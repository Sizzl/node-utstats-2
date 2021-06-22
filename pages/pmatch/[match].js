import React from "react";
import DefaultHead from "../../components/defaulthead";
import Nav from '../../components/Nav/';
import Footer from "../../components/Footer/";
import Session from '../../api/session';
import Sitesettings from '../../api/sitesettings';
import Match from '../../api/match';
import Gametypes from '../../api/gametypes';
import Servers from '../../api/servers';
import Maps from '../../api/maps';
import MatchSummary from "../../components/MatchSummary";
import Player from "../../api/player";
import Players from "../../api/players";
import Functions from '../../api/functions';
import Screenshot from '../../components/Screenshot/';
import Faces from '../../api/faces';
import MatchFragSummary from "../../components/MatchFragSummary";
import MatchSpecialEvents from "../../components/MatchSpecialEvents";
import MatchSprees from '../../components/MatchSprees';
import Sprees from '../../api/sprees';
import Kills from '../../api/kills';
import PlayerMatchKills from '../../components/PlayerMatchKills';
import PlayerMatchPowerUps from "../../components/PlayerMatchPowerUps";
import Weapons from '../../api/weapons';
import PlayerMatchWeapons from "../../components/PlayerMatchWeapons";
import PlayerMatchPickups from "../../components/PlayerMatchPickups";
import Items from '../../api/items';
import Rankings from '../../api/rankings';
import PlayerMatchRankings from '../../components/PlayerMatchRankings/';
import Pings from '../../api/pings';
import PlayerMatchPing from "../../components/PlayerMatchPing";
import Connections from "../../api/connections";
import PlayerMatchConnections from "../../components/PlayerMatchConnections";

class PlayerMatch extends React.Component{

    constructor(props){

        super(props);

    }

    cleanImageURL(input){

        const reg = /^\/images\/(.+)$/i;

        const result = reg.exec(input);

        if(result !== null){

            return result[1];
        }
        return input;
    }

    render(){

        const info = JSON.parse(this.props.info);
        const playerData = JSON.parse(this.props.playerData);

        let titleName = playerData.name;
        titleName+=(titleName[titleName.length - 1] == "s") ? "'" : "'s";

        const dateString = Functions.convertTimestamp(info.date, true);

        const parsedInfo = JSON.parse(this.props.info);

        const playerMatchData = JSON.parse(this.props.playerMatchData);

        const compactDate = Functions.DDMMYY(info.date, true);

        return <div>
            <DefaultHead 
                host={this.props.host} 
                title={`${titleName} Match Report ${compactDate} ${this.props.map}`} 
                description={`${titleName} match report for ${this.props.map} (${this.props.gametype}${(info.insta) ? " Instagib" : ""}) ${dateString}.`} 
                keywords={`match,report,player,${playerData.name},${this.props.map},${this.props.gametype}`}
                image={this.cleanImageURL(this.props.cleanMapImage)}    
            />
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                        <div className="default-header">{titleName} Match Report</div>
                        <MatchSummary 
                            info={this.props.info} 
                            server={this.props.server} 
                            gametype={this.props.gametype}
                            map={this.props.map} 
                            image={this.props.mapImage}
                        />

                        <Screenshot 
                            map={this.props.map} 
                            totalTeams={parsedInfo.total_teams} 
                            players={this.props.players} 
                            image={this.props.mapImage} 
                            matchData={this.props.info} 
                            serverName={this.props.server} 
                            gametype={this.props.gametype} 
                            faces={this.props.faces}
                            highlight={playerData.name}
                        />

                        <MatchFragSummary 
                            playerData={[playerMatchData]} 
                            totalTeams={parsedInfo.total_teams}
                            matchStart={parsedInfo.start}
                            single={true}
                        />

                        <MatchSpecialEvents bTeamGame={parsedInfo.team_game} players={[playerMatchData]} single={true}/>

                        <MatchSprees data={JSON.parse(this.props.sprees)} players={JSON.parse(this.props.playerNames)} matchStart={parsedInfo.start}/>

                        <PlayerMatchKills
                            data={JSON.parse(this.props.killsData)} 
                            player={playerData}
                            players={JSON.parse(this.props.playerNames)}
                        />

                        <PlayerMatchPowerUps 
                            belt={playerMatchData.shield_belt} 
                            amp={playerMatchData.amp}
                            ampTime={playerMatchData.amp_time}
                            invisibility={playerMatchData.invisibility}
                            invisibilityTime={playerMatchData.invisibility_time}
                            pads={playerMatchData.pads}
                            armor={playerMatchData.armor}
                            boots={playerMatchData.boots}
                            superHealth={playerMatchData.super_health}
                        />

                        <PlayerMatchWeapons 
                            data={JSON.parse(this.props.playerWeaponData)}
                            names={JSON.parse(this.props.weaponNames)}
                        />
                      
                        <PlayerMatchPickups 
                            data={JSON.parse(this.props.pickupData)}
                            names={JSON.parse(this.props.pickupNames)}
                        />

                        <PlayerMatchRankings data={JSON.parse(this.props.rankingData)}
                            current={JSON.parse(this.props.rankingData)} 
                            currentPosition={this.props.currentRankingPosition}
                        />

                        <PlayerMatchPing data={JSON.parse(this.props.pingData)}/>

                        <div className="default-header">Team Information</div>

                        <PlayerMatchConnections data={JSON.parse(this.props.connectionsData)} matchStart={parsedInfo.start}/>
                    </div>
                </div>
                <Footer session={this.props.session}/>
            </main>
        </div>
    }
}

