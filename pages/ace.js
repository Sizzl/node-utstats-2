import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import React from 'react';
import Session from '../api/session';
import SiteSettings from '../api/sitesettings';
import Link from 'next/link';
import AccessDenied from '../components/AccessDenied';
import ACE from '../api/ace';
import ACEHome from '../components/ACEHome';
import ACEPlayers from '../components/ACEPlayers';
import ACEPlayerReport from '../components/ACEPlayerReport';


const ACEPage = ({error, session, host, navSettings, mode, recentKicks, recentPlayers, playerName}) =>{

    if(error !== undefined){
        return <AccessDenied host={host} session={session} navSettings={navSettings}/>
    }

    recentKicks = JSON.parse(recentKicks);
    recentPlayers = JSON.parse(recentPlayers);

    let elems = [];


    if(mode === ""){
        elems = <ACEHome recentKicks={recentKicks} recentPlayers={recentPlayers}/>
    }else if(mode === "players"){
        elems = <ACEPlayers />
    }else if(mode === "player"){
        elems = <ACEPlayerReport name={playerName}/>
    }

    return <div>
            <DefaultHead host={host} title={`ACE`}  
            description={``} 
            keywords={``}/>
            <main>
            <Nav settings={navSettings} session={session}/>
            <div id="content">
                <div className="default">
                    <div className="default-header">
                        ACE Manager
                    </div>
                    <div className="big-tabs">
                        <Link href="/ace">
                            <a>
                                <div className={`tab ${(mode === "") ? "tab-selected" : null}`}>Recent Events</div>
                            </a>
                        </Link>
                        <Link href="/ace?mode=players">
                            <a>
                                <div className={`tab ${(mode === "players") ? "tab-selected" : null}`}>Player Search</div>
                            </a>
                        </Link>
                        <Link href="/ace?mode=player">
                            <a>
                                <div className={`tab ${(mode === "player") ? "tab-selected" : null}`}>Player Report</div>
                            </a>
                        </Link>
                        <Link href="/ace?mode=kicks">
                            <a>
                                <div className={`tab ${(mode === "kicks") ? "tab-selected" : null}`}>Kick Logs</div>
                            </a>
                        </Link>
                    </div>

                    {elems}
                </div>
            </div>
            <Footer session={session}/>
            </main>   
        </div>
}

export async function getServerSideProps({req, query}){

    const session = new Session(req);

	await session.load();

    const settings = new SiteSettings();

    const navSettings = await settings.getCategorySettings("Navigation");

    const mode = (query.mode !== undefined) ? query.mode.toLowerCase() : "";

    let playerName = (query.name !== undefined) ? query.name : "";

    if(!await session.bUserAdmin()){
       
        return {
            props: {
                "error": "",
                "host": req.headers.host,
                "session": JSON.stringify(session.settings),
                "navSettings": JSON.stringify(navSettings),
            }
        };
    }

    const aceManager = new ACE();

    const recentKicks = await aceManager.getHomeRecentKicks();
    const recentPlayers = await aceManager.getHomeRecentPlayers();

    console.log(`name = ${playerName}`);

    return {
        props: {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "mode": mode,
            "recentKicks": JSON.stringify(recentKicks),
            "recentPlayers": JSON.stringify(recentPlayers),
            "playerName": playerName
        }
    };
}


export default ACEPage;