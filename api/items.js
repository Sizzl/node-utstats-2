import { simpleQuery, bulkInsert } from "./database.js";
import { toMysqlDate } from "./generic.mjs";
import { getObjectName } from "./genericServerSide.mjs";
import Message from "./message.js";


export const DEFAULT_ITEMS = [
    {"name":"AntiGrav Boots","display_name":"Jump Boots","type":4},
	{"name":"Body Armor","display_name":"Body Armor","type":3},
	{"name":"Chainsaw","display_name":"Chainsaw","type":1},
	{"name":"Damage Amplifier","display_name":"Damage Amplifier","type":4},
	{"name":"Double Enforcers","display_name":"Double Enforcers","type":1},
	{"name":"Enforcer","display_name":"Enforcer","type":1},
	{"name":"Enhanced Shock Rifle","display_name":"Enhanced Shock Rifle","type":1},
	{"name":"Flak Cannon","display_name":"Flak Cannon","type":1},
	{"name":"GES Bio Rifle","display_name":"GES Bio Rifle","type":1},
	{"name":"Health Pack","display_name":"Health Pack","type":3},
	{"name":"Health Vial","display_name":"Health Vial","type":3},
	{"name":"Invisibility","display_name":"Invisibility","type":4},
	{"name":"Minigun","display_name":"Minigun","type":1},
	{"name":"Pulse Gun","display_name":"Pulse Gun","type":1},
	{"name":"Redeemer","display_name":"Redeemer","type":1},
	{"name":"RelicDeathInventory","display_name":"Relic Death","type":5},
	{"name":"RelicDefenseInventory","display_name":"Relic Defense","type":5},
	{"name":"RelicRedemptionInventory","display_name":"Relic Redemption","type":5},
	{"name":"RelicRegenInventory","display_name":"Relic Regen","type":5},
	{"name":"RelicSpeedInventory","display_name":"Relic Speed","type":5},
	{"name":"RelicStrengthInventory","display_name":"Relic Strength","type":5},
	{"name":"Ripper","display_name":"Ripper","type":1},
	{"name":"Rocket Launcher","display_name":"Rocket Launcher","type":1},
	{"name":"Shield Belt","display_name":"Shield Belt","type":4},
	{"name":"ShieldBelt","display_name":"Shield Belt","type":4},
	{"name":"Shock Rifle","display_name":"Shock Rifle","type":1},
	{"name":"Sniper Rifle","display_name":"Sniper Rifle","type":1},
	{"name":"Super Health Pack","display_name":"Super Health Pack","type":4},
	{"name":"Thigh Pads","display_name":"Thigh Pads","type":3},
	{"name":"Ammor Percing Slugs Pads","display_name":"Armor Percing Slugs","type":2},
	{"name":"AP CAS12","display_name":"AP CAS12s","type":1},
	{"name":"Armor Shard","display_name":"Armor Shard","type":3},
	{"name":"Arrows","display_name":"Arrows","type":2},
	{"name":"Blade Hopper","display_name":"Ripper Ammo","type":2},
	{"name":"Box of Rifle Rounds","display_name":"Sniper Ammo","type":2},
	{"name":"Box of RPB Rounds","display_name":"RPB Sniper Ammo","type":2},
	{"name":"CAS12","display_name":"CAS12","type":1},
	{"name":"Chaos Sniper Rifle","display_name":"Chaos Sniper Rifle","type":1},
	{"name":"Claw","display_name":"Claw","type":1},
	{"name":"Crossbow","display_name":"Crossbow","type":1},
	{"name":"Explosive Arrows","display_name":"Crossbow","type":2},
	{"name":"Explosive CAS12","display_name":"Explosive CAS12","type":1},
	{"name":"Explosive Crossbow","display_name":"Explosive Crossbow","type":1},
	{"name":"Explosive SG Shells","display_name":"Explosive SG Shells","type":2},
	{"name":"Flak Shells","display_name":"Flak Shells","type":2},
	{"name":"Gravity Belt","display_name":"Gravity Belt","type":5},
	{"name":"Poison Crossbow","display_name":"Poison Crossbow","type":1},
	{"name":"Proxy Mines","display_name":"Proxy Mines","type":1},
	{"name":"Rocket Pack","display_name":"Rocket Pack","type":2},
	{"name":"SG Shells","display_name":"SG Shell","type":2},
	{"name":"Shock Core","display_name":"Shock Core","type":2},
	{"name":"Sword","display_name":"Sword","type":1},
];

