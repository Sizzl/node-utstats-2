const ACE = require('../ace');
const fs = require('fs');
const config = require('../../config.json');
const geoip = require('geoip-lite');


class AceManager{

    constructor(){
        this.ace = new ACE();
    }

    async importLog(fileName, mode, data){

        const lines = data.match(/^.+$/img);

        if(mode === "join"){
            await this.importPlayerJoins(fileName, lines);
        }else if(mode === "kick"){
            await this.importKickLog(fileName, data, lines);
        }
    }

    async importPlayerJoins(fileName, lines){

        const joins = this.parseJoinLog(lines);

        for(let i = 0; i < joins.length; i++){

            const j = joins[i];

            const country = geoip.lookup(j.ip);

            if(country === null){
                j.country = "XX";
            }else{
                j.country = country.country;
            }

            await this.ace.insertJoin(fileName, j);
            await this.ace.updatePlayer(j);
        }

        fs.renameSync(`${config.ace.logDir}/${fileName}`, `Logs/imported/ace/joins/${fileName}`);
    }

    parseJoinLog(lines){

        const reg = /^\[(.+?)\]: \[(.+?)\]: \[(.+)\](.+?)$/i;

        const joins = [];

        for(let i = 0; i < lines.length; i++){

            const line = lines[i];
            const result = reg.exec(line);

            if(result !== null){

                const type = result[3].toLowerCase();

                if(type === "ip") joins.push({"ace": result[1], "name": result[2]});
            
                const current = joins[joins.length - 1];

                let currentData = result[4].trim();

                if(type === "time"){
             
                    currentData = this.ace.convertTimeStamp(currentData);

                }
    
                current[type] = currentData;
            }
        }
        return joins;
    }

    parseKickLog(lines){

        const reg = /\[(.+?)\]: (.+?)\.*: (.*)/i;
        const speedReg = /^(\d+\.\d+).+$/i;

        const data = {};

        for(let i = 0; i < lines.length; i++){

            const line = lines[i];

            const result = reg.exec(line);

            if(result !== null){

                const aceVersion = result[1];

                if(data.version === undefined){
                    data.version = aceVersion;
                }

                let type = result[2].toLowerCase();

                let currentValue = result[3];

                if(type === "cpuspeed"){

                    const speedResult = speedReg.exec(currentValue);
                    currentValue = speedResult[1];

                }else if(type === "timestamp"){

                    currentValue = this.ace.convertTimeStamp(currentValue);

                }

                if(type === "libraryname") type = "packagename";
                if(type === "librarypath") type = "packagepath";
                if(type === "librarysize") type = "packagesize";
                if(type === "libraryhash") type = "packagehash";
                if(type === "libraryver") type = "packagever";
                
                

                data[type] = currentValue;

            }
        }

        return data;
    }

    async importKickLog(fileName, rawData, lines){

        const data = this.parseKickLog(lines);

        if(data.kickreason){

            const country = geoip.lookup(data.playerip);

            if(country === null){
                data.country = "XX";
            }else{
                data.country = country.country;
            }

            await this.ace.insertKick(fileName, rawData, data);
        }

        fs.renameSync(`${config.ace.logDir}/${fileName}`, `Logs/imported/ace/kicks/${fileName}`);
        
    }
}


module.exports = AceManager;