import GAME_SETTINGS from "../settings/gameSettings";
import { Orb } from "./orb";
import { PlayerData } from "./playerData";
import { PlayerPrivateData } from "./playerPrivateData";
import { PlayerPublicData } from "./playerPublicData";
import { LeaderBoardData, OrbCollisionDto, PlayerCollisionDto } from "./serverDto";

export class GameState {

    private playerDataMap: Map<string, PlayerData>;
    private ordMap: Map<string, Orb>;
    // private orbList: Orb[];

    constructor() {
        this.initGameState();
    }

    private initGameState() {
        // init player-map
        this.playerDataMap = new Map();

        // init orbs
        this.ordMap = new Map();
        for (let i = 0; i < GAME_SETTINGS.initOrbCount; i++) {
            const orbId = `${i}`;
            this.ordMap.set(orbId, new Orb(orbId));
        }
    }

    public addNewPlayer(socketId: string, playerName: string): PlayerData {
        const playerPrivateData = new PlayerPrivateData();
        const playerPublicData = new PlayerPublicData(socketId, playerName);
        const playerData = new PlayerData(socketId, playerPrivateData, playerPublicData);
        this.playerDataMap.set(socketId, playerData);
        return playerData;
    }

    public removePlayer(removedSocketId: string): PlayerData {
        if (!removedSocketId || !removedSocketId.length) {
            return null;
        }
        const playerData = this.playerDataMap.get(removedSocketId);
        this.playerDataMap.delete(removedSocketId);
        return playerData;
    }

    public getPlayerList(): PlayerData[] {
        return Array.from(this.playerDataMap.values()) || [];
    }

    public getPlayerCount(): number {
        return this.playerDataMap.size || 0;
    }

    public addPubSubPlayers(playerDataList: PlayerData[]): void {
        if (!playerDataList || !playerDataList.length) {
            return;
        }

        console.log(`inside [addPubSubPlayers] , rcvd-ids=[${playerDataList.map(x => x.socketId)}]`);
        playerDataList.forEach(playerData => {
            this.playerDataMap.set(playerData.socketId, playerData);
        });
    }

    public getOrbList(): Orb[] {
        return Array.from(this.ordMap.values()) || [];
        // return this.orbList || [];
    }

    private getOrbKeyList(): string[] {
        try {
            return Array.from(this.ordMap.keys()) || [];
        } catch (e) {
            return [];
        }
    }

    public getPublicDataListOfAllPlayers(): PlayerPublicData[] {
        const publicDataList = this.getPlayerList().map(x => x.playerPublicData);
        return publicDataList;
    }

    public getPlayerBySocketId(socketId): PlayerData {
        return this.playerDataMap.get(socketId);
    }

    //ORB COLLISIONS
    public updatePlayerOnOrbCollision(playerData: PlayerData): OrbCollisionDto {
        if (!playerData) {
            return { orbIdRemoved: null, newOrbData: null, updatedPlayer: null };
        }

        const { playerPrivateData, playerPublicData } = playerData;
        const { x: playerX, y: playerY } = playerPublicData;
        let orbIdRemoved: string = null;

        const keyListInOrbMap = this.getOrbKeyList();
            for(let i = 0; i < keyListInOrbMap.length ; i++) {
            if (orbIdRemoved !== null) {
                break;
            }
            const orb = this.ordMap.get(keyListInOrbMap[i]);
            const { orbRadius, orbX } = orb;

            if (playerX + playerPublicData.radius + orbRadius > orbX
                && playerX < orbX + playerPublicData.radius + orbRadius
                && playerY + playerPublicData.radius + orbRadius > orbX
                && playerY < orbX + playerPublicData.radius + orbRadius) {

                // Pythagoras test(circle)
                const distance = Math.sqrt(
                    ((playerX - orbX) * (playerX - orbX)) +
                    ((playerY - orbX) * (playerY - orbX))
                );
                // if (distance < playerPublicData.radius + orbRadius) {
                if (true) {

                    //COLLISION!!!
                    playerPublicData.score += 1; //incrament score
                    playerPublicData.orbsAbsorbed += 1; //incrament orbs absorbed count
                    // playerPublicData.color = orb.color;
                    if (playerPrivateData.zoom > 1) {
                        playerPrivateData.zoom -= .001; //update zoom so player doesn't get to big for screen
                    }

                    playerPublicData.radius += 0.05; //increase player size

                    if (playerPrivateData.speed < -0.005) {
                        playerPrivateData.speed += 0.005; //increase player speed
                    } else if (playerPrivateData.speed > 0.005) {
                        playerPrivateData.speed -= 0.005;
                    }

                    // can't hit more than one orb on a tock so break and return
                    orbIdRemoved = keyListInOrbMap[i];
                }
            }
        };

        let newOrbData = null;
        if (orbIdRemoved !== null) {
            const newOrbId = 1 + this.getOrbKeyList().length;
            newOrbData = new Orb(`${newOrbId}`);
            this.updateOrbData(orbIdRemoved , newOrbData);
        }
        return { orbIdRemoved, newOrbData, updatedPlayer: playerData };
    }


