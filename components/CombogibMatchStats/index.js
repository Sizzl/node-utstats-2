import React from "react";
import Image from "next/image";
import Table2 from "../Table2";
import CountryFlag from "../CountryFlag";
import ErrorMessage from "../ErrorMessage";
import Functions from "../../api/functions";
import Link from "next/link";
import styles from "./CombogibMatchStats.module.css";

class CombogibMatchStats extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "data": null, 
            "error": null, 
            "mode": 1, 
            "sortType": "name", 
            "bAscendingOrder": true,
            "bAllPlayers": true
        };

        this.sortGeneral = this.sortGeneral.bind(this);
        this.changeMode = this.changeMode.bind(this);
        this.changeTeamMode = this.changeTeamMode.bind(this);
        
    }

    changeTeamMode(newMode){

        this.setState({"bAllPlayers": newMode});
    }


    changeMode(id){

        this.setState({"mode": id});
    }


    sortGeneral(type){

        let sortType = type.toLowerCase();

        if(sortType === this.state.sortType){

            this.setState({"bAscendingOrder": !this.state.bAscendingOrder});
            return;
        }

        this.setState({"sortType": sortType, "bAscendingOrder": false});
    }

    async loadData(){

        const req = await fetch("/api/combogib",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "match", "matchId": this.props.matchId})
        });

        const res = await req.json();

        if(res.error === undefined){

            this.setState({"data": res.data});
        }else{
            this.setState({"error": res.error});
        }

        this.setState({"bLoaded": true});

    }

    async componentDidMount(){

        await this.loadData();
    }


    sortBasic(){

        const data = JSON.parse(JSON.stringify(this.state.data));

        return data.sort((a, b) =>{

            if(this.state.sortType === "combos"){
                a = a.combo_kills;
                b = b.combo_kills;
            }

            if(this.state.sortType === "balls"){
                a = a.ball_kills;
                b = b.ball_kills;
            }

            if(this.state.sortType === "primary"){
                a = a.primary_kills;
                b = b.primary_kills;
            }

            if(this.state.sortType === "single"){
                a = a.best_single_combo;
                b = b.best_single_combo;
            }

            

            if(this.state.bAscendingOrder){

                if(a < b){
                    return -1;
                }else if(a > b){
                    return 1;
                }

            }else{

                if(a < b){
                    return 1;
                }else if(a > b){
                    return -1;
                }

            }

            return 0;
        });
    }


    getKillsString(kills){

        return (kills === 0) ? "" : `${kills} Kill${(kills === 1) ? "" : "s"}`;

    }

    renderBasicTable(rows, totals, key){

        if(rows.length === 0) return null;

        const bestKill = totals.bestSingle;

        const bestSingle = this.getKillsString(bestKill);

        const totalsRow = <tr className="yellow" key={`totals-${key}`}>
            <td><b>Totals</b></td>
            <td><b>{totals.combos}</b></td>
            <td><b>{totals.balls}</b></td>
            <td><b>{totals.primary}</b></td>
            <td><b>{bestSingle}</b></td>
        </tr>

        return <Table2 key={key} width={4} players={true}>
            <tr>
                <th>Player</th>
                <th className="pointer" onClick={(() =>{
                    this.sortGeneral("combos");
                })}>
                    <Image src="/images/combo.png" alt="image" width={64} height={64}/>
                    <br/>Combo Kills
                </th>
                <th className="pointer" onClick={(() =>{
                    this.sortGeneral("balls");
                })}>
                    <Image src="/images/shockball.png" alt="image" width={64} height={64}/>
                    <br/>Shock Ball Kills
                </th>
                <th className="pointer" onClick={(() =>{
                    this.sortGeneral("primary");
                })}>
                    <Image src="/images/primary.png" alt="image" width={64} height={64}/>
                    <br/>Instagib Kills
                </th>
                <th className="pointer" onClick={(() =>{
                    this.sortGeneral("single");
                })}>
                    <Image src="/images/combo.png" alt="image" width={64} height={64}/>
                    <br/>Best Single Combo
                </th>
            </tr>
            {rows}
            {totalsRow}
        </Table2>
    }

    getPlayer(id){

        let player = this.props.players[id];

        if(player === undefined){
            return {"name": "Not Found", "country": "xx", "team": 255};
        }

        return player;
    }

    renderBasic(){

        if(this.state.mode !== 0) return null;

        const rows = [];

        const data = this.sortBasic();

        const teamData = [[],[],[],[]];

        const teamTotals = [
            {"combos": 0, "balls": 0, "primary": 0, "bestSingle": 0},
            {"combos": 0, "balls": 0, "primary": 0, "bestSingle": 0},
            {"combos": 0, "balls": 0, "primary": 0, "bestSingle": 0},
            {"combos": 0, "balls": 0, "primary": 0, "bestSingle": 0},
        ];

        const allTotals = {"combos": 0, "balls": 0, "primary": 0, "bestSingle": 0};

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const bestKill = d.best_single_combo;

            const bestKillString = this.getKillsString(bestKill);

            let currentPlayer = this.getPlayer(d.player_id);

            const currentElem = <tr key={i}>
                <td className={Functions.getTeamColor(currentPlayer.team)}>
                    <CountryFlag country={currentPlayer.country}/>
                    <Link href={`/pmatch/${this.props.matchId}?player=${d.player_id}`}><a>{currentPlayer.name}</a></Link>
                </td>
                <td>{Functions.ignore0(d.combo_kills)}</td>
                <td>{Functions.ignore0(d.ball_kills)}</td>
                <td>{Functions.ignore0(d.primary_kills)}</td>
                <td>{bestKillString}</td>
            </tr>

            if(this.state.bAllPlayers){

                rows.push(currentElem);

                allTotals.combos += d.combo_kills;
                allTotals.balls += d.ball_kills;
                allTotals.primary += d.primary_kills;

                if(d.best_single_combo > allTotals.bestSingle){
                    allTotals.bestSingle = d.best_single_combo;
                }

            }else{

                teamData[currentPlayer.team].push(currentElem);

                const teamTotal = teamTotals[currentPlayer.team];

                teamTotal.combos += d.combo_kills;            
                teamTotal.balls += d.ball_kills;  
                teamTotal.primary += d.primary_kills;
     
                if(d.best_single_combo > teamTotal.bestSingle){
                    teamTotal.bestSingle = d.best_single_combo;
                }
            }
        }

        if(this.state.bAllPlayers){

            return this.renderBasicTable(rows, allTotals, -1);

        }else{

            const tables = [];

            for(let i = 0; i < teamData.length; i++){

                const teamRows = teamData[i];

                tables.push(this.renderBasicTable(teamRows, teamTotals[i], i));
            }

            return tables;
        }
    }

    getTypeTitles(){

        if(this.state.mode === 1){

            return <tr>
                <th>Player</th>
                <th>Deaths</th>
                <th>Kills</th>
                <th>Efficiency</th>
                <th>Most Kills in 1 Life</th>
                <th>Best Combo</th>
            </tr>

        }else if(this.state.mode !== 0){

            return <tr>
                <th>Player</th>
                <th>Deaths</th>
                <th>Kills</th>
                <th>Efficiency</th>
                <th>Most Kills in 1 Life</th>
            </tr>

        }

        return null;

    }


    getTypeRow(data){

        if(this.state.mode === 0) return null;

        const player = this.getPlayer(data.player_id);


        const playerElem = <td className={Functions.getTeamColor(player.team)}>
            <Link href={`/pmatch/${this.props.matchId}?player=${data.player_id}`}>
                <a>
                    <CountryFlag country={player.country}/>{player.name}
                </a>
            </Link>
        </td>

        if(this.state.mode === 1){

            return <tr key={`${this.state.mode}-${data.player_id}`}>
                {playerElem}
                <td>{Functions.ignore0(data.combo_deaths)}</td>
                <td>{Functions.ignore0(data.combo_kills)}</td>
                <td>{data.combo_efficiency.toFixed(2)}%</td>
                <td>{Functions.ignore0(data.best_combo_kills)}</td>
                <td>{this.getKillsString(data.best_single_combo)}</td>
            </tr>

        }else{

            let kills = (this.state.mode === 2) ? data.ball_kills : data.primary_kills;
            let deaths = (this.state.mode === 2) ? data.ball_deaths : data.primary_deaths;
            let best = (this.state.mode === 2) ? data.best_ball_kills : data.best_primary_kills;

            const eff = (this.state.mode === 2) ? data.ball_efficiency : data.primary_efficiency;

            return <tr key={`${this.state.mode}-${data.player_id}`}>
                {playerElem}
                <td>{Functions.ignore0(deaths)}</td>
                <td>{Functions.ignore0(kills)}</td>
                <td>{eff.toFixed(2)}%</td>
                <td>{best}</td>
            </tr>

        }
    }

    renderTypeStats(){

        if(this.state.mode === 0) return null;
        
        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            rows.push(this.getTypeRow(d));
        }


        let titlesRow = this.getTypeTitles();

        let image = "combo.png";

        if(this.state.mode === 2){
            image = "shockball.png";
        }else if(this.state.mode === 3){
            image = "primary.png";
        }


        return <div>
            <div className={`${styles.imageb} t-width-4 center`}>
                <Image src={`/images/${image}`} alt="image" width={100} height={100}/>
            </div>
            <Table2 width={4} players={true}>
                {titlesRow}
                {rows}
            </Table2>
        </div>
    }

    render(){

        if(this.state.error !== null){

            return <ErrorMessage title="Combogib Stats" text={this.state.error}/>
        }

        if(this.state.data === null) return null;
        
        return <div>
            <div className="default-header">Combogib Stats</div> 
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>General Stats</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Combo Stats</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(2);
                })}>Shock Ball Stats</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(3);
                })}>Instagib Stats</div>
            </div>
            <div className="tabs">
                <div className={`tab ${(this.state.bAllPlayers) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeTeamMode(true);
                })}>All Players</div>
                <div className={`tab ${(!this.state.bAllPlayers) ? "tab-selected" : ""}`}  onClick={(() =>{
                    this.changeTeamMode(false);
                })}>Separate Teams</div>
                
            </div>
            {this.renderBasic()}
            {this.renderTypeStats()}
        </div>
    }
}

export default CombogibMatchStats;