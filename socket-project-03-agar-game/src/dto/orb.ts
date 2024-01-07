import { getRandomRGBString } from "../game-utils/game.utils";
import GAME_SETTINGS from "../settings/gameSettings";


export class Orb {

    orbColor : string;
    orbX : number;
    orbY : number;
    orbRadius : number;

    constructor() {
        this.orbColor = getRandomRGBString();
        this.orbX = Math.floor(Math.random() * GAME_SETTINGS.worldWidth);
        this.orbY = Math.floor(Math.random() * GAME_SETTINGS.worldHeight);
        this.orbRadius = GAME_SETTINGS.defaultGenericOrbSize;
    }

}