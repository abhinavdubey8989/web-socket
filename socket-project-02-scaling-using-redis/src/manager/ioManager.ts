

import express from 'express';
import { Server as SockerServer } from "socket.io";
import { Server as HttpServer} from "http";
import { config } from 'dotenv';
config();


const port:string = process.env.PORT;

// creating an httpServer using express
const app = express();
app.use(express.static(__dirname + '/public'));
const httpServer : HttpServer = app.listen(port , () => {console.log(`started on port ${port}`)});


// the below code creates a socket server (backend) , using the above HTTP server
// singleton pattern
export class IoManager {
    private static io : SockerServer = null;

    public static getIo() : SockerServer{
        if(!this.io){
            this.io =  new SockerServer(httpServer , {
                cors :{
                    origin : '*',
                    methods : ["GET" , "POST" , "PUT"]
                }
            });
        }
        return this.io;
    }

}