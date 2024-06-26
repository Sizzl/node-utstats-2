const config = require('../../config.json');
const Message = require('../message');
const Logs = require('../logs');
const ServerInfo = require('./serverInfo');
const MapInfo = require('./mapInfo');
const GameInfo = require('./gameinfo');
const PlayerManager = require('./playermanager');
const KillManager = require('./killmanager');
const Matches = require('../matches');
const Match = require('../match');
const Maps = require('../maps');
const Gametypes = require('../gametypes');
const CTFManager = require('./ctfmanager');
const LMSManager = require('./lmsmanager');
const AssaultManager = require('./assaultmanager');
const DOMManager = require('./dommanager');
const SpawnManager = require('./spawnmanager');
const WeaponsManager = require('./weaponsmanager');
const ItemsManager = require('./itemsmanager');
const CountriesManager = require('./countriesmanager');
const Rankings = require('../rankings');
const MonsterHuntManager = require('./monsterhuntmanager');
const CombogibManager = require('./combogibmanager');
const geoip = require('geoip-lite');
const md5 = require("md5");

class MatchManager{

    constructor(data, fileName, bIgnoreBots, minPlayers, minPlaytime, bUsePlayerACEHWID){

        this.data = data;
        this.fileName = fileName;
        this.bIgnoreBots = bIgnoreBots;

        this.minPlayers = minPlayers;
        this.minPlaytime = minPlaytime;

        this.bLinesNull = false;

        this.combogibLines = [];

        this.bFoundMatchStart = false;
        this.bFoundRealMatchStart = false;
        this.bUnderMinPlaytime = false;
        this.bUnderMinPlayerLimit = false;

        this.bUsePlayerACEHWID = bUsePlayerACEHWID;

        new Message(`Starting import of log file ${fileName}`,"note");
        new Message(`Auto merge players by HWID is set to ${Boolean(this.bUsePlayerACEHWID)}`, "note");

        this.convertFileToLines();

    }