    public updatePlayerOnPlayerCollision(currPlayerData: PlayerData): PlayerCollisionDto {

        const allPlayerList = this.getPlayerList();

        for (let i = 0; i < allPlayerList.length; i++) {
            const otherPlayer = allPlayerList[i];

            if (otherPlayer.socketId == currPlayerData.socketId) {
                continue;
            }

            let pLocx = otherPlayer.playerPublicData.x
            let pLocy = otherPlayer.playerPublicData.y
            let pR = otherPlayer.playerPublicData.radius

            // AABB Test - Axis-aligned bounding boxes
            if (currPlayerData.playerPublicData.x + currPlayerData.playerPublicData.radius + pR > pLocx
                && currPlayerData.playerPublicData.x < pLocx + currPlayerData.playerPublicData.radius + pR
                && currPlayerData.playerPublicData.y + currPlayerData.playerPublicData.radius + pR > pLocy
                && currPlayerData.playerPublicData.y < pLocy + currPlayerData.playerPublicData.radius + pR) {
                // console.log("Hit square test!");
                // Pythagoras test
                const distance = Math.sqrt(
                    ((currPlayerData.playerPublicData.x - pLocx) * (currPlayerData.playerPublicData.x - pLocx)) +
                    ((currPlayerData.playerPublicData.y - pLocy) * (currPlayerData.playerPublicData.y - pLocy))
                );
                if (distance < currPlayerData.playerPublicData.radius + pR) {
                    //COLLISION!!
                    if (currPlayerData.playerPublicData.radius > pR) {
                        // ENEMY DEATH
                        currPlayerData.playerPublicData.score += (otherPlayer.playerPublicData.score + 10);
                        currPlayerData.playerPublicData.playersAbsorbed += 1;
                        currPlayerData.playerPublicData.radius += otherPlayer.playerPublicData.radius * 0.25

                        if (currPlayerData.playerPrivateData.zoom > 1) {
                            currPlayerData.playerPrivateData.zoom -= (pR * 0.25) * .001;
                        }

                        return {
                            removedPlayerName: otherPlayer.playerPublicData.name,
                            removedPlayerId: otherPlayer.socketId,
                            updatedPlayer: currPlayerData,
                        }

                    }

                    //This code could check to see if it the player who tocked was hit.
                    //It is commented out since the above code should run on the other player's tock 
                    //In other words, we only need to consider it a "death" on the attacking players turn
                    // else if(currPlayerData.playerPublicData.radius < pR){ }
                }
            }

        }
        return {
            removedPlayerName: null,
            removedPlayerId: null,
            updatedPlayer: null,
        };
    }

    public getLeaderBoard(): LeaderBoardData[] {
        const allPlayers = this.getPlayerList();
        const leaderBoardArray = allPlayers.map(curPlayer => {
            if (curPlayer.playerPublicData) {
                return {
                    name: curPlayer.playerPublicData.name,
                    score: curPlayer.playerPublicData.score,
                }
            }
        });
        return leaderBoardArray;
    }

    public updateOrbData(removedOrbId : string , orbToAdd : Orb): void {
        this.ordMap.delete(removedOrbId);
        this.ordMap.set(orbToAdd.id , orbToAdd);
    }

}

