

import { Server as SockerServer, Socket } from "socket.io";
import { Server as HttpServer} from "http";
import { sendMsg } from "./sendMsgToClient";
import os from 'os';
import { config } from 'dotenv';
config();

// the below code creates a socket server (backend) , using the above HTTP server
// singleton pattern
export class IoManager {
    private static instance: IoManager;
    private io: SockerServer;
  
    private constructor(httpServer: HttpServer) {
        // Initialize Socket.IO server with the HTTP server instance
        // Additional configuration or event handling can be added here
        this.io = new SockerServer(httpServer , {
            cors :{
                origin : '*',
                methods : ["GET" , "POST" , "PUT"]
            }
        });
        console.log(`socket server up ...`)
      }

 

    public static getInstance(httpServer: HttpServer): IoManager {
        if (!IoManager.instance) {
          IoManager.instance = new IoManager(httpServer);
        }
        return IoManager.instance;
      }
    

    public getIo() : SockerServer { 
        return this.io ;
    }

    public initIo(){
      this.io.on('connect' , (socket : Socket)=>{

        const socketId = socket.id;

        // greetings from server ... :)
        socket.emit('serverInfo' , {uiSocketId : socketId , port : process.env.PORT , hostName : os.hostname()});

        // when a ui-socket sends the "newChatMsgFromClient" event 
        // the below logic is executed
        // this logic broadcasts the msgs to call connected sockets
        socket.on('newChatMsgFromClient' , (data) => {
            console.log(`server inside newChatMsgFromClient`);
            console.log(data);

            // we can do either of below , "sendMsg" was added to just check modularity
            // this.io.emit('newMessageToClients' , {fromServer : data.fromClient})
            sendMsg(this.io , data)
          });
      });
    }

}