    async import(){

        try{

            const start = performance.now() * 0.001;

            if(config.bIgnoreDuplicates){

                if(await Logs.bExists(this.fileName)){
                    new Message(`${this.fileName} has already been imported and will not be re-imported, to change this change bIgnoreDuplicates to false in config.js`,'warning');
                    new Message(`Finished import of log file ${this.fileName}.`, 'note');
                    return;
                }
            }

            if(!this.bFoundRealMatchStart){

                new Message(`There is no match realstart event, skipping import.`,"note");
                return;
            }


            this.mapInfo = new MapInfo(this.mapLines);
            this.gameInfo = new GameInfo(this.gameLines);

            

            if(this.gameInfo.matchLength < this.minPlaytime){

                new Message(`Match length is less then the minimum specified, skipping.`, "note");
                this.bUnderMinPlaytime = true;
                return null;
            }

           

            this.serverInfo = new ServerInfo(this.serverLines, this.gameInfo.getMatchLength());

            

            await this.serverInfo.updateServer(geoip);
            new Message(`Inserted server info into database.`, 'pass');

            this.gametype = new Gametypes(this.gameInfo.gamename);

            await this.gametype.updateStats(this.gameInfo.gamename, this.serverInfo.date, this.gameInfo.getMatchLength().length);      

            if(this.gametype.currentMatchGametype === undefined){
                new Message(`Incomplete log skipping...`,'error');
                return null;
            }

            this.spawnManager = new SpawnManager();
            this.playerManager = new PlayerManager(
                this.playerLines, 
                this.spawnManager, 
                this.bIgnoreBots, 
                this.gameInfo.getMatchLength(), 
                geoip, 
                this.bUsePlayerACEHWID,
                this.gameInfo.hardcore
            );

            const matchTimings = this.gameInfo.getMatchLength();
            
            await this.mapInfo.updateStats(this.serverInfo.date, matchTimings.length);
            if(this.mapInfo.maps.bMergeError) return;
            

            await this.playerManager.createPlayers(this.gametype.currentMatchGametype, this.mapInfo.mapId);
            this.playerManager.totalTeams = this.gameInfo.totalTeams;
            this.playerManager.init();

            this.playerManager.setPlayerPlaytime(this.gameInfo.hardcore);

            //const playersWithPlaytime = this.playerManager.getTotalPlayersWithPlaytime();
            const playersWithPlaytime = this.playerManager.getTotalPlayers();
            

            if(playersWithPlaytime < this.minPlayers){
                new Message(`Total players is less then the minimum specified, skipping.`, "note");

                this.bUnderMinPlayerLimit = true;
                return null;
            }

            

    
            if(this.mapInfo.mapPrefix === "mh"){
                this.gameInfo.totalTeams = 0;
            }
 
            

            this.killManager = new KillManager(this.killLines, this.playerManager, this.bIgnoreBots, matchTimings, this.gameInfo.hardcore);

            this.playerManager.killManager = this.killManager;

            

            this.playerManager.setKills(this.killManager.kills);
            this.playerManager.matchEnded(this.gameInfo.end);
            this.playerManager.setHeadshots(this.killManager.headshots);
            //this.playerManager.setPlayerPlaytime(this.gameInfo.hardcore);

            this.match = new Match();
            this.matches = new Matches();
            this.maps = new Maps();
 
            


            this.spawnManager.setMapId(this.mapInfo.mapId);
            await this.spawnManager.updateMapStats();
            new Message(`Inserted map info into database.`, 'pass');

            this.serverId = await this.serverInfo.getServerId();

            await this.insertMatch();
            new Message(`Inserted match info into database.`,'pass');

            await this.playerManager.updateFaces(this.serverInfo.date);
            await this.playerManager.updateVoices(this.serverInfo.date);
            await this.playerManager.setIpCountry();

            this.playerManager.pingManager.parsePings(this.playerManager);
            await this.playerManager.pingManager.insertPingData(this.matchId);

            this.playerManager.teamsManager.parseTeamChanges(this.playerManager);
            await this.playerManager.teamsManager.insertTeamChanges(this.matchId);
            // no longer needed with new way of calculating playtime includes hardcore check
            //this.playerManager.fixPlaytime(this.gameInfo.hardcore, this.gameInfo.matchLength);


            
            new Message(`Updated player team changes`,'pass');
            //process.exit();

            const bLMS = this.bLastManStanding();
            if(!bLMS){
                this.setMatchWinners();
            }

            await this.playerManager.insertMatchData(
                this.gametype.currentMatchGametype, 
                this.matchId, this.mapInfo.mapId, 
                this.serverInfo.date
            );
            new Message(`Updated player match data.`,'pass');
            
            await this.serverInfo.setLastIds(this.serverId, this.matchId, this.mapInfo.mapId);

            

            

            //this.playerManager.mergeDuplicates(bLMS);
            
    
            
            if(this.assaultManager !== undefined){

                this.assaultManager.mapId = this.mapInfo.mapId;
                this.assaultManager.matchId = this.matchId;
                this.assaultManager.parseData();
                this.assaultManager.playerManager = this.playerManager;
                await this.assaultManager.updateMapObjectives();
                await this.assaultManager.insertCapturedMapObjectives(this.matchId);
                await this.assaultManager.updatePlayerCaptureTotals();
                await this.assaultManager.updateMapCaptureTotals();
                await this.assaultManager.setAttackingTeam();
                await this.assaultManager.setMatchCaps();

                new Message(`Assault stats update complete.`,'pass');
            }

            if(this.domManager !== undefined){

                this.domManager.mapId = this.mapInfo.mapId;
                this.domManager.matchId = this.matchId;
                this.domManager.playerManager = this.playerManager;
                this.domManager.parseData();
                await this.domManager.updateControlPointStats();
                await this.domManager.insertMatchControlPointStats();
                await this.domManager.updateMatchDomCaps();
                this.domManager.setPlayerDomCaps();
                await this.domManager.insertMatchControlPointCaptures(this.matchId, this.mapInfo.mapId);

                new Message(`Domination stats update complete.`,'pass');
            }

            

            //this.playerManager.mergeDuplicates(bLMS);

            
            await this.playerManager.updateFragPerformance(this.gametype.currentMatchGametype, this.mapInfo.mapId, this.serverInfo.date);

            new Message(`Updated player frag performance.`,'pass');
            await this.playerManager.updateWinStats(this.gametype.currentMatchGametype, this.mapInfo.mapId);
            new Message(`Updated player winstats performance.`,'pass');
            

            if(this.domManager !== undefined){

                this.domManager.setLifeCaps(this.killManager);

                await this.domManager.updatePlayersMatchStats();
                await this.domManager.insertMatchPlayerScores(this.matchId);
                await this.domManager.updatePlayerLifeCaps(this.matchId);
            }

            if(this.assaultManager !== undefined){
                await this.assaultManager.updatePlayersMatchStats();
            }

            if(this.monsterHuntManager !== undefined){

                this.monsterHuntManager.parseData(this.playerManager, this.killManager);

                await this.monsterHuntManager.updatePlayerMatchData(this.matchId, this.playerManager.players);
                await this.monsterHuntManager.updatePlayerTotals(this.gametype.currentMatchGametype, this.playerManager.players);
                await this.monsterHuntManager.updateMatchMonsterTotals(this.matchId);
                await this.monsterHuntManager.insertPlayerMatchTotals(this.matchId);
                await this.monsterHuntManager.insertKills(this.matchId);
                await this.monsterHuntManager.setMatchMonsterKills(this.matchId);
            }


            if(this.weaponsManager !== undefined){

                this.weaponsManager.matchId = this.matchId;
                this.weaponsManager.mapId = this.mapInfo.mapId;
                this.weaponsManager.gametypeId = this.gametype.currentMatchGametype;
                
                this.weaponsManager.parseData();
                this.weaponsManager.addKillNames(this.killManager.killNames);
                await this.weaponsManager.update(this.playerManager);
                new Message(`Updated player weapon stats.`,'pass');

            }else{
                this.weaponsManager = new WeaponsManager();
            }


            this.itemsManager = new ItemsManager(this.itemLines, this.playerManager, this.killManager, this.gameInfo.totalTeams);
          
            await this.itemsManager.updateTotals(this.serverInfo.date);
            await this.itemsManager.updateMapItems(this.mapInfo.mapId, this.matchId);

            this.itemsManager.setPlayerPickupTimes(this.gameInfo.end);
            this.itemsManager.setPlayerPickups();
            

            new Message(`Updating player match pickups.`,"pass");
            await this.itemsManager.setPlayerMatchPickups(this.matchId);

            new Message(`Updated item totals.`,'pass');
            await this.itemsManager.insertMatchData(this.matchId, this.serverInfo.date);
            new Message(`Updated item match data.`,'pass');
            await this.itemsManager.setMatchAmpStats(this.matchId);

            await this.itemsManager.updatePowerUps(
                this.matchId, 
                this.serverInfo.date, 
                this.gameInfo.totalTeams, 
                this.mapInfo.mapId,
                this.gametype.currentMatchGametype
            );

            await this.playerManager.insertConnectionData(this.matchId);
            new Message(`Updated played connection data.`,'pass');

            


            this.countiresManager = new CountriesManager();
            await this.countiresManager.insertBulk(this.playerManager.players, this.serverInfo.date);
            new Message(`Updated Country stats`,'pass');

            await this.killManager.insertKills(this.matchId, this.weaponsManager);
            new Message(`Inserted match kill data`,'pass');

            await this.killManager.insertHeadshots(this.matchId);
            new Message(`Updated player headshots`,'pass');

            await this.killManager.insertTeleFrags(this.matchId, this.mapInfo.mapId, this.gametype.currentMatchGametype);
            new Message(`Inserted telefrags.`,"pass");

            await this.playerManager.insertScoreHistory(this.matchId);
            new Message(`Inserted player score history`,'pass');

            new Message(`Updating player winrates.`,'note');
            await this.playerManager.updateWinRates(this.matchId, this.serverInfo.date, this.gametype.currentMatchGametype, this.mapInfo.mapId);

    
            new Message(`Update player spree history`,'note');

            await this.playerManager.insertSprees(this.matchId);


            new Message(`Updating Player Map History.`,'note');
            await this.maps.updateAllPlayersHistory(this.playerManager.players, this.mapInfo.mapId, this.matchId, this.serverInfo.date);
            new Message(`Updated player map history.`,'pass');
            //this.maps.updatePlayerHistory(this.playerManager.players[0].masterId, this.mapInfo.matchId);



            //if(this.combogibLines.length !== 0){

                this.combogibManager = new CombogibManager(
                    this.playerManager, this.killManager, 
                    this.combogibLines, this.gametype.currentMatchGametype, this.matchId, 
                    this.mapInfo.mapId, this.bIgnoreBots,
                    this.gameInfo.matchLength
                );
           
                new Message("Parsing combogib data.","note");
                
                this.combogibManager.createKillTypeData();
                this.combogibManager.createPlayerEvents();

                await this.combogibManager.updateDatabase();

                
                
            //}
            
            const pingAverageData = this.playerManager.pingManager.getMatchAverage(this.playerManager);

            await this.match.setMatchPingData(this.matchId, 
                pingAverageData.min.average, 
                pingAverageData.average.average, 
                pingAverageData.max.average
            );



           // this.killManager.createOriginalIdDeaths();


            if(this.CTFManager !== undefined){

                this.CTFManager.totalTeams = this.gameInfo.totalTeams;
                this.CTFManager.playerManager = this.playerManager;
                this.CTFManager.bIgnoreBots = this.bIgnoreBots;
                this.CTFManager.matchId = this.matchId;
                this.CTFManager.killManager = this.killManager;
                this.CTFManager.matchDate = this.serverInfo.date;
                this.CTFManager.mapId = this.mapInfo.mapId;
                this.CTFManager.gametypeId = this.gametype.currentMatchGametype;
                this.CTFManager.createFlags();

                await this.CTFManager.parseData(matchTimings.start, matchTimings.end);
                //await this.CTFManager.updatePlayerMatchStats();
                
                await this.CTFManager.insertFlagLocations();

                await this.CTFManager.insertPlayerMatchData(this.serverId, this.mapInfo.mapId, this.gametype.currentMatchGametype);
                await this.CTFManager.updatePlayerTotals(this.serverId, this.mapInfo.mapId, this.gametype.currentMatchGametype);
                await this.CTFManager.updatePlayerBestValues(this.gametype.currentMatchGametype);
                await this.CTFManager.updatePlayerBestValuesSingleLife(this.gametype.currentMatchGametype);
                await this.CTFManager.updateMapCapRecord(this.mapInfo.mapId, this.gametype.currentMatchGametype);
                await this.CTFManager.insertEvents();
                await this.CTFManager.insertCarryTimes();
                await this.CTFManager.insertFlagDrops();
                await this.CTFManager.insertFlagDeaths();
                await this.CTFManager.insertFlagCovers();
                await this.CTFManager.bulkInsertFlagPickups();
                await this.CTFManager.bulkInsertSelfCovers();
                await this.CTFManager.insertCapReturnKills();
                
                /*if(this.CTFManager.bHasData()){
                    new Message(`Found ${this.CTFManager.data.length} Capture The Flag Data to parse`,'note');
                    // console.table(this.CTFManager.data);
                    
                    this.CTFManager.parseData(this.killManager, matchTimings.start);
                    this.CTFManager.createCapData();
                    this.CTFManager.setPlayerStats();
                    await this.CTFManager.insertCaps(this.matchId, this.mapInfo.mapId, this.serverInfo.date);
                    await this.CTFManager.insertFlagLocations(this.mapInfo.mapId);
                    await this.CTFManager.addCTF4Data();
                    await this.CTFManager.updateMapCapRecords(this.mapInfo.mapId, this.matchId, this.serverInfo.date);
                   

                    new Message(`Capture The Flag stats update complete.`,'pass');
                }*/
            }       

            if(bLMS){
                
                this.LMSManager = new LMSManager(this.playerManager, this.killManager, this.gameInfo.getMatchLength(), this.gameInfo.fraglimit);
                const LMSWinner = this.LMSManager.getWinner();
                const winner = this.playerManager.getPlayerById(LMSWinner.id);
      
                if(winner !== null){

                    winner.bWinner = true;

                    await this.match.setDMWinner(this.matchId, winner.masterId, LMSWinner.score);

                    new Message(`Last man standing stats update complete.`,'pass');

                }else{
                    new Message(`Winner for LMS is null`, 'warning');
                }
            }

            

            this.rankingsManager = new Rankings();

            await this.rankingsManager.init();

            //need to get player current totals then add them to the scores
            new Message("Updating player rankings.","note");
            await this.playerManager.updateRankings(this.rankingsManager, this.gametype.currentMatchGametype, this.matchId);

            const logId = await Logs.insert(this.fileName);

            new Message(`Log file id is ${logId}`,"note");

            await Logs.setMatchId(logId, this.matchId);

            

            new Message(`Finished import of log file ${this.fileName}.`, 'Progress');

            const end = performance.now() * 0.001;

            new Message(`Log imported in ${end - start} seconds.`,"Progress");

            return {
                "updatedPlayers": this.playerManager.players.length, 
                "updatedGametype": this.gametype.currentMatchGametype
            }

        }catch(err){
            console.trace(err);
        }
    }


