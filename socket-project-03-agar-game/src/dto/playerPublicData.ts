import { getRandomNum, getRandomRGBString } from "../game-utils/game.utils";
import GAME_SETTINGS from "../settings/gameSettings";



export class PlayerPublicData{

    socketId : string;
    name : string;
    x : number;
    y : number;
    radius : number;
    color : string ;
    score : number;
    orbsAbsorbed : number;
    playersAbsorbed : number;


    constructor(socketId : string , playerName:string){
        this.name = playerName;
        this.x = getRandomNum(GAME_SETTINGS.worldHeight);
        this.y = getRandomNum(GAME_SETTINGS.worldWidth);
        this.radius = 10;
        this.color = getRandomRGBString();
        this.score = 0;
        this.orbsAbsorbed = 0;
        this.playersAbsorbed = 0;
        this.socketId = socketId;
    }
}

