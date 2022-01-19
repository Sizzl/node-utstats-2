const mysql = require('./api/database');
const Message = require('./api/message');
const config = require('./config.json');


async function columnExists(table, column){

    const query = `SELECT COUNT(*) as total_results FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?`;

    const vars = [config.mysql.database, table, column];
    
    const result = await mysql.simpleFetch(query, vars);

    if(result.length > 0){

        if(result[0].total_results > 0) return true;
    }

    return false;
}

async function alterTable(table, column, datatype){

    const query = `ALTER TABLE ${table} ADD COLUMN ${column} ${datatype}`;

    await mysql.simpleUpdate(query);
}

async function changeColumnName(table, oldName, newName){

    //RENAME COLUMN old_column_name TO new_column_name;
    const query = `ALTER TABLE ${table} RENAME COLUMN ${oldName} TO ${newName}`;

    await mysql.simpleQuery(query);
}


async function updateFTPTable(){

    const table = "nstats_ftp";
    const minPlayersExists = await columnExists(table, "min_players");
    const minPlaytimeExists = await columnExists(table, "min_playtime");

    if(minPlayersExists && minPlaytimeExists){

        new Message(`TABLE ${table} does not need to be updated.`,"pass");

    }else{

        if(!minPlayersExists){
            await alterTable(table, "min_players", "INT(2) NOT NULL");
        }

        if(!minPlaytimeExists){
            await alterTable(table, "min_playtime", "INT(11) NOT NULL");
        }
    }
}


