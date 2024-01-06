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
        console.log(playerData);
        this.playerDataMap.set(socketId , playerData);
        return playerData;
    }

    public removePlayer(socketId : string) : PlayerData {
        const playerData = this.playerDataMap.get(socketId);
        this.playerDataMap.delete(socketId);
        return playerData;
    }

    public getPlayerList(){
        return Array.from(this.playerDataMap.values());
        // return this.playerDataMap.;
    }

    public getPlayerCount() : number{
        return this.playerDataMap.size || 0;
    }

    public addPubSubPlayer(playerData : PlayerData) : void {
        if(!playerData){
            return;
        }
        this.playerDataMap.set(playerData.socketId , playerData);
    }
}

