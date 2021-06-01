const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');
const Functions = require('./functions');
const CountriesManager = require('./countriesmanager');
const Assault = require('./assault');
const CTF = require('./ctf');
const Domination = require('./domination');
const Faces = require('./faces');
const Headshots = require('./headshots');
const Items = require('./items');
const Kills = require('./kills');
const Connections = require('./connections');
const Pings = require('./pings');
const Weapons = require('./weapons');
const Rankings = require('./rankings');
const Voices = require('./voices');
const WinRate = require('./winrate');

class Player{

    constructor(){

    }



    getNameIdQuery(name, gametypeId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,gametype FROM nstats_player_totals WHERE name=? AND gametype=? LIMIT 1";

            if(gametypeId === undefined){
                gametypeId = 0;
            }

            mysql.query(query, [name, gametypeId], (err, result) =>{

                if(err) reject(err);

                if(result[0] === undefined){
                    resolve(null);
                }else{
                    resolve(result[0]);
                }

                resolve(null);
            });
        });
    }

    createNameIdQuery(name, gametype, masterPlayerId){
        

        return new Promise((resolve, reject) =>{

            if(gametype === undefined){
                gametype = 0;
            }

            if(masterPlayerId === undefined){
                masterPlayerId = 0;
            }


            const query = `INSERT INTO nstats_player_totals VALUES(NULL,?,?,0,0,'','','',0,?,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
            ,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)`;

            mysql.query(query, [name, masterPlayerId, gametype], (err, result) =>{

                if(err) reject(err);

                resolve({"id": result.insertId, "gametype": gametype});
            });
        });
    }

    async setPlayerMasterId(name, gametype, id){

        await mysql.simpleUpdate("UPDATE nstats_player_totals SET player_id=? WHERE name=? AND gametype=?", 
            [id, name, gametype]
        );
    }
 
    async getNameId(name, gametype, bCreate){



            let id = await this.getNameIdQuery(name, 0);
            
            
            if(id === null){

                id = await this.createNameIdQuery(name, 0);

                //only need for gametype 0, otherwise player totals for gametype 0 is always 0
                await this.setPlayerMasterId(name, 0, id.id);
            }

            let idGametype = await this.getNameIdQuery(name, gametype);

            if(idGametype === null){
                idGametype = await this.createNameIdQuery(name, gametype, id.id);
            }


            return {"totalId": id.id, "gametypeId": idGametype.id};

    
    }

    updateEfficiency(id){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET efficiency = (kills / (deaths + kills)) * 100 WHERE id=?`;

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updateFrags(id, date, playtime, frags, score, kills, deaths, suicides, teamKills, spawnKills,
        multis, bestMulti, sprees, bestSpree, fastestKill, slowestKill, bestSpawnKillSpree,
        firstBlood, accuracy, normalRangeKills, longRangeKills, uberRangeKills, headshots, gametype){
            
        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET matches=matches+1, 
            first = IF(first = 0 OR first > ?, ?, first), 
            last = IF(last < ?,?,last), 
            playtime=playtime+?, 
            frags=frags+?, score=score+?, kills=kills+?, deaths=deaths+?, suicides=suicides+?, 
            team_kills=team_kills+?, spawn_kills=spawn_kills+?,
            multi_1 = multi_1+?, multi_2 = multi_2+?, multi_3 = multi_3+?, multi_4 = multi_4+?,
            multi_5 = multi_5+?, multi_6 = multi_6+?, multi_7 = multi_7+?,
            multi_best = IF(multi_best < ?, ?, multi_best),
            spree_1 = spree_1+?, spree_2 = spree_2+?, spree_3 = spree_3+?, spree_4 = spree_4+?,
            spree_5 = spree_5+?, spree_6 = spree_6+?, spree_7 = spree_7+?,
            spree_best = IF(spree_best < ?, ?, spree_best),
            fastest_kill = IF(fastest_kill > ? OR fastest_kill = 0 AND ? != 0, ?, fastest_kill),
            slowest_kill = IF(slowest_kill < ? OR slowest_kill = 0 AND ? != 0, ?, slowest_kill),
            best_spawn_kill_spree = IF(best_spawn_kill_spree < ?, ?, best_spawn_kill_spree),
            first_bloods=first_bloods+?,
            accuracy=?, k_distance_normal=k_distance_normal+?, k_distance_long=k_distance_long+?, k_distance_uber=k_distance_uber+?,
            headshots=headshots+?
            WHERE id=? AND gametype=?`;

            const vars = [
                date,
                date,
                date,
                date,
                playtime, 
                frags, 
                score, 
                kills, 
                deaths, 
                suicides, 
                teamKills, 
                spawnKills, 
                multis.double,
                multis.multi,
                multis.mega,
                multis.ultra,
                multis.monster,
                multis.ludicrous,
                multis.holyshit,
                bestMulti,
                bestMulti,
                sprees.spree,
                sprees.rampage,
                sprees.dominating,
                sprees.unstoppable,
                sprees.godlike,
                sprees.massacre,
                sprees.brutalizing,
                bestSpree,
                bestSpree,
                fastestKill,
                fastestKill,
                fastestKill,
                slowestKill,
                slowestKill,
                slowestKill,
                bestSpawnKillSpree,
                bestSpawnKillSpree,
                firstBlood,
                accuracy,
                normalRangeKills,
                longRangeKills,
                uberRangeKills,
                headshots,
                id,
                gametype
            ];

            mysql.query(query, vars, async (err) =>{

                if(err) reject(err);

                try{
                    await this.updateEfficiency(id);
                }catch(err){
                    new Message(err, 'warning');
                }

                resolve();
            });
        });
    }


    updateWinStats(id, win, drew, gametype){

        return new Promise((resolve, reject) =>{

            if(gametype === undefined) gametype = 0;

            let query = "UPDATE nstats_player_totals SET wins=wins+1, winrate=(wins/matches)*100 WHERE id=? AND gametype=?";

            if(!win){
                if(!drew){
                    query = "UPDATE nstats_player_totals SET losses=losses+1, winrate=(wins/matches)*100 WHERE id=? AND gametype=?";
                }else{
                    query = "UPDATE nstats_player_totals SET draws=draws+1, winrate=(wins/matches)*100 WHERE id=? AND gametype=?";
                }
            }

            mysql.query(query, [id, gametype], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }



    insertMatchData(player, matchId, gametypeId, mapId, matchDate, ping){

        return new Promise((resolve, reject) =>{

           // console.log(player);

            const query = `INSERT INTO nstats_player_matches VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
                ?,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,?,?,?,?,?,?,?,?,?,?,?,0,0,0,0,0,0,0,0,0)`;

            const vars = [
                matchId,
                matchDate,
                mapId,
                player.masterId,
                Functions.setValueIfUndefined(player.ip,''),
                Functions.setValueIfUndefined(player.country,'xx'),
                Functions.setValueIfUndefined(player.faceId),
                Functions.setValueIfUndefined(player.voiceId),
                gametypeId,
                player.bWinner,
                player.bDrew,
                Functions.setValueIfUndefined(player.stats.time_on_server),
                player.teams[player.teams.length - 1].id,
                player.stats.firstBlood,
                player.stats.frags,
                player.stats.score,
                player.stats.kills,
                player.stats.deaths,
                player.stats.suicides,
                player.stats.teamkills,
                player.stats.spawnKills,
                Functions.calculateKillEfficiency(player.stats.kills, player.stats.deaths),
                player.stats.multis.double,
                player.stats.multis.multi,
                player.stats.multis.mega,
                player.stats.multis.ultra,
                player.stats.multis.monster,
                player.stats.multis.ludicrous,
                player.stats.multis.holyshit,
                player.stats.bestMulti,
                player.stats.sprees.spree,
                player.stats.sprees.rampage,
                player.stats.sprees.dominating,
                player.stats.sprees.unstoppable,
                player.stats.sprees.godlike,
                player.stats.sprees.massacre,
                player.stats.sprees.brutalizing,
                player.stats.bestSpree,
                player.stats.bestspawnkillspree,
                ping.min,
                parseInt(ping.average),
                ping.max,
                player.stats.accuracy.toFixed(2),
                (isNaN(player.stats.killMinDistance)) ? 0 : Functions.setValueIfUndefined(player.stats.killMinDistance),
                (isNaN(player.stats.killAverageDistance)) ? 0 : Functions.setValueIfUndefined(player.stats.killAverageDistance),
                player.stats.killMaxDistance,
                player.stats.killsNormalRange,
                player.stats.killsLongRange,
                player.stats.killsUberRange,
                player.stats.headshots
            ];


            mysql.query(query, vars, (err, result) =>{

                if(err){
                    console.trace(err);
                    reject(err);
                }

                //console.log(result);

                resolve(result.insertId);
            });
        });
    }

    getPlayerById(id){

        return new Promise((resolve, reject) =>{

            id = parseInt(id);

            const query = "SELECT * FROM nstats_player_totals WHERE id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    Functions.removeIps(result);
                    resolve(result[0]);
                }
                
                resolve(null);
            });
        });
    }


    getPlayerGametypeWinStats(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT gametype,matches,wins,losses,draws,playtime,accuracy,last FROM nstats_player_totals WHERE gametype!=0 AND name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve(null);
            });
        });
    }


    getRecentMatches(id, amount, page){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_player_matches WHERE player_id=? ORDER BY match_date DESC, id DESC LIMIT ?,?";

            if(page === undefined){
                page = 1;
            }

            page--;

            if(page < 0){
                page = 0;
            }

            const start = amount * page;

            mysql.query(query, [id, start, amount], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    Functions.removeIps(result);
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    getTotalMatches(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_matches FROM nstats_player_matches WHERE player_id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);
                
                if(result !== undefined){
                    resolve(result[0].total_matches);
                }

                resolve(0);
            });
        });
    }


    getAllInMatch(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_player_matches WHERE match_id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    Functions.removeIps(result);
                    resolve(result);
                }
                resolve([]);
            });
        });
    }


    getNames(ids){

        return new Promise((resolve, reject) =>{

            if(ids.length === 0){ resolve(new Map())}

            const query = "SELECT id,name FROM nstats_player_totals WHERE id IN(?)";

            const data = new Map();

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                   // resolve(result);

                    for(let i = 0; i < result.length; i++){
                        data.set(result[i].id, result[i].name)
                    }
                }
                resolve(data);
            });
        });
    }


    getMaxValue(type){

        return new Promise((resolve, reject) =>{

            type = type.toLowerCase();
            //add winrate
            const validTypes = ["playtime","score","frags","deaths","kills","matches","efficiency","winrate","accuracy","wins"];
            
            let data = 0;

            const index = validTypes.indexOf(type);

            if(index === -1){
                resolve(0);
            }

            const query = `SELECT ${validTypes[index]} as type_result FROM nstats_player_totals WHERE gametype=0 ORDER BY ${validTypes[index]} DESC LIMIT 1`;

            mysql.query(query, (err, result) =>{

                
                if(err) reject(err);

                if(result !== undefined){
                    if(result.length > 0){
                        data = result[0].type_result;
                    }
                }

                resolve(data);
            });

        });
    }

    insertScoreHistory(matchId, timestamp, player, score){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_match_player_score VALUES(NULL,?,?,?,?)";

            mysql.query(query, [matchId, timestamp, player, score], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    getScoreHistory(matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT timestamp,player,score FROM nstats_match_player_score WHERE match_id=? ORDER BY timestamp ASC";

            mysql.query(query, [matchId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                resolve([]);
            });
        });
    }

    getMatchDatesAfter(timestamp, player){

        return new Promise((resolve, reject) =>{

            const query = "SELECT match_date,gametype FROM nstats_player_matches WHERE match_date>=? AND player_id=? ORDER BY match_date DESC";

            mysql.query(query, [timestamp, player], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const data = [];

                    for(let i = 0; i < result.length; i++){

                        data.push({"date": result[i].match_date, "gametype": result[i].gametype});
                    }

                    resolve(data);
                }

                resolve([]);
            });
        });
    }

    getAllIps(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT DISTINCT ip FROM nstats_player_matches WHERE player_id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    
                    const data = [];

                    for(let i = 0; i < result.length; i++){

                        data.push(result[i].ip);
                    }

                    resolve(data);
                }

                resolve([]);
            });
        });
    }

    getIdsWithThisIp(ips){

        return new Promise((resolve, reject) =>{

            if(ips.length === 0) resolve([]);

            const query = "SELECT DISTINCT player_id FROM nstats_player_matches WHERE ip IN(?)";

            mysql.query(query, [ips], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const data = [];

                    for(let i = 0; i < result.length; i++){

                        data.push(result[i].player_id);
                    }
                    resolve(data);
                }

                resolve([]);
            });
        

        });
    }
    


    getPlayerNames(ids){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,country,face FROM nstats_player_totals WHERE id IN(?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    async getPossibleAliases(id){

        try{

            const ips = await this.getAllIps(id);

            const ids = await this.getIdsWithThisIp(ips);

            return await this.getPlayerNames(ids);

        }catch(err){
            console.trace(err);
        }
    }



    getGametypeTotals(player, gametype){

        return new Promise((resolve, reject) =>{

            const query = `SELECT frags,deaths,suicides,team_kills,flag_taken,flag_pickup,flag_return,flag_capture,
            flag_cover,flag_seal,flag_assist,flag_kill,dom_caps,assault_objectives,multi_1,multi_2,multi_3,multi_4,
            multi_5,multi_6,multi_7,spree_1,spree_2,spree_3,spree_4,spree_5,spree_6,spree_7,flag_assist,flag_return,
            flag_taken,flag_dropped,flag_capture,flag_pickup,flag_seal,flag_cover,flag_cover_pass,flag_cover_fail,
            flag_self_cover,flag_self_cover_pass,flag_self_cover_fail,flag_multi_cover,flag_spree_cover,flag_kill,
            flag_save,dom_caps,assault_objectives,playtime,matches
            FROM nstats_player_totals WHERE gametype=? AND id=?
            `;

            mysql.query(query, [gametype, player], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result.length > 0) resolve(result[0]);
                }

                resolve(null);
            });

        });
    }


    getMatchData(playerId, matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_player_matches WHERE player_id=? AND match_id=?";

            mysql.query(query, [playerId, matchId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result.length > 0){
                        resolve(result[0]);
                    }
                }

                resolve(null);
            });
        });
    }

    async deletePlayerMatch(playerId, matchId){

        return await mysql.simpleDelete("DELETE FROM nstats_player_matches WHERE player_id=? AND match_id=?", [
            playerId, matchId
        ]);
    }

    async deletePlayerScoreData(playerId, matchId){

        return await mysql.simpleDelete("DELETE FROM nstats_match_player_score WHERE player=? AND match_id=?",
        [playerId, matchId]);
    }


    async deletePlayerTeamChanges(playerId, matchId){

        return await mysql.simpleDelete("DELETE FROM nstats_match_team_changes WHERE player=? AND match_id=?",[
            playerId, matchId
        ]);
    }

    async reduceMapTotals(playerId, mapId, playtime){

        return await mysql.simpleUpdate(`UPDATE nstats_player_maps SET matches=matches-1,playtime=playtime-? WHERE player=?
        AND map=?
        `, [playtime, playerId, mapId]);
    }


    async reduceTotals(player, gametypeId){

        const query = `UPDATE nstats_player_totals SET 
            matches=matches-1,
            wins = IF(? = 1, wins-1, wins),
            losses = IF(? = 0, losses-1, losses),
            draws = IF(? = 1, draws-1, draws),
            winrate = (wins / matches) * 100,
            playtime = playtime-?,
            first_bloods = IF(? = 1, first_bloods-1, first_bloods),
            frags = frags-?,
            score = score-?,
            kills = kills-?,
            deaths = deaths-?,
            suicides = suicides-?,
            team_kills = team_kills-?,
            spawn_kills = spawn_kills-?,
            efficiency = (kills / (kills + deaths)) * 100,
            multi_1 = multi_1 - ?,
            multi_2 = multi_2 - ?,
            multi_3 = multi_3 - ?,
            multi_4 = multi_4 - ?,
            multi_5 = multi_5 - ?,
            multi_6 = multi_6 - ?,
            multi_7 = multi_7 - ?,
            spree_1 = spree_1 - ?,
            spree_2 = spree_2 - ?,
            spree_3 = spree_3 - ?,
            spree_4 = spree_4 - ?,
            spree_5 = spree_5 - ?,
            spree_6 = spree_6 - ?,
            spree_7 = spree_7 - ?,

            flag_assist = flag_assist - ?,
            flag_return = flag_return - ?,
            flag_taken = flag_taken - ?,
            flag_dropped = flag_dropped - ?,
            flag_capture = flag_capture - ?,
            flag_pickup = flag_pickup - ?,
            flag_seal = flag_seal - ?,
            flag_cover = flag_cover - ?,
            flag_cover_pass = flag_cover_pass - ?,
            flag_cover_fail = flag_cover_fail - ?,
            flag_self_cover = flag_self_cover - ?,
            flag_self_cover_pass = flag_self_cover_pass - ?,
            flag_self_cover_fail = flag_self_cover_fail - ?,
            flag_multi_cover = flag_multi_cover - ?,
            flag_spree_cover = flag_spree_cover - ?,
            flag_kill = flag_kill - ?,
            flag_save = flag_save - ?,
            flag_carry_time = flag_carry_time - ?,
            assault_objectives = assault_objectives - ?,
            dom_caps = dom_caps - ?,
            k_distance_normal = k_distance_normal - ?,
            k_distance_long = k_distance_long - ?,
            k_distance_uber = k_distance_uber - ?,

            headshots = headshots - ?,
            shield_belt = shield_belt - ?,
            amp = amp - ?,
            amp_time = amp_time - ?,
            invisibility = invisibility - ?,
            invisibility_time = invisibility_time - ?,
            pads = pads - ?,
            armor = armor - ?,
            boots = boots - ?,
            super_health = super_health - ?


            WHERE name=? AND gametype IN(?)
            `;

            const gametypes = [0, gametypeId];

            const vars = [
                player.winner,
                player.winner,
                player.draw,
                player.playtime,
                player.first_blood,
                player.frags,
                player.score,
                player.kills,
                player.deaths,
                player.suicides,
                player.team_kills,
                player.spawn_kills,
                player.multi_1,
                player.multi_2,
                player.multi_3,
                player.multi_4,
                player.multi_5,
                player.multi_6,
                player.multi_7,
                player.spree_1,
                player.spree_2,
                player.spree_3,
                player.spree_4,
                player.spree_5,
                player.spree_6,
                player.spree_7,

                player.flag_assist,
                player.flag_return,
                player.flag_taken,
                player.flag_dropped,
                player.flag_capture,
                player.flag_pickup,
                player.flag_seal,
                player.flag_cover,
                player.flag_cover_pass,
                player.flag_cover_fail,
                player.flag_self_cover,
                player.flag_self_cover_pass,
                player.flag_self_cover_fail,
                player.flag_multi_cover,
                player.flag_spree_cover,
                player.flag_kill,
                player.flag_save,
                player.flag_carry_time,
                player.assault_objectives,
                player.dom_caps,
                player.headshots,
                player.k_distance_normal,
                player.k_distance_long,
                player.k_distance_uber,

                player.shield_belt,
                player.amp,
                player.amp_time,
                player.invisibility,
                player.invisibility_time,
                player.pads,
                player.armor,
                player.boots,
                player.super_health,

                player.name,
                gametypes
            ];

        return await mysql.simpleUpdate(query, vars);
    }


    async getPlayerGametypeData(playerName, gametypeId){

        return await mysql.simpleFetch("SELECT * FROM nstats_player_totals WHERE name=? AND gametype=?", 
            [playerName, gametypeId]
        );
    }
    

    async removeFromMatch(playerId, matchId, mapId, matchManager){

        try{

            const matchData = await this.getMatchData(playerId, matchId);

            let playerNames = await this.getNames([playerId]);

            console.log(playerNames);

            const mapIterator = playerNames.values();

            matchData.name = mapIterator.next().value;

            if(matchData !== null){

                const countriesManager = new CountriesManager();

                await countriesManager.reduceUses(matchData.country, 1);

                const assaultManager = new Assault();

                await assaultManager.deletePlayerFromMatch(playerId, matchId);

                const ctfManager = new CTF();

                await ctfManager.deletePlayerFromMatch(playerId, matchId);

                const domManager = new Domination();

                await domManager.deletePlayerFromMatch(playerId, matchId);

                const faceManager = new Faces();

                await faceManager.reduceUsage(matchData.face, 1);

                const headshotsManager = new Headshots();

                await headshotsManager.deletePlayerFromMatch(playerId, matchId);

                const itemsManager = new Items();

                await itemsManager.deletePlayerFromMatch(playerId, matchId);

                const killsManager = new Kills();

                await killsManager.deletePlayerMatchData(playerId, matchId);

                const connectionsManager = new Connections();

                await connectionsManager.deletePlayerFromMatch(playerId, matchId);

                const pingManager = new Pings();

                await pingManager.deletePlayerMatchData(playerId, matchId);

                await this.deletePlayerScoreData(playerId, matchId);

                await this.deletePlayerTeamChanges(playerId, matchId);

                await this.reduceMapTotals(playerId, mapId, matchData.playtime);

                await this.reduceTotals(matchData, matchData.gametype);

                const weaponManager = new Weapons();

                await weaponManager.deletePlayerFromMatch(playerId, matchId);

                const rankingManager = new Rankings();

                await rankingManager.deletePlayerFromMatch(playerId, matchId, matchData.playtime);


                const playerGametypeData = await this.getPlayerGametypeData(matchData.name, matchData.gametype);

                await rankingManager.recalculatePlayerRanking(playerId, playerGametypeData);

                const voiceManager = new Voices();

                await voiceManager.reduceTotals(matchData.voice, 1);

                const winRateManager = new WinRate();

                await winRateManager.deletePlayerFromMatch(playerId, matchId, matchData.gametype);


                await this.deletePlayerMatch(playerId, matchId);



                await matchManager.reducePlayerCount(matchId, 1);

            }

            


        }catch(err){
            console.trace(err);
        }
    }

}

module.exports = Player;