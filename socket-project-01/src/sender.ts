import { IoManager } from "./manager/ioManager";


export function sendMsg(dataFromClient){
    console.log(`inside sendMsg ...`)
    const io = IoManager.getIo();
    io.emit('newMessageToClients' , {fromServer : dataFromClient.fromClient})
}