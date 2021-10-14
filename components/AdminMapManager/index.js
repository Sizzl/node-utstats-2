import React from 'react';
import Functions from '../../api/functions';
import TrueFalse from '../TrueFalse';

class AdminMapManager extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "fullsize": [], 
            "thumbs": [], 
            "names": [], 
            "expectedFileNames": [], 
            "finishedLoading": false,
            "uploads": {}
        };

        this.uploadImage = this.uploadImage.bind(this);
    }

    async uploadImage(e){

        try{

            e.preventDefault();

            const name = e.target[0].name;
            const fullName = e.target[1].name;

            const formData = new FormData();

            if(e.target[0].files.length === 0){

                alert("No File selected");
                return;
            }

            const currentUploads = Object.assign(this.state.uploads);

            currentUploads[fullName] = {"finished": false, "errors": []}

            this.setState({"uploads": currentUploads});

            formData.append(name, e.target[0].files[0]);

            const req = await fetch("/api/mapimageupload",{
                "method": "POST",
                "body": formData
            });

            const res = await req.json();

            const newUploads = Object.assign(this.state.uploads);

            if(res.errors === undefined){
    
                newUploads[fullName] = {"finished": true, "errors": []};

                const fullsize = Object.assign(this.state.fullsize);
                const thumbsize = Object.assign(this.state.thumbs);

                fullsize.push(name);
                thumbsize.push(name);

                this.setState({"fullsize": fullsize, "thumbs": thumbsize});

            }else{
                newUploads[fullName] = {"finished": true, "errors": res.errors};
            }

            this.setState({"uploads": newUploads});

        }catch(err){
            console.trace(err);
        }

    }

    async loadFileList(){

        try{

            const req = await fetch("/api/mapmanager", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "allimages"})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"fullsize": res.data.fullsize, "thumbs": res.data.thumbs});
            }else{

                throw new Error(res.error);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async loadMapNames(){

        try{

            const req = await fetch("/api/mapmanager",{
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "allnames"})
            });

            const res = await req.json();

            if(res.error === undefined){

                const names = [];
                const expectedFileNames = [];

                for(let i = 0; i < res.data.length; i++){

                    expectedFileNames.push(Functions.cleanMapName(res.data[i].name).toLowerCase());
                    names.push(Functions.removeUnr(res.data[i].name));
    
                }


                this.setState({"names": names, "expectedFileNames": expectedFileNames});

            }else{
                throw new Error(res.error);
            }

        }catch(err){
            console.trace(err);
        }   
    }

    async componentDidMount(){

        await this.loadFileList();
        await this.loadMapNames();
        this.setState({"finishedLoading": true});
    }


    renderFileTable(){

        if(!this.state.finishedLoading) return null;

        const rows = [];

        for(let i = 0; i < this.state.names.length; i++){

            const n = this.state.names[i];
            const expectedFile = `${this.state.expectedFileNames[i]}.jpg`;

            const fullsizeIndex = this.state.fullsize.indexOf(expectedFile);
            const thumbIndex = this.state.thumbs.indexOf(expectedFile);

            rows.push(<tr key={i}>
                <td>{n}</td>
                <td>{expectedFile}</td>
                <TrueFalse bTable={true} value={fullsizeIndex !== -1} fDisplay="Missing" tDisplay="Found"/>
                <TrueFalse bTable={true} value={thumbIndex !== -1} fDisplay="Missing" tDisplay="Found"/>
                <td>

                    <form action="/" method="POST" encType="multipart/form-data" onSubmit={this.uploadImage}>
                        <input type="file" name={expectedFile} accept=".jpg,.png,.bmp"/>
                        <input type="submit" value="Upload" name={n}/>
                    </form>
                </td>
            </tr>);
        }

        return <div>
            <table className="t-width-1 td-1-left">
                <tbody>
                    <tr>
                        <th>Map</th>
                        <th>Required Image</th>
                        <th>Fullsize Image</th>
                        <th>Thumb Image</th>
                        <th>Actions</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    renderUploadProgress(){

        const rows = [];

        for(const [key, value] of Object.entries(this.state.uploads)){

            let colorClass = "";
            let displayText = "";
            const errors = [];
           // const colorClass = (value.finished) ? (value.errors.length === 0) ? "team-green" : "team-red" : "team-yellow";

            if(value.finished){

                if(value.errors.length === 0){
                    colorClass = "team-green";
                    displayText = "Upload Successful";
                }else{
                    colorClass = "team-red";

                    for(let i = 0; i < value.errors.length; i++){

                        errors.push(<div key={i}><b>Error:</b> {value.errors[i]}</div>);
                    }

                    displayText = errors;
                }
            }else{

                colorClass = "team-yellow";
                displayText = "Uploading, please wait...";
            }

            rows.push(<tr key={rows.length}>
                <td>{key}</td>
                <td className={colorClass}>{displayText}</td>
            </tr>);
        }


        if(rows.length === 0) return null;

        return <div className="m-bottom-25">
            <div className="default-sub-header">Uploads In Progress</div>
            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>File</th>
                        <th>Status</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Map Manager</div>
            {this.renderUploadProgress()}
            {this.renderFileTable()}
        </div>
    }
}

export default AdminMapManager;