    async insertMatch(){

    
        const motd = this.serverInfo.getMotd();

        const matchString = `${this.serverInfo.absolute_time}_${this.serverInfo.server_servername}_${this.serverInfo.server_port}`;

        this.matchId = await this.matches.insertMatch(
            this.serverInfo.date, 
            this.serverId, 
            md5(matchString),
            this.gametype.currentMatchGametype,
            this.mapInfo.mapId,
            this.gameInfo.gameversion, 
            this.gameInfo.minnetversion, 
            this.serverInfo.server_adminname,
            this.serverInfo.server_adminemail,
            this.serverInfo.server_region,
            motd,
            this.gameInfo.mutators,
            this.gameInfo.matchLength,
            this.gameInfo.endReason,
            this.gameInfo.start,
            this.gameInfo.end,
            this.gameInfo.insta, 
            this.gameInfo.teamgame,
            this.gameInfo.gamespeed,
            this.gameInfo.hardcore,
            this.gameInfo.tournamentmode,
            this.gameInfo.aircontrol,
            this.gameInfo.usetranslocator,
            this.gameInfo.friendlyfirescale,
            this.gameInfo.netmode,
            this.gameInfo.maxspectators,
            this.gameInfo.maxplayers,
            this.gameInfo.totalTeams,
            this.playerManager.getTotalPlayers(),
            this.gameInfo.timelimit,
            this.gameInfo.targetScore,
            0,
            0,
            this.gameInfo.teamScores[0],
            this.gameInfo.teamScores[1],
            this.gameInfo.teamScores[2],
            this.gameInfo.teamScores[3],
            (this.mapInfo.mapPrefix === "mh") ? true : false
        );

    }

