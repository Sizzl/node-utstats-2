class Functions{

    static firstCharLowerCase(input){

        let ending = input.substring(1);

        return `${input[0].toLowerCase()}${ending}`;
    }

    //default value is optional
    static setValueIfUndefined(input, defaultValue){

        if(defaultValue === undefined) defaultValue = 0;

        if(input !== undefined){
            if(input === null){
                return defaultValue;
            }
        }
        
        if(input === undefined) return defaultValue;

        return input;
    }


    static calculateKillEfficiency(kills, deaths){
        
        if(kills === 0) return 0;
        if(deaths === 0 && kills > 0) return 100;
        
        return (kills / (kills + deaths)) * 100;
    }
    

    static getPlayer = (players, id) =>{

        for(let i = 0; i < players.length; i++){
    
            if(players[i].id === id){
                return players[i];
            }
        }
    
        return {"name": "not found", "country": "xx", "team": 0}
    }


    static getTeamColor(team){

        switch(team){
            case 0: {  return "team-red"; } ;
            case 1: {  return "team-blue"; } ;
            case 2: {  return "team-green"; } ;
            case 3: {  return "team-yellow"; };
            default: { return "team-none";} ;
        }
    }

    static getTeamName(team, bIgnoreTeam){

        let teamName = '';

        switch(team){

            case 0: { teamName = "Red"; } break;
            case 1: { teamName = "Blue"; } break;
            case 2: { teamName = "Green"; } break;
            case 3: { teamName = "Yellow"; } break;
            default: { teamName = "None"; } break;
        }


        if(bIgnoreTeam === undefined){

            if(teamName === "None") return "None";
            return `${teamName} Team`;
        }else{
            return teamName;
        }
    }


    static removeIps(data){

        if(data !== undefined){

            if(data !== null){

                for(let i = 0; i < data.length; i++){

                    if(data[i].ip !== undefined){
                        delete data[i].ip;
                    }
                }
            }
        }

        return data;
    }



    static getUniqueValues(data, key){

        const found = [];

        for(let i = 0; i < data.length; i++){

            if(found.indexOf(data[i][key]) === -1){
                found.push(data[i][key]);
            }
        }

        return found;
    }

    /**
     * Modify an array of objects by inserting a new key into each object with the ids matching value
     * @param {*} data Array of Objects to modify
     * @param {*} names Object/Array of id -> name pairs, e.g {"1": 'a name'}
     * @param {*} key What key holds the data for the id we need e.g a[key]
     * @param {*} newKey What key to create with the matching id's name e.g a[newKey]=value
     */
    static setIdNames(data, names, key, newKey){

        let d = 0;
        let currentId = 0;
    
        for(let i = 0; i < data.length; i++){
    
            d = data[i];
            currentId = d[key];
    
            if(names[currentId] !== undefined){
                d[newKey] = names[currentId];
            }else{
                d[newKey] = 'Not Found';
            }
        }
    }


    static removeMapGametypePrefix(name){

        const reg = /^.+?-(.+)$/i;

        const result = reg.exec(name);

        if(result === null){
            return name;
        }else{

            return result[1];
        }
    }


    static removeUnr(name){

        const reg = /^(.+?)\.unr$/i;

        const result = reg.exec(name);

        if(result !== null){
            return result[1];
        }

        return name;
    }

    static cleanMapName(name){

        name = this.removeUnr(name);
        name = this.removeMapGametypePrefix(name);

        name = name.replace(/[\[\]\'\`]/ig,"");

        return name;
    }

    static setSafeInt(value, defaultValue, minValue, maxValue){

        if(defaultValue === undefined) defaultValue = 1;

        if(value === undefined) return defaultValue;

        value = parseInt(value);

        if(value !== value){
            return defaultValue;
        }

        if(minValue !== undefined){

            if(value < minValue){
                return minValue;
            }
        }

        if(maxValue !== undefined){

            if(value > maxValue){
                return maxValue;
            }
        }

        return value;
    }


    /**
     * Only display Values that are not zero
     */

    static ignore0(input){

        if(input != 0){
            return input;
        }

        return '';
    }


    static MMSS(timestamp){

        let seconds = Math.floor(timestamp % 60);
        let minutes = Math.floor(timestamp / 60);

        if(seconds < 0) seconds = 0;
        if(minutes < 0) minutes = 0;

        if(seconds < 10){
            seconds = `0${seconds}`;
        }

        if(minutes < 10){
            minutes = `0${minutes}`;
        }

        return `${minutes}:${seconds}`;
    }


    static insertIfNotExists(array, value){


        for(let i = 0; i < array.length; i++){

            if(array[i] === value) return array;
        }

        array.push(value);
    }


    static cleanDamage(damage){

        if(damage < 1000) return damage;

        if(damage >= 1000 && damage < 1000000){
            return `${(damage / 1000).toFixed(2)}K`;
        }else if(damage >= 1000000 && damage < 1000000000){
            return `${(damage / 1000000).toFixed(2)}M`;
        }else if(damage >= 1000000000 && damage < 1000000000000){
            return `${(damage / 1000000000).toFixed(2)}B`;
        }else{
            return `${(damage / 1000000000000).toFixed(2)}T`;
        }

    }


    /**
     * 
     * @param {*} total how many arrays to create (Used for graphs)
     * @returns 
     */
    static createDateRange(total, defaultValue){

        const obj = [];

        for(let i = 0; i < total; i++){

            obj.push(defaultValue);
        }

        return obj;
    }


    static insertIfNotExists(data, value){

        if(data.indexOf(value) === -1) data.push(value);

    }


    static getOrdinal(value){

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

    static getDayName = (day) =>{

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
    
    
    static getMonthName = (month) =>{
    
        switch(month){
            case 0: { return 'January'; } 
            case 1: { return 'February'; } 
            case 2: { return 'March'; } 
            case 3: { return 'April'; } 
            case 4: { return 'May'; } 
            case 5: { return 'June'; } 
            case 6: { return 'July'; } 
            case 7: { return 'August'; } 
            case 8: { return 'September'; } 
            case 9: { return 'October'; } 
            case 10: { return 'November'; } 
            case 11: { return 'December'; } 
        }
    }
    
    static convertTimestamp = (timestamp, noDayName, noTime) =>{
    
        const now = new Date();
        now.setTime(timestamp * 1000);
    
        const year = now.getFullYear();
        const month = now.getMonth();
        const dayName = now.getDay();
        const day = now.getDate();
        const hour = now.getHours();
        let minute = now.getMinutes();
        
        if(minute < 10) minute = `0${minute}`;
    
        let dayNameString = `${this.getDayName(dayName)} `;
    
        if(noDayName !== undefined){
            dayNameString = '';
        }
    
        let timeString = ` ${hour}:${minute}`;
    
        if(noTime !== undefined){
            timeString = '';
        }
    
        return `${dayNameString}${day}${this.getOrdinal(day)} ${this.getMonthName(month)} ${year}${timeString}`;
    
    }

}

module.exports = Functions;