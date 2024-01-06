import { PlayerData } from "./playerData";
import { PlayerPrivateData } from "./playerPrivateData";
import { PlayerPublicData } from "./playerPublicData";

export class GameState {

    private playerDataMap : Map<string , PlayerData>;
    
    constructor(){
        this.playerDataMap = new Map();

    }

    public addNewPlayer(socketId : string) : PlayerData {
        const playerPrivateData = new PlayerPrivateData();
        const playerPublicData = new PlayerPublicData("rob");
        const playerData = new PlayerData(socketId , playerPrivateData , playerPublicData);
        this.playerDataMap.set(socketId , playerData);
        return playerData;
    }

    public removePlayer(socketId : string) : PlayerData {
        const playerData = this.playerDataMap.get(socketId);
        this.playerDataMap.delete(socketId);
        return playerData;
    }

    public getPlayerList() : PlayerData[]{
        return Array.from(this.playerDataMap.values()) || [];
        // return this.playerDataMap.;
    }

    public getPlayerCount() : number{
        return this.playerDataMap.size || 0;
    }

    public addPubSubPlayers(playerDataList : PlayerData[]) : void {
        if(!playerDataList || !playerDataList.length){
            return;
        }

        console.log(`inside [addPubSubPlayers] , rcvd-ids=[${playerDataList.map(x=>x.socketId)}]`);
        playerDataList.forEach(playerData =>{
            this.playerDataMap.set(playerData.socketId , playerData);
        });
    }
}

