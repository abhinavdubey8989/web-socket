
import os from 'os';
import { getServerId } from '../game-utils/game.utils';

export class SocketMsg<T> {

    timeStamp : number;
    serverId : string;
    port : string;
    socketId : string;
    mainData : T;

    constructor(data : T , socketId = ""){
        this.port = process.env.PORT;
        this.timeStamp = Date.now();
        this.serverId = getServerId();
        this.socketId = socketId;
        this.mainData = data;
    }

    
}

