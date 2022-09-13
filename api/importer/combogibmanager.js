const Message = require("../message");

class CombogibManager{

    constructor(playerManager, killManager, lines){
        
        this.playerManager = playerManager;
        this.killManager = killManager;

        this.lines = lines;
        //used by smartCTF mod like sp0ngeb0bs
        this.comboEvents = [];

        this.playerStats = [];

        this.playerBestCombos = {};

        this.multiKillCombos = [];


        this.bUsedComboEvents = false;
        this.bUsedComboDamageType = false;

        this.parseComboLines();

    }

    parseComboLines(){

        if(this.lines.length > 0){
            this.bUsedComboEvents = true;
        }

        for(let i = 0; i < this.lines.length; i++){

            this.addComboEvent(this.lines[i]);
        }
    }

    getPlayerStats(playerId){

        playerId = parseInt(playerId);

        for(let i = 0; i < this.playerStats.length; i++){

            const p = this.playerStats[i];

            if(p.player === playerId){

                return p;
            }
        }

        this.playerStats.push({
            "player": playerId,
            "kills":{
                "primary": 0,
                "shockBall": 0,
                "combo": 0
            },
            "deaths":{
                "primary": 0,
                "shockBall": 0,
                "combo": 0
            },
            "bestKillsSingleCombo": 0,
            "bestComboKillsSingleLife": 0,
            "comboKillsSinceLastDeath": 0,
            "lastDeath": -1,
            "bestPrimaryKillsLife": 0,
            "primaryKillsSinceDeath": 0,
            "bestShockBallKillsLife": 0,
            "shockBallKillsSinceDeath": 0
        });

        return this.playerStats[this.playerStats.length - 1];
    }

    addComboEvent(line){

        const reg = /^(\d+\.\d+)\tcombo_kill\t(\d+)\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null){

            new Message(`CombogibManager.addKill() reg.exec(line) result was null.`,"warning");
            return;
        }

        const timestamp = parseFloat(result[1]);
        const killerMatchId = parseInt(result[2]);
        const victimMatchId = parseInt(result[3]);

        const killerId = this.playerManager.getOriginalConnectionMasterId(killerMatchId);
        const victimId = this.playerManager.getOriginalConnectionMasterId(victimMatchId);

        const killer = this.getPlayerStats(killerId);
        const victim = this.getPlayerStats(victimId);

        killer.kills.combo++;
        victim.deaths.combo++;
 