export default class Items{

    constructor(){}

    async exists(item){

        const query = "SELECT COUNT(*) as total_pickups FROM nstats_items WHERE name=?";

        const result = await simpleQuery(query, [item]);

        return result[0].total_pickups > 0;
    }

    async create(name, uses, date){

        const query = "INSERT INTO nstats_items VALUES(NULL,?,?,?,?,?,1,0)";

        return await simpleQuery(query, [name, name, date, date, uses]);
    }

    async update(name, uses, date){

        const query = `UPDATE nstats_items SET uses=uses+?,
        first = IF(? < first, ?, IF(first = 0, ?, first)),
        last = IF(? > last, ?, last),
        matches=matches+1
        WHERE name=?`;

        return await simpleQuery(query, [uses, date, date, date, date, date, name]);
    }

    async updateTotals(item, uses, date){

        try{

            if(await this.exists(item)){
                await this.update(item, uses, date);
            }else{
                new Message(`Item ${item} does not exist, creating now.`,'note');
                await this.create(item, uses, date);
            }

        }catch(err){
            new Message(`Items.updateTotals ${err}`,'error');
        }
    }

    async insertPlayerMatchItem(matchId, playerId, item, uses){

        const query = "INSERT INTO nstats_items_match VALUES(NULL,?,?,?,?)";

        return await simpleQuery(query, [matchId, playerId, item, uses]);
    }

    async insertAllPlayerMatchItems(vars){

        const query = "INSERT INTO nstats_items_match (match_id,player_id,item,uses) VALUES ?";

        await bulkInsert(query, vars);
    }

    async playerTotalExists(playerId, item){

        const query = "SELECT COUNT(*) as total_items FROM nstats_items_player WHERE player=? AND item=?";

        const result = await simpleQuery(query, [playerId, item]);
        return result[0].total_items > 0;   
    }

    async insertPlayerTotal(playerId, item, uses, date){

        const query = "INSERT INTO nstats_items_player VALUES(NULL,?,?,?,?,?,1)";

        return await simpleQuery(query, [playerId, item, date, date, uses]);
    }

    async updatePlayerTotalQuery(playerId, item, uses, date){

 
        const query = `UPDATE nstats_items_player SET uses=uses+?,matches=matches+1,
        first = IF(? < first, ?, first),
        last = IF(? > last, ?, last)
        WHERE player=? AND item=?`;

        return await simpleQuery(query, [uses, date, date, date, date, playerId, item]);
    }

    async updatePlayerTotal(playerId, item, uses, date){

        try{

            if(await this.playerTotalExists(playerId, item)){

                await this.updatePlayerTotalQuery(playerId, item, uses, date);
            }else{

                await this.insertPlayerTotal(playerId, item, uses, date);
            }

        }catch(err){
            new Message(`items.updatePlayerTotals ${err}`,'error');
        }
    }

    async getPlayerTotalData(player){

        return await getPlayerTotalData(player);
    }


    async setPlayerMatchPickups(matchId, player, data){

        const query = `UPDATE nstats_player_matches SET 
            shield_belt=?,amp=?,amp_time=?,
            invisibility=?,invisibility_time=?,
            pads=?,armor=?,boots=?,super_health=?
            WHERE match_id=? AND player_id=?`;


        const vars = [
            data.belt ?? 0,
            data.amp ?? 0,
            data.ampStats.totalTime,
            data.invis ?? 0,
            data.invisStats.totalTime,
            data.pads ?? 0,
            data.armor ?? 0,
            data.boots ?? 0,
            data.super ?? 0,
            matchId,
            player
        ];


        return await simpleQuery(query, vars)

    }

    async updatePlayerBasicPickupData(player, data){

        const query = `UPDATE nstats_player_totals SET 
            shield_belt=shield_belt+?,
            amp=amp+?,
            amp_time=amp_time+?,

            invisibility=invisibility+?,
            invisibility_time=invisibility_time+?,
            pads=pads+?,armor=armor+?,boots=boots+?,super_health=super_health+? WHERE id=?`;

           
        const vars = [
            data.belt ?? 0,
            data.amp ?? 0,
            data.ampStats.totalTime,
            data.invis ?? 0,
            data.invisStats.totalTime,
            data.pads ?? 0,
            data.armor ?? 0,
            data.boots ?? 0,
            data.super ?? 0,
            player
        ];

        return await simpleQuery(query, vars);
    }