    parseNStatsLine(line, playerTypes){

        const nstatsReg = /^\d+\.\d+?\tnstats\t(.+?)\t.+$/i;
        const monsterReg = /monsterkill\t(\d+?)\t(.+)$/i
        const monsterKilledPlayerReg = /mk\t(.+?)\t(.+)/;

        const ctfTypes = [
            "flag_location",
            "flag_kill",
            "fdl", //flag drop location,
            "frl", //flag return location,
            "ftor" //flag timeout return location
        ];

        const locationTypeReg = /^(weapon|ammo|pickup)_location$/i;

        //"weapon_location", "ammo_location", "pickup_location",

        const typeResult = nstatsReg.exec(line);

        if(typeResult !== null){

            const bLocationReg = locationTypeReg.exec(typeResult[1]);
            //if(a !== null) console.log(a);
            //console.log(typeResult);

            if(bLocationReg){

                this.itemLines.push(line);
                return;
            }

            const subType = typeResult[1].toLowerCase();

            if(playerTypes.indexOf(subType) !== -1){

                this.playerLines.push(line);
                return;

            }
            
            if(subType === 'kill_distance' || subType == 'kill_location' || subType === "suicide_loc"){

                this.killLines.push(line);
                return;
            }
            
            if(subType === 'dom_point'){

                if(this.domManager === undefined){
                    this.domManager = new DOMManager();
                }

                this.domManager.data.push(line);
                return;
            }
            
            if(ctfTypes.indexOf(subType) !== -1){

                if(this.CTFManager === undefined){

                    this.CTFManager = new CTFManager();
                }

                this.CTFManager.bHaveNStatsData = true;

                this.CTFManager.lines.push(line);
                return;
            }

            if(monsterReg.test(line) || monsterKilledPlayerReg.test(line)){

                if(this.monsterHuntManager === undefined){
                    this.monsterHuntManager = new MonsterHuntManager();
                }

                this.monsterHuntManager.lines.push(line);
            }         
        }            
    }

