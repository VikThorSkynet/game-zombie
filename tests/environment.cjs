const fs=require('node:fs'),path=require('node:path');
module.exports=async(page,assert,quality,release)=>{
    const root=path.join(__dirname,'../docs/measurements');
    const snapshots=[];
    await page.setViewportSize({width:1440,height:960});
    for(const sample of ['street','scope','installation']){
        const snapshot=await page.evaluate(async sample=>{
            const q=qa,T=q.THREE;q.resetGame();q.controls.dispatchEvent({type:'lock'});q.controls.isLocked=true;
            if(sample==='installation'){
                for(let n=0;n<3;n++)q.generatorNetwork.completed.add(n);
                q.generatorNetwork.openDoor();q.setContainmentDoor(true);q.waveDirector.phase='intermission';
                q.camera.position.set(0,1.8,143);if(!await q.travelArea(q.areaPortals[0]))throw Error('Travel failed');
                q.controls.isLocked=true;q.camera.position.set(4,1.8,21);q.camera.lookAt(0,1.5,-18);
                q.createZombie(new T.Vector3(0,0,9),q.zombieTypeConfigs.normal);
            }else{
                q.camera.position.set(0,1.8,0);q.camera.lookAt(0,1.6,sample==='scope'?-40:-8);
                q.createZombie(new T.Vector3(0,0,sample==='scope'?-40:-8),q.zombieTypeConfigs.normal);
            }
            q.updateWeapon(0);q.updateUI();q.controls.isLocked=false;
            if(sample==='scope'){
                q.camera.fov=21.7;q.camera.updateProjectionMatrix();q.flashlight.intensity=.45;
                q.weapons[0].model.visible=false;document.body.classList.add('scoped','aiming');
            }
            document.body.classList.remove('menu-open');document.getElementById('overlay').style.display='none';
            q.renderScene();
            const lights=[],textures=new Set();q.scene.traverse(o=>{if(o.isLight)lights.push({type:o.type,shadow:o.castShadow});
                for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])for(const v of Object.values(m))if(v?.isTexture)textures.add(v);});
            return {sample,colliders:q.staticColliders.map(c=>[c.minX,c.maxX,c.minZ,c.maxZ]),blockers:q.bulletBlockers.length,
                lights,textures:[...textures].filter(t=>t.userData.sharedSurface).map(t=>({width:t.image.width,height:t.image.height})),
                memory:{...q.renderer.info.memory},calls:q.renderer.info.render.calls,
                hitMeshes:q.zombies[0].userData.hitMeshes.length,exposure:q.renderer.toneMappingExposure};
        },sample);
        assert(snapshot.hitMeshes>0);assert(snapshot.textures.every(t=>t.width<=256&&t.height<=256));
        snapshots.push(snapshot);
        if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`${release}-${sample}-${quality}.png`)});}
    }
    const baseline=path.join(root,`p6-v32-${quality}.json`);
    if(release!=='v32'){
        const before=JSON.parse(fs.readFileSync(baseline));
        snapshots.forEach((s,i)=>{assert.deepEqual(s.colliders,before.snapshots[i].colliders,`${s.sample} collision layout`);
            assert.equal(s.blockers,before.snapshots[i].blockers,'bullet blockers');
            assert.deepEqual(s.lights,before.snapshots[i].lights,'no additional lights or shadows');
            assert.equal(s.hitMeshes,before.snapshots[i].hitMeshes,'hit meshes');});
    }
    fs.writeFileSync(path.join(root,`p6-${release}-${quality}.json`),JSON.stringify({release,quality,kind:'fixed-view-environment-audit',snapshots},null,2)+'\n');
    console.log(`P6 ${release} ${quality}: captures, textures, collision layout and light budget passed`);
};