    async changePlayerIdsMatch(oldId, newId){

        await simpleQuery("UPDATE nstats_items_match SET player_id=? WHERE player_id=?", [newId, oldId]);
    }


    async createNewPlayerTotalFromMerge(player, item, first, last, uses, matches){

        const query = "INSERT INTO nstats_items_player VALUES(NULL,?,?,?,?,?,?)";
        const vars = [player, item, first, last, uses, matches];

        await simpleQuery(query, vars);
    }

    async mergePlayerTotals(oldId, newId){

        try{

            const oldData = await this.getPlayerTotalData(oldId);
            const newData = await this.getPlayerTotalData(newId);

            const mergedData = {};

            const merge = (array) =>{

                for(let i = 0; i < array.length; i++){

                    const d = array[i];
    
                    if(mergedData[d.item] === undefined){
                        mergedData[d.item] = d;
                    }else{
    
                        mergedData[d.item].uses += d.uses;
                        mergedData[d.item].matches += d.matches;
    
                        if(d.first < mergedData[d.item].first){
                            mergedData[d.item].first = d.first;
                        }
    
                        if(d.last > mergedData[d.item].last){
                            mergedData[d.item].last = d.last;
                        }
                    }
                }
            }

            merge(oldData);
            merge(newData);

            await deletePlayerTotals(oldId);
            await deletePlayerTotals(newId);

            for(const [key, value] of Object.entries(mergedData)){

                await this.createNewPlayerTotalFromMerge(newId, key, value.first, value.last, value.uses, value.matches);
            }


        }catch(err){
            console.trace(err);
        }
    }



    async getAllPlayerMatchData(playerId){

        return await simpleQuery("SELECT * FROM nstats_items_match WHERE player_id=?", [playerId]);
    }

    
    async deleteAllPlayerMatchData(player){

        await simpleQuery("DELETE FROM nstats_items_match WHERE player_id=?", [player]);
    }


    async getMatchesData(ids){

        if(ids.length === 0) return [];
        
        return await simpleQuery("SELECT * FROM nstats_items_match WHERE match_id IN (?)", [ids]);
    }


    async getAll(){

        return await simpleQuery("SELECT * FROM nstats_items ORDER BY name ASC");
    }

    async updateEntry(id, displayName, type){

        const query = "UPDATE nstats_items SET display_name=?,type=? WHERE id=?";
        const vars = [displayName, type, id];

        await simpleQuery(query, vars);
    }