        this.comboEvents.push({
            "timestamp": timestamp,
            "killer": killerId,
            "victim": victimId
        });
    }

    getKillsWithTimestamp(timestamp, bComboEvents){

        timestamp = parseFloat(timestamp);
        const found = [];

        const events = (bComboEvents) ? this.comboEvents : this.comboKills;

        for(let i = 0; i < events.length; i++){

            const k = events[i];

            if(k.timestamp > timestamp) break;

            if(k.timestamp === timestamp){
                found.push(k);
            }

        }

        return found;
    }

    updatePlayerBestSingleComboKill(playerId, kills){

        const player = this.getPlayerStats(playerId);

        if(player.bestKillsSingleCombo < kills){
            player.bestKillsSingleCombo = kills;
        }
  
    }

    //probably overkill checking if two different players get a combo at the exact same time
    createMultiComboKills(duplicateTimes){

        for(const timestamp of duplicateTimes){

            const killers = {};

            const currentKills = this.getKillsWithTimestamp(timestamp, true);

            for(let i = 0; i < currentKills.length; i++){

                const k = currentKills[i];

                const killer = k.killer;
                const victim = k.victim;


                if(killers[killer] === undefined){
                    killers[killer] = 0;
                }

                if(killer !== victim) killers[killer]++;
            }

            for(const [key, value] of Object.entries(killers)){

                if(value < 2) continue;

                this.multiKillCombos.push({"timestamp": timestamp, "player": parseInt(key), "kills": value});
                this.updatePlayerBestSingleComboKill(key, value);
            }
        }
    }

    //combos captured as combo_kill\tkiller\tvictim
    createMultiCombosFromComboEvents(){

        let previousTimestamp = -1;

        const duplicateTimes = new Set();

        for(let i = 0; i < this.comboEvents.length; i++){

            const {timestamp} = this.comboEvents[i];

            if(timestamp === previousTimestamp){
                duplicateTimes.add(timestamp);
            }

            previousTimestamp = timestamp;
        }
        
        this.createMultiComboKills(duplicateTimes);

    }

    createMultiComboEventsFromKillsData(){

        this.comboMultiKillsAlt = [];

        for(const [timestamp, totalKills] of Object.entries(this.comboKillTimestamps)){

            if(totalKills <= 1) continue;

            const kills = this.getKillsWithTimestamp(timestamp, false);

            const players = {};

            for(let i = 0; i < kills.length; i++){

                const player = this.playerManager.getOriginalConnectionMasterId(kills[i].player);

                if(players[player] === undefined) players[player] = 0;

                players[player]++;
            }


            for(const [player, kills] of Object.entries(players)){

                if(kills > 1){
                    this.comboMultiKillsAlt.push({"timestamp": parseFloat(timestamp), "player": parseInt(player), "kills": kills});
                    this.updatePlayerBestSingleComboKill(player, kills);
                }
            }
        }

    }

    createPlayerEvents(){
        

        //if(this.comboEvents.length > 0){

            this.createMultiCombosFromComboEvents();
       // }else{

            this.createMultiComboEventsFromKillsData();
       // }

        //console.log("----------------------------------");
        //console.log(this.multiKillCombos);
        //console.log(this.comboMultiKillsAlt);

       // console.log(this.playerBestCombos);
        //console.log(this.playerStats);


        this.setPlayerStats();
        
    }

    createKillTypeData(){

        this.shockBallKills = [];
        this.primaryFireKills = [];
        this.comboKills = [];
        this.comboKillTimestamps = {};

        for(let i = 0; i < this.killManager.kills.length; i++){

            const k = this.killManager.kills[i];

            if(k.killerId === k.victimId || k.type.toLowerCase() == "suicide") continue;

            const deathType = k.deathType.toLowerCase();

            if(deathType !== "shockball" && deathType !== "jolted" && deathType !== "combo") continue;

            const currentKill = {
                "timestamp": k.timestamp,
                "player": this.playerManager.getOriginalConnectionMasterId(k.killerId),
                "victim": this.playerManager.getOriginalConnectionMasterId(k.victimId)
            };

            if(deathType === "shockball"){
                this.shockBallKills.push(currentKill);
            }

            if(deathType === "jolted"){
                this.primaryFireKills.push(currentKill);
            }

            if(deathType === "combo"){

                this.comboKills.push(currentKill);

                if(this.comboKillTimestamps[k.timestamp] === undefined){
                    this.comboKillTimestamps[k.timestamp] = 0;
                }

                this.comboKillTimestamps[k.timestamp]++;
            }
        }

        console.log(`Shock Ball kills = ${this.shockBallKills.length}, Primary Fire kills = ${this.primaryFireKills.length}, Combo Kills = ${this.comboKills.length}`);
    }


    updatePlayerStat(playerId, event, killType, timestamp){

        const player = this.getPlayerStats(playerId);

        const data = (event === "kill") ? player.kills : player.deaths;

        const deathsSinceLastEvent = this.killManager.getDeathsBetween(player.lastDeath, timestamp, playerId);


        if(deathsSinceLastEvent > 0){

            player.comboKillsSinceLastDeath = 0;
            player.shockBallKillsSinceDeath = 0;
            player.primaryKillsSinceDeath = 0;

            player.lastDeath = timestamp;

        }
    

        if(killType === "combo"){

            data.combo++;
            player.comboKillsSinceLastDeath++;

            if(player.comboKillsSinceLastDeath > player.bestComboKillsSingleLife){
                player.bestComboKillsSingleLife = player.comboKillsSinceLastDeath;
            }

        }else if(killType === "shockball"){

            data.shockBall++;

            player.shockBallKillsSinceDeath++;

            if(player.shockBallKillsSinceDeath > player.bestShockBallKillsLife){
                player.bestShockBallKillsLife = player.shockBallKillsSinceDeath;
            }

        }else if(killType === "primary"){

            data.primary++;

            player.primaryKillsSinceDeath++;

            if(player.primaryKillsSinceDeath > player.bestPrimaryKillsLife){
                player.bestPrimaryKillsLife = player.primaryKillsSinceDeath;
            }
        }

    }


    resetAllPlayerKillsSinceDeath(){

        for(let i = 0; i < this.playerStats.length; i++){

            const p = this.playerStats[i];

            p.comboKillsSinceLastDeath = 0;
        }
    }

    //set the stats with combo events if they have not been set with damagetypes
    setPlayersBestComboSingleLife(){


        this.resetAllPlayerKillsSinceDeath();

        const playersLastComboKill = {};

        for(let i = 0; i < this.comboEvents.length; i++){

            const e = this.comboEvents[i];

            if(playersLastComboKill[e.killer] === undefined){
                playersLastComboKill[e.killer] = e.timestamp;
            }

            const totalDeaths = this.killManager.getDeathsBetween(playersLastComboKill[e.killer], e.timestamp, e.killer);

            const playerStats = this.getPlayerStats(e.killer);

            if(totalDeaths === 0){

                playerStats.comboKillsSinceLastDeath++;

                if(playerStats.comboKillsSinceLastDeath > playerStats.bestComboKillsSingleLife){
                    playerStats.bestComboKillsSingleLife = playerStats.comboKillsSinceLastDeath;
                }

            }else{

                playerStats.comboKillsSinceLastDeath = 1;
            }

            playersLastComboKill[e.killer] = e.timestamp;
        }
    }


    setPlayerStats(){


        if(this.comboEvents.length === 0){

            for(let i = 0; i < this.comboKills.length; i++){
                
                const k = this.comboKills[i];

                this.updatePlayerStat(k.player, "kill", "combo", k.timestamp);
                this.updatePlayerStat(k.victim, "death", "combo", k.timestamp);
            }
        }


        for(let i = 0; i < this.shockBallKills.length; i++){

            const k = this.shockBallKills[i];

            this.updatePlayerStat(k.player, "kill", "shockball", k.timestamp);
            this.updatePlayerStat(k.victim, "death", "shockball", k.timestamp);
        }
            

        for(let i = 0; i < this.primaryFireKills.length; i++){

            const k = this.primaryFireKills[i];

            this.updatePlayerStat(k.player, "kill", "primary", k.timestamp);
            this.updatePlayerStat(k.victim, "death", "primary", k.timestamp);
        }


        //set player best kills with combos in single life but only with the combo events, 

        this.setPlayersBestComboSingleLife();
       
        console.log(this.playerStats);
    }

}


module.exports = CombogibManager;