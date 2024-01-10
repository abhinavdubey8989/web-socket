

import { Server as SockerServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { sendMsg } from "./sendMsgToClient";
import os from 'os';
import { config } from 'dotenv';
import { PubSubManager } from "./pubSubManager";
import httpServer from "../server";
import { PlayerPrivateData } from "../dto/playerPrivateData";
import { PlayerPublicData } from "../dto/playerPublicData";
import { PlayerData } from "../dto/playerData";
import { GameState } from "../dto/gameState";
import { SocketMsg } from "../dto/socketMessage";
import { getServerDetails, getValidDataFromJsonString, isSelf } from "../game-utils/game.utils";
import { UiInit, UiTockData } from "../dto/uiDto";
import { Orb } from "../dto/orb";
import GAME_SETTINGS from "../settings/gameSettings";
import { LeaderBoardData, OrbCollisionDto, OtherPlayerMovementOrLeaderBoardUpdate, PlayerCollisionDto, ServerInitResp } from "../dto/serverDto";
config();

const PUB_SUB_CHANNEL_MAP = {
    NEW_PLAYER_ADDED: 'pubsub.player.added',
    PLAYER_REMOVED: 'pubsub.player.removed',
    NEW_SERVER_JOINED: 'pubsub.server.joined',
    PLAYERS_INFO_DUMP_RCVD: 'pubsub.server.playersinfodump.received',
    ORB_COLLISION_UPDATE: 'pubsub.server.orbcollision.received',
    PLAYERS_COLLISION_UPDATE: 'pubsub.server.playerscollision.received',
    OTHER_PLAYER_MOVEMENT_OR_LEADER_BOARD_UPDATE: 'pubsub.playerorleaderboardupdate.rcvd',
}

// the below code creates a socket server (backend) , using the above HTTP server
// singleton pattern
export class IoManager {
    private static instance: IoManager;
    private io: SockerServer;
    private gameState: GameState;
    private pubSubManager: PubSubManager;
    private tickTockInterval: NodeJS.Timeout;

    private constructor(httpServer: HttpServer) {
        // Initialize Socket.IO server with the HTTP server instance
        // Additional configuration or event handling can be added here
        this.io = new SockerServer(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT']
            }
        });

        this.pubSubManager = PubSubManager.getInstance();
        this.gameState = new GameState();

        // when a new server spins up , it needs the players data from other servers
        // for the above , this server will publish a msg in this channel , the handler is defined below
        const pubSubMsg: SocketMsg<any> = new SocketMsg(getServerDetails())
        this.pubSubManager.getPub().publish(PUB_SUB_CHANNEL_MAP.NEW_SERVER_JOINED, JSON.stringify(pubSubMsg));

        console.log(`socket server up ...port=[${process.env.PORT}]`)
    }

    public static getInstance(): IoManager {
        if (!IoManager.instance) {
            IoManager.instance = new IoManager(httpServer);
        }
        return IoManager.instance;
    }

    public getIo(): SockerServer {
        return this.io;
    }

    public initIo() {
        this.subscribeToPubSubEvents();

        this.io.on('connect', async (socket: Socket) => {
            const socketId = socket.id;

            // when ui sends the signal that its ready to play (ie. after entering name + other details)
            // then only we send data from server
            socket.on('ui-init', async (uiData: UiInit, uiAckCallBack) => {
                const playerData = this.gameState.addNewPlayer(socketId, uiData.playerName);
                const pubSubMsg: SocketMsg<PlayerData[]> = new SocketMsg([playerData]);
                await this.pubSubManager.getPub().publish(PUB_SUB_CHANNEL_MAP.NEW_PLAYER_ADDED, JSON.stringify(pubSubMsg));
                this.sendRegurlarUpdateToClients(socket);
                const serverData: SocketMsg<ServerInitResp> = new SocketMsg({ socketId, orbList: this.gameState.getOrbList() });
                uiAckCallBack(serverData);
            });

            // ui data updated (or player movement)
            socket.on('ui-tock', async (uiData: UiTockData) => {
                await this.updateGameOnUiTock(socket, uiData);
            });


            // when player leaves , we need to remove it from current server's game-state
            // also we need to remove from other servers' game-state , for which we put a msg into pubsub
            socket.on('disconnect', async () => {
                const disconnectedPlayerData = this.gameState.removePlayer(socketId);
                const disconnededPubSubMsg: SocketMsg<PlayerData> = new SocketMsg(disconnectedPlayerData);
                if (disconnectedPlayerData) {
                    await this.pubSubManager.getPub().publish(PUB_SUB_CHANNEL_MAP.PLAYER_REMOVED, JSON.stringify(disconnededPubSubMsg));
                }

                // stop ticking if no players
                if (this.tickTockInterval && this.gameState.getPlayerCount() == 0) {
                    clearInterval(this.tickTockInterval);
                }
            });
        });
    }

    // server emit data to ui regularly (30FPS)
    // using this data the ui will paint the canvas
    private sendRegurlarUpdateToClients(socket: Socket) {

        // only send data if players exist
        if (this.gameState.getPlayerCount() < 1) {
            return;
        }

        const fn = () => {
            const playersConnected = this.gameState.getPlayerCount();
            const sockerServerMsg: SocketMsg<PlayerPublicData[]> = new SocketMsg(this.gameState.getPublicDataListOfAllPlayers());
            if (playersConnected > 0) {
                this.io.emit('server-tick', sockerServerMsg);
            }
        };

        this.tickTockInterval = setInterval(fn, 33);
    }


    private async updateGameOnUiTock(socket: Socket, uiData: UiTockData) {
        const socketId = socket.id;
        const player = this.gameState.getPlayerBySocketId(socketId);
        if (!player) {
            return;
        }
        const speed = player.playerPrivateData.speed;
        const xV = player.playerPrivateData.xVector = uiData.xVector;
        const yV = player.playerPrivateData.yVector = uiData.yVector;

        //if player can move in the x, move
        if ((player.playerPublicData.x > 5 && xV < 0) || (player.playerPublicData.x < GAME_SETTINGS.worldWidth) && (xV > 0)) {
            player.playerPublicData.x += speed * xV;
        }
        //if player can move in the y, move
        if ((player.playerPublicData.y > 5 && yV > 0) || (player.playerPublicData.y < GAME_SETTINGS.worldHeight) && (yV < 0)) {
            player.playerPublicData.y -= speed * yV;
        }

        let thereIsAnUpdatedInPlayerOrLeaderBoard = false;

        //check if current player hit orbs
        const orbCollisionDto: OrbCollisionDto = this.gameState.updatePlayerOnOrbCollision(player);
        if (orbCollisionDto.orbIdRemoved !== null) {
            const serverDataForOrbCollision: SocketMsg<OrbCollisionDto> = new SocketMsg(orbCollisionDto);
            const serverLeaderBoardData: SocketMsg<LeaderBoardData[]> = new SocketMsg(this.gameState.getLeaderBoard())

            // send updated orb data to ui
            this.io.emit('server-orb-update', serverDataForOrbCollision);
            this.pubSubManager.getPub().publish(PUB_SUB_CHANNEL_MAP.ORB_COLLISION_UPDATE, JSON.stringify(serverDataForOrbCollision));

            // since player hit orb , its score increase , update leaderboard on ui
            this.io.emit('server-leaderboard-update', serverLeaderBoardData);
            thereIsAnUpdatedInPlayerOrLeaderBoard = true;
        }

        // //player collisions of tocking player
        const playerCollisionDto: PlayerCollisionDto = this.gameState.updatePlayerOnPlayerCollision(player)
        if (playerCollisionDto.removedPlayerId) {
            const serverDataForPlayerCollision: SocketMsg<PlayerCollisionDto> = new SocketMsg(playerCollisionDto);

            // remove the dead player + update the player score who survived the player crash
            socket.broadcast.to(playerCollisionDto.removedPlayerId).emit('server-player-absorbed-and-removed', serverDataForPlayerCollision);
            this.pubSubManager.getPub().publish(PUB_SUB_CHANNEL_MAP.PLAYERS_COLLISION_UPDATE, JSON.stringify(serverDataForPlayerCollision));

            // since 2 players collided , score increase , update leaderboard on ui 
            const serverLeaderBoardData: SocketMsg<LeaderBoardData[]> = new SocketMsg(this.gameState.getLeaderBoard())
            this.io.emit('server-leaderboard-update', serverLeaderBoardData);
            thereIsAnUpdatedInPlayerOrLeaderBoard = true;
        }

        // if there was no orb/player collision , then current player's movement was not captured on ui
        // it looked like other players are not moving
        // to avoid this we send updated location (+ other data) of current player to all servers via pubsub
        if (thereIsAnUpdatedInPlayerOrLeaderBoard) {
            const pubSubMsgForMovementOrLBUpdate: SocketMsg<OtherPlayerMovementOrLeaderBoardUpdate> = new SocketMsg({ updatedPlayer: player });
            this.pubSubManager.getPub().publish(PUB_SUB_CHANNEL_MAP.OTHER_PLAYER_MOVEMENT_OR_LEADER_BOARD_UPDATE, JSON.stringify(pubSubMsgForMovementOrLBUpdate));
        }
    }

    private subscribeToPubSubEvents() {
        const sub = this.pubSubManager.getSub();

        // lets say we have 2 servers : s1 , s2 (offering socket connections)
        // when a new player joins s1 , then we need to update that player's data in s2 as well
        // the publish msg is in initIo() , the below logic does the update in s2
        sub.subscribe(PUB_SUB_CHANNEL_MAP.NEW_PLAYER_ADDED, (message, channel) => {
            const pubSubMsg: SocketMsg<PlayerData[]> = getValidDataFromJsonString(message);
            if (!pubSubMsg) {
                return;
            }
            const fromServerId = pubSubMsg.serverId;
            if (isSelf(fromServerId)) {
                return;
            }
            console.log(`inside [${PUB_SUB_CHANNEL_MAP.NEW_PLAYER_ADDED}] , fromServerId=[${fromServerId}] , self=[${isSelf(fromServerId)}]`);
            this.gameState.addPubSubPlayers(pubSubMsg.mainData);
        });

        // same logic as above , but here we remove a player
        sub.subscribe(PUB_SUB_CHANNEL_MAP.PLAYER_REMOVED, (message, channel) => {
            const pubSubMsg: SocketMsg<PlayerData> = getValidDataFromJsonString(message);
            if (!pubSubMsg) {
                return;
            }
            const removedSocketId = pubSubMsg.mainData.socketId;
            const fromServerId = pubSubMsg.serverId;
            console.log(`inside [${PUB_SUB_CHANNEL_MAP.PLAYER_REMOVED}] , fromServerId=[${fromServerId}] , self=[${isSelf(fromServerId)}]`);
            this.gameState.removePlayer(removedSocketId);
        });

        // lets say due to high traffic , we need to spin up extra server (s3)
        // when s3 joins , it needs to fetch the data of all players from all servers (in our case , its s1 , s2)
        // s3 will send a msg , which is there in initIo() , 
        // when s1 , s2 get this msg , they will emit all their player list
        // the below logic is in context of s1 , s2 . Here player list is being emitted (from s1 , s2)
        sub.subscribe(PUB_SUB_CHANNEL_MAP.NEW_SERVER_JOINED, (message, channel) => {
            console.log(`inside [${PUB_SUB_CHANNEL_MAP.NEW_SERVER_JOINED}]`);
            const playerDataList: PlayerData[] = this.gameState.getPlayerList();
            const pubSubMsg: SocketMsg<PlayerData[]> = new SocketMsg(playerDataList);
            this.pubSubManager.getPub().publish(PUB_SUB_CHANNEL_MAP.PLAYERS_INFO_DUMP_RCVD, JSON.stringify(pubSubMsg));
        });

        // below logic is in context of s3 
        // it will update its game state basis the dump of s1,s2
        sub.subscribe(PUB_SUB_CHANNEL_MAP.PLAYERS_INFO_DUMP_RCVD, (message, channel) => {
            const pubSubMsg: SocketMsg<PlayerData[]> = getValidDataFromJsonString(message);
            if (!pubSubMsg) {
                return;
            }
            const fromServerId = pubSubMsg.serverId;
            console.log(`inside [${PUB_SUB_CHANNEL_MAP.PLAYERS_INFO_DUMP_RCVD}] , fromServerId=[${fromServerId}] , self=[${isSelf(fromServerId)}]`);
            this.gameState.addPubSubPlayers(pubSubMsg.mainData);
        });


        // when 2 players collided we need to remove one and update other
        sub.subscribe(PUB_SUB_CHANNEL_MAP.PLAYERS_COLLISION_UPDATE, (message, channel) => {
            const pubSubMsg: SocketMsg<PlayerCollisionDto> = getValidDataFromJsonString(message);
            if (!pubSubMsg) {
                return;
            }
            console.log(`inside [${PUB_SUB_CHANNEL_MAP.PLAYERS_INFO_DUMP_RCVD}] , fromServerId=[${pubSubMsg.serverId}] , self=[${isSelf(pubSubMsg.serverId)}]`);
            this.gameState.addPubSubPlayers([pubSubMsg.mainData.updatedPlayer]);
            this.gameState.removePlayer(pubSubMsg.mainData.removedPlayerId);
        });

        // when player<>orb collided we need to update player
        sub.subscribe(PUB_SUB_CHANNEL_MAP.ORB_COLLISION_UPDATE, (message, channel) => {
            const pubSubMsg: SocketMsg<OrbCollisionDto> = getValidDataFromJsonString(message);
            if (!pubSubMsg) {
                return;
            }
            console.log(`inside [${PUB_SUB_CHANNEL_MAP.PLAYERS_INFO_DUMP_RCVD}] , fromServerId=[${pubSubMsg.serverId}] , self=[${isSelf(pubSubMsg.serverId)}]`);
            this.gameState.addPubSubPlayers([pubSubMsg.mainData.updatedPlayer]);
            this.gameState.updateOrbData(pubSubMsg.mainData.orbIdRemoved, pubSubMsg.mainData.newOrbData);
        });

        // in other server , update player movement
        sub.subscribe(PUB_SUB_CHANNEL_MAP.OTHER_PLAYER_MOVEMENT_OR_LEADER_BOARD_UPDATE, (message, channel) => {
            const pubSubMsg: SocketMsg<PlayerData> = getValidDataFromJsonString(message);
            if (!pubSubMsg) {
                return;
            }
            const fromServerId = pubSubMsg.serverId;
            console.log(`inside [${PUB_SUB_CHANNEL_MAP.NEW_PLAYER_ADDED}] , fromServerId=[${fromServerId}] , self=[${isSelf(fromServerId)}]`);
            if (isSelf(fromServerId)) {
                return;
            }
            this.gameState.addPubSubPlayers([pubSubMsg.mainData]);

            const serverLeaderBoardData: SocketMsg<LeaderBoardData[]> = new SocketMsg(this.gameState.getLeaderBoard())
            this.io.emit('server-leaderboard-update', serverLeaderBoardData); // update leader-board        
        });
    }

}