    convertFileToLines(){

        const reg = /^(.+?)$/img;
        const typeReg = /^\d+\.\d+?\t(.+?)(\t.+|)$/i;
        const realStartReg = /^\d+\.\d+\tgame\trealstart$/i;
        this.lines = this.data.match(reg);


        if(this.lines === null){
            this.bLinesNull = true;
            new Message("matchmanager.ConvertFileToLines() this.lines is null","error");
            return;
        }

        this.serverLines = [];
        this.mapLines = [];
        this.gameLines = [];
        this.playerLines = [];
        this.killLines = [];
        this.itemLines = [];
        this.headshotLines = [];


        const gameTypes = [
            "game",
            "game_start",
            "game_end",
            "teamscore"
        ];

        const playerTypes = [
            "player",
            "face",
            "voice",
            "netspeed",
            "stat_player",
            "bestspawnkillspree",
            "spawnkills",
            "bestspree",
            "shortesttimebetweenkills",
            "longesttimebetweenkills",
            "first_blood",
            "spawn_loc",
            "spawn_point",
            "p_s",
            "hwid"
        ];

        const assaultTypes = [
            "assault_timelimit",
            "assault_gamename",
            "assault_objname",
            "assault_defender",
            "assault_attacker",
            "assault_obj",
        ];

        const domTypes = [
            "dom_point",
            "dom_playerscore_update",
            "dom_score_update",
            "controlpoint_capture"
        ];


        const itemTypes = [
            "item_get", "item_activate", "item_deactivate"

        ];

        

        for(let i = 0; i < this.lines.length; i++){

            const line = this.lines[i];
            const typeResult = typeReg.exec(line);

            if(typeResult === null) continue;
            

            const currentType = typeResult[1].toLowerCase();

            if(gameTypes.indexOf(currentType) !== -1){

                if(currentType === "game_start") this.bFoundMatchStart = true;

                if(realStartReg.test(line)){
                    this.bFoundRealMatchStart = true;
                }

                this.gameLines.push(line);
            }

            if(currentType == 'info') this.serverLines.push(line);   
            if(currentType == 'map') this.mapLines.push(line);

            
            if(playerTypes.indexOf(currentType) !== -1 || currentType.startsWith('weap_')){

                this.playerLines.push(line);

                if(currentType.startsWith('weap_')){

                    if(this.weaponsManager === undefined) this.weaponsManager = new WeaponsManager();

                    this.weaponsManager.data.push(line);
                }
            }
            
            if(currentType === 'nstats'){

                this.parseNStatsLine(line, playerTypes);
            }
            
            if(currentType === 'kill' || currentType === 'teamkill' || currentType === 'suicide' || currentType === 'headshot'){
        
                this.killLines.push(line);

            }
            
            if(assaultTypes.indexOf(currentType) !== -1){

                if(this.assaultManager === undefined){
                    this.assaultManager = new AssaultManager();
                }

                this.assaultManager.data.push(line);

                
            }
            
            if(domTypes.indexOf(currentType) !== -1){

                if(this.domManager === undefined){
                    this.domManager = new DOMManager();
                }

                this.domManager.data.push(line);
            }
            
            if(itemTypes.indexOf(currentType) !== -1){

                this.itemLines.push(line);
            }
            
            if(currentType === "combo_kill" || currentType === "combo_insane"){

                this.combogibLines.push(line);            
                //this.combogibManager.addComboEvent(this.lines[i]);
            }

            if(currentType.toLowerCase().startsWith("flag_")){

                if(this.CTFManager === undefined){
                    this.CTFManager = new CTFManager();
                }

                this.CTFManager.lines.push(line);
                // this.ctfData.push(this.lines[i]);
            }
        }
    }


