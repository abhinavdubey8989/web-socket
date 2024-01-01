
// 3rd party from npm
// const express = require('express');
// const socketio = require('socket.io')
// const app = express();
// const port = 8001


// app.use(express.static(__dirname + '/public'));
// const expressServer = app.listen(port);
// const io = socketio(expressServer)



// // "io" = entire socketio backend server 
// // "socket" = just 1 connected socket
// io.on('connection',(socket)=>{
//     console.log(socket.id,"has connected")
//     //in ws we use "send" method, and it socket.io we use the "emit" method
//     // socket.emit('messageFromServer',{data:"Welcome to the socket server!"})
//     socket.on('newMessageToServer',(dataFromClient)=>{
//         console.log("Data:",dataFromClient);
//         io.emit('newMessageToClients',{text:dataFromClient.text});
//     });
// });


import express from 'express';
import {config} from 'dotenv';
config();

const app = express()

const port:string = process.env.PORT

app.listen(port , () => {console.log(`started on port ${port}`)})
