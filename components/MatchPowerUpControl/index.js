import React from 'react';
import styles from './MatchPowerUpControl.module.css';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import Functions from '../../api/functions';


class MatchPowerUpControl extends React.Component{

    constructor(props){

        super(props);

        this.itemTitles = {
            "amp": "UDamage",
            "armor": "Body Armor",
            "pads": "Thigh Pads",
            "boots": "Jump Boots",
            "shield_belt": "Shield Belt",
            "invisibility": "Invisibility",
            "super_health": "Super Health",
        };
    }


    getTotal(item, team, bPlayer){

        let total = 0;

        let p = 0;

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];
            
            if(team !== undefined){

                if(bPlayer === undefined){

                    if(p.team === team){
                        if(p[item] !== undefined) total += p[item];
                    }

                }else{

                    if(p.player_id === team){
                        if(p[item] !== undefined) return p[item]; 
                    }
                }

            }else{

                if(p[item] !== undefined) total += p[item];
            }
        }

        return total;
    }

    getTeamTopPlaytimePlayer(team){

        let p = 0;

        let players  = this.props.players;

        players.sort((a, b) =>{

            a = a.playtime;
            b = b.playtime;

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }

            return 0;
        });

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];

            if(p.team === team) return {"name": p.name, "id": p.player_id, "country": p.country}
        }

        return {"name": "Not Found", "id": -1, "country": "xx"};
    }

    getName(team){

        if(this.props.players.length === 2){
            // /<CountryFlag country={"gb"}/>Ooper

            let player = this.getTeamTopPlaytimePlayer(team);

            return <Link href={`/player/${player.id}`}><a><CountryFlag host={this.props.host} country={player.country} />{player.name}</a></Link>

        }else{

            if(team === 0) return "Red Team";
            if(team === 1) return "Blue Team";
            if(team === 2) return "Green Team";
            if(team === 3) return "Yellow Team";
        }
    }

    displayItemDuel(item){

        let title = "Unknown";

        let timeElems = null;
        let totalPickups = 0;  
   
        let totalTeams = this.props.totalTeams;

        const values = {
            "red": 0,
            "blue": 0
        };

        const percentValues = {
            "red": 0,
            "blue": 0
        };

        totalPickups = this.getTotal(item)

        if(totalPickups === 0) return null;

        values.red = this.getTotal(item, 0);
        values.blue = this.getTotal(item, 1);
        

        if(item === "amp"){

            timeElems = <div className={styles.pcontroltop}>
                <div>{this.getTotal("amp_time", 0).toFixed(2)} seconds</div>
                <div>{this.getTotal("amp_time", 1).toFixed(2)} seconds</div>
            </div>

        }else if(item === "invisibility"){

            timeElems = <div className={styles.pcontroltop}>
                <div>{this.getTotal("invisibility_time", 0).toFixed(2)} seconds</div>
                <div>{this.getTotal("invisibility_time", 1).toFixed(2)} seconds</div>
            </div>

        }

        title = this.itemTitles[item];

        if(title === undefined) title = "Not Found";
        

        for(let [key, value] of Object.entries(percentValues)){

            if(totalPickups != 0 && values[key] != 0){
                value = values[key] / totalPickups;
            }

            value *= 100;
            percentValues[key] = value;
        }

        if(totalPickups === 0){

            for(let [key, value] of Object.entries(percentValues)){

                value = 100 / totalTeams;
                percentValues[key] = value;
            }
        }


        return <div className={styles.iwrapper}>

            <div className={styles.iname}>{title}</div>
            {timeElems}
            <div className={styles.pcontrol}>
                <div className={styles.name1}>
                    {this.getName(0)}
                </div>
                <div className={styles.bar}>
                    <div style={{"width": `${percentValues.red}%`}} className={`${styles.player1} team-red`}>
                       {values.red}
                    </div>
                    <div style={{"width": `${percentValues.blue}%`}} className={`${styles.player2} team-blue`}>
                        {values.blue}
                    </div>
                </div>
                <div className={styles.name2}>
                    {this.getName(1)}
                </div>
            </div>
        </div>
    }

    //for 1v1s or 2 team games
    displayDuel(){

        
        if(this.props.totalTeams !== 2){
            return null;
        }

        const ampElems = this.displayDefaultItem("amp");
        const invisElems = this.displayDefaultItem("invisibility");
        const sbElems = this.displayDefaultItem("shield_belt");
        const shElems = this.displayDefaultItem("super_health");
        const armorElems = this.displayDefaultItem("armor");
        const padElems = this.displayDefaultItem("pads");
        const bootElems = this.displayDefaultItem("boots");

        const results = [
            ampElems,
            invisElems,
            sbElems,
            shElems,
            armorElems,
            padElems,
            bootElems,
        ];

        let bAnyData = false;

        for(let i = 0; i < results.length; i++){

            if(results[i] !== null){
                bAnyData = true;
                break;
            }
        }

        if(!bAnyData) return null;
        

        return <div>
            {ampElems}
            {invisElems}
            {sbElems}
            {shElems}
            {armorElems}
            {padElems}
            {bootElems}
        </div>;
    }


    getMostUsed(item){

        const players = this.props.players;

        players.sort((a, b) =>{

            a = a[item];
            b = b[item];

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }

            return 0;
        });

        const max = (players.length > 4) ? 4 : players.length;


        const found = [];

        let p = 0;

        for(let i = 0; i < max; i++){

            p = players[i];

            found.push({
                "name": p.name,
                "id": p.player_id,
                "uses": p[item],
                "country": p.country
            });
        }

        return found;

    }

    displayDefaultItem(item){

        const totalUses = this.getTotal(item);

        if(totalUses === 0) return null;
        
        let title = this.itemTitles[item];

        if(title === undefined) title = "Not Found";

        const totalElems = [];
        const timeElems = [];
        const nameElems = [];

        let type = "solo";

        if(this.props.totalTeams >= 2){

            for(let i = 0; i < this.props.totalTeams; i++){

                totalElems.push(<div key={i} className={Functions.getTeamColor(i)}>
                    {this.getTotal(item, i)}
                </div>);

                if(item === "amp" || item === "invisibility"){
                    timeElems.push(<div key={i} className={styles.dtime}>{this.getTotal(`${item}_time`, i)} Seconds</div>);
                }
            }

            switch(this.props.totalTeams){
                case 2: { type = "duo"; } break;
                case 3: { type = "trio"; } break;
                case 4: { type = "quad"; } break;
                default: { type = "solo"; } break;
            }

        }else{

            const mostUsed = this.getMostUsed(item);


            for(let i = 0; i < mostUsed.length; i++){

                nameElems.push(<div key={i} className={Functions.getTeamColor(i)}>
                    <Link href={`/player/${mostUsed[i].id}`}><a><CountryFlag host={this.props.host} country={mostUsed[i].country}/>{mostUsed[i].name}</a></Link>
                </div>);

                totalElems.push(<div key={i}>
                    {mostUsed[i].uses}
                </div>);

                if(item === "amp" || item === "invisibility"){
                    timeElems.push(<div key={i} className={styles.dtime}>{this.getTotal(`${item}_time`, mostUsed[i].id, true)} Seconds</div>);
                }
            }

            switch(mostUsed.length){
                case 1: { type = "solo"; } break;
                case 2: { type = "duo"; } break;
                case 3: { type = "trio"; } break;
                case 4: { type = "quad"; } break;
                default: { type = "quad"; } break;
            }
        
        }


        return <div className={styles.default}>
            <div className={styles.defaulttitle}>{title}</div>
            <div className={`${styles[type]} black`}>{nameElems}</div>
            <div className={styles[type]}>{timeElems}</div>
            <div className={`${styles.boxwrapper} ${type}`}>
                {totalElems}
            </div>
        </div>
    }
    

    displayDefault(){

        if(this.props.players.length > 2 && this.props.totalTeams !== 2){

            const ampElems = this.displayDefaultItem("amp");
            const invisElems = this.displayDefaultItem("invisibility");
            const sbElems = this.displayDefaultItem("shield_belt");
            const shElems = this.displayDefaultItem("super_health");
            const armorElems = this.displayDefaultItem("armor");
            const padElems = this.displayDefaultItem("pads");
            const bootElems = this.displayDefaultItem("boots");

            const results = [
                ampElems,
                invisElems,
                sbElems,
                shElems,
                armorElems,
                padElems,
                bootElems,
            ];

            let bAnyData = false;

            for(let i = 0; i < results.length; i++){

                if(results[i] !== null){
                    bAnyData = true;
                    break;
                }
            }

            if(!bAnyData) return null;

            return <div>
                {ampElems}
                {invisElems}
                {sbElems}
                {shElems}
                {armorElems}
                {padElems}
                {bootElems}
            </div>
        }

        return null;
    }

    render(){

        const duelElems = this.displayDuel();
        const defaultElems = this.displayDefault();

        console.log(duelElems);
        console.log(defaultElems);

        if(defaultElems === null && duelElems === null) return null;

        return <div>
            <div className="default-header">
                Power Up Control
            </div>

            {duelElems}
            {defaultElems}
        </div>
    }
}


export default MatchPowerUpControl;