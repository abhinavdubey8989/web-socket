
import { config } from 'dotenv';
config();

export class GameSettings {

    worldWidth : number;
    worldHeight : number;
    defaultSpeed : number
    defaultZoom : number;
    defaultGenericOrbSize : number;
    initOrbCount : number;


    constructor(){
        this.worldHeight = +process.env.WORLD_HEIGHT;
        this.worldWidth = +process.env.WORLD_WIDTH;
        this.defaultSpeed = +process.env.DEFAULT_SPEED;
        this.defaultZoom = +process.env.DEFAULT_ZOOM;
        this.defaultGenericOrbSize = +process.env.DEFAULT_GENERIC_ORB_SIZE;
        this.initOrbCount = +process.env.INIT_ORB_COUNT
    }

}


const GAME_SETTINGS : GameSettings = new GameSettings();
Object.freeze(GAME_SETTINGS);
export default GAME_SETTINGS;