export async function getServerSideProps({req, query}){


    let matchId = -1;
    let playerId = -1;

    if(query.match !== undefined){

        matchId = parseInt(query.match);

        if(matchId !== matchId) matchId = -1;
    }

    if(query.player !== undefined){

        playerId = parseInt(query.player);

        if(playerId !== playerId) playerId = -1;
    }
    

    const session = new Session(req);

    await session.load();

    const settings = new Sitesettings();

    const navSettings = await settings.getCategorySettings("Navigation");

    const matchManager = new Match();

    const info = await matchManager.get(matchId);

    const gametypeManager = new Gametypes();
    const gametypeName = await gametypeManager.getName(info.gametype);
    const serverManager = new Servers();
    const serverName = await serverManager.getName(info.server);
    const mapManager = new Maps();
    const mapName = await mapManager.getName(info.map);

    const playerManager = new Player();
    const playersManager = new Players();

    const players = await playerManager.getAllInMatch(matchId);
    

    const playerFaceIds = [];
    const playerIds = [];
    
    let p = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        

        if(playerFaceIds.indexOf(p.face) === -1){
            playerFaceIds.push(p.face);
        }

        if(playerIds.indexOf(p.player_id) === -1){
            playerIds.push(p.player_id);
        }
    }


    const playerNames = await playersManager.getNamesByIds(playerIds);

    const playerNamesObject = {};


    let currentName = "";

    const getPlayerName = (id) =>{

        let p = 0;

        for(let i = 0; i < playerNames.length; i++){

            p = playerNames[i];

            if(p.id === id){
                return p.name;
            }
        }

        return "Not Found";
    }

    for(let i = 0; i < players.length; i++){

        p = players[i];

        currentName = getPlayerName(p.player_id);

        if(currentName === undefined){
            currentName = "Not Found";
        }

        p.name = currentName;
    }
    

    const playerData = await playerManager.getPlayerById(playerId);
    const playerMatchData = await playerManager.getMatchData(playerId, matchId);

    playerMatchData.name = playerData.name;

    const playerGametypeData = await playerManager.getGametypeTotals(playerId, info.gametype);

    const mapImage = await mapManager.getImage(mapName);
    const cleanMapImage = Functions.removeExtension(mapImage);
    
    const faceManager = new Faces();
    const playerFaces = await faceManager.getFacesWithFileStatuses(playerFaceIds);


    const spreeManager = new Sprees();

    const spreeData = await spreeManager.getPlayerMatchData(matchId, playerId);

    const killManager = new Kills();

    const killsData = await killManager.getMatchKillsIncludingPlayer(matchId, playerId);

    const weaponManager = new Weapons();

    const playerWeaponData = await weaponManager.getPlayerMatchData(playerId, matchId);

    const weaponIds = [];

    for(let i = 0; i < playerWeaponData.length; i++){

        if(weaponIds.indexOf(playerWeaponData[i].weapon_id) === -1){
            weaponIds.push(playerWeaponData[i].weapon_id);
        }
    }

    const weaponNames = await weaponManager.getNamesByIds(weaponIds);

    const itemsManager = new Items();

    const pickupData = await itemsManager.getPlayerMatchData(matchId, playerId);

    const itemIds = [];

    for(let i = 0; i < pickupData.length; i++){

        if(itemIds.indexOf(pickupData[i].item) === -1){

            itemIds.push(pickupData[i].item);
        }
    }

    const pickupNames = await itemsManager.getNamesByIds(itemIds);

    
    const rankingManager = new Rankings();

    const matchRankingData = await rankingManager.getPlayerMatchHistory(playerId, matchId);

    const currentRankingData = await rankingManager.getCurrentPlayerRanking(playerId, info.gametype);

    let currentGametypePosition = 0;

    if(currentRankingData.length > 0){
        currentGametypePosition = await rankingManager.getGametypePosition(currentRankingData[0].ranking, info.gametype);
    }

    const pingManager = new Pings();

    const pingData = await pingManager.getPlayerMatchData(matchId, playerId);

    const connectionManager = new Connections();

    const connectionsData = await connectionManager.getPlayerMatchData(matchId, playerId);


    console.log(connectionsData);

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "info": JSON.stringify(info),
            "server": serverName,
            "gametype": gametypeName,
            "map": mapName,
            "playerNames": JSON.stringify(playerNames),
            "playerData": JSON.stringify(playerData),
            "playerMatchData": JSON.stringify(playerMatchData),
            "playerGametypeData": JSON.stringify(playerGametypeData),
            "mapImage": mapImage,
            "cleanMapImage": cleanMapImage,
            "players": JSON.stringify(players),
            "faces": JSON.stringify(playerFaces),
            "sprees": JSON.stringify(spreeData),
            "killsData": JSON.stringify(killsData),
            "playerWeaponData": JSON.stringify(playerWeaponData),
            "weaponNames": JSON.stringify(weaponNames),
            "pickupData": JSON.stringify(pickupData),
            "pickupNames": JSON.stringify(pickupNames),
            "rankingData": JSON.stringify(matchRankingData),
            "currentRankingData": JSON.stringify(currentRankingData),
            "currentRankingPosition": currentGametypePosition,
            "pingData": JSON.stringify(pingData),
            "connectionsData": JSON.stringify(connectionsData)
        }
    }
}

export default PlayerMatch;