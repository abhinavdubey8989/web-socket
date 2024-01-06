


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