import { createClient } from 'redis';

export class PubSubManager {
    private static instance: PubSubManager;
    private pub;
    private sub;

  
    private constructor() {
        this.pub = createClient({
            url  : `redis://host.docker.internal:6379`
          });   


        this.pub.on('connect' , async()=>{
            this.sub = this.pub.duplicate();
            this.sub.on('error', err => console.error(err));
            await this.sub.connect();    
            this.pub.on('connect' , ()=>{
                console.log(`subscriber to redis client !!`)
            });

            console.log(`publisher to redis client !!`)
        });

        this.pub.on("error", (err) => console.log("Redis Client Error", err));
        this.pub.on("reconnecting", () => console.log("Redis Client is reconnecting"));
        this.pub.on("ready", () => console.log("Redis Client is ready"));
        this.pub.on("end", () => console.log("Redis Client is disconnected")); 
    }

    public static initPubSubManager() {
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