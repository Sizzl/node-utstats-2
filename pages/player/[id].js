import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/';
import Footer from '../../components/Footer/';
import PlayerSummary from '../../components/PlayerSummary/';
import Player from '../../api/player';
import Link from 'next/link';
import Countires from '../../api/countries';
import Gametypes from '../../api/gametypes';
import Maps from '../../api/maps';
import PlayerRecentMatches from '../../components/PlayerRecentMatches/';
import Matches from '../../api/matches';
import Weapons from '../../api/weapons';
import PlayerWeapons from '../../components/PlayerWeapons/';
import Functions from '../../api/functions';
import Servers from '../../api/servers';
import Faces from '../../api/faces';
import WinRate from '../../api/winrate';



function Home({playerId, summary, gametypeStats, gametypeNames, recentMatches, matchScores, totalMatches, 
	matchPages, matchPage, matchesPerPage, weaponStats, weaponNames, weaponImages, mapImages, serverNames, 
	face, latestWinRate, winRateHistory}) {

	//console.log(`servers`);
	if(summary === undefined){

		return (<div>
					<DefaultHead />
			
					<main>
						<Nav />
						<div id="content">
						<div className="default">
							<div className="default-header">
								There is no player with that id.
							</div>
						</div>
						</div>
						<Footer />
					</main>   
			</div>);
	}

	summary = JSON.parse(summary);
	
		const flag = summary.country;

		const name = summary.name;
		summary = JSON.stringify(summary);

		const country = Countires(flag);

		let titleName = name;

		if(titleName[titleName.length - 1].toLowerCase() !== 's'){
			titleName = `${name}'s`;
		}else{
			titleName = `${name}'`;
		}

		// /<img className="title-flag" src={`../images/flags/${country.code.toLowerCase()}.svg`} alt="flag"/>

		return (
				<div>
					<DefaultHead />
					<main>
						<Nav />
						<div id="content">
							<div className="default">
								<div className="default-header">
									 {titleName} Career Profile
								</div>


								<PlayerSummary summary={summary} flag={country.code.toLowerCase()} country={country.country} gametypeStats={gametypeStats}
									gametypeNames={gametypeNames} face={face} latestWinRate={latestWinRate} winRateHistory={winRateHistory}
								/>

								<PlayerWeapons weaponStats={weaponStats} weaponNames={weaponNames} weaponImages={weaponImages} />

								<PlayerRecentMatches playerId={playerId} matches={recentMatches} scores={matchScores} gametypes={gametypeNames} 
								totalMatches={totalMatches} matchPages={matchPages} currentMatchPage={matchPage} matchesPerPage={matchesPerPage} mapImages={mapImages}
								serverNames={serverNames}
								/>

							</div>
						</div>
						<Footer />
					</main>   
				</div>
	)
}


function createWinRateData(results, gametypeNames){

	const data = [];
	const titles = [];
	const text = [];

	let r = 0;
	let currentTitle = "";




	for(let i = 0; i < results.length; i++){

		r = results[i];

		

		if(r.length === 0) continue;

		//if(r.gametypeName === "Not Found") continue;

		currentTitle = (gametypeNames[r[0].gametype] !== undefined) ? gametypeNames[r[0].gametype] : "Not Found";

		titles.push(currentTitle);

		data.push({
			"name": currentTitle,
			"data": []
		});

		text.push([]);

		r.sort((a, b) =>{

			a = a.matches;
			b = b.matches;

			if(a < b){
				return -1;
			}else if(a > b){
				return 1;
			}

			return 0;
		});

		for(let x = 0; x < r.length; x++){
			
			data[data.length - 1].data.push(parseFloat(r[x].winrate.toFixed(2)));
			text[text.length - 1].push(`Wins ${r[x].wins} Draws ${r[x].draws} Losses ${r[x].losses} `);
		}
		
	}

	const fixedData = [];

	for(let i = 0; i < data.length; i++){

		fixedData.push([data[i]]);
	}


	return {"data": fixedData, "titles": titles, "text": text};


}

