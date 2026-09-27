module.exports=async(page,assert,quality)=>{
    const result=await page.evaluate(async()=>{
        const q=qa,T=q.THREE,out={spawnChecks:0,loadouts:[]};
        q.resetGame();q.controls.isLocked=true;
        for(const [x,z]of [[0,0],[140,140],[-140,-140],[140,-140],[-140,140]]){
            q.camera.position.set(x,1.8,z);
            for(let i=0;i<12;i++){
                const p=q.getSpawnPosition();
                if(p&&(p.distanceTo(q.camera.position)<20||q.isPositionBlocked(p.x,p.z,.9)||!q.findNavigationPath(p,q.camera.position,.65).length))throw Error('unsafe spawn');
                out.spawnChecks++;
            }
        }
        for(const wave of [1,5,20,100]){
            q.resetGame();q.startWave(wave);q.controls.isLocked=true;
            q.createCampaignEnemy(new T.Vector3(0,0,-1),true);
            const z=q.zombies.at(-1),d=z.userData,hp=q.health;
            if(d.attackDamage>21.75||d.maxHealth!==180||d.legMaxHealth!==72)throw Error('unbounded campaign threat');
            q.updateZombies(.5);if(q.health!==hp||d.arrivalGrace<=0)throw Error('arrival grace');
            const grace=d.arrivalGrace;q.controls.isLocked=false;q.updateZombies(2);if(d.arrivalGrace!==grace)throw Error('grace advanced paused');
        }
        for(const loadout of [{ids:['pistol','shotgun'],rarity:0,pap:false},{ids:['smg','sniper'],rarity:2,pap:true},{ids:['assault_rifle','ray_gun'],rarity:3,pap:true}]){
            q.resetGame();q.controls.isLocked=true;
            for(let i=0;i<3;i++)q.generatorNetwork.completed.add(i);q.generatorNetwork.openDoor();q.setContainmentDoor(true);
            q.waveDirector.phase='intermission';q.camera.position.set(0,1.8,143);await q.travelArea(q.areaPortals[0]);q.controls.isLocked=true;
            q.weapons.forEach((w,i)=>{w.configId=loadout.ids[i];w.rarity=loadout.rarity;w.packapunched=loadout.pap;});
            q.campaign.stage='ready';q.campaign.start(true);q.startCampaignBoss();
            // Controlled boss range: real rays and finite ammo, stationary safe aim.
            let shots=0,reloads=0,nominalSeconds=0;
            const boss=q.campaignBoss;
            for(let phase=1;phase<=3;phase++){
                q.switchWeapon(phase===2?1:0);q.updateWeaponSwitch(.5);
                q.camera.position.set(0,1.8,-8);q.updateCampaign(2);nominalSeconds+=2;
                const phaseStart=q.campaign.phase;
                let guard=0;
                while(q.campaign.stage==='boss'&&q.campaign.phase===phaseStart&&guard++<300){
                    const w=q.weapons[q.currentWeaponIndex],cfg=q.weaponConfigs[w.configId];
                    if(w.ammoInMag===0){q.startReload();q.finishReload();reloads++;nominalSeconds+=cfg.reloadDuration;}
                    if(w.ammoInMag===0)throw Error('loadout ammo exhausted');
                    w.ammoInMag--;shots++;nominalSeconds+=cfg.fireRate/1000;
                    q.camera.lookAt(0,1.65,-16);q.scene.updateMatrixWorld(true);
                    for(let p=0;p<cfg.pellets;p++){
                        if(cfg.id==='ray_gun')q.fireLaser(cfg.damageHead,cfg.damageBody,0,cfg.penetration);
                        else q.fireBullet(cfg.damageHead,cfg.damageBody,0,cfg.penetration,false,false);
                    }
                }
                if(guard>=300)throw Error('boss cannot progress');
                if(phase<3){
                    const reinforcements=q.zombies.filter(z=>z!==boss);
                    if(reinforcements.length!==4||reinforcements.some(z=>z.position.distanceTo(q.camera.position)<10))throw Error('unsafe reinforcement');
                    for(const z of reinforcements)q.killZombie(z,{awardScore:false,allowPowerup:false});
                }
            }
            if(q.campaign.stage!=='choice')throw Error('boss not defeated');
            out.loadouts.push({...loadout,shots,reloads,nominalSeconds:+nominalSeconds.toFixed(2)});
            // Extraction with same equipment and finite targets.
            q.updateCampaign(0);q.waveDirector.phase='intermission';q.camera.position.set(0,1.8,26);q.controls.isLocked=true;await q.travelArea(q.areaPortals[0]);q.controls.isLocked=true;
            const radio=q.campaignNodes.find(n=>n.userData.role==='extract');q.camera.position.copy(radio.position).add(new T.Vector3(0,1.8,1.6));q.interact();
            if(q.zombies.length!==6||q.campaign.stage!=='extracting')throw Error('extraction not finite');
            for(const z of [...q.zombies]){q.damageEnemy(z,180,'bullet');q.killZombie(z,{allowPowerup:false});}
            q.updateCampaign(15);if(q.campaign.stage!=='extracted')throw Error('extraction blocked');
        }
        // Ring phase leaves a safe centre, but moving into its annulus deals damage.
        q.resetGame();q.controls.isLocked=true;
        for(let i=0;i<3;i++)q.generatorNetwork.completed.add(i);q.generatorNetwork.openDoor();q.setContainmentDoor(true);
        q.waveDirector.phase='intermission';q.camera.position.set(0,1.8,143);await q.travelArea(q.areaPortals[0]);q.controls.isLocked=true;
        q.campaign.stage='ready';q.campaign.start(true);q.startCampaignBoss();q.campaign.phase=2;q.campaign.health=1600;
        q.camera.position.set(0,1.8,-8);q.updateCampaign(2);
        const health=q.health;q.updateCampaign(2);if(q.health!==health)throw Error('annulus centre damaged');
        q.updateCampaign(3);q.camera.position.x=4;q.updateCampaign(2);if(q.health!==health-26)throw Error('annulus danger missed');
        q.resetGame();q.controls.isLocked=false;return out;
    });
    assert.equal(result.spawnChecks,60);assert.equal(result.loadouts.length,3);
    console.log(JSON.stringify({quality,p4:result}));
    if(process.env.P4_WRITE_REPORT)require('node:fs').writeFileSync(require('node:path').join(__dirname,'../docs/measurements/p4-'+quality+'.json'),JSON.stringify({quality,kind:'controlled-integration-not-human-playtest',limitations:'Travel and generators advanced by test hooks. Boss uses stationary perfect body aim, alternates equipped slots per phase, no dodging cost, no live reinforcement combat. Nominal time is cadence plus reload plus shields, excluding weapon switch, not wall-clock time. Extraction enemies removed with fixed damage. Does not validate 90–180s target.',...result},null,2)+'\n');
    if(process.env.QA_SCREENSHOTS){
        const fs=require('node:fs'),path=require('node:path');fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});
        for(const phase of [1,2,3]){
            await page.evaluate(async phase=>{
                const q=qa;q.resetGame();q.controls.isLocked=true;
                for(let i=0;i<3;i++)q.generatorNetwork.completed.add(i);q.generatorNetwork.openDoor();q.setContainmentDoor(true);
                q.waveDirector.phase='intermission';q.camera.position.set(0,1.8,143);await q.travelArea(q.areaPortals[0]);q.controls.isLocked=true;
                q.campaign.stage='ready';q.campaign.start(true);q.startCampaignBoss();q.campaign.phase=phase;q.campaign.health=3200-phase*800;q.campaignBoss.userData.health=q.campaign.health;
                q.camera.position.set(0,1.8,-8);q.camera.lookAt(0,0,-10);q.updateCampaign(2);
                q.controls.dispatchEvent({type:'lock'});q.controls.isLocked=false;
                document.body.classList.remove('menu-open');document.getElementById('overlay').style.display='none';
                q.updateUI();q.controls.isLocked=true;q.renderScene();q.controls.isLocked=false;
            },phase);
            await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'v31-phase-'+phase+'-'+quality+'.png')});
        }
        await page.evaluate(()=>qa.resetGame());
    }
};
