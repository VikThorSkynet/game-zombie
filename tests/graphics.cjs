module.exports=async(page,assert,quality)=>{
    const result=await page.evaluate(quality=>{
        const q=qa,T=q.THREE;const samples=[];
        q.resetGame();q.controls.dispatchEvent({type:'lock'});q.controls.isLocked=false;
        q.camera.position.set(0,1.8,0);q.camera.rotation.set(0,0,0);
        q.createZombie(new T.Vector3(0,0,-40));q.createZombie(new T.Vector3(3,0,-40));
        const z=q.zombies[0],other=q.zombies[1],hits=z.userData.hitMeshes;
        const geometry=hits.map(m=>m.geometry.uuid),transforms=hits.map(m=>[m.position.toArray(),m.scale.toArray()]);
        const shared=hits[0].geometry===other.userData.hitMeshes[0].geometry;
        q.updateEnemyDetail(q.camera);
        const far=z.userData.renderDetailFar&&z.userData.renderDetails.every(m=>!m.visible)&&hits.every(m=>m.visible);
        q.camera.fov=21.7;q.camera.updateProjectionMatrix();q.updateEnemyDetail(q.camera);
        const scope=!z.userData.renderDetailFar&&z.userData.renderDetails.every(m=>m.visible);
        const unchanged=JSON.stringify(hits.map(m=>m.geometry.uuid))===JSON.stringify(geometry)&&JSON.stringify(hits.map(m=>[m.position.toArray(),m.scale.toArray()]))===JSON.stringify(transforms);
        q.camera.fov=75;q.camera.updateProjectionMatrix();
        z.position.set(0,0,-(quality==='low'?17:23));q.updateEnemyDetail(q.camera);
        z.position.z=-(quality==='low'?15:21);q.updateEnemyDetail(q.camera);const hysteresis=z.userData.renderDetailFar;
        z.position.z=-8;q.updateEnemyDetail(q.camera);const near=!z.userData.renderDetailFar;
        // An actual ray still damages the far hit mesh with cosmetic details absent.
        z.position.set(0,0,-40);q.updateEnemyDetail(q.camera);z.userData.health=1e5;
        q.camera.lookAt(0,1.4,-40);q.scene.updateMatrixWorld(true);q.fireBullet(75,42,0,1,false,false);
        const hit=z.userData.health<1e5;
        q.applyLegDamage(z,99999);q.updateEnemyDetail(q.camera);const crawl=z.userData.legsDestroyed&&z.userData.legL.scale.y===.2;
        let disposed=0;const buffer=hits[0].geometry;buffer.addEventListener('dispose',()=>disposed++);
        q.killZombie(z,{awardScore:false,allowPowerup:false});q.renderScene();
        const ownership=disposed===0&&other.userData.hitMeshes[0].geometry===buffer;
        q.resetGame();
        for(let cycle=0;cycle<10;cycle++){
            q.resetGame();q.controls.isLocked=false;q.camera.position.set(0,1.8,0);q.camera.lookAt(0,1.8,-15);
            for(let i=0;i<8;i++)q.createZombie(new T.Vector3((i%4-1.5)*2,0,-9-Math.floor(i/4)*4));
            q.createDog(new T.Vector3(0,0,-6));q.renderScene();
            samples.push({...q.renderer.info.memory,cache:q.enemyGeometryCache.size});
        }
        // Types may vary; after warming all types, compare clean resets with identical content.
        const clean=[];
        for(let i=0;i<10;i++){q.resetGame();q.renderScene();clean.push({...q.renderer.info.memory,cache:q.enemyGeometryCache.size});}
        const stable=clean.every(m=>m.geometries===clean[0].geometries&&m.textures===clean[0].textures&&m.cache<=64);
        return {shared,far,scope,unchanged,hysteresis,near,hit,crawl,ownership,stable,samples,clean};
    },quality);
    for(const k of ['shared','far','scope','unchanged','hysteresis','near','hit','crawl','ownership','stable'])assert(result[k],'graphics '+quality+' '+k);
    console.log(JSON.stringify({quality,graphics:result}));
    if(process.env.P5_WRITE_REPORT)require('node:fs').writeFileSync(require('node:path').join(__dirname,'../docs/measurements/p5-audit-'+quality+'.json'),JSON.stringify({quality,kind:'resource-and-hitbox-regression',...result},null,2)+'\n');
    if(process.env.QA_SCREENSHOTS){
        const fs=require('node:fs'),path=require('node:path');fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});
        for(const sample of ['street-near','street-far','street-scope','installation']){
            await page.evaluate(async sample=>{
                const q=qa,T=q.THREE;q.resetGame();q.controls.dispatchEvent({type:'lock'});q.controls.isLocked=true;
                if(sample==='installation'){
                    for(let n=0;n<3;n++)q.generatorNetwork.completed.add(n);q.generatorNetwork.openDoor();q.setContainmentDoor(true);
                    q.waveDirector.phase='intermission';q.camera.position.set(0,1.8,143);await q.travelArea(q.areaPortals[0]);q.controls.isLocked=true;
                    q.camera.position.set(4,1.8,21);q.camera.lookAt(0,1.5,-18);
                }else{
                    const distance=sample==='street-near'?5:40;
                    q.camera.position.set(0,1.8,0);q.camera.lookAt(0,1.7,-distance);q.createZombie(new T.Vector3(0,0,-distance));
                    if(sample==='street-scope'){q.camera.fov=21.7;q.camera.updateProjectionMatrix();}
                }
                q.updateWeapon(0);q.updateUI();q.controls.isLocked=false;
                document.body.classList.remove('menu-open');document.getElementById('overlay').style.display='none';q.renderScene();
            },sample);
            await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'v32-'+sample+'-'+quality+'.png')});
        }
        await page.evaluate(()=>qa.resetGame());
    }
};