export async function getServerSideProps({query}) {

	const matchesPerPage = 25;
		
	const playerManager = new Player();
	const gametypes = new Gametypes();
	const maps = new Maps();
	const matchManager = new Matches();
	const weaponsManager = new Weapons();
	const serverManager = new Servers();

	if(query.id === undefined) query.id = 0;

	const playerId = query.id;
		
	let summary = await playerManager.getPlayerById(playerId);
	
	if(summary === undefined){
		return {
			props: {}
		};
	}

	let gametypeStats = await playerManager.getPlayerGametypeWinStats(summary.name);
	
	const totalMatches = await playerManager.getTotalMatches(playerId);

	const gametypeIds = Functions.getUniqueValues(gametypeStats, 'gametype');

	let gametypeNames = await gametypes.getNames(gametypeIds);


	const matchPage = (query.matchpage !== undefined) ? (parseInt(query.matchpage) === parseInt(query.matchpage) ? query.matchpage : 1) : 1;
	let recentMatches = await playerManager.getRecentMatches(query.id, matchesPerPage, matchPage);
	
	const matchPages = Math.ceil(totalMatches / matchesPerPage);

	const uniqueMaps = Functions.getUniqueValues(recentMatches, 'map_id');
	const matchIds = Functions.getUniqueValues(recentMatches, 'match_id');

	let mapData = await maps.getNames(uniqueMaps);
	let matchScores = await matchManager.getWinners(matchIds);
	let matchPlayerCount = await matchManager.getPlayerCount(matchIds);
	let weaponStats = await weaponsManager.getPlayerTotals(playerId);
	let weaponNames = await weaponsManager.getAllNames();
	let weaponImages = await weaponsManager.getImageList();


	const justMapNames = [];

	for(const [key, value] of Object.entries(mapData)){
		justMapNames.push(value);
	}

	let mapImages = await maps.getImages(justMapNames);

	Functions.setIdNames(recentMatches, mapData, 'map_id', 'mapName');

	const serverNames = await serverManager.getAllNames();

	const serverIds = await matchManager.getServerNames(matchIds);

	Functions.setIdNames(recentMatches, serverIds, 'match_id', 'server');
	Functions.setIdNames(recentMatches, matchPlayerCount, 'match_id', 'players');


	const faceManager = new Faces();

	//console.log(await faceManager.getFacesWithFileStatuses([summary.face]));

	let currentFace = await faceManager.getFacesWithFileStatuses([summary.face]);

	//console.log(currentFace);

	//console.log(currentFace);

	const winRateManager = new WinRate();
	let latestWinRate = await winRateManager.getPlayerLatest(playerId);
	Functions.setIdNames(latestWinRate, gametypeNames, 'gametype', 'gametypeName');

	gametypeIds.unshift(0);
	let winRateHistory = await winRateManager.getPlayerWinrateHistory(playerId, gametypeIds, 50);
	//Functions.setIdNames(winRateHistory, gametypeNames, 'gametype', 'gametypeName');

	
	winRateHistory = createWinRateData(winRateHistory, gametypeNames);

	//console.log(winRateHistory);

	return { 
		props: {
			"playerId": playerId,
			"summary": JSON.stringify(summary),
			"gametypeStats": JSON.stringify(gametypeStats),
			"gametypeNames": JSON.stringify(gametypeNames),
			"recentMatches": JSON.stringify(recentMatches),
			"matchScores": JSON.stringify(matchScores),
			"totalMatches": totalMatches,
			"matchPages": matchPages,
			"matchPage": matchPage,
			"matchesPerPage": matchesPerPage,
			"weaponStats": JSON.stringify(weaponStats),
			"weaponNames": JSON.stringify(weaponNames),
			"weaponImages": JSON.stringify(weaponImages),
			"mapImages": JSON.stringify(mapImages),
			"serverNames": JSON.stringify(serverNames),
			"face": currentFace[summary.face].name,
			"latestWinRate": JSON.stringify(latestWinRate),
			"winRateHistory": JSON.stringify(winRateHistory)
			
		}
	}
}

export default Home;

