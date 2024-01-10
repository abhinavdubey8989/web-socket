

import { IoManager } from './manager/ioManager';
import { Server as HttpServer } from "http";
import express from 'express';
import { config } from 'dotenv';
import { PubSubManager } from './manager/pubSubManager';
import { router as testRouter} from './routes/test.router';
config();

const port:string = process.env.PORT;


// creating an httpServer using express
const app = express();

// api end points (testing only)
app.use("/api" , testRouter);


// app.use(express.static(path.join(__dirname, '..', 'public')));
const httpServer : HttpServer = app.listen(port , async() => {
    console.log(`started on port ${port} ...`);
    PubSubManager.getInstance()
});


export default httpServer;







