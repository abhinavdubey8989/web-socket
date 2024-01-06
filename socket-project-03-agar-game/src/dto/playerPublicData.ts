import { getRandomNum, getRandomRGBString } from "../game-utils/game.utils";
import GAME_SETTINGS from "../settings/gameSettings";



export class PlayerPublicData{

    name : string;
    x : number;
    y : number;
    radius : number;
    color : string ;
    score : number;
    orbsAbsorbed : number;

    constructor(playerName:string){
        this.name = playerName;
        this.x = getRandomNum(GAME_SETTINGS.worldHeight);
        this.y = getRandomNum(GAME_SETTINGS.worldWidth);
        this.color = getRandomRGBString();
        this.score = 0;
        this.orbsAbsorbed = 0;
    }
}