    async adminUpdateEntries(data){

        try{

            let d = 0;

            for(let i = 0; i < data.length; i++){

                d = data[i];

                await this.updateEntry(d.id, d.display_name, d.type);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async updateMatchAmpKills(matchId, ampKills){

        const query = `UPDATE nstats_matches SET 
        amp_kills=?,
        amp_kills_team_0=?,
        amp_kills_team_1=?,
        amp_kills_team_2=?,
        amp_kills_team_3=? 
        WHERE id=?`;

        const vars = [
            ampKills.total,
            ampKills.red,
            ampKills.blue,
            ampKills.green,
            ampKills.yellow,
            matchId
        ];

        return await simpleQuery(query, vars);
    }

    async createMapItemsObject(uniqueItems){

        const namesToIds = {};

        for(const [key, value] of Object.entries(uniqueItems)){
            namesToIds[key] = await this.getMapItemId(key, value)
        }

        return namesToIds;
    }

    createMapItemsLocationInsertVars(namesToIds, locationData, mapId, matchId){

        const insertVars = [];

        for(let i = 0; i < locationData.length; i++){

            const d = locationData[i];
            const itemId = namesToIds[d.className] ?? -1;
            insertVars.push([mapId, matchId, itemId, d.name, d.location.x, d.location.y, d.location.z]);
        }

        return insertVars;
    }

    async updateMapItems(uniqueItems, locationData, mapId, matchId){

        const namesToIds = await this.createMapItemsObject(uniqueItems);

        const insertVars = this.createMapItemsLocationInsertVars(namesToIds, locationData, mapId, matchId);

        const query = `INSERT INTO nstats_map_items_locations (map_id, match_id, item_id, item_name, pos_x, pos_y, pos_z) VALUES ?`;
        await bulkInsert(query, insertVars);
    }

    async createMapItemId(item, type){

        const query = `INSERT INTO nstats_map_items VALUES(NULL,?,?,"","")`;

        const result = await simpleQuery(query, [item, type]);

        return result.insertId;
    }

    async getMapItemId(item, type){

        const query = `SELECT id FROM nstats_map_items WHERE item_class=? AND item_type=?`;

        const result = await simpleQuery(query, [item, type]);

        if(result.length > 0){
            return result[0].id;
        }

        return await this.createMapItemId(item, type);
    }
}


async function deletePlayerTotals(player){

    await simpleQuery("DELETE FROM nstats_items_player WHERE player=?", [player]);
}

export async function getMatchData(matchId){

    const query = "SELECT player_id,item,uses FROM nstats_items_match WHERE match_id=?";
    return await simpleQuery(query, [matchId]);

}


async function getPlayerMatchItemData(playerId, matchId){

    const query = "SELECT item,uses FROM nstats_items_match WHERE match_id=? AND player_id=?";
    return await simpleQuery(query, [matchId, playerId]);
}

async function reduceItemTotalsByPlayerMatchUse(item, uses){

    const query = "UPDATE nstats_items SET uses=uses-? WHERE id=?";

    return await simpleQuery(query, [uses, item]);
}

export async function deletePlayerMatchUses(playerId, matchId){

    const query = "DELETE FROM nstats_items_match WHERE player_id=? AND match_id=?";

    return await simpleQuery(query, [playerId, matchId]);
}

export async function deletePlayerFromMatch(playerId, matchId){

    try{

        const matchData = await getPlayerMatchItemData(playerId, matchId);

        if(matchData.length > 0){

            let m = 0;

            for(let i = 0; i < matchData.length; i++){

                m = matchData[i];

                await reduceItemPlayerTotal(m.item, playerId, m.uses);
                await reduceItemTotalsByPlayerMatchUse(m.item, m.uses);
                await deletePlayerMatchUses(playerId, matchId);

            }
        }
    }catch(err){
        console.trace(err);
    }   
}

export async function getMatchTotals(matchId){

    const query = "SELECT item,SUM(uses) as total_uses FROM nstats_items_match WHERE match_id=? GROUP BY item";
    const result =  await simpleQuery(query, [matchId]);

    const obj = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        obj[r.item] = r.total_uses;
    }

    return obj;
}

export function createPlayerItemUses(data){

    const players = {};

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(players[d.player_id] === undefined){
            players[d.player_id] = {};
        }

        const p = players[d.player_id];

        p[d.item] = d.uses;
    }

    return players;
}

export async function getIdsByNames(names){

    if(names.length === 0) return [];

    const query = "SELECT id,name,type FROM nstats_items WHERE name IN(?)";

    return await simpleQuery(query, [names]);
}

export async function getNamesByIds(ids, bReturnSimpleObject){

    if(ids.length === 0) return [];

    if(bReturnSimpleObject === undefined) bReturnSimpleObject = false;

    const query = "SELECT id,name,display_name,type FROM nstats_items WHERE id IN(?) ORDER BY name ASC";

    const result = await simpleQuery(query, [ids]);

    if(!bReturnSimpleObject){
        return result;
    }

    const obj = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        obj[r.id] = {
            "name": r.name,
            "displayName": r.display_name,
            "type": r.type
        };
    }

    return obj;
}

export async function getItemsById(itemIds){

    if(itemIds.length === 0) return null;

    const query = `SELECT id,name,display_name,type FROM nstats_items WHERE id IN(?)`;

    const result = await simpleQuery(query, [itemIds]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        data[r.id] = {"name": r.name, "displayName": r.display_name, "type": r.type};
    }

    return data;
}

export async function getPlayerMatchData(matchId, playerId){

    const query = "SELECT item,uses FROM nstats_items_match WHERE match_id=? AND player_id=?";

    const result = await simpleQuery(query, [matchId, playerId]);

    const itemIds = [...new Set(result.map((r) =>{
        return r.item;
    }))];

    const items = await getItemsById(itemIds);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        data[r.item] = r.uses;
        
    }
    

    return {"items": items, data};
}

async function getPlayerTotalData(player){

    const query = "SELECT item,first,last,uses,matches FROM nstats_items_player WHERE player=?";

    return await simpleQuery(query, [player]);
}


export async function getPlayerProfileData(player){

    const data = await getPlayerTotalData(player);

    const itemIds = new Set();

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        itemIds.add(d.item);
    }

    const items = await getItemsById([...itemIds]);

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        d.itemName = items[d.item]?.name ?? "Not Found";
        d.type = items[d.item]?.type ?? 0;
    }

    return data;
}

