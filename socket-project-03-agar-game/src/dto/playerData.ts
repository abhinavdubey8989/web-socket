import { PlayerPrivateData } from "./playerPrivateData";
import { PlayerPublicData } from "./playerPublicData";

export class PlayerData{

    socketId : string;
    playerPrivateData : PlayerPrivateData;
    playerPublicData : PlayerPublicData
    
    constructor(socketId : string , playerPrivateData : PlayerPrivateData , playerPublicData : PlayerPublicData){
        this.socketId = socketId;
        this.playerPrivateData = playerPrivateData;
        this.playerPublicData = playerPublicData;
    }
}

