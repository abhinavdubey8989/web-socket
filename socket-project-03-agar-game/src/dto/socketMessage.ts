
import os from 'os';

export class SocketMsg<T> {

    timeStamp : number;
    serverId : string;
    port : string;
    socketId : string;
    mainData : T;

    constructor(data : T , socketId = ""){
        this.timeStamp = Date.now();
        this.serverId = os.hostname();
        this.port = process.env.PORT;
        this.socketId = socketId;
        this.mainData = data;
    }

    
}

