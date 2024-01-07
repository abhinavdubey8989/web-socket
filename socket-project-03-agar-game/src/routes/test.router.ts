import { Router , Request} from "express";
import { IoManager } from "../manager/ioManager";
import { PubSubManager } from "../manager/pubSubManager";
import { getServerDetails } from "../game-utils/game.utils";


const router = Router();

router.get("/app" , (req : Request , res)=>{

    // const io = IoManager.getInstance().getIo();
    // const pub = PubSubManager.getInstance().getPub()
    // console.log(io);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.removeHeader('ETag');
    res.removeHeader('Last-Modified');

    console.log(`inside ${req.url} ...`);
    res.json(getServerDetails());

});

export { router } ;