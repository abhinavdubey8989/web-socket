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
    orbIdRemoved: string; 
    newOrbData: Orb;
    updatedPlayer: PlayerData;
}

export class LeaderBoardData {
    name: string; 
    score: number;
}

export class OtherPlayerMovementOrLeaderBoardUpdate {
    updatedPlayer: PlayerData;
}

