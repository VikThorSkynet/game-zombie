module.exports=async function(page,assert,quality,releaseTag) {
    const result=await page.evaluate(quality=>{
        const q=qa,T=q.THREE,c={};const reset=()=>{q.resetGame();q.controls.isLocked=true;q.camera.position.set(0,1.8,0);q.camera.rotation.set(0,0,0);};
        reset();q.startWave(5);
        c.profile=q.waveDirector.profile.kind==='dogs'&&q.waveDirector.total===6&&q.waveDirector.maxActive===4;
        for(let i=0;i<20;i++)q.updateWave(1);
        c.cap=q.zombies.length===4&&q.waveDirector.spawned===4&&q.zombies.every(z=>z.userData.isDog&&z.userData.maxHealth===q.enemyHealth(5,q.BALANCE.dogs.healthMultiplier));
        c.model=q.zombies.every(z=>z.userData.legs.length===4&&z.userData.hitMeshes.every(m=>m.userData.parentZombie===z));
        const g=q.generators[0];q.camera.position.copy(g.position).add(new T.Vector3(0,1.8,2));q.interact();c.noOverlap=!q.generatorNetwork.active;
        let rewards=0;const off=q.gameEvents.on('dogRoundReward',()=>rewards++);
        for(const z of [...q.zombies])q.killZombie(z,{allowPowerup:false});
        c.noEarlyReward=q.powerups.length===0;
        for(let i=0;i<20;i++)q.updateWave(1);
        const last=q.zombies.at(-1);q.applyPowerup('nuke');q.killZombie(last);
        c.reward=rewards===1&&q.powerups.filter(p=>p.userData.type==='max_ammo').length===1;
        q.updateWave(0);q.updateWave(1);c.complete=q.waveDirector.phase==='intermission'&&rewards===1;
        q.weapons.forEach(w=>{w.ammoInMag=0;w.reserveAmmo=0;});q.applyPowerup('max_ammo');c.refill=q.weapons.every(w=>w.ammoInMag>0&&w.reserveAmmo>0);off();
        reset();q.startWave(8);const baseCap=quality==='low'?24:32;
        c.fogCap=q.waveDirector.profile.kind==='fog'&&q.waveDirector.maxActive<baseCap;
        c.noShooters=Array.from({length:500},()=>q.getZombieTypeConfig()).every(t=>!t.isShooter&&!t.isDog);
        q.updateRoundAtmosphere(1);c.fade=q.scene.fog.density>.006&&q.scene.fog.density<.05;
        const fog=q.scene.fog.density;q.controls.isLocked=false;q.updateRoundAtmosphere(10);c.fogPause=q.scene.fog.density===fog;
        q.controls.isLocked=true;q.updateRoundAtmosphere(10);c.dense=q.scene.fog.density===.05;
        q.startWave(9);q.updateRoundAtmosphere(10);c.restore=q.scene.fog.density===.006&&q.waveDirector.maxActive===baseCap;
        // Actual bite: warning, no immediate damage, single hit and recovery.
        reset();q.startWave(5);let dog=q.createDog(new T.Vector3(0,0,-3));q.updateZombies(.01);q.updateRoundAtmosphere(0);
        c.warning=dog.userData.attack.phase==='windup'&&!document.getElementById('dog-warning').hidden&&q.health===100;
        q.controls.isLocked=false;const timer=dog.userData.attack.remaining;q.updateZombies(1);c.attackPause=dog.userData.attack.remaining===timer;
        q.controls.isLocked=true;
        for(let i=0;i<30;i++)q.updateZombies(.05);
        c.oneBite=Math.abs(q.health-(100-dog.userData.attackDamage))<1e-8&&dog.userData.attack.phase==='recover';
        reset();q.startWave(5);dog=q.createDog(new T.Vector3(0,0,-3));q.updateZombies(.01);q.camera.position.x=4;
        for(let i=0;i<30;i++)q.updateZombies(.05);c.dodge=q.health===100;
        reset();q.startWave(5);const barrier=q.generators[0];q.camera.position.copy(barrier.position).add(new T.Vector3(0,1.8,2));
        dog=q.createDog(barrier.position.clone().add(new T.Vector3(0,0,-2)));q.updateZombies(.01);
        c.wallWarning=dog.userData.attack.phase==='pursue';
        dog.userData.attack.phase='lunge';dog.userData.attack.remaining=.35;dog.userData.lungeDirection.set(0,0,1);
        for(let i=0;i<7;i++)q.updateZombies(.05);
        c.wallBite=q.health===100&&dog.position.z<barrier.position.z-.8&&dog.userData.attack.phase==='recover';
        reset();q.startWave(5);dog=q.createDog(new T.Vector3(0,0,-3));q.armor.protection=50;
        for(let i=0;i<30;i++)q.updateZombies(.05);
        c.armor=q.armor.protection<50&&q.health>100-dog.userData.attackDamage;
        // Dog hitboxes participate in both real raycasters. Torso is not classified as a human leg.
        reset();q.startWave(5);dog=q.createDog(new T.Vector3(0,0,-4));q.camera.position.set(0,1.04,0);
        q.camera.lookAt(0,1.04,-3.1);q.scene.updateMatrixWorld(true);const hp=dog.userData.health;
        q.fireBullet(10,7,0,1,false,false);c.bullet=dog.userData.health<hp&&dog.userData.legHealth===dog.userData.legMaxHealth;
        const hit=dog.userData.health;q.fireLaser(10,7,0,1);c.laser=dog.userData.health<hit;
        q.camera.position.set(3,.78,-4);q.camera.lookAt(0,.78,-4);q.camera.updateMatrixWorld(true);
        const bodyHp=dog.userData.health;q.fireBullet(10,7,0,1,false,false);
        c.torso=dog.userData.health===bodyHp-7&&dog.userData.legHealth===dog.userData.legMaxHealth;
        dog.userData.attack.phase='windup';dog.userData.meleeStagger=.22;q.updateZombies(.05);c.stagger=dog.userData.attack.phase==='recover';
        q.applyLegDamage(dog,999);c.legs=dog.userData.legsDestroyed&&dog.position.y===0&&dog.userData.legs.length===4;
        q.camera.position.set(0,1.8,-2);q.camera.lookAt(0,1,-4);q.meleeAttack();c.melee=!q.zombies.includes(dog);
        reset();q.startWave(8);q.updateRoundAtmosphere(3);q.applyDamage(10000);const density=q.scene.fog.density;q.updateRoundAtmosphere(10);c.death=q.scene.fog.density===density;
        for(let i=0;i<3;i++){q.resetGame();q.createDog(new T.Vector3(0,0,-3));}
        q.resetGame();c.reset=q.zombies.length===0&&q.zombieHitMeshes.length===0&&q.scene.fog.density===.006&&q.waveDirector.profile.kind==='normal';q.controls.isLocked=false;
        return c;
    },quality);
    assert(Object.values(result).every(Boolean),JSON.stringify({quality,special:result}));console.log(JSON.stringify({quality,special:result}));
    if(process.env.QA_SCREENSHOTS) {
        const path=require('node:path');
        for(const view of ['dog','fog']) {
            await page.evaluate(view=>{
                const q=qa,T=q.THREE;q.resetGame();q.controls.isLocked=true;q.startWave(view==='dog'?5:8);
                q.camera.position.set(0,1.8,0);q.camera.rotation.set(0,0,0);
                if(view==='dog'){q.createDog(new T.Vector3(0,0,-3.5));q.updateZombies(.01);q.camera.position.set(2,1.8,0);q.camera.lookAt(0,.8,-3.5);}
                else {for(const z of [-12,-22,-32])q.createZombie(new T.Vector3(2,0,z),q.zombieTypeConfigs.normal);q.updateRoundAtmosphere(10);}
                q.updateRoundAtmosphere(0);q.updateUI();q.updateWeapon(1/60);q.controls.isLocked=false;
                document.body.classList.remove('menu-open');document.getElementById('overlay').style.display='none';q.renderScene();
            },view);
            await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`${releaseTag}-${view}-${quality}.png`)});
        }
        await page.evaluate(()=>qa.resetGame());
    }
};
