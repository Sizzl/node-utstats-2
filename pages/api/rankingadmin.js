import Session from '../../api/session';
import Rankings from '../../api/rankings';

export default async (req, res) =>{

    try{


        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const rankingManager = new Rankings();

            let gametypeId = parseInt(req.body.gametypeId);
            let mode = req.body.mode;

            if(mode === "values"){

                const values = req.body.data;

                if(values !== undefined){

                    console.log("change values");

                    console.table(values);

                    let v = 0;

                    for(let i = 0; i < values.length; i++){

                        v = values[i];

                        await rankingManager.updateEvent(v.id, v.description, v.value);
                    }

                    res.status(200).json({"message": "passed"});

                }else{
                    res.status(200).json({"message": "Values are not set"});
                }

                

            }else{

                mode = parseInt(mode);

                if(mode === mode){

                    if(gametypeId === gametypeId){


                        if(gametypeId > 0){

                            if(mode === 0){

                                await rankingManager.recalculateGametypeRankings(gametypeId);

                            }else if(mode === 1){

                                await rankingManager.deleteGametype(gametypeId);
                            }


                            console.log(`gametypeId = ${gametypeId}, mode = ${mode}`);
                            res.status(200).json({"message": "passed"});
                            return;

                        }else{

                            res.status(200).json({"message": "Gametype must be a positive integer."});
                        }

                    }else{

                        res.status(200).json({"message": "Gametype must a valid integer."});
                    }
                }else{

                    res.status(200).json({"message": "Mode must be a valid interger."});
                }
            }

        }else{

            res.status(200).json({"message": "Only admins can perform this action"});
        }


    }catch(err){
        console.trace(err);
        res.status(200).json({"message": `Error: ${err}`})
    }
}