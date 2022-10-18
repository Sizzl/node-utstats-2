import React from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import Table2 from "../Table2";
import TableHeader from "../TableHeader";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";

class CombogibMapTotals extends React.Component{

    constructor(props){

        super(props);

        this.state = {"loaded": false, "error": null, "data": null};
    }

    async loadData(){

        const req = await fetch("/api/combogib", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "maptotal", "mapId": this.props.mapId})
        });

        const res = await req.json();

        if(res.error !== undefined){

            this.setState({"error": res.error});
        }else{
            this.setState({"data": res.data, "players": res.players});
        }


        this.setState({"loaded": true});
    }

    async componentDidMount(){

        await this.loadData();
    }

    renderTotals(){

        const d = this.state.data;

        return <div>
            <TableHeader width={1}>General Summary</TableHeader>
            <Table2 width={1}>
                <tr>
                    <th>Total Matches</th>
                    <th>Total Playtime</th>
                    <th>Combo Kills</th>
                    <th>Insane Combo Kills</th>
                    <th>Shock Ball Kills</th>
                    <th>Instagib Kills</th>
                </tr>
                <tr>
                    <td>{d.matches}</td>
                    <td>{Functions.toHours(d.playtime)} Hours</td>
                    <td>{Functions.ignore0(d.combo_kills)}</td>
                    <td>{Functions.ignore0(d.insane_kills)}</td>
                    <td>{Functions.ignore0(d.ball_kills)}</td>
                    <td>{Functions.ignore0(d.primary_kills)}</td>
                </tr>
            </Table2>
        </div>
    }

    renderRecords(){

        const d = this.state.data;

        const comboKillsPlayer = Functions.getPlayer(this.state.players, d.best_combo_kills_player_id, true);
        const insaneKillsPlayer = Functions.getPlayer(this.state.players, d.best_insane_kills_player_id, true);
        const ballKillsPlayer = Functions.getPlayer(this.state.players, d.best_ball_kills_player_id, true);
        const primaryKillsPlayer = Functions.getPlayer(this.state.players, d.best_primary_kills_player_id, true);

        return <div>
            <TableHeader width={1}>Kill Type Spree Records</TableHeader>
            <Table2 width={1}>
                <tr>
                    <th>Most Combo Kills</th>
                    <th>Most Insane Combo Kills</th>
                    <th>Most ShockBall Kills</th>
                    <th>Most Instagib Kills</th>
                </tr>
                <tr>
                    <td>
                        {Functions.ignore0(d.best_combo_kills)}&nbsp;
                        <span className="small-font grey">
                            <i>
                                Kills By&nbsp;
                                <Link href={`/pmatch/${d.best_combo_kills_match_id}/?player=${d.best_combo_kills_player_id}`}>
                                    <a>
                                        <CountryFlag small={true} country={comboKillsPlayer.country}/>{comboKillsPlayer.name}
                                    </a>
                                </Link>
                            </i>
                        </span>
                    </td>
                    <td>
                        {Functions.ignore0(d.best_insane_kills)}&nbsp;
                        <span className="small-font grey">
                            <i>
                                Kills By&nbsp;
                                <Link href={`/pmatch/${d.best_insane_kills_match_id}/?player=${d.best_insane_kills_player_id}`}>
                                    <a>
                                        <CountryFlag small={true} country={insaneKillsPlayer.country}/>{insaneKillsPlayer.name}
                                    </a>
                                </Link>
                            </i>
                        </span>
                    </td>
                    <td>
                        {Functions.ignore0(d.best_ball_kills)}&nbsp;
                        <span className="small-font grey">
                            <i>
                                Kills By&nbsp;
                                <Link href={`/pmatch/${d.best_ball_kills_match_id}/?player=${d.best_ball_kills_player_id}`}>
                                    <a>
                                        <CountryFlag small={true} country={ballKillsPlayer.country}/>{ballKillsPlayer.name}
                                    </a>
                                </Link>
                            </i>
                        </span>
                    </td>
                    <td>
                        {Functions.ignore0(d.best_primary_kills)}&nbsp;
                        <span className="small-font grey">
                            <i>
                                Kills By&nbsp;
                                <Link href={`/pmatch/${d.best_primary_kills_match_id}/?player=${d.best_primary_kills_player_id}`}>
                                    <a>
                                        <CountryFlag small={true} country={primaryKillsPlayer.country}/>{primaryKillsPlayer.name}
                                    </a>
                                </Link>
                            </i>
                        </span>
                    </td>
                   
                </tr>
            </Table2>
        </div>
    }

    render(){

        if(!this.state.loaded) return <Loading/>;

        if(this.state.error !== null){

            if(this.state.error !== "none"){
                return <ErrorMessage title="CombogibMapTotals" text={this.state.error}/>;
            }

            return null;
        }

        return <div>
            <div className="default-header">Combogib Map Totals</div>
            {this.renderTotals()}
            {this.renderRecords()}
        </div>
    }
}

export default CombogibMapTotals;