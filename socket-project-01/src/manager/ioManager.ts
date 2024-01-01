

import express from 'express';
import { Server as SockerServer } from "socket.io";
import { Server as HttpServer} from "http";
import { config } from 'dotenv';
config();


const port:string = process.env.PORT;
const app = express();
app.use(express.static(__dirname + '/public'));
const httpServer : HttpServer = app.listen(port , () => {console.log(`started on port ${port}`)});


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