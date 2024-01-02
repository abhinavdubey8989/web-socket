

import { IoManager } from './manager/ioManager';
import { Socket } from "socket.io";
import { sendMsg } from './sender';
import os from 'os';
import { config } from 'dotenv';
config();


const port:string = process.env.PORT;


const io = IoManager.getIo();

io.on('connect' , (socket : Socket)=>{

    const socketId = socket.id;

    // greetings from server ... :)
    socket.emit('serverInfo' , {uiSocketId : socketId , port , hostName : os.hostname()});

    // when a ui-socket sends the "newChatMsgFromClient" event 
    // the below logic is executed
    // this logic broadcasts the msgs to call connected sockets
    socket.on('newChatMsgFromClient' , (data) => {
        console.log(`server inside newChatMsgFromClient`);
        console.log(data);

        // we can do either of below , "sendMsg" was added to just check modularity
        io.emit('newMessageToClients' , {fromServer : data.fromClient})
        // sendMsg(data)
    });
});






