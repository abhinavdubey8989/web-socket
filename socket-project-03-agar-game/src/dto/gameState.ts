import GAME_SETTINGS from "../settings/gameSettings";
import { Orb } from "./orb";
import { PlayerData } from "./playerData";
import { PlayerPrivateData } from "./playerPrivateData";
import { PlayerPublicData } from "./playerPublicData";

export class GameState {

    private playerDataMap: Map<string, PlayerData>;
    private orbList: Orb[];

    constructor() {
        this.initGameState();
    }

    private initGameState() {
        // init player-map
        this.playerDataMap = new Map();

        // init orbs
        this.orbList = [];
        for (let i = 0; i < GAME_SETTINGS.initOrbCount; i++) {
            this.orbList.push(new Orb());
        }
    }

    public addNewPlayer(socketId: string , playerName : string): PlayerData {
        const playerPrivateData = new PlayerPrivateData();
        const playerPublicData = new PlayerPublicData(socketId , playerName);
        const playerData = new PlayerData(socketId, playerPrivateData, playerPublicData);
        this.playerDataMap.set(socketId, playerData);
        return playerData;
    }

    public removePlayer(socketId: string): PlayerData {
        const playerData = this.playerDataMap.get(socketId);
        this.playerDataMap.delete(socketId);
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
        return this.orbList || [];
    }

    public getPublicDataListOfAllPlayers() : PlayerPublicData[] {
        const publicDataList = this.getPlayerList().map(x=>x.playerPublicData);
        return publicDataList;
    }

    public getPlayerBySocketId(socketId): PlayerData {
        return this.playerDataMap.get(socketId);
    }

}

