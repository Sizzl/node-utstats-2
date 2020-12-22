const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');
const Functions = require('./functions');

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

    createNameIdQuery(name, gametype){
        

        return new Promise((resolve, reject) =>{

            if(gametype === undefined){
                gametype = 0;
            }


            const query = `INSERT INTO nstats_player_totals VALUES(NULL,?,'','','',0,?,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0)`;

            mysql.query(query, [name, gametype], (err, result) =>{

                if(err) reject(err);

                resolve({"id": result.insertId, "gametype": gametype});
            });
        });
    }

 
    async getNameId(name, gametype, bCreate){



            let id = await this.getNameIdQuery(name, 0);
            let idGametype = await this.getNameIdQuery(name, gametype);
            
            if(id === null){
                id = await this.createNameIdQuery(name);
            }

            if(idGametype === null){
                idGametype = await this.createNameIdQuery(name, gametype);
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

    updateFrags(id, playtime, frags, score, kills, deaths, suicides, teamKills, spawnKills,
        multis, bestMulti, sprees, bestSpree, fastestKill, slowestKill, bestSpawnKillSpree,
        firstBlood, gametype){
            
        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET matches=matches+1, playtime=playtime+?, 
            frags=frags+?, score=score+?, kills=kills+?, deaths=deaths+?, suicides=suicides+?, 
            team_kills=team_kills+?, spawn_Kills=spawn_kills+?,
            multi_1 = multi_1+?, multi_2 = multi_2+?, multi_3 = multi_3+?, multi_4 = multi_4+?,
            multi_5 = multi_5+?, multi_6 = multi_6+?, multi_7 = multi_7+?,
            multi_best = IF(multi_best < ?, ?, multi_best),
            spree_1 = spree_1+?, spree_2 = spree_2+?, spree_3 = spree_3+?, spree_4 = spree_4+?,
            spree_5 = spree_5+?, spree_6 = spree_6+?, spree_7 = spree_7+?,
            spree_best = IF(spree_best < ?, ?, spree_best),
            fastest_kill = IF(fastest_kill > ? OR fastest_kill = 0 AND ? != 0, ?, fastest_kill),
            slowest_kill = IF(slowest_kill < ? OR slowest_kill = 0 AND ? != 0, ?, slowest_kill),
            best_spawn_kill_spree = IF(best_spawn_kill_spree < ?, ?, best_spawn_kill_spree),
            first_bloods=first_bloods+?
            WHERE id=? AND gametype=?`;

            const vars = [
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

            let query = "UPDATE nstats_player_totals SET wins=wins+1 WHERE id=? AND gametype=?";

            if(!win){
                if(!drew){
                    query = "UPDATE nstats_player_totals SET losses=losses+1 WHERE id=? AND gametype=?";
                }else{
                    query = "UPDATE nstats_player_totals SET draws=draws+1 WHERE id=? AND gametype=?";
                }
            }

            mysql.query(query, [id, gametype], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }



    insertMatchData(player, matchId, gametypeId, mapId){

        return new Promise((resolve, reject) =>{

           // console.log(player);

            const query = `INSERT INTO nstats_player_matches VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
                ?,
                0,0,0,0,0,0,0,0,0,
                0,0)`;

            const vars = [
                matchId,
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
                player.stats.firstBlood,
                player.stats.frags,
                player.stats.score,
                player.stats.kills,
                player.stats.deaths,
                player.stats.suicides,
                player.stats.teamkills,
                player.stats.spawnkills,
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
                player.stats.bestspawnkillspree
            ];

            mysql.query(query, vars, (err, result) =>{

                if(err) console.log(err);//reject(err);

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
                    resolve(result[0]);
                }
                
                resolve(null);
            });
        });
    }


    getPlayerGametypeWinStats(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT gametype,matches,wins,losses,draws,playtime FROM nstats_player_totals WHERE gametype!=0 AND name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve(null);
            });
        });
    }

}

module.exports = Player;