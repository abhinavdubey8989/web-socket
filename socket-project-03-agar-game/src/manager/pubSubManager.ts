import { createClient , RedisClientType } from 'redis';
import { config } from 'dotenv';
import { IoManager } from './ioManager';
config();

export class PubSubManager {
    private static instance: PubSubManager;
    private pub : RedisClientType<any, any>;
    private sub : RedisClientType<any, any>;
  
    private constructor() {
        this.pub = createClient({
            url  : process.env.REDIS_URL
        });   

        this.pub.connect().then(async ()=>{
            this.sub = this.pub.duplicate();
            this.sub.on('error', err => console.error(err));
            await this.sub.connect(); 
            this.sub.on('connect' ,()=>{console.log(`subscriber connected to redis client !!`)});
   
            console.log(`pub.connected to redis client !!`);

            // init socket-server
            const io = IoManager.getInstance();
            io.initIo();
            
          }).catch(e =>{
            console.log(`error while connecting to redis client !!`);
            console.log(JSON.stringify(e));
          });
      


        this.pub.on('connect', ()=>{
            console.log(`publisher connected to redis client !!`);
            // const io = IoManager.getInstance(httpServer);
            // io.initIo();
        });
        this.pub.on("error", (err) => console.log("Redis Client Error", err));
        this.pub.on("reconnecting", () => console.log("Redis Client is reconnecting"));
        this.pub.on("ready", () => console.log("Redis Client is ready"));
        this.pub.on("end", () => console.log("Redis Client is disconnected")); 
    }

    public static getInstance() {
        console.log(`inside PubSubManager.getInstance ...`)
        if(!PubSubManager.instance){
            PubSubManager.instance = new PubSubManager();
        }
        return PubSubManager.instance;
    }
    
    public getPub() { 
        return this.pub ;
    }

    public getSub() { 
        return this.sub ;
    }
}