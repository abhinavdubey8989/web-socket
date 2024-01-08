import { getRandomRGBString } from "../game-utils/game.utils";
import GAME_SETTINGS from "../settings/gameSettings";


export class Orb {

    id : string;
    orbColor : string;
    orbX : number;
    orbY : number;
    orbRadius : number;

    constructor(id: string) {
        this.id = id;
        this.orbColor = getRandomRGBString();
        this.orbX = Math.floor(Math.random() * GAME_SETTINGS.worldWidth);
        this.orbY = Math.floor(Math.random() * GAME_SETTINGS.worldHeight);
        this.orbRadius = GAME_SETTINGS.defaultGenericOrbSize;
    }

}