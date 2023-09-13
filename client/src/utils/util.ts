/* 
    Function that converts a unix timestamp to a formatted time string
    Ex: Input 12394127000 -> Output 11:42 AM
*/
export const convertTimestamp = (timestamp: any) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true})
}

/* 
    Function that gets the current time and returns an object
    with the current Hour and the current minutes formatted with 24 hour clock
    Ex: Input None -> Output {currHour: 13, currMin: 52}
*/
export const getCurrentTime = () => {
    const currentTime = new Date().toLocaleString('en-US', {timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: true});
    const splitTime = currentTime.split(':');
    let currHour = Number(splitTime[0]);
    let currMin = Number(splitTime[1].split(" ")[0]);
    const amPm = splitTime[1][splitTime[1].length - 2];
    if (amPm === 'P') currHour += 12; 

    return {currHour, currMin}
}

/* 
    Function that returns the arrival times for the next 10 mins
    Ex: Input [12:32, 08:22, 10:11, ...] -> Output [10:11, 10:13, 10:17]
*/
export const getNearestArrivalTime = (times: any) => {
    let result: string[] = [];
    const {currHour, currMin} = getCurrentTime();

    for (const hour of times) {
        const fSplit = hour.split(":");
        const fHour = Number(fSplit[0]);
        const fMin = Number(fSplit[1]);
        if (fHour === currHour && (fMin >= currMin && fMin <= currMin + 10)) {
            if(!result.includes(hour)) result.push(hour);
        }
    }
    return result.sort();
}

/* 
    Function that determines if bus positions should be fetched again
    If last update of bus fetch was > 3 mins ago then returns 1
    Ex: Input 10:33 AM -> Output 1 or 0
    1 if should be refresh, 0 otherwise
*/
export const checkRefreshTimer = (lastUpdate: string) => {
    const {currHour, currMin} = getCurrentTime();
    const fSplit = lastUpdate.split(":");
    let fHour = Number(fSplit[0]);
    const splitMin = fSplit[1].split(" ");
    const fMin = Number(splitMin[0]);
    const amPm = splitMin[1][0];
    if (amPm === 'P') {fHour += 12};
    
    //If more than 3 mins since last update refresh buses
    if (fHour <= currHour && Math.abs(currMin - fMin) > 3) return 1;
    return 0;
}