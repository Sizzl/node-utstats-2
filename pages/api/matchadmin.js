import Session from '../../api/session';
import Matches from '../../api/matches'

export default async (req, res) =>{

    try{

        const session = new Session(req);

        await session.load();

        if(session.settings.bAdmin){
            
            console.log(req.body);

            const matchManager = new Matches();

            if(req.body.type === "deleteMatch"){

                await matchManager.deleteMatch(parseInt(req.body.matchId));

            }else{
                res.status(200).json({"message": "Unknown command"});
                return;
            }

            res.status(200).json({"message": "passed"});
        }else{

            res.status(200).json({"message": "Only admins can perform this action."});
        }

    }catch(err){
        console.trace(err);
        res.status(200).json({"message": `Error ${err}`})
    }   
}