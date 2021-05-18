const mysql = require('./database');
const Promise = require('promise');

class Headshots{

    constructor(){

    }

    insert(match, timestamp, killer, victim, distance, killerTeam, victimTeam){

        return new Promise((resolve, reject) =>{

            if(distance === undefined) distance = -1;

            if(distance === null) distance = -1;

            const query = "INSERT INTO nstats_headshots VALUES(NULL,?,?,?,?,?,?,?)";

            mysql.query(query, [match, timestamp, killer, victim, distance, killerTeam, victimTeam], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    getMatchData(match){

        return new Promise((resolve, reject) =>{

            const query = "SELECT timestamp,killer,victim,distance,killer_team,victim_team FROM nstats_headshots WHERE match_id=?";

            mysql.query(query, [match], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    deleteMatchData(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_headshots WHERE match_id=?";

            mysql.query(query, [id], (err) =>{
                
                if(err) reject(err);

                resolve();
            });
        });
    }

    deletePlayerFromMatch(playerId, matchId){

        return new Promise((resolve, reject) =>{

            const query = `DELETE FROM nstats_headshots WHERE (match_id=? AND killer=?) OR (match_id=? AND victim=?)`;

            mysql.query(query, [matchId, playerId, matchId, playerId], (err) =>{

                if(err) reject(err);

                resolve();
            }); 
        });
    }

    async changePlayerIds(oldId, newId){

        await mysql.simpleUpdate("UPDATE nstats_headshots SET killer=? WHERE killer=?", [newId, oldId]);
        await mysql.simpleUpdate("UPDATE nstats_headshots SET victim=? WHERE victim=?", [newId, oldId]);
    }
}


module.exports = Headshots;