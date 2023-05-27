const Message = require("./message");
const mysql = require("./database");

class WinRate{

    constructor(){}

    async createPlayerLatest(playerId, gametypeId, mapId, matchResult, matchDate, matchId){

        const query = `INSERT INTO nstats_winrates_latest VALUES(
            NULL,?,?,?,?,?,
            1,?,?,?,?,
            ?,?,?,
            ?,?,?
        )`;

        const wins = (matchResult === 1) ? 1 : 0;
        const draws = (matchResult === 2) ? 1 : 0;
        const losses = (matchResult === 0) ? 1 : 0;

        const winrate = (matchResult === 1) ? 100 : 0;

        const vars = [
            matchDate, matchId, playerId, gametypeId, mapId,
            wins, draws, losses, winrate,
            wins, draws, losses,
            wins, draws, losses
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async updatePlayerLatest(playerId, gametypeId, mapId, matchResult, matchDate, matchId){

        const query = `UPDATE nstats_winrates_latest SET
        date=?, match_id=?,
        matches=matches+1,
        wins = IF(? = 1, wins + 1, wins),
        draws = IF(? = 2, draws + 1, draws),
        losses = IF(? = 0, losses + 1, losses),
        winrate = IF(wins > 0, (wins / matches) * 100, 0),
        current_win_streak = IF(? = 1, current_win_streak + 1, 0),
        current_draw_streak = IF(? = 2, current_draw_streak + 1, 0),
        current_lose_streak = IF(? = 0, current_lose_streak + 1, 0),
        max_win_streak = IF(current_win_streak > max_win_streak, current_win_streak, max_win_streak),
        max_draw_streak = IF(current_draw_streak > max_draw_streak, current_draw_streak, max_draw_streak),
        max_lose_streak = IF(current_lose_streak > max_lose_streak, current_lose_streak, max_lose_streak)
        WHERE player=? AND gametype=? AND map=?`;

        const vars = [
            matchDate, matchId,
            matchResult,
            matchResult,
            matchResult,
            matchResult,
            matchResult,
            matchResult,
            playerId, gametypeId, mapId];

        const result = await mysql.simpleQuery(query, vars);

        if(result.affectedRows === 0){
            await this.createPlayerLatest(playerId, gametypeId, mapId, matchResult, matchDate, matchId);
        }

        await this.insertHistory(playerId, gametypeId, mapId, matchResult, matchDate, matchId);

    }


    async getPlayerLatest(playerId, gametypeId, mapId){

        const query = `SELECT matches,wins,draws,losses,winrate,current_win_streak,
        current_draw_streak,current_lose_streak,max_win_streak,max_draw_streak,max_lose_streak
        FROM nstats_winrates_latest WHERE player=? AND gametype=? AND map=?`;

        const result = await mysql.simpleQuery(query, [playerId, gametypeId, mapId]);

        if(result.length > 0) return result[0];

        return null;
    }


    async insertHistory(playerId, gametypeId, mapId, matchResult, matchDate, matchId){

        const latestData = await this.getPlayerLatest(playerId, gametypeId, mapId);

        if(latestData === null){

            new Message(`winrate.insertHistory() latest is null`, "error");
            return;
        }

        const query = `INSERT INTO nstats_winrates VALUES(NULL,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,
            ?,?,?    
        )`;

        const vars = [
            matchDate, matchId, playerId, gametypeId, mapId,
            matchResult, latestData.matches, latestData.wins, latestData.draws, latestData.losses,
            latestData.winrate, latestData.current_win_streak, latestData.current_draw_streak, latestData.current_lose_streak,
            latestData.max_win_streak, latestData.max_draw_streak, latestData.max_lose_streak
        ];

        await mysql.simpleQuery(query, vars);
    }

    async bNeedToRecalulate(date){

        const query = `SELECT date FROM nstats_winrates_latest ORDER BY date DESC LIMIT 1`;

        const result = await mysql.simpleQuery(query);

        if(result.length === 0) return false;

        return result[0].date > date;
    }
    /*async getPlayersCurrentData(players, gametypes, maps){

        const query = `SELECT * FROM nstats_winrates_latest WHERE player IN(?) AND gametype IN(?) AND map IN(?)`;

        const result = await mysql.simpleQuery(query, [players, gametypes, maps]);

        console.log(result);

        return this.createCurrentData(result, players, gametypes, maps);

    }*/

    /*async getCurrentPlayersData(players, gametypes){

        if(players.length === 0){
            new Message(`WinRate.getCUrrentPlayersData() players.length is 0 skipping.`,"warning");
            return [];
        }

        const query = "SELECT * FROM nstats_winrates_latest WHERE player IN(?) AND gametype IN(?) ORDER BY id DESC";

        const result = await mysql.simpleQuery(query, [players, gametypes]);

        return this.createMissingData(players, result, gametypes);

    }

    bDataExist(data, player, gametype){


        for(let i = 0; i < data.length; i++){

            const d = data[i];
            if(d.player === player && d.gametype === gametype) return true;
        }

        return false;
    }

    createMissingData(players, result, gametypes){

        for(let i = 0; i < players.length; i++){

            for(let x = 0; x < gametypes.length; x++){

                if(!this.bDataExist(result, players[i], gametypes[x])){

                    result.push(
                        {
                            "player": players[i],
                            "gametype": gametypes[x],
                            "matches": 0,
                            "wins": 0,
                            "draws": 0,
                            "losses": 0,
                            "winrate": 0,
                            "current_win_streak": 0,
                            "current_draw_streak": 0,
                            "current_lose_streak": 0,
                            "max_win_streak": 0,
                            "max_draw_streak": 0,
                            "max_lose_streak": 0
                        }
                    );
                }
            }
        }

        return result;
    }


    async insertLatest(matchId, date, data){

        const query = "INSERT INTO nstats_winrates_latest VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

        const vars = [
            date, 
            matchId, 
            data.player, 
            data.gametype, 
            data.matches,
            data.wins, 
            data.draws, 
            data.losses,
            data.winrate,
            data.current_win_streak,
            data.current_draw_streak,
            data.current_lose_streak,
            data.max_win_streak,
            data.max_draw_streak,
            data.max_lose_streak
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async insertHistory(matchId, date, data, bLatest){


        if(bLatest !== undefined){
            return this.insertHistory(matchId, date, data);
        }
        
        const query = "INSERT INTO nstats_winrates VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

        const vars = [
            date, 
            matchId, 
            data.player, 
            data.gametype, 
            data.match_result,
            data.matches,
            data.wins, 
            data.draws, 
            data.losses,
            data.winrate,
            data.current_win_streak,
            data.current_draw_streak,
            data.current_lose_streak,
            data.max_win_streak,
            data.max_draw_streak,
            data.max_lose_streak
        ];
        
    
        return await mysql.simpleQuery(query, vars);
        
    }

    async updateLatest(matchId, date, data){

        const query = `UPDATE nstats_winrates_latest SET 
        date=?,
        match_id=?,
        matches=?,
        wins=?,
        draws=?,
        losses=?,
        winrate=?,
        current_win_streak=?,
        current_draw_streak=?,
        current_lose_streak=?,
        max_win_streak=?,
        max_draw_streak=?,
        max_lose_streak=?
        WHERE player=? AND gametype=?`;

        const vars = [
            date, 
            matchId, 
            data.matches,
            data.wins, 
            data.draws, 
            data.losses,
            data.winrate,
            data.current_win_streak,
            data.current_draw_streak,
            data.current_lose_streak,
            data.max_win_streak,
            data.max_draw_streak,
            data.max_lose_streak,
            data.player,
            data.gametype
        ];

        const result = await mysql.simpleQuery(query, vars);

        if(result.affectedRows === 0){
            await this.insertHistory(matchId, date, data, true);
        }
    }


    async getPlayerLatest(player){

        const query = "SELECT * FROM nstats_winrates_latest WHERE player=?";
        return await mysql.simpleQuery(query, [player]);
    }

    async getPlayerGametypeHistory(player, gametype, limit){

        const query = "SELECT * FROM nstats_winrates WHERE player=? AND gametype=? ORDER BY match_id DESC LIMIT ?";
        return await mysql.simpleQuery(query, [player, gametype, limit]);
     
    }
    

    async getPlayerWinrateHistory(player, gametypes, maxPerGametype){

        try{

            if(gametypes.length === 0) return [];

            const data = [];

            for(let i = 0; i < gametypes.length; i++){

                data.push(await this.getPlayerGametypeHistory(player, gametypes[i], maxPerGametype));
            }

            return data;
            
        }catch(err){
            console.trace(err);
        }
    }


    async getPreviousMatchByDate(date, gametype, player){

        const query = "SELECT * FROM nstats_winrates WHERE date <= ? AND gametype = ? AND player = ? ORDER BY date DESC, id DESC LIMIT 1";

        return await mysql.simpleQuery(query, [date, gametype, player]);

    }


    async getAllPlayerGametypeHistory(player, gametype){

        const query = `SELECT id,date,match_result
            FROM nstats_winrates WHERE gametype=? AND player=? ORDER BY date ASC`;

        return await mysql.simpleQuery(query, [gametype, player]);
    }

    async updateHistoryEntry(data){

        const query = `UPDATE nstats_winrates SET 
        matches=?,
        wins=?,
        draws=?,
        losses=?,
        winrate=?,
        current_win_streak=?,
        current_draw_streak=?,
        current_lose_streak=?,
        max_win_streak=?,
        max_draw_streak=?,
        max_lose_streak=?
        WHERE id=?`;

        const vars = [

            data.matches,
            data.wins,
            data.draws,
            data.losses,
            data.winrate,
            data.current_win_streak,
            data.current_draw_streak,
            data.current_lose_streak,
            data.max_win_streak,
            data.max_draw_streak,
            data.max_lose_streak,
            data.id

        ];

        return await mysql.simpleQuery(query, vars);
    }

    //call when a match date is lower then the latest one
    async recalculateWinRates(player, gametype){

        try{

            const history = await this.getAllPlayerGametypeHistory(player, gametype);

            let currentWinStreak = 0;
            let currentDrawStreak = 0;
            let currentLoseStreak = 0;

            let maxWinStreak = 0;
            let maxDrawStreak = 0;
            let maxLoseStreak = 0;

            let currentWins = 0;
            let currentDraws = 0;
            let currentLosses = 0;

            for(let i = 0; i < history.length; i++){

                const h = history[i];

                if(h.match_result === 0){

                    currentWinStreak++;
                    currentDrawStreak = 0;
                    currentLoseStreak = 0;

                    if(currentWinStreak > maxWinStreak){
                        maxWinStreak = currentWinStreak;
                    }

                    currentWins++;

                }else if(h.match_result === 1){

                    currentWinStreak = 0;
                    currentDrawStreak = 0;
                    currentLoseStreak++;

                    if(currentLoseStreak > maxLoseStreak){
                        maxLoseStreak = currentLoseStreak;
                    }

                    currentLosses++;

                }else{

                    currentWinStreak = 0;
                    currentDrawStreak++;
                    currentLoseStreak = 0;

                    if(currentDrawStreak > maxDrawStreak){
                        maxDrawStreak = currentDrawStreak;
                    }

                    currentDraws++;
                }

                h.wins = currentWins;
                h.draws = currentDraws;
                h.losses = currentLosses;
                h.current_win_streak = currentWinStreak;
                h.current_draw_streak = currentDrawStreak;
                h.current_lose_streak = currentLoseStreak;
                h.max_win_streak = maxWinStreak;
                h.max_draw_streak = maxDrawStreak;
                h.max_lose_streak = maxLoseStreak;
                h.matches = i + 1;
                
                if(h.wins > 0){

                    if(h.draws === 0 && h.losses === 0){
                        h.winrate = 100;
                    }else{
                        h.winrate = (h.wins / h.matches) * 100;
                    }
                }else{
                    h.winrate = 0;
                }

            }

        }catch(err){
            console.trace(err);
        }   
    }


    async deleteMatchData(id){


        await mysql.simpleDelete("DELETE FROM nstats_winrates WHERE match_id=?", [id]);
        await mysql.simpleDelete("DELETE FROM nstats_winrates_latest WHERE match_id=?", [id]);
     
    }

    async getPlayerGamtypeHistoryDetailed(playerId, gametypeId){

        return await mysql.simpleFetch("SELECT * FROM nstats_winrates WHERE gametype=? AND player=? ORDER BY id ASC",[
            gametypeId, playerId
        ]);
    }

    async recalculatePlayerHistory(data, playerId, gametypeId){

        try{

            if(data.length === 0) return;

            // loser = 0
            // winner = 1
            // draw = 2

            let matches = 0;
            let wins = 0;
            let draws = 0;
            let losses = 0;
            let currentWinStreak = 0;
            let currentDrawStreak = 0;
            let currentLoseStreak = 0;
            let maxWinStreak = 0;
            let maxDrawStreak = 0;
            let maxLoseStreak = 0;
            let winrate = 0;
            let matchId = 0;
            let matchDate = 0;

            for(let i = 0; i < data.length; i++){

                const d = data[i];

                matches++;

                matchId = d.match_id;
                matchDate = d.date;

                if(d.match_result === 0){

                    losses++;
                    currentWinStreak = 0;
                    currentDrawStreak = 0;
                    currentLoseStreak++;

                }else if(d.match_result === 1){

                    wins++;
                    currentWinStreak++;
                    currentDrawStreak = 0;
                    currentLoseStreak = 0;

                }else if(d.match_result === 2){

                    draws++;
                    currentDrawStreak++;
                    currentWinStreak = 0;
                    currentLoseStreak = 0;
                }


                if(currentWinStreak >= maxWinStreak) maxWinStreak = currentWinStreak;
                if(currentDrawStreak >= maxDrawStreak) maxDrawStreak = currentDrawStreak;
                if(currentLoseStreak >= maxLoseStreak) maxLoseStreak = currentLoseStreak;


                winrate = 0;

                if(wins > 0){

                    if(losses === 0 && draws === 0){
                        winrate = 100;
                    }else{

                        winrate = (wins / matches) * 100
                    }

                }

                //query here

                await this.updateHistoryEntry({
                    "id": d.id,
                    "matches": matches,
                    "wins": wins,
                    "draws": draws,
                    "losses": losses,
                    "current_win_streak": currentWinStreak,
                    "current_draw_streak": currentDrawStreak,
                    "current_lose_streak": currentLoseStreak,
                    "max_win_streak": maxWinStreak,
                    "max_draw_streak": maxDrawStreak,
                    "max_lose_streak": maxLoseStreak,
                    "winrate": winrate

                });
            }

            await this.updateLatest(matchId, matchDate, {
                "id": d.id,
                "matches": matches,
                "wins": wins,
                "draws": draws,
                "losses": losses,
                "current_win_streak": currentWinStreak,
                "current_draw_streak": currentDrawStreak,
                "current_lose_streak": currentLoseStreak,
                "max_win_streak": maxWinStreak,
                "max_draw_streak": maxDrawStreak,
                "max_lose_streak": maxLoseStreak,
                "winrate": winrate,
                "player": playerId,
                "gametype": gametypeId

            });

        }catch(err){
            console.trace(err);
        }
    }

    async deletePlayerFromMatch(playerId, matchId, gametypeId){

        try{

            await mysql.simpleDelete("DELETE FROM nstats_winrates WHERE player=? AND match_id=?", [playerId, matchId]);

            const allHistory = await this.getPlayerGamtypeHistoryDetailed(playerId, 0);
            const gametypeHistory = await this.getPlayerGamtypeHistoryDetailed(playerId, gametypeId);

            await this.recalculatePlayerHistory(allHistory, playerId, gametypeId);
            await this.recalculatePlayerHistory(gametypeHistory, playerId, gametypeId);

        }catch(err){
            console.trace(err);
        }
    }

    async deletePlayer(playerId){
        await mysql.simpleQuery("DELETE FROM nstats_winrates WHERE player=?", [playerId]);
        await mysql.simpleQuery("DELETE FROM nstats_winrates_latest WHERE player=?", [playerId]);
    }

    async insertLatestAfterMerge(gametype, data){

        const query = `INSERT INTO nstats_winrates_latest VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        const vars = [
            data.date,
            data.match_id,
            data.player,
            gametype,
            data.matches,
            data.wins,
            data.draws,
            data.losses,
            data.winrate,
            data.current_win_streak,
            data.current_draw_streak,
            data.current_lose_streak,
            data.max_win_streak,
            data.max_draw_streak,
            data.max_lose_streak
        ];

        await mysql.simpleInsert(query, vars);
    }

    async recalculatePlayerHistoryAfterMerge(playerId, matches){

        try{

            const totals = {};

            const updateTotal = (d, gametype) =>{

                if(totals[gametype] === undefined){

                    totals[gametype] = {
                        "player": playerId,
                        "match_id": 0,
                        "date": 0,
                        "matches": 0,
                        "wins": 0,
                        "draws": 0,
                        "losses": 0,
                        "winrate": 0,
                        "current_win_streak": 0,
                        "current_draw_streak": 0,
                        "current_lose_streak": 0,
                        "max_win_streak": 0,
                        "max_draw_streak": 0,
                        "max_lose_streak": 0,
                        "winrate": 0,
                        "match_result": 0, //for history table, 0 win, lose 1, draw 2,
                        "gametype": gametype, //also for history
                    };
                }

                const current = totals[gametype];

                
                current.date = d.match_date;
                current.match_id = d.match_id;
                current.matches++;

                if(d.winner){
                    current.wins++;
                    current.current_win_streak++;
                    current.current_draw_streak = 0;
                    current.current_lose_streak = 0;
                    current.match_result = 0;
                }

                if(d.draw){
                    current.draws++;
                    current.current_win_streak = 0;
                    current.current_draw_streak++;
                    current.current_lose_streak = 0;
                    current.match_result = 2;

                }else{
                    if(!d.winner){
                        current.losses++;
                        current.current_win_streak = 0;
                        current.current_draw_streak = 0;
                        current.current_lose_streak++;
                        current.match_result = 1;
                    }
                }

                if(current.wins > 0){

                    if(current.losses === 0){
                        current.winrate = 100;
                    }else{
                        current.winrate = (current.wins / current.matches) * 100;
                    }
                }



                if(current.current_win_streak > current.max_win_streak) current.max_win_streak = current.current_win_streak;
                if(current.current_draw_streak > current.max_draw_streak) current.max_draw_streak = current.current_draw_streak;
                if(current.current_lose_streak > current.max_lose_streak) current.max_lose_streak = current.current_lose_streak;
            }

            for(let i = 0; i < matches.length; i++){

                const m = matches[i];

                updateTotal(m, 0);
                updateTotal(m, m.gametype);
                await this.insertHistory(m.match_id, m.match_date, totals[m.gametype]);
                await this.insertHistory(m.match_id, m.match_date, totals[0]);
            }


            for(const [key, value] of Object.entries(totals)){

                await this.insertLatestAfterMerge(key, value);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async changeGametypeId(oldId, newId){

        await mysql.simpleUpdate("UPDATE nstats_winrates SET gametype=? WHERE gametype=?", [newId, oldId]);
        await mysql.simpleUpdate("UPDATE nstats_winrates_latest SET gametype=? WHERE gametype=?", [newId, oldId]);
    }

    async getGametypeData(id){

        return await mysql.simpleFetch("SELECT * FROM nstats_winrates WHERE gametype=? ORDER BY match_id ASC", [id]);
    }

    async deleteGametype(id){

        //console.log(`delete gametype ${id}`);
        await mysql.simpleDelete("DELETE FROM nstats_winrates WHERE gametype=?", [id]);
        await mysql.simpleDelete("DELETE FROM nstats_winrates_latest WHERE gametype=?", [id]);
    }

    createDummyGametypeData(player, gametype){

        return {
            "player": player,
            "gametype": gametype,
            "match_id": 0,
            "match_result": 0,
            "matches": 0,
            "wins": 0,
            "draws": 0,
            "losses": 0,
            "winrate": 0,
            "current_win_streak": 0,
            "current_draw_streak": 0,
            "current_lose_streak": 0,
            "max_win_streak": 0,
            "max_draw_streak": 0,
            "max_lose_streak": 0
        };
    }

    async recalculateGametype(id){

        try{

            const data = await this.getGametypeData(id);

            await this.deleteGametype(id);

            const players = {}

            const updateGametype = async (gametype, data) =>{

               // console.log(`update gametype id ${gametype}`);

                try{
                    let d = data;

                    if(players[d.player] === undefined){
                        players[d.player] = {}
                    }

                    if(players[d.player][gametype] === undefined){
                        players[d.player][gametype] = this.createDummyGametypeData(d.player, gametype);
                    }


                    const current = players[d.player][gametype];

                    current.matches++;
                    current.match_id = d.match_id;
                    current.match_result = d.match_result;

                    //0 win 1 lose 2 draw

                    if(d.match_result === 0){

                        current.wins++;
                        current.draws = 0;
                        current.losses = 0;

                        current.current_win_streak++;
                        current.current_draw_streak = 0;
                        current.current_lose_streak = 0;

                    }else if(d.match_result === 1){

                        current.wins = 0;
                        current.draws = 0;
                        current.losses++;

                        current.current_win_streak = 0;
                        current.current_draw_streak = 0;
                        current.current_lose_streak++;

                    }else if(d.match_result === 2){

                        current.wins = 0;
                        current.draws++;
                        current.losses = 0;

                        current.current_win_streak = 0;
                        current.current_draw_streak++;
                        current.current_lose_streak = 0;
                    }


                    if(current.current_win_streak > current.max_win_streak) current.max_win_streak = current.current_win_streak;
                    if(current.current_draw_streak > current.max_draw_streak) current.max_draw_streak = current.current_draw_streak;
                    if(current.current_lose_streak > current.max_lose_streak) current.max_lose_streak = current.current_lose_streak;


                    await this.insertHistory(d.match_id, -1, d);
                    await this.updateLatest(d.match_id, -1, d);

                }catch(err){
                    console.trace(err);
                }
            }

            for(let i = 0; i < data.length; i++){

                const d = data[i];
                await updateGametype(id, d);
            }

            if(id !== 0){

                await this.recalculateGametype(0);
            }

        }catch(err){
            console.trace(err);
        }

    }

    async deleteGametypeLatest(id){

        await mysql.simpleDelete("DELETE FROM nstats_winrates_latest WHERE gametype=?", [id]);
    }

    async deleteMatchesQuery(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_winrates WHERE match_id IN (?)", [ids]);
    }

    async deleteMatches(matchIds, gametypeId, playerIds){

        try{

            await this.deleteGametypeLatest(gametypeId);
            await this.deleteMatchesQuery(matchIds);

            await this.recalculateGametype(0);
            
        }catch(err){
            console.trace(err);
        }
    }*/
}

module.exports = WinRate;