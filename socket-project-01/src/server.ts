

import { IoManager } from './manager/ioManager';
import { Socket } from "socket.io";


const io = IoManager.getIo();

io.on('connect' , (socket : Socket)=>{
    const socketId = socket.id
    console.log(`socket with id=[${socketId}] connected`);
    // socket.emit('test-1' , {a :1 , b:2 , socketId});
    io.emit('test-1' , {a :1 , b:2 , socketId});
});