async function getAllIdsUsedInMatch(matchId){

    const query = `SELECT DISTINCT item FROM nstats_items_match WHERE match_id=?`;
    const result = await simpleQuery(query, [matchId]);

    return result.map((r) =>{
        return r.item;
    });
}


async function updateTotalsAfterRecalculate(data){

    const query = `UPDATE nstats_items SET first=?,last=?,uses=?,matches=? WHERE id=?`;


    for(const [weaponId, d] of Object.entries(data)){

        const vars = [
            toMysqlDate(d.minDate),
            toMysqlDate(d.maxDate),
            d.uses,
            d.matchIds.size,
            weaponId
        ];
        
        await simpleQuery(query, vars);
    }
    
}

async function recalculateMultipleTotals(itemIds){

    if(itemIds.length === 0) return;

    const query = `SELECT nstats_items_match.item,
    nstats_items_match.match_id,
    SUM(nstats_items_match.uses) as uses,
    MIN(nstats_matches.date) as match_date
    FROM nstats_items_match
    INNER JOIN nstats_matches ON nstats_items_match.match_id = nstats_matches.id
    WHERE item IN (?) GROUP BY nstats_items_match.item,nstats_items_match.match_id`;

    const result = await simpleQuery(query, [itemIds]);

    const totals = {};


    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(totals[r.item] === undefined){
            totals[r.item] = {
                "matchIds": new Set(),
                "uses": 0,
                "minDate": null,
                "maxDate": null
            };
        }

        const t = totals[r.item]
        t.matchIds.add(r.match_id);
        t.uses += parseInt(r.uses);

        if(t.minDate === null || t.minDate > r.match_date){
            t.minDate = r.match_date;
        }
        if(t.maxDate === null || t.maxDate < r.match_Date){
            t.maxDate = r.match_date;
        }
    }

    await updateTotalsAfterRecalculate(totals);

}


async function deleteMultiplePlayerItemTotals(itemIds, playerIds){

    const query = `DELETE FROM nstats_items_player WHERE item IN(?) AND player IN(?)`;

    return await simpleQuery(query, [itemIds, playerIds]);
}


async function bulkInsertPlayerItemTotals(data){

    const query = `INSERT INTO nstats_items_player (player,item,first,last,uses,matches) VALUES ?`;

    const insertVars = [];

    for(const [playerId, player] of Object.entries(data)){

        for(const [itemId, d] of Object.entries(player)){

            insertVars.push([
                playerId, itemId, d.minDate, d.maxDate, d.uses, d.matchIds.size
            ]);
        }
    }

    await bulkInsert(query, insertVars);
}

async function recalculateMultiplePlayerTotals(itemIds, playerIds){

    if(itemIds.length === 0) return;
    if(playerIds.length === 0) return;

    const query = `SELECT nstats_items_match.item,
    nstats_items_match.match_id,
    nstats_items_match.player_id,
    SUM(nstats_items_match.uses) as uses,
    MIN(nstats_matches.date) as match_date
    FROM nstats_items_match
    INNER JOIN nstats_matches ON nstats_items_match.match_id = nstats_matches.id
    WHERE item IN (?) AND player_id IN (?) GROUP BY nstats_items_match.player_id,nstats_items_match.item,nstats_items_match.match_id`;

    const result = await simpleQuery(query, [itemIds, playerIds]);

    const totals = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(totals[r.player_id] === undefined){
            totals[r.player_id] = {};
        }

        if(totals[r.player_id][r.item] === undefined){
            totals[r.player_id][r.item] = {
                "matchIds": new Set(),
                "uses": 0,
                "minDate": null,
                "maxDate": null
            };
        }

        const t = totals[r.player_id][r.item]
        t.matchIds.add(r.match_id);
        t.uses += parseInt(r.uses);

        if(t.minDate === null || t.minDate > r.match_date){
            t.minDate = r.match_date;
        }
        if(t.maxDate === null || t.maxDate < r.match_Date){
            t.maxDate = r.match_date;
        }

    }


    await deleteMultiplePlayerItemTotals(itemIds, playerIds);
    await bulkInsertPlayerItemTotals(totals);
}

export async function deleteMatchData(matchId, playerIds){

    const usedIds = await getAllIdsUsedInMatch(matchId);

    const query = `DELETE FROM nstats_items_match WHERE match_id=?`;

    await simpleQuery(query, [matchId]);

    await recalculateMultipleTotals(usedIds);
    await recalculateMultiplePlayerTotals(usedIds, playerIds);

}
