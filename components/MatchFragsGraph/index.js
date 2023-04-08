import React from 'react';
import Graph from '../Graph';

class MatchFragsGraph extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "kills": [], 
            "deaths": [], 
            "suicides": [], 
            "finishedLoading": false, 
            "teamsKills": [], 
            "teamsDeaths": [],
            "teamsSuicides": [],
            "teammateKills": [],
            "data": null
        };
    }

    async loadKills(){

        try{

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "kills", "matchId": this.props.matchId, "players": this.props.players, "teams": this.props.teams})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"data": res.data});
             //   this.convertKillData(res.data);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadKills();
        this.setState({"finishedLoading": true});
    }

    render(){

        if(!this.state.finishedLoading) return null;

        if(this.state.data === null) return null;

        const graphTitles = ["Kills", "Deaths", "Suicides", "TeamKills", "Efficiency"];

        const graphData = [
            this.state.data.kills, 
            this.state.data.deaths, 
            this.state.data.suicides, 
            this.state.data.teammateKills, 
            this.state.data.efficiency
        ];

        if(this.props.teams > 1){

            const teamsTitles = ["Team Total Kills", "Team Total Deaths", "Team Total Suicides", "Team Total TeamKills", "Team Efficiency"];
            const teamsData = [
                this.state.data.teamKills, 
                this.state.data.teamDeaths, 
                this.state.data.teamSuicides, 
                this.state.data.teamsTeammateKills,
                this.state.data.teamEfficiency
            ];

        

            graphTitles.push(...teamsTitles);
            graphData.push(...teamsData);

        }

        return <div>
            <div className="default-header">Frags Graph</div>
            <Graph 
                title={graphTitles} 
                data={JSON.stringify(graphData)}
            />
        </div>
    }
}

export default MatchFragsGraph;