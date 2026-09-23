module.exports = async function testProgression(page, assert, quality) {
    const result = await page.evaluate(() => {
        const q=qa,T=q.THREE;
        const check={};
        q.resetGame();q.controls.isLocked=true;
        const plateStation=q.upgradeStations.find(s=>s.userData.kind==='armor');
        const bench=q.upgradeStations.find(s=>s.userData.kind==='arsenal');
        check.stations=q.upgradeStations.length===2&&q.upgradeStations.every(s=>q.findNavigationPath(new T.Vector3(),s.position.clone().add(new T.Vector3(0,0,2)),0.65).length>0);
        const approach=s=>q.camera.position.copy(s.position).add(new T.Vector3(0,1.8,2));
        approach(plateStation);q.score=149;q.interactSupply(plateStation);
        check.insufficient=q.score===149&&q.armor.reserve===0;
        q.score=600;document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'}));
        check.purchase=q.score===450&&q.armor.reserve===1;
        q.weapons[0].ammoInMag--;const ammo=q.weapons[0].ammoInMag;
        document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyF'}));
        const plating=q.armor.plating;
        q.shoot();q.startReload();q.meleeAttack();q.switchWeapon(1);q.startPackAPunch();q.interactSupply(plateStation);
        check.actionGuards=plating&&q.weapons.every(w=>!w.model.visible)&&q.weapons[0].ammoInMag===ammo&&!q.isReloading&&q.currentWeaponIndex===0&&q.score===450&&q.armor.reserve===1;
        q.updateArmorPlate(.5);q.controls.isLocked=false;const timer=q.armor.remaining;
        q.updateArmorPlate(100);document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyG'}));
        check.pause=q.armor.remaining===timer&&q.armor.protection===0&&q.armor.tier===1;
        q.controls.isLocked=true;q.updateArmorPlate(1);
        check.equipped=q.armor.protection===50&&q.armor.reserve===0&&!q.armor.plating;
        q.applyDamage(50);check.absorption=q.health===80&&q.armor.protection===20;
        q.applyDamage(50);check.break=q.health===50&&q.armor.protection===0&&document.getElementById('combat-feedback').textContent==='PLACA QUEBRADA';
        q.score=9999;
        document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyG'}));
        document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyG'}));
        document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyG'}));
        check.capacity=q.armor.tier===3&&q.armor.protection===0&&q.score===5499;
        for(let i=0;i<6;i++)q.interactSupply(plateStation);
        check.reserveCap=q.armor.reserve===5&&q.score===4749;
        approach(bench);q.scrap.amount=1200;
        for(let i=0;i<5;i++)q.interactSupply(bench);
        const weapon=q.weapons[0];check.rarity=weapon.rarity===4&&q.scrap.amount===0;
        q.score=5000;q.startPackAPunch();q.finishPackAPunch();
        check.pack=weapon.packapunched&&weapon.rarity===4&&q.weaponMultiplier(weapon)===5.75&&q.score===0;
        weapon.configId='ray_gun';q.scrap.amount=1000;q.interactSupply(bench);
        check.special=q.scrap.amount===1000&&q.weaponMultiplier(weapon)===2.5;
        q.resetGame();q.controls.isLocked=true;q.camera.position.set(0,1.8,0);
        q.createZombie(new T.Vector3(0,0,-5),q.zombieTypeConfigs.normal);
        const target=q.zombies.at(-1);target.userData.health=10000;
        q.weapons[0].rarity=2;q.weapons[0].packapunched=true;
        q.scene.updateMatrixWorld(true);const aim=target.userData.head.getWorldPosition(new T.Vector3());
        q.camera.lookAt(aim);q.camera.updateMatrixWorld(true);
        const hits=[];const off=q.gameEvents.on('enemyDamaged',e=>hits.push(e));
        q.fireBullet(75,42,0,1,false,false);q.fireLaser(75,42,0,1);
        off();check.damage=hits.length===2&&hits.every(h=>Math.abs(h.amount-(h.headshot?75:42)*1.55*2.5)<1e-7);
        const kills=[];const offKill=q.gameEvents.on('enemyKilled',e=>kills.push(e));
        q.killZombie(target,{cause:'bullet',headshot:true,allowPowerup:false});q.killZombie(target,{cause:'bullet',headshot:true});
        check.reward=q.score===125&&q.scrap.amount===3&&kills.length===1;offKill();
        q.applyPowerup('double_points');q.createZombie(new T.Vector3(0,0,-5),q.zombieTypeConfigs.normal);
        q.killZombie(q.zombies.at(-1),{cause:'melee',headshot:true,allowPowerup:false});
        check.double=q.score===375&&q.scrap.amount===6;
        const scrapBefore=q.scrap.amount;
        q.createZombie(new T.Vector3(0,0,-6),q.zombieTypeConfigs.normal);q.applyPowerup('nuke');
        check.nuke=q.score===1175&&q.scrap.amount===scrapBefore;
        // Normal mystery box and Fire Sale must replace rarity as well as weapon/PaP.
        q.resetGame();q.controls.isLocked=true;q.startWave(15);q.score=2000;
        const originalRandom=Math.random;
        try {
            Math.random=()=>.8;
            q.camera.position.copy(q.mysteryBox.position).add(new T.Vector3(0,1.8,3));
            q.interact();q.updateInteractables(4);q.interact();
            check.normalBox=q.weapons[0].configId==='assault_rifle'&&q.weapons[0].rarity===3&&!q.weapons[0].packapunched;
            q.applyPowerup('fire_sale');const box=q.saleBoxes[0];q.interactSupply(box);q.updateSaleBoxes(3.1);
            q.weapons[0].rarity=4;q.weapons[0].packapunched=true;
            Math.random=()=>0;
            q.interactSupply(box);
            check.saleBox=q.weapons[0].rarity===3&&!q.weapons[0].packapunched;
        } finally { Math.random=originalRandom; }
        q.armor.buyPlate(150);q.startArmorPlate();q.applyDamage(10000);
        check.death=!q.armor.plating;
        q.resetGame();q.controls.isLocked=false;
        check.reset=q.armor.tier===1&&q.armor.reserve===0&&q.armor.protection===0&&q.scrap.amount===0
            &&q.weapons.every(w=>w.rarity===0&&!w.packapunched);
        return check;
    });
    assert(Object.values(result).every(Boolean),JSON.stringify({quality,progression:result}));
    console.log(JSON.stringify({quality,progression:result}));
    if (process.env.QA_SCREENSHOTS) {
        const path=require('node:path');
        for(const kind of ['armor','arsenal']){
            await page.evaluate(kind=>{
                const q=qa,T=q.THREE;q.resetGame();q.controls.isLocked=true;
                const station=q.upgradeStations.find(s=>s.userData.kind===kind);
                q.camera.position.copy(station.position).add(new T.Vector3(0,1.8,2.7));
                q.camera.lookAt(station.position.clone().add(new T.Vector3(0,1.25,0)));
                q.score=2400;q.scrap.amount=240;q.weapons[0].rarity=2;
                q.armor.upgrade(1500);q.armor.protection=64;q.armor.buyPlate(150);
                q.updateWeapon(1/60);q.updateUI();q.updateInteractables(0);q.controls.isLocked=false;
                document.body.classList.remove('menu-open');document.getElementById('overlay').style.display='none';q.renderScene();
            },kind);
            await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`v19-${kind}-${quality}.png`)});
        }
        await page.evaluate(()=>{
            qa.controls.isLocked=true;qa.startArmorPlate();qa.updateArmorPlate(.6);qa.updateUI();qa.updateInteractables(0);qa.controls.isLocked=false;qa.renderScene();
        });
        await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`v19-plating-${quality}.png`)});
        await page.evaluate(()=>{qa.resetGame();document.body.classList.add('menu-open');document.getElementById('overlay').style.display='flex';});
    }
};