async function updateCapsTable(){

    const table = "nstats_ctf_caps";

    const coverExists = await columnExists(table, "self_covers");
    const coverCountExists = await columnExists(table, "self_covers_count");
    const coverTimesExists = await columnExists(table, "self_covers_times");
    const sealsExists = await columnExists(table, "seals");
    const sealTimesExists = await columnExists(table, "seal_times");

    const flagTeamExists = await columnExists(table, "flag_team");

    const totalDropsExists = await columnExists(table, "total_drops");
    const totalCoversExists = await columnExists(table, "total_covers");
    const totalSelfCoversExists = await columnExists(table, "total_self_covers");

    const totalPickupsExists = await columnExists(table, "total_pickups");
    const totalAssistsExists = await columnExists(table, "total_assists");
    const totalUniqueAssistsExists = await columnExists(table, "total_unique_assists");
    const totalSealsExists = await columnExists(table, "total_seals");

    const timeDroppedExists = await columnExists(table, "time_dropped");
    const carryTimeExists = await columnExists(table, "carry_time");

    const exists = [
        coverExists,
        coverTimesExists,
        sealsExists,
        sealTimesExists,
        flagTeamExists,
        totalDropsExists,
        totalCoversExists,
        totalSelfCoversExists,
        totalPickupsExists,
        totalAssistsExists,
        totalUniqueAssistsExists,
        totalSealsExists,
        timeDroppedExists,
        carryTimeExists
    ];


    if(exists.every(x => x === true)){

        new Message(`TABLE ${table} does not need to be updated.`,"pass");

    }else{

        if(!coverExists){
            await alterTable(table, "self_covers", "text NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "self_covers"`,"pass");
        }

        if(!coverCountExists && !coverTimesExists){
            await alterTable(table, "self_covers_count", "text NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "self_covers_times"`,"pass");
        }

        if(!sealsExists){  
            await alterTable(table, "seals", "text NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "seals"`,"pass");
        }

        if(!sealTimesExists){  
            await alterTable(table, "seal_times", "text NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "seal_times"`,"pass");
        }

        if(!flagTeamExists){
            await alterTable(table, "flag_team", "int(1) NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "flag_team"`,"pass");
        }

        if(!totalDropsExists){

            await alterTable(table, "total_drops", "int(11) NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "total_drops"`,"pass");
        }

        if(!totalCoversExists){

            await alterTable(table, "total_covers", "int(11) NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "total_covers"`,"pass");
        }

        if(!totalSelfCoversExists){

            await alterTable(table, "total_self_covers", "int(11) NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "total_self_covers"`,"pass");
        }

        if(!totalPickupsExists){

            await alterTable(table, "total_pickups", "int(11) NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "total_pickups"`,"pass");
        }

        if(!totalAssistsExists){

            await alterTable(table, "total_assists", "int(11) NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "total_assists"`,"pass");
        }

        if(!totalUniqueAssistsExists){

            await alterTable(table, "total_unique_assists", "int(11) NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "total_assists"`,"pass");
        }

        if(!totalSealsExists){

            await alterTable(table, "total_seals", "int(11) NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "total_seals"`,"pass");
        }

        if(!timeDroppedExists){

            await alterTable(table, "time_dropped", "DECIMAL(9,2) NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "time_dropped"`,"pass");
        }

        if(!carryTimeExists){

            await alterTable(table, "carry_time", "DECIMAL(9,2) NOT NULL");
            new Message(`Updated table nstats_ctf_caps, add column "carry_time"`,"pass");
        }

    }
}

async function updateSiteSettings(){

    

    const orderExists = await columnExists("nstats_site_settings", "page_order");

    if(!orderExists){

        await alterTable("nstats_site_settings", "page_order", "INT(11) NOT NULL");
        new Message(`Updated table nstats_site_settings, add column "page_order"`,"pass");
    }
    
    const query = "SELECT category, name FROM nstats_site_settings";
    const result = await mysql.simpleFetch(query);

    const currentSettings = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(currentSettings[r.category] === undefined){
            currentSettings[r.category] = [];
        }

        currentSettings[r.category].push(r.name);
    }

    const queries = [
        `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Mutators","true",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Time Limit","true",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Target Score","true",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Minimum Players","0",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Minimum Playtime","0",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Player Score Graph","true",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Times","true",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Minimum Solo Caps Before Displayed","1",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Minimum Assisted Caps Before Displayed","1",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Maximum Solo Caps To Display","50",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Maximum Assisted Caps To Display","50",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Capture The Flag Cap Records","true",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Health/Armour Control","true",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Weapons Control","true",0)`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Ammo Control","true",0)`
    ];

    
    const reg = /^.+NULL,"(.+?)","(.+?)",.+$/i;

    for(let i = 0; i < queries.length; i++){

        const q = queries[i];

        const result = reg.exec(q);

        if(result !== null){

            if(currentSettings[result[1]].indexOf(result[2]) === -1){
                await mysql.simpleUpdate(q);
                new Message(`GerneralQuery ${i+1} of ${queries.length} completed.`,"pass");
            }else{
                new Message(`GerneralQuery ${i+1} of ${queries.length} did not need to be updated.`,"pass");
            }
        }
    }
}

async function createNewTables(){

    try{
        const queries = [
            `CREATE TABLE IF NOT EXISTS nstats_ctf_cap_records(
                id int(11) NOT NULL AUTO_INCREMENT,
                match_id INT(11) NOT NULL,
                match_date INT(11) NOT NULL,
                map_id INT(11) NOT NULL,
                team INT(1) NOT NULL,
                grab INT(11) NOT NULL,
                assists VARCHAR(500) NOT NULL,
                cap INT(11) NOT NULL,
                travel_time DECIMAL(10,2) NOT NULL,
                type INT(1) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
        ];

        for(let i = 0; i < queries.length; i++){

            const q = queries[i];

            await mysql.simpleQuery(q);
            new Message(`createNewTables Query ${i+1} of ${queries.length} completed.`,"pass");

        }

    }catch(err){
        new Message(`createNewTables Query ${i+1} ${err}`, "error");
    }


}

(async () =>{

    try{

        new Message("Database Upgrade", "note");

        await createNewTables();
        await updateFTPTable();
        await updateCapsTable();
        await updateSiteSettings();

        if(await columnExists("nstats_ctf_caps", "self_covers_count")){
            await mysql.simpleQuery("ALTER TABLE nstats_ctf_caps CHANGE self_covers_count self_covers_times TEXT(1000) NOT NULL");
        }

        process.exit(0);

    }catch(err){
        console.trace(err);
    }


})();