import { Server as SockerServer } from "socket.io";




// used to check modularity only
export function sendMsg(io : SockerServer, data){
    io.emit('newMessageToClients' , {fromServer : data.fromClient})
}