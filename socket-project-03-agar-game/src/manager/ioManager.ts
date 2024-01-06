

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
import { getValidDataFromJsonString } from "../game-utils/game.utils";
config();

const PUB_SUB_CHANNEL_MAP = {
    NEW_PLAYER_ADDED : "pubsub.player.added",
    PLAYER_REMOVED : "pubsub.player.removed",
    NEW_SERVER_JOINED : "pubsub.server.joined",
    PLAYERS_INFO_DUMP_RCVD : "pubsub.server.playersinfodump.received",
}

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

        // when a new server spins up , it needs the players data from other servers
        // for the above , this server will publish a msg in this channel , the handler is defined below
        this.pubSubManager.getPub().publish(PUB_SUB_CHANNEL_MAP.NEW_SERVER_JOINED , JSON.stringify({
            server : os.hostname(),
            port : process.env.PORT
        }));
        
        console.log(`socket server up ...port=[${process.env.PORT}]`)
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
            await this.pubSubManager.getPub().publish(PUB_SUB_CHANNEL_MAP.NEW_PLAYER_ADDED , JSON.stringify(playerData));

            if(this.gameState.getPlayerCount() > 0){
                this.sendRegurlarUpdateToClients();
            }

            // when player leaves , we need to remove it from current server game state
            // also we need to remove from other servers , for which we put a msg into channel
            socket.on('disconnect' , async () => {
                const playerData = this.gameState.removePlayer(socketId);
                if(playerData){
                    await this.pubSubManager.getPub().publish(PUB_SUB_CHANNEL_MAP.PLAYER_REMOVED , JSON.stringify(playerData));
                }
            });
        });

      

    }

    private subscribeToPubSubEvents(){
        const sub = this.pubSubManager.getSub();

        // lets say we have 2 servers : s1 , s2 (offering socket connections)
        // when a new player joins s1 , then we need to update that player's data in s2 as well
        // the publish msg is in initIo() , the below logic does the update in s2
        sub.subscribe(PUB_SUB_CHANNEL_MAP.NEW_PLAYER_ADDED , (message , channel)=>{
            console.log(`inside [${PUB_SUB_CHANNEL_MAP.NEW_PLAYER_ADDED}]`);
            const playerDataList : PlayerData[] = getValidDataFromJsonString(message);
            this.gameState.addPubSubPlayers(playerDataList);
        });

        // same logic as above , but here we remove a player
        sub.subscribe(PUB_SUB_CHANNEL_MAP.PLAYER_REMOVED , (message , channel)=>{
            console.log(`inside [${PUB_SUB_CHANNEL_MAP.PLAYER_REMOVED}]`);
            const playerData : PlayerData = getValidDataFromJsonString(message);
            this.gameState.removePlayer(playerData.socketId);
        });

        // lets say due to high traffic , we need to spin up extra server (s3)
        // when s3 joins , it needs to fetch the data of all players from all servers (in our case , its s1 , s2)
        // s3 will send a msg , which is there in initIo() , 
        // when s1 , s2 get this msg , they will emit all their player list
        // the below logic is in context of s1 , s2 . Here player list is being emitted (from s1 , s2)
        sub.subscribe(PUB_SUB_CHANNEL_MAP.NEW_SERVER_JOINED , (message , channel)=>{
            console.log(`inside [${PUB_SUB_CHANNEL_MAP.NEW_SERVER_JOINED}]`);
            const playerDataList : PlayerData[] = this.gameState.getPlayerList();
            this.pubSubManager.getPub().publish(PUB_SUB_CHANNEL_MAP.PLAYERS_INFO_DUMP_RCVD , JSON.stringify(playerDataList));
        });

        // below logic is in context of s3 
        // it will update its game state basis the dump of s1,s2
        sub.subscribe(PUB_SUB_CHANNEL_MAP.PLAYERS_INFO_DUMP_RCVD , (message , channel) => {
            console.log(`inside [${PUB_SUB_CHANNEL_MAP.PLAYERS_INFO_DUMP_RCVD}]`);
            const playerDataList : PlayerData[] = getValidDataFromJsonString(message);
            this.gameState.addPubSubPlayers(playerDataList);
        });
    }

    private sendRegurlarUpdateToClients(){
        const fn = ()=>{
            const playersConnected = this.gameState.getPlayerCount();
            console.log(`sending info of ${playersConnected} players to ui`);
            if(playersConnected > 0){
                this.io.emit('serverInfo' , this.gameState.getPlayerList());
            }
        };
        setInterval(fn , 5 * 1000);
    }
}