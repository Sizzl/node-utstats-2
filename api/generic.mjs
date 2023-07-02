
export function fart(){
    return "Fart Noise";
}

export function getNameFromDropDownList(names, targetId){

    targetId = parseInt(targetId);
    
    for(let i = 0; i < names.length; i++){

        const n = names[i];

        if(n.value === targetId) return n.displayValue;
    }

    return "Not Found";
}

export function plural(value, word){

    if(value == "") return "";

    if(value === 1) return word;

    return `${word}s`;
}

export function toPlaytime(seconds, bIncludeMilliSeconds){

    if(seconds === 0) return "None";

    const milliSeconds = seconds % 1;

    if(bIncludeMilliSeconds === undefined) bIncludeMilliSeconds = false;

    const rSeconds = Math.floor(seconds % 60);
    let secondString = plural(rSeconds, "Second");

    const totalMintues = Math.floor(seconds / 60);

    const rMinutes = Math.floor(totalMintues % 60);
    const minuteString = plural(rMinutes, "Minute");
        
    const hours = Math.floor(totalMintues / 60);
    const hoursString = plural(hours, "Hour");

   // const minutes = Math.floor(seconds / 60) % 60;

    if(hours > 0){

        if(rMinutes > 0){
            return `${hours} ${hoursString}, ${rMinutes} ${minuteString}`;
        }else{

            if(rSeconds > 0){
                return `${hours} ${hoursString}, ${rSeconds} ${secondString}`;
            }
        }

        return `${hours} ${hoursString}`;
        
    }else{

        if(rMinutes > 0){

            if(rSeconds > 0){
                return `${rMinutes} ${minuteString}, ${rSeconds} ${secondString}`;
            }

            return `${rMinutes} ${minuteString}`;

        }else{

            if(rSeconds > 0){

                if(bIncludeMilliSeconds){

                    let ms = Math.floor(milliSeconds * 100);
                    if(ms < 10) ms = `0${ms}`;
             
                    return `${rSeconds}.${ms} Seconds`;
                }

                return `${rSeconds} ${secondString}`;
            }

            return `${Math.floor(milliSeconds * 1000)} ms`;
        }
    }
}

export function getDayName(day){

    switch(day){
        case 0: {   return 'Sunday'; }
        case 1: {   return 'Monday'; }
        case 2: {   return 'Tuesday'; }
        case 3: {   return 'Wednesday'; }
        case 4: {   return 'Thursday'; }
        case 5: {   return 'Friday'; }
        case 6: {   return 'Saturday'; }
    }
}


export function getMonthName(month, bFull){

    if(bFull === undefined){
        bFull = false;
    }

    const short = {
        "0": "Jan",
        "1": "Feb",
        "2": "Mar",
        "3": "Apr",
        "4": "May",
        "5": "June",
        "6": "July",
        "7": "Aug",
        "8": "Sep",
        "9": "Oct",
        "10": "Nov",
        "11": "Dec"
    };


    const long = {
        "0": "January",
        "1": "February",
        "2": "March",
        "3": "April",
        "4": "May",
        "5": "June",
        "6": "July",
        "7": "August",
        "8": "September",
        "9": "October",
        "10": "November",
        "11": "December"
    };

   
    if(bFull) return long[month];
    return short[month];
}

export function getOrdinal(value){

    const first = value % 10;
    const second = value % 100;

    if(second >= 10 && second < 20){
        return 'th';
    }

    if(first === 1){
        return 'st';
    }else if(first === 2){
        return 'nd';
    }else if(first === 3){
        return 'rd';
    }

    return 'th';   
}

export function convertTimestamp(timestamp, noDayName, noTime){

    noDayName = (noDayName !== undefined) ? noDayName : false;
    noTime = (noTime !== undefined) ? noTime : false;

    const now = new Date();
    now.setTime(timestamp * 1000);

    const year = now.getFullYear();
    const month = now.getMonth();
    const dayName = now.getDay();
    const day = now.getDate();
    const hour = now.getHours();
    let minute = now.getMinutes();
    
    if(minute < 10) minute = `0${minute}`;

    let dayNameString = "";

    if(!noDayName){
        dayNameString = `${getDayName(dayName)} `;
    }
    
    let timeString = "";

    if(!noTime){
        timeString = ` ${hour}:${minute}`;
    }

    return `${dayNameString}${day}${getOrdinal(day)} ${getMonthName(month)} ${year}${timeString}`;
}

export function getPlayer(players, id, bObject){

    id = parseInt(id);

    bObject = bObject ?? false;

    if(!bObject){

        for(let i = 0; i < players.length; i++){
    
            if(players[i].id === id){
                return players[i];
            }
        }
    }else{

        if(players !== null){

            if(players[id] !== undefined){
                return players[id];
            }
        }
    }

    return {"name": "not found", "country": "xx", "team": 0, "id": -1}
}


export function ignore0(input){

    if(input != 0){
        return input;
    }

    return "";
}

/**
 * 
 * @param {Object} data 
 * @param {Array} targetKeys Array of target key names
 * @param {Array} returnKeys Array of the new keys for the unique values, targetKeys[0] = returnKeys[0] ect.
 */
export function getUniqueValuesFromObject(data, targetKeys, returnKeys){
    
    if(targetKeys.length > returnKeys.length) throw new Error("targetKeys must be at least the same length of returnKeys");

    const obj = {};

    for(let i = 0; i < returnKeys.length; i++){

        if(obj[returnKeys[i]] !== undefined) continue;
        obj[returnKeys[i]] = new Set();
    }

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        for(let x = 0; x < targetKeys.length; x++){

            const currentKey = targetKeys[x];
            const targetKey = returnKeys[x];

            obj[targetKey].add(d[currentKey]);
        }
    }

    for(const [key, values] of Object.entries(obj)){

        obj[key] = [...values]; 
    }

    return obj;
}

export function MMSS(timestamp){

    let seconds = Math.floor(timestamp % 60);
    let minutes = Math.floor(timestamp / 60);
    let hours = Math.floor(minutes / 60);

    if(seconds < 0) seconds = 0;
    if(minutes < 0) minutes = 0;

    if(seconds < 10){
        seconds = `0${seconds}`;
    }

    if(minutes < 10){
        minutes = `0${minutes}`;
    }

    if(hours < 1){
        return `${minutes}:${seconds}`;
    }else{

        minutes = minutes % 60;
        if(minutes < 10) minutes = `0${minutes}`;
        
        return `${hours}:${minutes}:${seconds}`;
    }
}


export function firstCharToUpperCase(text){

    if(text.length === 0) return "";

    const char1 = text[0].toUpperCase();

    const otherChars = text.substring(1);

    return `${char1}${otherChars}`;
}


export function toTeamColor(teamId){

    teamId = parseInt(teamId);

    if(teamId === 0) return "Red";
    if(teamId === 1) return "Blue";
    if(teamId === 2) return "Green";
    if(teamId === 3) return "Yellow";

    return "None";
}

export function removeUnr(name){

    const reg = /^(.+?)\.unr$/i;

    const result = reg.exec(name);

    if(result !== null){
        return result[1];
    }

    return name;
}

export function removeMapGametypePrefix(name){

    const reg = /^.*?-(.+)$/i;

    const result = reg.exec(name);

    if(result === null){
        return name;
    }else{

        return result[1];
    }
}

export function cleanMapName(name){

    name = removeUnr(name);
    name = removeMapGametypePrefix(name);

    name = name.replace(/[\[\]\'\`]/ig,"");

    return name;
}