
import os from 'os';

export class SocketMsg<T> {

    timeStamp : number;
    serverId : string;
    socketId : string;
    data : T;

    constructor(data : T , socketId = ""){
        this.timeStamp = Date.now();
        this.serverId = os.hostname();
        this.socketId = socketId;
        this.data = data;
    }

    
}

