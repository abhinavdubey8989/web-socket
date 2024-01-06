import { Router } from "express";
import { IoManager } from "../manager/ioManager";
import { PubSubManager } from "../manager/redisManager";


const router = Router();

router.get("/app" , (re, res)=>{

    // const io = IoManager.getInstance().getIo();
    // const pub = PubSubManager.getInstance().getPub()
    // console.log(io);
    // console.log(pub);

    res.json({a:1 , b:2 , c:3});
});

export { router } ;