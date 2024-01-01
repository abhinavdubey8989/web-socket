
// this is core node.js module
const http = require('http');

// the backend server uses this module to user WS
const webSocket = require('ws');

const port = 8000;

// creating a http-server
// here we are not using express
const httpServer = http.createServer((req,res)=>{
    res.end('connected to http-server')
});


const wsServer = new webSocket.WebSocketServer({server:httpServer});

// step-2 : this happens on handshake (101 header status) 
// the client requests to upgrade the connection
// the server by default accepts the connection
wsServer.on('headers' , (headers , req)=>{
    console.log(headers);
});

// step-3 : happens on server after handshake is complete
// websocket-server on connection makes a websocket
wsServer.on('connection',(ws,req)=>{
    // console.log(ws);
    ws.send('Welcome to the websocket server!!!');
    ws.on('message',(data)=>{
        console.log(data.toString());
    })
});


// listening on a port
httpServer.listen(port);