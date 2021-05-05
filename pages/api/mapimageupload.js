import formidable from 'formidable';
import fs from 'fs';
import Session from '../../api/session';

export const config = {
    api: {
        bodyParser: false,
    },
  };

export default async (req, res) =>{

    const VALID_FILE_TYPES = [".jpg", ".jpeg"];
    const VALID_MIME_TYPES = ["image/jpg", "image/jpeg"];

    const form = new formidable.IncomingForm();

    let cookies = [];

    if(req.headers.cookie !== undefined){
        cookies = req.headers.cookie;
    }

    const session = new Session(cookies);

    if(await session.bUserAdmin()){

        console.log("check");

        form.uploadDir = "./uploads/";
        form.keepExtensions = false;

        console.log("check2");


        form.parse(req, (err, fields, files) => {

            console.log("check 3");

            //fs.writeFileSync("potato.fart", "test");
            
            console.log(err, fields, files);
        });


        form.onPart = function (part){

            if(part.filename){

               // console.log("part.filename");
                //console.log(part.filename);

                if(VALID_MIME_TYPES.indexOf(part.mime) !== -1){

                    console.log("VALID FILE TYPE");

                    form.handlePart(part);
                }else{
                    console.log("Not valid file type");
                }

                
            }else{
                form.handlePart(part);
            }
        }

        form.on("file", (name, file) =>{

            fs.renameSync(file.path, `./public/images/maps/${file.name}`);
        })
        

        res.status(200).json({"potaotes": "yofoghdf"});
    }else{
        res.status(200).json({"error": "Access Denied"});
    }
}