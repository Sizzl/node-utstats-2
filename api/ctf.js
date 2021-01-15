const Promise = require('promise');
const mysql = require('./database');

class CTF{

    constructor(data){

        this.data = data;
    }


    updatePlayerTotals(masterId, gametypeId, data){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET
            flag_assist=flag_assist+?,
            flag_return=flag_return+?,
            flag_taken=flag_taken+?,
            flag_dropped=flag_dropped+?,
            flag_capture=flag_capture+?,
            flag_pickup=flag_pickup+?,
            flag_cover=flag_cover+?,
            flag_kill=flag_kill+?,
            flag_save=flag_save+?
            WHERE id IN(?,?)`;

            const vars = [
                data.assist,
                data.return,
                data.taken,
                data.dropped,
                data.capture,
                data.pickup,
                data.cover,
                data.kill,
                data.save,
                masterId, gametypeId
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updatePlayerMatchStats(rowId, stats){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_matches SET
            flag_assist = ?,
            flag_return = ?,
            flag_taken = ?,
            flag_dropped = ?,
            flag_capture = ?,
            flag_pickup = ?,
            flag_cover = ?,
            flag_kill = ?,
            flag_save = ?
            WHERE id=?`;

            const vars = [
                stats.assist,
                stats.return,
                stats.taken,
                stats.dropped,
                stats.capture,
                stats.pickup,
                stats.cover,
                stats.kill,
                stats.save,
                rowId
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    insertCap(matchId, mapId, team, grabTime, grab, covers, assists, cap, capTime, travelTime){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_ctf_caps VALUES(NULL,?,?,?,?,?,?,?,?,?,?)";


            const vars = [matchId, mapId, team, grabTime, grab, covers.toString(), assists.toString(), cap, capTime, travelTime];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    getMatchCaps(matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_ctf_caps WHERE match_id=?";

            mysql.query(query, [matchId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }
}


module.exports = CTF;