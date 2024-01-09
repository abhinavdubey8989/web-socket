


import os from 'os';

/**
 * 
 * @param multiplier 
 * @returns a random number in the range [minVal , (multiplier+minVal)]
 * 
 */
export function getRandomNum(multiplier : number , minVal : number = 10) : number{
    return Math.floor(multiplier * Math.random() + minVal);
}


/**
 * 
 * @returns rgb is range (0,0,0)-(256,256,256)
 */
export function getRandomRGBString() : string{
    const r = getRandomNum(200 , 50);
    const g = getRandomNum(200 , 50);
    const b = getRandomNum(200 , 50);
    return `rgb(${r},${g},${b})`;
}

/**
 * 
 * @returns json.parsed data or null
 */
export function getValidDataFromJsonString(jsonStringifiedMsg) : any {
    try{
        const parsedData = JSON.parse(jsonStringifiedMsg);
        return parsedData;
    }catch(e){
        console.log(`invalid data in getValidDataFromJsonString`)
        return null;
    }
}


/**
 * 
 * @returns 
 */
export function getServerDetails() {
    const port = process.env.PORT;
    const host = os.hostname();
    return {host , port};
}


/**
 * 
 * @returns 
 */
export function isSelf(incomingServerId) {
    const currServer = getServerId();
    return currServer === incomingServerId;
}


/**
 * 
 * @returns 
 */
export function getServerId() {
    const serverId = os.hostname() + ` :: ${process.env.PORT}`;
    return serverId;
}