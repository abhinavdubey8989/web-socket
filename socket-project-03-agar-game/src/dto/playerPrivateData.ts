import GAME_SETTINGS from "../settings/gameSettings";



export class PlayerPrivateData{

    xVector : number;
    yVector : number;
    speed : number;
    zoom : number ;

    constructor(){
        this.xVector = 0;
        this.yVector = 0;
        this.speed = GAME_SETTINGS.defaultSpeed;
        this.zoom = GAME_SETTINGS.defaultZoom;
    }
}

