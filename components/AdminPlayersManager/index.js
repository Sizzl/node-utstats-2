import React from 'react';
import Loading from '../Loading';
import AdminPlayerRename from '../AdminPlayerRename';
import AdminDeletePlayer from '../AdminDeletePlayer';
import BasicUIBox from '../BasicUIBox';
import AdminPlayerMerge from '../AdminPlayerMerge';
import AdminPlayerSearch from '../AdminPlayerSearch';
//import AdminPlayerHWIDMerge from '../AdminPlayerHWIDMerge';

class AdminPlayersManager extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "mode": 3, 
            "players": [], 
            "names": [],
            "bFinishedLoadingGeneral": false, 
            "general": null, 
            "generalError": null
        };

        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){
        this.setState({"mode": id});
    }

    async loadGeneral(){

        try{

            this.setState({"generalError": null, "bFinishedLoadingGeneral": false});

            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "general"})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"bFinishedLoadingGeneral": true, "general": res});
            }


        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        //await this.loadNames();
        await this.loadGeneral();
    }

    renderGeneral(){

        if(this.state.mode !== 0) return null;

        let elems = null;

        if(this.state.bFinishedLoadingGeneral ){

            elems = <div>
                <BasicUIBox title="IP addresses" value={this.state.general.uniqueIps} image={`/images/bar-chart.png`} />
                <BasicUIBox title="Total Players" value={this.state.general.totalPlayers.allTime} image={`/images/bar-chart.png`} />
                <BasicUIBox title="Players Last 24 Hours" value={this.state.general.totalPlayers.past24Hours} image={`/images/bar-chart.png`} />
                <BasicUIBox title="Players Last 7 Days" value={this.state.general.totalPlayers.pastWeek} image={`/images/bar-chart.png`} />
                <BasicUIBox title="Players Last 28 Days" value={this.state.general.totalPlayers.pastMonth} image={`/images/bar-chart.png`} />
            </div>
        }else{

            elems = <Loading />;
        }

        return <div>
            <div className="default-header">General Summary</div>
            {elems}
        </div>
    }

    renderRename(){

        if(this.state.mode !== 2) return null;

        return <AdminPlayerRename />;
    }

    renderDelete(){

        if(this.state.mode !== 4) return null;

        return <AdminDeletePlayer />;
    }

    renderMerge(){

        if(this.state.mode !== 3) return null;

        return <AdminPlayerMerge />;
    }

    renderSearch(){

        if(this.state.mode !== 1) return null;

        return <AdminPlayerSearch />;
    }

    renderHWIDMerge(){

        return null;
        /*
        if(this.state.mode !== 5) return null;

        return <AdminPlayerHWIDMerge />;*/
    }

    render(){

        return <div>
            <div className="default-header">Player Manager</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);  
                })}>General Summary</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);  
                })}>Search</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(2);  
                })}>Rename Player</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(3);  
                })}>Merge Players<span className="yellow">(By Name)</span></div>
                <div className={`tab ${(this.state.mode === 4) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(4);  
                })}>Delete Player</div>
            </div>
            {this.renderGeneral()}
            {this.renderSearch()}
            {this.renderRename()}
            {this.renderMerge()}
            {this.renderDelete()}
        </div>
    }
}

export default AdminPlayersManager;