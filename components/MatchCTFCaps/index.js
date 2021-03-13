import TipHeader from '../TipHeader/';
import CountryFlag from '../CountryFlag/';
import MMSS from '../MMSS/';
import styles from './MatchCTFCaps.module.css';
import Link from 'next/link';
import Functions from '../../api/functions';
import MouseHoverBox from '../MouseHoverBox/';

const createPlayerMap = (players) =>{

    const data = new Map();

    let p = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        data.set(p.player_id, {"name": p.name, "country": p.country});
    }

    return data;
}

const getPlayer = (players, id) =>{

    id = parseInt(id);

    const current = players.get(id);

    if(current !== undefined){
        return {"name": current.name, "country": current.country};
    }

    return {"name": 'Not Found', "country": 'xx'};
}

function createCovers(covers, coverTimes){

    const data = new Map();

    covers = covers.split(',');
    coverTimes = coverTimes.split(',');

    let total = 0;
    let player = 0;
    let current = 0;
    

    for(let i = 0; i < covers.length; i++){

        if(covers[i] === ''){
            continue;
        }

        total++;

        player = parseInt(covers[i]);
        current = data.get(player);


        if(current === undefined){
            data.set(player, {"total": 1, "times": [coverTimes[i]]});
        }else{

            current.times.push(coverTimes[i]);
            current.total++;

            if(current.times !== undefined){
                data.set(player, {"total": current.total, "times": current.times})
            }
        }
    }

    let ordered = [];

    for(const [key, value] of data){
        ordered.push({"key": key, "value": value.total, "times": value.times});
    }

    ordered.sort((a, b) =>{

        a = a.value;
        b = b.value;

        if(a > b){
            return -1;
        }else if(a < b){
            return 1;
        }

        return 0;
    });

    data.clear();

    for(let i = 0; i < ordered.length; i++){

        data.set(ordered[i].key, {"value": ordered[i].value, "times": ordered[i].times});
    }

    return {"data": data, "total": total};
}

function createAssists(assists, assistTimes){

    assists = assists.split(',');
    assistTimes = assistTimes.split(',');

    console.log(assistTimes);
    const players = [];

    for(let i = 0; i < assists.length; i++){

        if(assists[i] === ''){
            continue;
        }

        if(players.indexOf(parseInt(assists[i])) === -1){
            players.push({"player": parseInt(assists[i]), "time": parseFloat(assistTimes[i])});
        }

    }

    return players;
}


function calcDropTime(data){

    let totalCarryTime = 0;

    data.assist_carry_times = data.assist_carry_times.split(',');

    for(let i = 0; i < data.assist_carry_times.length; i++){

        if(data.assist_carry_times[i] !== ''){
            totalCarryTime += parseFloat(data.assist_carry_times[i]);
        }
    }
   

    return parseFloat(data.travel_time - totalCarryTime).toFixed(2);
}

const MatchCTFCaps = ({players, caps, matchStart, totalTeams}) =>{

    players = JSON.parse(players);
    caps = JSON.parse(caps);
    matchStart = parseFloat(matchStart)

    const playerNames = createPlayerMap(players);

    let currentCovers = 0;
    let currentAssists = 0;
    let grabPlayer = 0;
    let capPlayer = 0;
    let bgColor = 0;
    let currentCoverPlayer = 0;
    let currentAssistPlayer = 0;
    let totalDropTime = 0;

  
    const elems = [];
    let coverElems = [];
    let assistElems = [];
    let coverNames = [];

    let c = 0;

    for(let i = 0; i < caps.length; i++){

        c = caps[i];

        coverNames = "";
        currentCovers = createCovers(c.covers, c.cover_times);
        currentAssists = createAssists(c.assists, c.assist_carry_times);
        totalDropTime = calcDropTime(c);

        grabPlayer = getPlayer(playerNames, c.grab);
        capPlayer = getPlayer(playerNames, c.cap);

        coverElems = [];
        assistElems = [];
         
        //<CountryFlag country={currentCoverPlayer.country}/><Link href={`/player/${key}`}><a>{currentCoverPlayer.name}</a></Link> 
        for(const [key, value] of currentCovers.data){

            currentCoverPlayer = getPlayer(playerNames, key);

            coverElems.push(<span key={`cap-${i}-cover-${key}`} className={styles.cover}>
                <CountryFlag country={currentCoverPlayer.country}/>
                <Link href={`/player/${key}`}><a>
                <MouseHoverBox title={`${currentCoverPlayer.name} covered the flag carrier`} 
                    content={`${currentCoverPlayer.name} covered the flag carrier ${value.value} ${(value.value === 1) ? "time" : "times"}.`} 
                    display={currentCoverPlayer.name}/>
                </a></Link> 
            </span>);
        }

        for(let x = 0; x < currentAssists.length; x++){

            currentAssistPlayer = getPlayer(playerNames, currentAssists[x].player);

            console.log(`currentAssists[x]`);
            console.log(currentAssists[x]);

            assistElems.push(<span key={`cap-${i}-assist-${x}`} className={styles.cover}>
                <CountryFlag country={currentAssistPlayer.country}/>
                <Link href={`/player/${currentAssists[x]}`}><a><MouseHoverBox title={"Assist time"} display={currentAssistPlayer.name} 
                content={`${currentAssistPlayer.name} carried the flag for ${currentAssists[x].time} seconds`}/></a></Link>
            </span>);
        }

        bgColor = Functions.getTeamColor(c.team);

        elems.push(<tr key={`cover-${i}`} className={"team-none"}>
            <td className={bgColor}><span className={styles.time}><MMSS timestamp={c.grab_time - matchStart}/></span><CountryFlag country={grabPlayer.country}/><Link href={`/player/${c.grab}`}><a>{grabPlayer.name}</a></Link></td>
            <td>{coverElems}</td>
            <td>{assistElems}</td>
            <td className={bgColor}><span className={styles.time}><MMSS timestamp={c.cap_time - matchStart}/></span><CountryFlag country={capPlayer.country}/><Link href={`/player/${c.cap}`}><a>{capPlayer.name}</a></Link></td>
            <td><span className={styles.time}><MMSS timestamp={c.travel_time}/></span></td>
            <td className={styles.time}>{(totalDropTime > 0) ? `${totalDropTime} Seconds` : ''}</td>
        </tr>);
    }

    return (<div>
        <div className="default-header">Flag Caps</div> 
        <table className={styles.table}>
            <tbody>
                <tr>
                    <th>Grabbed</th>
                    <th>Covers</th>
                    <th>Assists</th>
                    <th>Capped</th>
                    <th>Travel Time</th>
                    <th>Time Dropped</th>
                </tr>
                {elems}
            </tbody>
        </table>       
    </div>);
}

export default MatchCTFCaps;