import Combogib from "../../api/combogib";

export default async function handler(req, res){

    try{

        let mode = req.body.mode ?? null;

        if(mode === null){
            res.status(200).json({"error": "No mode specified"});
            return;
        }

        mode = mode.toLowerCase();
        const matchId = req.body.matchId ?? -1;

        const combo = new Combogib();

        if(mode === "match"){

            const data = await combo.getMatchData(matchId);

            res.status(200).json({"data": data});

            return;

        }else if(mode === "pmatch"){

            const matchId = req.body.matchId ?? -1;
            const playerId = req.body.playerId ?? -1;

            if(matchId === -1|| playerId === -1){
                res.status(200).json({"error": "PlayerId and or matchId were not specified"});
                return;
            }

        }

    }catch(err){

        console.trace(err);
        res.status(200).json({"error": err.message});
        return;
    }

    res.status(200).json({"error": "Unknown mode."});
    return;

}

