import MatchCTFSummaryDefault from '../MatchCTFSummaryDefault/';
import MatchCTFSummaryCovers from '../MatchCTFSummaryCovers/';
import MatchCTFSummarySeals from '../MatchCTFSummarySeals/';
import React from 'react';


class MatchCTFSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 1};
    }

    changeMode(id){
        this.setState({"mode": id});
    }

    renderDefault(){

        if(this.state.mode !== 0) return null;

        return <MatchCTFSummaryDefault playerData={this.props.playerData}/>;
    }

    renderCovers(){

        if(this.state.mode !== 1) return null;
        return <MatchCTFSummaryCovers playerData={this.props.playerData}/>;
    }

    renderSeals(){
        if(this.state.mode !== 2) return null;
        return <MatchCTFSummarySeals playerData={this.props.playerData}/>;
    }

    render(){

        return <div>
            <div className="default-header">Capture The Flag Summary</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>General</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Covers</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(2);
                })}>Seals</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(3);
                })}>Returns</div>
            </div>
            {this.renderDefault()}
            {this.renderCovers()}
            {this.renderSeals()}
        </div>
    }
}

export default MatchCTFSummary;