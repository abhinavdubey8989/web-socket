
import { config } from 'dotenv';
config();

export class GameSettings {

    public worldWidth : number;
    public worldHeight : number;
    public defaultSpeed : number
    public defaultZoom : number

    constructor(){
        this.worldHeight = +process.env.WORLD_HEIGHT;
        this.worldWidth = +process.env.WORLD_WIDTH;
        this.defaultSpeed = +process.env.DEFAULT_SPEED;
        this.defaultZoom = +process.env.DEFAULT_ZOOM;
    }

}


const GAME_SETTINGS : GameSettings = new GameSettings();
Object.freeze(GAME_SETTINGS);
export default GAME_SETTINGS;