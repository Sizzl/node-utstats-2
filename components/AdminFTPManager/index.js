import React from 'react';
import TrueFalse from '../TrueFalse';


class AdminFTPManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 0,
            "selectedServer": -1,
            "currentName": "",
            "currentHost": 0,
            "currentPort": 0,
            "currentUser": "",
            "currentPassword": "",
            "currentFolder": "",
            "currentLogs": "",
            "editPassed": null,
            "editInProgress": false,
            "editErrors": [],
            "createPassed": null,
            "createInProgress": false,
            "createErrors": [],
            "deletePassed": null,
            "deleteInProgress": false,
            "deleteErrors": []
        };

        this.updateSelected = this.updateSelected.bind(this);

        this.editEntry = this.editEntry.bind(this);

        this.changeMode = this.changeMode.bind(this);

        this.addServer = this.addServer.bind(this);

        this.deleteServer = this.deleteServer.bind(this);

        this.setValue = this.setValue.bind(this);
    }

    setValue(id, key, value){


        const newServers = Object.assign(this.props.servers);

        for(let i = 0; i < newServers.length; i++){

            if(newServers[i].id === id){       
                newServers[i][key] = value;
            }
        }

        this.props.updateParent(newServers);
    }

    removeServerFromList(id){

        const newData = [];

        let s = 0;

        for(let i = 0; i < this.props.servers.length; i++){

            s = this.props.servers[i];

            if(s.id !== id){
                newData.push(s);
            }
        }

        this.props.updateParent(newData);
    }

    async deleteServer(e){

        try{

            const errors = [];

            e.preventDefault();

            this.setState({
                "deletePassed": null,
                "deleteInProgress": true,
                "deleteErrors": []
            });

            const serverId = parseInt(e.target[0].value);

            if(serverId !== serverId){
                errors.push("Server ID must be a valid integer.");
            }

            if(serverId === -1){
                errors.push("You have not selected a server to delete");
            }


            if(errors.length === 0){

                const req = await fetch("/api/ftpadmin", {
                    "method": "POST",
                    "body": JSON.stringify({
                        "data": {
                            "id": serverId,
                            "mode": "delete"
                        }
                    })
                });

                const result = await req.json();

                if(result.message !== "passed"){
                    errors.push(result.message);
                }else{

                    this.removeServerFromList(serverId);
                }
            }


            if(errors.length === 0){

                this.setState({
                    "deletePassed": true,
                    "deleteInProgress": false,
                    "deleteErrors": []
                });

            }else{

                this.setState({
                    "deletePassed": false,
                    "deleteInProgress": false,
                    "deleteErrors": errors
                });
            }



        }catch(err){
            console.trace(err);
        }
    }

    bServerAlreadyAdded(host, port, folder){


        let s = 0;

        for(let i = 0; i < this.props.servers.length; i++){

            s = this.props.servers[i];

            if(s.host === host && s.port === port && s.target_folder === folder){
                return true;
            }
        }

        return false;
    }

    addServerToList(id, name, host, port, user, password, folder, deleteAfter, deleteTmp, ignoreBots, ignoreDuplicates){

        const newObject = {
            "id": id,
            "name": name,
            "host": host,
            "port": port,
            "user": user,
            "password": password,
            "target_folder": folder,
            "delete_after_import": deleteAfter,
            "first": 0,
            "last": 0,
            "total_imports": 0,
            "delete_tmp_files": deleteTmp,
            "ignore_bots": ignoreBots,
            "ignore_duplicates": ignoreDuplicates
        };

        const data = this.props.servers;

        data.push(newObject);

        this.props.updateParent(data);
    }


    async addServer(e){

        try{

            e.preventDefault();

            this.setState({
                "createPassed": null,
                "createInProgress": true,
                "createErrors": []
            });


            let name = e.target[0].value;
            let host = e.target[1].value;
            let port = parseInt(e.target[2].value);
            let user = e.target[3].value;
            let password = e.target[4].value;
            let folder = e.target[5].value;
            let deleteAfter = (e.target[6].checked) ? 1 : 0;
            let tempFiles = (e.target[7].checked) ? 1 : 0;
            let ignoreBots = (e.target[8].checked) ? 1 : 0;
            let ignoreDuplicates = (e.target[9].checked) ? 1 : 0;


            const errors = [];

            if(name === "") errors.push("Server name can not be blank");
            if(host === "") errors.push("Host can not be blank");

            if(port !== port) errors.push("Port must be a valid integer");
            if(port < 1 || port > 65535) errors.push("Port must be between 1 and 65535");

            if(user === "") errors.push("User can not be blank");

            if(this.bServerAlreadyAdded(host, port, folder)){
                errors.push(`The host port combo of ftp://${host}:${port}, with the target folder of "${folder}" is already in use.`);
            }

            if(errors.length === 0){

                const req = await fetch("/api/ftpadmin", {

                    "method": "POST",
                    "body": JSON.stringify({"data": {
                        "mode": "create",
                        "name": name,
                        "host": host,
                        "port": port,
                        "user": user,
                        "password": password,
                        "target_folder": folder,
                        "delete_after_import": deleteAfter,
                        "delete_tmp_files": tempFiles,
                        "ignore_bots": ignoreBots,
                        "ignore_duplicates": ignoreDuplicates
                        }
                    })
                });

                const result = await req.json();

                if(result.message !== "passed"){
                    errors.push(result.message);
                }else{

                    this.addServerToList(
                        result.serverId, name, host, port, user, password, folder, deleteAfter, tempFiles, ignoreBots, ignoreDuplicates
                    );

                    this.setState({
                        "createPassed": true,
                        "createInProgress": false,
                        "createErrors": []
                    });
                }
            }

            if(errors.length > 0){

                this.setState({
                    "createPassed": false,
                    "createInProgress": false,
                    "createErrors": errors
                });
            }


        }catch(err){
            console.trace(err);
        }
    }

    changeMode(id){

        this.setState({"mode": id});
    }


    async updateServerDetails(data){

        try{

            const errors = [];

            this.setState({
                "editPassed": null,
                "editInProgress": true,
                "editErrors": []
            });


            console.log(data);

            if(data.id < 1){
                errors.push("You have not selected a server to edit.");
            }

            data.mode = "edit";

            if(errors.length === 0){

                const req = await fetch("/api/ftpadmin", {
                    "method": "POST",
                    "body": JSON.stringify({"data": data})
                });

                const result = await req.json();

                if(result.message === "passed"){

                    this.setState({
                        "editPassed": true,
                        "editInProgress": false,
                        "editErrors": []
                    });

                }else{
                    errors.push(result.message);
                }


                console.log(result);
            }

            if(errors.length > 0){

                this.setState({
                    "editPassed": false,
                    "editInProgress": false,
                    "editErrors": errors
                });
            }

        }catch(err){
            console.trace(err);
        }
    }

    editEntry(e){


        e.preventDefault();

        let name = e.target[1].value;
        let host = e.target[2].value;
        let port = e.target[3].value;
        let user = e.target[4].value;
        let password = e.target[5].value;
        let folder = e.target[6].value;

        let deleteAfterImport = (e.target[7].checked) ? 1 : 0;
        let deleteTmpFiles = (e.target[8].checked) ? 1 : 0;
        let ignoreBots = (e.target[9].checked) ? 1 : 0;
        let ignoreDuplicates = (e.target[10].checked) ? 1 : 9;
        let serverId = parseInt(e.target[11].value);

        const newData = Object.assign(this.props.servers);
        let editData = 0;

        let current = 0;

        for(let i = 0; i < newData.length; i++){

            current = newData[i];

            if(current.id === serverId){

                current.name = name;
                current.host = host;
                current.port = port;
                current.user = user;
                current.password = password;
                current.target_folder = folder;
                current.delete_after_import = deleteAfterImport;
                current.delete_tmp_files = deleteTmpFiles;
                current.ignore_bots = ignoreBots;
                current.ignore_duplicates = ignoreDuplicates;

                editData = current;
            }
        }

        this.updateServerDetails(editData);
        this.props.updateParent(newData);

    }

    updateSelected(e){

        const value = parseInt(e.target.value);

        this.setState({"selectedServer": value});

    }
    
    renderTable(){

        if(this.state.mode !== 0) return null;

        const rows = [];

        let s = 0;

        for(let i = 0; i < this.props.servers.length; i++){

            s = this.props.servers[i];

            rows.push(<tr key={i}>
                <td>{s.name}</td>
                <td>{s.host}</td>
                <td>{s.port}</td>
                <td>{s.target_folder}</td>
                <TrueFalse bTable={true} value={s.delete_after_import} />
                <TrueFalse bTable={true} value={s.delete_tmp_files} />
                <TrueFalse bTable={true} value={s.ignore_bots} />
                <TrueFalse bTable={true} value={s.ignore_duplicates} />
                <td>{s.first}</td>
                <td>{s.last}</td>
                <td>{s.total_imports}</td>
            </tr>);
        }


        return <div>
            <div className="default-header">Current Servers</div>
            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Host</th>
                        <th>Port</th>
                        <th>Target Folder</th>
                        <th>Delete After Import<br/>(FTP/UnrealTournament/Logs)</th>
                        <th>Delete TMP Files</th>
                        <th>Ignore Bots</th>
                        <th>Ignore Duplicate Logs</th>
                        <th>First</th>
                        <th>Last</th>
                        <th>Total</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }


    createServersDropDown(){

        const options = [];

        let s = 0;

        for(let i = 0; i < this.props.servers.length; i++){

            s = this.props.servers[i];

            options.push(<option key={i} value={s.id}>
                {s.name} ({s.host}:{s.port}) 
            </option>);
        }

        return <select className="default-select m-bottom-25" value={this.state.selectedServer} onChange={this.updateSelected}>
            <option value="-1">Select a server</option>
            {options}
        </select>
    }

    getServerSettings(){

        let s = 0;

        for(let i = 0; i < this.props.servers.length; i++){

            s = this.props.servers[i];

            if(s.id === this.state.selectedServer){
                return s;
            }
        }


        return {
            "id": -1,
            "name": "",
            "host": "",
            "port": "",
            "user": "",
            "password": "",
            "target_folder": "",
            "first": "",
            "last": "",
            "total": "",
            "delete_after_import": "",
            "delete_tmp_files": "",
            "ignore_bots": "",
            "ignore_duplicates": ""
        };
    }

    renderEditProgress(){

        if(this.state.editInProgress){


            return <div className="team-yellow m-bottom-25 p-bottom-25 center t-width-1">
                <div className="default-header">Processing</div>
                Edit in progress, please wait...
            </div>;

        }else{

            if(this.state.editPassed === false){

                const errors = [];

                let e = 0;

                for(let i = 0; i < this.state.editErrors.length; i++){

                    e = this.state.editErrors[i];

                    errors.push(<div key={i}>{e}</div>);
                }

                return <div className="team-red m-bottom-25 p-bottom-25 center t-width-1">
                    <div className="default-header">Error</div>
                    {errors}
                </div>;

            }else if(this.state.editPassed === true){

                return <div className="team-green m-bottom-25 p-bottom-25 center t-width-1">
                    <div className="default-header">Passed</div>
                    Edit was completed successfully
                </div>;
            }
        }
    }

    renderCreateProgress(){

        if(this.state.createInProgress){


            return <div className="team-yellow m-bottom-25 p-bottom-25 center t-width-1">
                <div className="default-header">Processing</div>
                Adding new server in progress, please wait...
            </div>;

        }else{

            if(this.state.createPassed === false){

                const errors = [];

                let e = 0;

                for(let i = 0; i < this.state.createErrors.length; i++){

                    e = this.state.createErrors[i];

                    errors.push(<div key={i}>{e}</div>);
                }

                return <div className="team-red m-bottom-25 p-bottom-25 center t-width-1">
                    <div className="default-header">Error</div>
                    {errors}
                </div>;

            }else if(this.state.createPassed === true){

                return <div className="team-green m-bottom-25 p-bottom-25 center t-width-1">
                    <div className="default-header">Passed</div>
                    New server was added successfully
                </div>;
            }
        }
    }

    renderDeleteProgress(){

        if(this.state.deleteInProgress){


            return <div className="team-yellow m-bottom-25 p-bottom-25 center t-width-1">
                <div className="default-header">Processing</div>
                Deleting server in progress, please wait...
            </div>;

        }else{

            if(this.state.deletePassed === false){

                const errors = [];

                let e = 0;

                for(let i = 0; i < this.state.deleteErrors.length; i++){

                    e = this.state.deleteErrors[i];

                    errors.push(<div key={i}>{e}</div>);
                }

                return <div className="team-red m-bottom-25 p-bottom-25 center t-width-1">
                    <div className="default-header">Error</div>
                    {errors}
                </div>;

            }else if(this.state.deletePassed === true){

                return <div className="team-green m-bottom-25 p-bottom-25 center t-width-1">
                    <div className="default-header">Passed</div>
                    Server deleted successfully
                </div>;
            }
        }
    }

    renderEditForm(){

        if(this.state.mode !== 1) return null;

        const selected = this.getServerSettings();

        return <div>
            <div className="default-header">Edit Server</div>
            {this.renderEditProgress()}
            <form className="form" action="/" method="POST" onSubmit={this.editEntry}>
       
                {this.createServersDropDown()}
                <div className="select-row">
                    <div className="select-label">Name</div>
                    <div>
                        <input type="text" defaultValue={selected.name} id="name" className="default-textbox" placeholder="Name..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Host</div>
                    <div>
                        <input type="text" defaultValue={selected.host} id="host" className="default-textbox" placeholder="Host..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Port</div>
                    <div>
                        <input type="text" defaultValue={selected.port} id="port" className="default-textbox" placeholder="Port"/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">User</div>
                    <div>
                        <input type="text" defaultValue={selected.user} id="user" className="default-textbox" placeholder="User..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Password</div>
                    <div>
                        <input type="password" defaultValue={selected.password} id="password" className="default-textbox" placeholder="Password..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Target Folder</div>
                    <div>
                        <input type="text" defaultValue={selected.target_folder} id="folder" className="default-textbox" placeholder="Target folder..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Delete Logs From FTP After Import</div>
                    <div>
                        <input  checked={selected.delete_after_import} type="checkbox" onChange={(() =>{
                            this.setValue(selected.id, "delete_after_import", (selected.delete_after_import) ? 0 : 1);
                        })}/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Delete TMP Files</div>
                    <div>
                        <input checked={selected.delete_tmp_files} type="checkbox" onChange={(() =>{
                            this.setValue(selected.id, "delete_tmp_files", (selected.delete_tmp_files) ? 0 : 1);
                        })}/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Ignore Bots</div>
                    <div>
                        <input  checked={selected.ignore_bots}  type="checkbox" onChange={(() =>{
                            this.setValue(selected.id, "ignore_bots", (selected.ignore_bots) ? 0 : 1);
                        })}/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Ignore Duplicate Matches</div>
                    <div>
                        <input checked={selected.ignore_duplicates} type="checkbox" onChange={(() =>{
                            this.setValue(selected.id, "ignore_duplicates", (selected.ignore_duplicates) ? 0 : 1);
                        })}/>
                    </div>
                </div>
                <input type="hidden" value={selected.id}/>
                <input type="submit" className="search-button" value="Update"/>
            </form>
        </div>
    }

    renderCreateForm(){

        if(this.state.mode !== 2) return null;

        return <div>
            <div className="default-header">Add FTP Server</div>

            {this.renderCreateProgress()}
            
            <form className="form" action="/" method="POST" onSubmit={this.addServer}>

                <div className="select-row">
                    <div className="select-label">Name</div>
                    <div><input type="text" className="default-textbox" placeholder="Name..." /></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Host</div>
                    <div><input type="text" className="default-textbox" placeholder="Host..." /></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Port</div>
                    <div><input type="number" className="default-textbox" placeholder="Port..." /></div>
                </div>
                <div className="select-row">
                    <div className="select-label">User</div>
                    <div><input type="text" className="default-textbox" placeholder="User..." /></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Password</div>
                    <div><input type="password" className="default-textbox" placeholder="Password..." /></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Target Folder</div>
                    <div><input type="text" className="default-textbox" placeholder="Target Folder..." /></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Delete Logs From FTP After Import</div>
                    <div><input type="checkbox"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Delete TMP Files</div>
                    <div><input type="checkbox"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Ignore Bots</div>
                    <div><input type="checkbox"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Ignore Duplicate Matches</div>
                    <div><input type="checkbox"/></div>
                </div>
                <input type="submit" className="search-button" value="Add Server"/>
            </form>
        </div>
    }

    renderDeleteFrom(){

        if(this.state.mode !== 3) return null;

        return <div>
            <div className="default-header">Delete Server</div>
            {this.renderDeleteProgress()}
            <form className="form" action="/" method="POST" onSubmit={this.deleteServer}>
                <div className="select-row">
                    <div className="select-label">Server To Delete</div>
                    <div>{this.createServersDropDown()}</div>
                </div>
                <input type="submit" className="search-button" value="Delete Server"/>
            </form>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">FTP Manager</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Server List</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Edit Server</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(2);
                })}>Add Server</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(3);
                })}>Delete Server</div>
            </div>

            {this.renderTable()}
            {this.renderEditForm()}
            {this.renderCreateForm()}
            {this.renderDeleteFrom()}
        </div>
    }
}

export default AdminFTPManager;