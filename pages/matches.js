
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import MatchesManager from '../api/matches';
import MatchesTableView from '../components/MatchesTableView/';
import Gametypes from '../api/gametypes';
import Functions from '../api/functions';
import Servers from '../api/servers';
import Maps from '../api/maps';
import Pagination from '../components/Pagination';
import Link from 'next/link'

class Matches extends React.Component{

    constructor(props){

        super(props);

        this.state = {"perPage": this.props.perPage, "gametype": this.props.gametype};

        this.changePerPage = this.changePerPage.bind(this);
        this.changeGametype = this.changeGametype.bind(this);

    }

    changePerPage(event){
        this.setState({"perPage": event.target.value});
    }

    changeGametype(event){
        this.setState({"gametype": event.target.value})
    }

    createGametypeOptions(){

        const elems = [];

        const gametypes = JSON.parse(this.props.gametypes);

        for(const [key, value] of Object.entries(gametypes)){
            
            elems.push(<option value={key}>{value}</option>);
        }

        return elems;
    }

    render(){

        const pages = Math.ceil(this.props.totalMatches / this.props.perPage);

        const url = `/matches?perPage=${this.state.perPage}&gametype=${this.state.gametype}&page=`;

        return (<div>
            <DefaultHead />
            <main>
                <Nav />
                <div id="content">

                    <div className="default">
                        <div className="default-header">
                            Recent Matches
                        </div>
                        <div className="select-row">
                            <div className="select-label">Gametype</div>
                            <select className="default-select" value={this.state.gametype} onChange={this.changeGametype}>
                                <option value="0">All</option>
                                {this.createGametypeOptions()}
                            </select>
                        </div>
                        <div className="select-row">
                            <div className="select-label">Results Per Page</div>
    
                                <select className="default-select" value={this.state.perPage} onChange={this.changePerPage}>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                    
                        </div>

                        <Link href={`${url}${this.props.page}`}><a className="search-button">Search</a></Link>
                        <Pagination currentPage={this.props.page} 
                            perPage={this.props.perPage} 
                            pages={pages} 
                            results={this.props.totalMatches} 
                            url={url}/>
                        <MatchesTableView data={this.props.matches}/>
                    </div>
                </div>
                <Footer />
            </main>
        </div>);
    }
}

export async function getServerSideProps({query}){

    const matchManager = new MatchesManager();
    const gametypeManager = new Gametypes();
    const serverManager = new Servers();
    const mapManager = new Maps();

    

    let perPage = 25;
    let page = 1;
    let gametype = 0;

    if(query.perPage !== undefined){

        perPage = parseInt(query.perPage);

        if(perPage !== perPage){
            perPage = 25;
        }

        if(perPage > 100 || perPage < 1){
            perPage = 25;
        }
    }

    if(query.page !== undefined){

        page = parseInt(query.page);

        if(page !== page){
            page = 1;
        }

        if(page < 1){
            page = 1;
        }
    }

    if(query.gametype !== undefined){

        gametype = parseInt(query.gametype);

        if(gametype !== gametype){
            gametype = 0;
        }
    }

    const matches = await matchManager.getRecent(page - 1, perPage, gametype);
    const totalMatches = await matchManager.getTotal(gametype);
    //const uniqueGametypes = Functions.getUniqueValues(matches, 'gametype');
    const uniqueServers = Functions.getUniqueValues(matches, 'server');
    const uniqueMaps = Functions.getUniqueValues(matches, 'map');


    let gametypeNames = {};

    //if(uniqueGametypes.length > 0){
    //    gametypeNames = await gametypeManager.getNames(uniqueGametypes);
    //}

    gametypeNames = await gametypeManager.getAllNames();

    let serverNames = {};

    if(uniqueServers.length > 0){
        serverNames = await serverManager.getNames(uniqueServers);
    }

    let mapNames = {};

    if(uniqueMaps.length > 0){
        mapNames = await mapManager.getNames(uniqueMaps);
    }


    Functions.setIdNames(matches, gametypeNames, 'gametype', 'gametypeName');
    Functions.setIdNames(matches, serverNames, 'server', 'serverName');
    Functions.setIdNames(matches, mapNames, 'map', 'mapName');

    //console.log(matches[0]);
    return {
        "props": {
            "matches": JSON.stringify(matches),
            "page": page,
            "perPage": perPage,
            "totalMatches": totalMatches,
            "gametypes": JSON.stringify(gametypeNames),
            "gametype": gametype
        }
    };
}


export default Matches;