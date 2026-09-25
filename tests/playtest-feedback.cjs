// Controlled regression of the reported route; not a human completion-time measurement.
module.exports=async function(page,assert,quality,releaseTag){
    const result=await page.evaluate(async()=>{
        const q=qa,T=q.THREE,c={};q.resetGame();q.controls.isLocked=true;
        const near=n=>q.camera.position.copy(n.position).add(new T.Vector3(0,1.8,n.userData.kind==='generator'?2:1.6));
        const press=()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'}));
        const clear=()=>{for(const z of [...q.zombies])q.killZombie(z,{awardScore:false,allowPowerup:false});};
        q.startWave(1);near(q.generators[0]);q.createZombie(q.camera.position.clone().add(new T.Vector3(0,-1.8,8)));
        q.applyLegDamage(q.zombies[0],999);press();
        c.crawlerBlocks=!q.generatorNetwork.active&&q.supplyPrompt(q.generators[0]).includes('rastejantes');
        clear();q.waveDirector.spawned=q.waveDirector.total;q.updateWave(0);press();
        c.afterClear=q.generatorNetwork.active?.wave===1;
        const types=new Set();for(let i=0;i<100&&q.generatorNetwork.active;i++){
            q.updateContainment(1);for(const z of q.zombies)types.add(z.userData.typeName);clear();
        }
        c.mixedDefense=types.has('Cão')&&types.has('Corredor')&&types.has('Normal');
        near(q.generators[1]);press();c.onePerWave=!q.generatorNetwork.active&&q.supplyPrompt(q.generators[1]).includes('próxima onda');
        // Isolate the reported gate / file / radio / door route from defense duration.
        for(let i=0;i<3;i++)q.generatorNetwork.completed.add(i);q.generatorNetwork.openDoor();q.setContainmentDoor(true);
        for(const n of q.campaignNodes.filter(n=>n.userData.role==='record')){near(n);press();}
        c.records=q.campaign.records.size===3&&q.campaign.stage==='parts';
        c.collected=q.campaignNodes.filter(n=>n.userData.role==='record').every(n=>n.visible&&n.userData.check.visible&&q.campaignPrompt(n).includes('COLETADO'));
        const radio=q.campaignNodes.find(n=>n.userData.role==='extract');near(radio);press();
        c.radio=q.campaignPrompt(radio).includes('confirmados 3/3')&&q.campaignPrompt(radio).includes('INSTALAÇÃO');
        q.createZombie(new T.Vector3(0,0,130));q.applyLegDamage(q.zombies[0],999);
        q.camera.position.set(0,1.8,143);press();c.doorExplains=!q.areaRuntime.loading&&q.travelReason().includes('rastejantes');
        clear();q.waveDirector.phase='intermission';q.waveDirector.remaining=1;
        q.updateWave(30);c.intervalHeld=q.waveDirector.phase==='intermission'&&q.waveDirector.remaining===1&&q.waveDirector.advanceHolds.has('interaction');
        press();c.keyboardTravel=q.areaRuntime.loading;
        while(q.areaRuntime.loading)await new Promise(resolve=>requestAnimationFrame(resolve));
        c.entered=q.areaRuntime.active==='installation'&&q.campaign.records.size===3;
        q.controls.isLocked=true;q.camera.position.set(0,1.8,10);q.updateWave(0);
        c.intervalReleased=!q.waveDirector.advanceHolds.has('interaction');
        q.resetGame();c.resetMarks=q.campaignNodes.filter(n=>n.userData.check).every(n=>!n.userData.check.visible);
        q.controls.isLocked=true;q.camera.position.set(0,1.8,0);q.camera.lookAt(0,1.8,-10);
        q.fireLaser(10,7,0,1);const tracer=q.tracers.at(-1);
        c.rayCreation=tracer.laser&&tracer.impactLight.intensity<=1.1&&tracer.glowTrail.material.opacity<=.28&&tracer.flash.geometry.parameters.radius===.12;
        q.updateTracers(.01);c.rayFade=tracer.impactLight.intensity<=1.1&&tracer.glowTrail.material.opacity<=.28&&tracer.flash.material.opacity<=.45;
        const model=q.createPaPWeaponModel(q.weaponConfigs.ray_gun);let luminous=0,maxGlow=0;
        model.traverse(o=>{if(o.material?.emissive){luminous++;maxGlow=Math.max(maxGlow,o.material.emissiveIntensity);}});
        c.pap=luminous>0&&maxGlow<=.28;
        const w=q.weapons[0],originalModel=w.model,originalId=w.configId;w.model=model;w.configId='ray_gun';q.updatePaPWeaponEffects(1);
        maxGlow=0;model.traverse(o=>{if(o.material?.emissive&&!o.userData.keepOptic)maxGlow=Math.max(maxGlow,o.material.emissiveIntensity);});c.papPulse=maxGlow<=.3;
        w.model=originalModel;w.configId=originalId;model.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
        q.resetGame();q.controls.isLocked=false;
        c.surfaceCache=q.surfaceMaps.cache.size===6&&[...q.surfaceMaps.cache.values()].every(v=>v.map.userData.sharedSurface&&v.bump.userData.sharedSurface);
        const textures=[];for(let i=0;i<4;i++){q.resetGame();q.controls.isLocked=false;q.camera.position.set(0,1.8,0);q.camera.lookAt(0,1.8,-10);q.renderScene();textures.push(q.renderer.info.memory.textures);}
        c.restartTextures=textures.slice(1).every(n=>n===textures[0]);
        return c;
    });
    assert(Object.values(result).every(Boolean),JSON.stringify({quality,playtestFeedback:result}));
    console.log(JSON.stringify({quality,playtestFeedback:result}));
};
