

import { Server as SockerServer, Socket } from "socket.io";
import { Server as HttpServer} from "http";
import { sendMsg } from "./sendMsgToClient";
import os from 'os';
import { config } from 'dotenv';
import { PubSubManager } from "./redisManager";
import httpServer from "../server";
import { PlayerPrivateData } from "../dto/playerPrivateData";
import { PlayerPublicData } from "../dto/playerPublicData";
import { PlayerData } from "../dto/playerData";
import { GameState } from "../dto/gameState";
import { SocketMsg } from "../dto/socketMessage";
config();

// the below code creates a socket server (backend) , using the above HTTP server
// singleton pattern
export class IoManager {
    private static instance: IoManager;
    private io: SockerServer;
    private gameState : GameState;
    private pubSubManager : PubSubManager;


    private constructor(httpServer: HttpServer) {
        // Initialize Socket.IO server with the HTTP server instance
        // Additional configuration or event handling can be added here
        this.io = new SockerServer(httpServer , {
            cors :{
                origin : '*',
                methods : ["GET" , "POST" , "PUT"]
            }
        });

        this.pubSubManager = PubSubManager.getInstance();
        this.gameState = new GameState();
        console.log(`socket server up ...`)
    }

    public static getInstance(): IoManager {
        if (!IoManager.instance) {
          IoManager.instance = new IoManager(httpServer);
        }
        return IoManager.instance;
    }
    
    public getIo() : SockerServer { 
        return this.io ;
    }

    public initIo(){
        this.subscribeToPubSubEvents();

        this.io.on('connect' , async (socket : Socket)=>{
            const socketId = socket.id;

            const playerData = this.gameState.addNewPlayer(socketId);
            await this.pubSubManager.getPub().publish("pubsub.player.added" , JSON.stringify(playerData));

            if(this.gameState.getPlayerCount() > 0){
                this.sendRegurlarUpdateToClients();
            }

            // when player leaves
            socket.on('disconnect' , async () => {
                const playerData = this.gameState.removePlayer(socketId);
                if(playerData){
                    await this.pubSubManager.getPub().publish("pubsub.player.removed" , JSON.stringify(playerData));
                }
            });
        });

      

    }

    private subscribeToPubSubEvents(){
        const sub = this.pubSubManager.getSub();

        // the below logic gets executed when redis event is triggered on "redis-message" channel
        sub.subscribe("pubsub.player.added" , (message , channel)=>{
            const playerData : PlayerData = JSON.parse(message);
            console.log(`inside [pubsub.player.added] , socketId=[${playerData.socketId}]`);
            this.gameState.addPubSubPlayer(playerData);
        });


        sub.subscribe("pubsub.player.removed" , (message , channel)=>{
            const playerData : PlayerData = JSON.parse(message);
            console.log(`inside [pubsub.player.removed] , socketId=[${playerData.socketId}]`);
            this.gameState.removePlayer(playerData.socketId);
        });
    }

    private sendRegurlarUpdateToClients(){
        const fn = ()=>{
            console.log(`sending info of ${this.gameState.getPlayerCount()} players to ui`);
            this.io.emit('serverInfo' , this.gameState.getPlayerList());
        };
        setInterval(fn , 1000);
    }
}