import { Orb } from "./orb";
import { PlayerData } from "./playerData";


export class ServerInitResp {
    socketId: string;
    orbList: Orb[]
}


export class PlayerCollisionDto {
    removedPlayerName: string;
    removedPlayerId: string;
    updatedPlayer: PlayerData;
}


export class OrbCollisionDto {
    orbIdxRemoved: number; 
    newOrbData: Orb;
    updatedPlayer: PlayerData;
}

export class LeaderBoardData {
    name: string; 
    score: number;
}