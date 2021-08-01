import mysql from './database';
import Players from './players';
import Functions from '../functions';
import MainMaps from '../../api/maps';

class Matches{

    constructor(){

        this.players = new Players();

    }


    async getLatestMatches(page, perPage){

        page = parseInt(page);
        perPage = parseInt(perPage);

        if(page !== page) page = 1;
        if(perPage !== perPage) perPage = 25;

        page--;

        if(page < 0){ page = 0; }
        if(perPage <= 0) perPage = 25;

        const start = page * perPage;

        const query = `SELECT id,time,servername,gamename,gametime,mapfile,teamgame,ass_att,ass_win,t0,t1,t2,t3,t0score,t1score,t2score,t3score 
        FROM uts_match ORDER BY time DESC LIMIT ?,?`;


        const matches = await mysql.simpleQuery(query, [start, perPage]);

        const uniqueMaps = this.setUniqueMaps(matches);

        const mapImages = await this.getMapImages(uniqueMaps);

        let imageIndex = 0;

        let m = 0;

        for(let i = 0; i < matches.length; i++){

            m = matches[i];

            m.players = await this.getMatchPlayerCount(m.id);

            m.result = await this.createMatchResult(m);

            m.totalTeams = this.setTotalTeams(m.t0, m.t1, m.t2, m.t3);

            imageIndex = mapImages.indexOf(Functions.cleanMapName(m.mapfile).toLowerCase());

            if(imageIndex === -1){
                m.image = "default";
            }else{
                m.image = mapImages[imageIndex];
            }
        }

        return matches;
    }


    async getMapImages(mapNames){

        const mainMaps = new MainMaps();

        return await mainMaps.getImages(mapNames);
        
    }


    setUniqueMaps(matches){

        const unique = [];

        let m = 0;

        let currentName = "";

        for(let i = 0; i < matches.length; i++){

            m = matches[i];

            currentName = Functions.removeUnr(m.mapfile);

            if(unique.indexOf(currentName) === -1){
                unique.push(currentName);
            }
        }

        return unique;
    }

    setTotalTeams(red, blue, green, yellow){

        let total = 0;

        if(red > 0) total++;
        if(blue > 0) total++;
        if(green > 0) total++;
        if(yellow > 0) total++;

        return total;
    }

    async getMatchPlayerCount(id){

        const query = "SELECT COUNT(*) as players FROM uts_player WHERE matchid=?";

        const result = await mysql.simpleQuery(query, [id]);

        return result[0].players;
    }

    async createMatchResult(matchData){

        const teamGame = matchData.teamgame.toLowerCase();

        if(teamGame === "true"){

            const teamScores = [];

            for(let i = 0; i < 4; i++){
                if(matchData[`t${i}`]) teamScores.push(matchData[`t${i}score`]);
            }

            return teamScores;

        }else{

            return await this.players.getDmWinner(matchData.id);
        }

    }

}

export default Matches;