import Players from "../../api/players";
import Maps from "../../api/maps";
import Records from "../../api/records";
import Gametypes from "../../api/gametypes";
import CTF from "../../api/ctf";
import Matches from "../../api/matches";
import {getPlayer} from "../../api/generic.mjs";


export default async function handler(req, res){

    try{

        const query = req.query;

        if(query.mode === undefined){
            res.status(200).json({"error": "No query mode specified."});
            return;
        }

        const recordsManager = new Records();

        const mode = query.mode;
        const cat = query.cat ?? "";

        let page = (query.page !== undefined) ? parseInt(query.page) : 1; 
        if(page !== page) page = 1;

        const perPage = (query.perPage !== undefined) ? parseInt(query.perPage) : 25;

        let gametype = (query.gametype !== undefined) ? parseInt(query.gametype) : 0;
        if(gametype !== gametype) gametype = 0;

        let map = (query.map !== undefined) ? parseInt(query.map) : 0;
        if(map !== map) map = 0;

        let playerId = (query.playerId !== undefined) ? parseInt(query.playerId) : 0;
        if(playerId !== playerId) playerId = 0;

        

        if(mode === "0"){

            const {totalResults, data} = await recordsManager.getPlayerTotalRecords(cat, gametype, map, page, perPage);
            res.status(200).json({"data": data, "totalResults": totalResults});
            return;
        }

        if(mode === "1"){

            const {data, totalResults} = await recordsManager.getPlayerMatchRecords(gametype, map, cat, page, perPage);

            const mapsManager = new Maps();
            const mapNames = await mapsManager.getNamesByIds(data.mapIds, true);     

            const gametypesManager = new Gametypes();
            const gametypeNames = await gametypesManager.getNames(data.gametypeIds);

            data.data.map((d) =>{
                d.mapName = (mapNames[d.map_id] !== undefined) ? mapNames[d.map_id] : "Not Found";
                d.gametypeName = (gametypeNames[d.gametype] !== undefined) ? gametypeNames[d.gametype] : "Not Found";
            });

            res.status(200).json({"data": data.data, "totalResults": totalResults});
            return;
        }

        if(mode === "2"){

            
            const ctfManager = new CTF();
            const matchManager = new Matches();
            const playerManager = new Players();

            const data = await ctfManager.getAllMapRecords(gametype);
            const matchDates =  await matchManager.getDates(data.matchIds) ?? {};

            const grabCapPlayers = await ctfManager.getGrabAndCapPlayers(data.capIds);

            const uniquePlayers = new Set();

            for(const info of Object.values(grabCapPlayers)){

                uniquePlayers.add(info.grab);
                uniquePlayers.add(info.cap);
            }

            const assistPlayers = await ctfManager.getAssistedPlayers(data.capIds);

            for(let i = 0; i < assistPlayers.uniquePlayers.length; i++){

                const player = assistPlayers.uniquePlayers[i];
                uniquePlayers.add(player);
            }


            const names = await playerManager.getBasicInfo([...uniquePlayers]);

            const types = ["soloCaps", "assistCaps"];

            for(let t = 0; t < types.length; t++){

                for(let i = 0; i < data[types[t]].length; i++){

                    const d = data[types[t]][i];
                    d.date = matchDates[d.match_id] ?? 0;

                    d.grabPlayer = getPlayer(names,grabCapPlayers[d.cap_id].grab, true); 
                    d.capPlayer = getPlayer(names,grabCapPlayers[d.cap_id].cap, true); 

                    d.totalAssists = 0;

                    if(types[t] === "assistCaps"){

                        const currentAssists = assistPlayers.assists[d.cap_id] ?? [];

                        d.assistPlayers = currentAssists.map((assist) =>{
                            return getPlayer(names, assist, true)
                        });

                        d.totalAssists = d.assistPlayers.length;
                    }
                }
            }
            
            res.status(200).json({"data": data, "totalResults": 1});

            return;
        }

        if(mode === "3"){
            
            const ctfManager = new CTF();
            //0 solo caps 1 assist players
            const data = await ctfManager.getSingleMapCapRecords(gametype, map, cat, page, perPage);

            const playerManager = new Players();
            data.playerNames = await playerManager.getBasicInfo(data.uniquePlayers);

            res.status(200).json({"data": data, "totalResults": data.totalResults});
            return;
        }

        /*if(req.body.mode === undefined){

            res.status(200).json({"error": "No mode was specified."});
            return;
        }

        let mode = req.body.mode ?? 0;

        const playerManager = new Players();

        const validTypesDisplay = playerManager.getValidRecordTypes();
        const validTypes = playerManager.getValidRecordTypes(true);

        if(mode === "validtypes"){

            res.status(200).json(validTypesDisplay);
            return;
        }


        if(req.body.type === undefined){

            res.status(200).json({"error": "No type was specified."});
            return;
        }

        
        let type = req.body.type ?? "";
        if(type !== "") type = type.toLowerCase();

        let page = req.body.page ?? 0;
        if(page < 0) page = 0;
        let perPage = req.body.perPage ?? 25;

        perPage = parseInt(perPage);
        
        if(perPage !== perPage) perPage = 25;
        if(perPage > 100) perPage = 100;
        if(perPage <= 0) perPage = 25;


        if(mode === "totals"){

            if(validTypes.totals.indexOf(type) !== -1){

                const totalData = await playerManager.getBestOfTypeTotal(validTypes.totals, type, 0, perPage, page);

                const totalPossibleResults = await playerManager.getTotalResults(0);

                res.status(200).json({"data": totalData, "totalResults": totalPossibleResults});
                return;
            }   
        }

        if(mode === "match"){

            if(validTypes.totals.indexOf(type) !== -1){

                const results = await playerManager.getBestMatchValues(validTypes.matches, type, page, perPage);

                const totalResults = await playerManager.getTotalBestMatchValues(validTypes.matches, type);
                
                const playerIds = Functions.getUniqueValues(results, "player_id");
                const mapIds = Functions.getUniqueValues(results, "map_id");

                const mapManager = new Maps();

                const mapNames = await mapManager.getNames(mapIds);

                const playerNames = await playerManager.getNamesByIds(playerIds, true);

                for(let i = 0; i < results.length; i++){

                    const r = results[i];
                    r.name = playerNames[results[i].player_id].name ?? "Not Found";
                    r.mapName = mapNames[results[i].map_id] ?? "Not Found";
                }


                res.status(200).json({"data": results, "totalResults": totalResults});
                return;

            }
        }*/

        res.status(200).json({"error": "Unknown option."});
        return;

    }catch(err){

        console.trace(err);

        res.status(200).json({"error": err.toString()});
    }
}