    setMatchWinners(){

        
        if(this.gameInfo.endReason.toLowerCase() === "hunt successfull!"){

            for(let i = 0; i < this.playerManager.players.length; i++){

                const p = this.playerManager.players[i];

                if(p.bPlayedInMatch && !p.bSpectator){
                    p.bWinner = true;
                }
            }

            return;
        }

        if(this.gameInfo.teamgame){

            new Message(`Match is a team game.`,'note');

            const winningTeams = this.gameInfo.getWinningTeam();


            for(let i = 0; i < this.playerManager.players.length; i++){

                const p = this.playerManager.players[i];

                const playerTeam = p.getLastPlayedTeam();

                if(winningTeams.indexOf(playerTeam) === -1) continue;


                if(winningTeams.length === 1){
                    p.bWinner = true;
                }else{
                    p.bDrew = true;
                }
                
            }

        }else{

            new Message(`Match is not a team game,`,'note');

            
            if(this.playerManager.players.length > 0){

                this.playerManager.sortByScore();

                const winnerScore =  this.playerManager.players[0].stats.score;
                const winnerDeaths =  this.playerManager.players[0].stats.deaths;

                let totalWinningPlayers = 0;

                for(let i = 0; i < this.playerManager.players.length; i++){

                    const p = this.playerManager.players[i];

                    if(p.stats.score === winnerScore && p.stats.deaths === winnerDeaths){
                        totalWinningPlayers++;
                    }
                }

                if(totalWinningPlayers === 1){
                    this.playerManager.players[0].bWinner = true;
                }else{

                    for(let i = 0; i < totalWinningPlayers; i++){
                        this.playerManager.players[i].bDrew = true;
                    }
                }

                this.setDmWinner(this.playerManager.players[0].masterId, this.playerManager.players[0].stats.score);
            }
        }

        new Message(`Set player match winners.`,'pass');
    }


    async setDmWinner(playerId, score){

        await this.match.setDMWinner(this.matchId, playerId, score);
    }


    bLastManStanding(){

        const reg = /last man standing/i;
        return reg.test(this.gameInfo.gamename);
    }
}

module.exports = MatchManager;