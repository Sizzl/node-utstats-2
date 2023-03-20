const mysql = require('./api/database');
const Message = require('./api/message');
const config = require('./config.json');


async function columnExists(table, column){

    const query = `SELECT COUNT(*) as total_results FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?`;

    const vars = [config.mysql.database, table, column];
    
    const result = await mysql.simpleQuery(query, vars);

    if(result.length > 0){

        if(result[0].total_results > 0) return true;
    }

    return false;
}

async function alterTable(table, column, datatype, after){

    if(await columnExists(table, column)){
        new Message(`${table} already has the column ${column}.`,"pass");
        return;
    }
    
    if(after === undefined) after = "";

    const query = `ALTER TABLE ${table} ADD COLUMN ${column} ${datatype} ${after}`;

    await mysql.simpleQuery(query);
    new Message(query, "pass");
}

async function changeColumnName(table, oldName, newName){

    //RENAME COLUMN old_column_name TO new_column_name;
    const query = `ALTER TABLE ${table} RENAME COLUMN ${oldName} TO ${newName}`;

    await mysql.simpleQuery(query);
}

async function updatePlayerTotals(){

    const table = "nstats_player_totals";

    new Message(`Starting update of ${table}.`,"note");

    await alterTable(table, "team_0_playtime", "float NOT NULL", "AFTER playtime");
    await alterTable(table, "team_1_playtime", "float NOT NULL", "AFTER team_0_playtime");
    await alterTable(table, "team_2_playtime", "float NOT NULL", "AFTER team_1_playtime");
    await alterTable(table, "team_3_playtime", "float NOT NULL", "AFTER team_2_playtime");
    await alterTable(table, "spec_playtime", "float NOT NULL", "AFTER team_3_playtime");

    new Message(`Updated table ${table}.`,"pass");
}

async function updatePlayerWeaponsMatch(){

    const table = "nstats_player_weapon_match";

    new Message(`Starting update of ${table}.`,"note");

    await alterTable(table, "map_id", "INT NOT NULL", "AFTER match_id");
    await alterTable(table, "gametype_id", "INT NOT NULL", "AFTER map_id");
    await alterTable(table, "best_kills", "INT NOT NULL", "AFTER kills");
    await alterTable(table, "suicides", "INT NOT NULL", "AFTER deaths");
    await alterTable(table, "team_kills", "INT NOT NULL", "AFTER suicides");
    await alterTable(table, "best_team_kills", "INT NOT NULL", "AFTER team_kills");

    new Message(`Updated table ${table}.`,"pass");
}

async function updatePlayerWeaponsTotals(){

    const table = "nstats_player_weapon_totals";

    new Message(`Starting update of ${table}.`,"note");

    await alterTable(table, "map_id", "INT NOT NULL", "AFTER player_id");
    await alterTable(table, "team_kills", "INT NOT NULL", "AFTER kills");
    await alterTable(table, "suicides", "INT NOT NULL", "AFTER deaths");

    new Message(`Updated table ${table}.`,"pass");
}

async function createPlayerWeaponBest(){

    new Message(`Creating table nstats_player_weapon_best.`,"note");

    const query = `CREATE TABLE IF NOT EXISTS nstats_player_weapon_best (
        id int(11) NOT NULL AUTO_INCREMENT,
        player_id int(11) NOT NULL,
        map_id int(11) NOT NULL,
        gametype_id int(11) NOT NULL,
        weapon_id int(11) NOT NULL,
        kills int(11) NOT NULL,
        kills_best_life int(11) NOT NULL,
        team_kills int(11) NOT NULL,
        team_kills_best_life int(11) NOT NULL,
        deaths int(11) NOT NULL,
        suicides int(11) NOT NULL,
        efficiency int(11) NOT NULL,
        accuracy float NOT NULL,
        shots int(11) NOT NULL,
        hits int(11) NOT NULL,
        damage bigint NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

    return await mysql.simpleQuery(query);
}

(async () =>{

    try{

        new Message("Node UTStats 2 Upgrade", "note");
        new Message("There is no upgrading from the previous version(2.6 & 2.7.X)","warning");
        new Message("You have to do a fresh install.", "warning");

        await updatePlayerTotals();
        
        await updatePlayerWeaponsMatch();
        await updatePlayerWeaponsTotals();
        await createPlayerWeaponBest();
        

        process.exit(0);

    }catch(err){
        console.trace(err);
    }


})();