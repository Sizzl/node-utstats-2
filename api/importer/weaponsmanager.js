const Weapons = require('../weapons');
const Message = require('../message');

class WeaponsManager{

    constructor(){

        this.weapons = new Weapons();
        this.data = [];
        this.names = [];

        this.currentWeapons = new Map();

    }

    parseData(){

        //console.log(this.data);

        const nameReg = /^\d+\.\d+\tweap_.+?\t(.+?)\t.+$/i;


        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            if(nameReg.test(d)){

                const result = nameReg.exec(d);

                if(this.names.indexOf(result[1]) === -1){
                    this.names.push(result[1]);
                }
            }
        }
    }

    addKillNames(names){

        for(let i = 0; i < names.length; i++){

            if(this.names.indexOf(names[i]) === -1){
                this.names.push(names[i]);
            }
        }
    }

    async update(playerManager){

        try{

            await this.weapons.getIdsByName(this.names);

            for(let i = 0; i < playerManager.players.length; i++){

                const p = playerManager.players[i];
                
                const playtime = p.getTotalPlaytime(playerManager.totalTeams);

                for(const [key, value] of p.weaponStats.entries()){
   
                    const currentWeaponId = this.weapons.getSavedWeaponByName(key);
                    
                    if(currentWeaponId !== null){      

                        await this.weapons.insertPlayerMatchStats(this.matchId, this.mapId, this.gametypeId, p.masterId, currentWeaponId, value);
                        await this.weapons.updatePlayerTotalStats(this.mapId, this.gametypeId, p.masterId, playtime, currentWeaponId, value); 
                        await this.weapons.updatePlayerBest(p.masterId, this.mapId, this.gametypeId, currentWeaponId, value);
                     

                        if(this.currentWeapons.has(currentWeaponId)){

                            const currentWeapon = this.currentWeapons.get(currentWeaponId);
    
                            currentWeapon.kills += value.kills;
                            currentWeapon.deaths += value.deaths;
                            currentWeapon.shots += value.shots;
                            currentWeapon.hits += value.hits;
                            currentWeapon.damage += Math.abs(value.damage);
                            currentWeapon.teamKills += value.teamKills;
                            currentWeapon.suicides += value.suicides;

                            this.currentWeapons.set(currentWeaponId, currentWeapon);
    
                        }else{
                            this.currentWeapons.set(currentWeaponId, value);
                        }
                    

                    }else{
                        new Message(`currentWeaponId is null for ${key}`,'warning');
                    }
                }
            }
            
            for(const [key, value] of this.currentWeapons){

                await this.weapons.update(key, value.kills, value.deaths, value.shots, value.hits, value.damage);
            }

        }catch(err){
            new Message(`weaponsmanager update ${err}`,'error');
        }
    }
}

module.exports = WeaponsManager;