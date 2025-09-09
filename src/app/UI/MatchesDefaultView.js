import { convertTimestamp, cleanMapName, removeUnr } from '../../../api/generic.mjs';
import MatchResultDisplay from './MatchResultDisplay';
import MatchResult from './MatchResult';

function getMapImage(images, name){

    name = cleanMapName(name).toLowerCase();

    if(images[name] !== undefined){
        return images[name];
    }

    return "default";

}

export default function MatchesDefaultView({data, images}){

    const elems = [];
    
    for(let i = 0; i < data.length; i++){

        const d = data[i];

        elems.push(<MatchResultDisplay 
            key={i}
            mode="recent"
            url={`/match/${d.id}`}
            mapImage={`/images/maps/${getMapImage(images, d.mapName)}.jpg`}
            mapName={removeUnr(d.mapName)}
            serverName={d.serverName}
            date={convertTimestamp(d.date)}
            players={d.players}
            playtime={d.playtime}
            gametypeName={d.gametypeName}
        >
            <MatchResult 
                dmWinner={d.dmWinner}
                dmScore={d.dm_score}
                totalTeams={d.total_teams}
                redScore={d.team_score_0}
                blueScore={d.team_score_1}
                greenScore={d.team_score_2}
                yellowScore={d.team_score_3}
                endReason={d.end_type}
                bMonsterHunt={d.mh}
            />
        </MatchResultDisplay>);

    
    }

    return <div>{elems}</div>
    
}