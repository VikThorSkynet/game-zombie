module.exports=async(page,assert,quality,releaseTag)=>{
    const result=await page.evaluate(async()=>{
        const q=qa,T=q.THREE,c={},one=()=>q.weapons.every((w,i)=>w.model.visible===(i===q.currentWeaponIndex));
        q.resetGame();c.initial=one();q.controls.isLocked=true;
        q.switchWeapon(1);q.updateWeapon(.1);const remaining=q.weaponSwitchTimer;
        q.controls.isLocked=false;q.updateWeapon(3);c.switchPause=q.weaponSwitchTimer===remaining&&q.currentWeaponIndex===0;
        q.controls.isLocked=true;q.updateWeapon(1);c.switchFinish=q.currentWeaponIndex===1&&!q.isSwitchingWeapon&&one();
        q.switchWeapon(0);q.applyDamage(9999);q.updateWeapon(3);c.deathStopsSwitch=q.currentWeaponIndex===1;
        q.resetGame();q.controls.isLocked=true;q.updateWeapon(.01);c.resetSwitch=one()&&q.currentWeaponIndex===0&&!q.isSwitchingWeapon;
        // Simulated active time cannot revive a switch from the previous run.
        q.updateWeapon(10);c.noOldSwitch=one()&&q.currentWeaponIndex===0;
        for(let i=0;i<5;i++){q.switchWeapon(1);q.updateWeapon(1);q.applyDamage(9999);q.resetGame();q.controls.isLocked=true;}
        c.repeatedReset=one()&&q.camera.children.filter(o=>o.name.startsWith('weapon-')).length===2;
        q.startWave(5);q.showWaveMessage('PERIGO',3);q.showWaveMessage('Bônus',0);
        c.priority=document.getElementById('waveMessage').textContent==='PERIGO';
        q.controls.isLocked=false;q.updateNotices(5);c.noticePause=document.getElementById('waveMessage').textContent==='PERIGO';
        q.controls.isLocked=true;q.updateNotices(2.3);c.delayedPriority=document.getElementById('waveMessage').textContent==='PERIGO';
        q.startWave(10);q.resetGame();q.controls.isLocked=true;q.updateNotices(2.3);
        c.noOldNotice=document.getElementById('waveMessage').textContent==='Onda 1';
        q.waveDirector.spawned=q.waveDirector.total;q.createZombie(new T.Vector3(0,0,-12));q.applyLegDamage(q.zombies[0],999);q.updateObjectiveHud();
        const hint=document.getElementById('last-enemy');c.lastEnemy=!hint.hidden&&hint.textContent.includes('rastejante')&&hint.textContent.includes('frente');
        q.killZombie(q.zombies[0],{awardScore:false,allowPowerup:false});q.updateObjectiveHud();c.hintClears=hint.hidden;
        q.resetGame();const g=q.generators[0];q.createZombie(g.position.clone());const z=q.zombies[0];
        c.recovery=q.recoverStuckZombie(z,q.camera.position)&&!q.isPositionBlocked(z.position.x,z.position.z,.65)&&q.findNavigationPath(z.position,q.camera.position,.65).length>0;
        q.resetGame();q.controls.isLocked=true;q.weapons[0].ammoInMag=1;q.startReload();c.reloadStarted=q.isReloading;
        q.camera.position.copy(q.generators[0].position).add(new T.Vector3(0,1.8,2));q.updateInteractables(0);
        c.blockedPrompt=document.getElementById('interactionPrompt').textContent.includes('RECARREGANDO');
        q.applyDamage(9999);q.resetGame();c.reloadReset=!q.isReloading&&one();
        q.controls.isLocked=true;q.armor.reserve=1;q.startArmorPlate();q.applyDamage(9999);q.resetGame();c.plateReset=!q.armor.plating&&one();
        q.controls.isLocked=true;q.meleeAttack();q.applyDamage(9999);q.resetGame();q.updateWeapon(0);c.meleeReset=one();
        q.controls.isLocked=true;q.score=5000;q.startPackAPunch();q.updateWeapon(.1);c.papHidden=q.weapons.every(w=>!w.model.visible);
        q.applyDamage(9999);q.resetGame();q.updateWeapon(1);c.papReset=one()&&!q.weapons[0].packapunched;
        q.controls.isLocked=false;return c;
    });
    assert(Object.values(result).every(Boolean),JSON.stringify({quality,polish:result}));console.log(JSON.stringify({quality,polish:result}));
    // Exercise the actual death menu and mouse recapture, rather than resetGame alone.
    await page.evaluate(()=>{qa.resetGame();qa.controls.isLocked=false;document.getElementById('overlay').style.display='flex';document.body.classList.add('menu-open');});
    await page.locator('#mainBtn').click();await page.waitForFunction(()=>qa.controls.isLocked);
    await page.evaluate(()=>qa.applyDamage(9999));
    await page.getByRole('button',{name:'Reiniciar',exact:true}).click();
    await page.waitForFunction(()=>qa.controls.isLocked&&!qa.gameOver);
    assert(await page.evaluate(()=>qa.weapons[0].model.visible&&!qa.weapons[1].model.visible&&document.pointerLockElement!==null),'actual restart button restores one gun and mouse capture');
    assert.equal(await page.locator('#damageText').evaluate(e=>getComputedStyle(e).opacity),'0','previous death damage indicator cleared');
    if(process.env.QA_SCREENSHOTS)await page.screenshot({path:require('node:path').join(process.env.QA_SCREENSHOTS,`${releaseTag}-restart-${quality}.png`)});
    await page.evaluate(()=>document.exitPointerLock());
    // Real dialog keyboard, cancel, confirmation and continued pointer lock.
    await page.evaluate(async()=>{
        const q=qa;q.resetGame();for(let i=0;i<3;i++)q.generatorNetwork.completed.add(i);q.generatorNetwork.openDoor();q.setContainmentDoor(true);
        q.waveDirector.phase='intermission';q.camera.position.set(0,1.8,143);q.controls.isLocked=true;await q.travelArea(q.areaPortals[0]);
        q.campaign.stage='choice';const n=q.campaignNodes.find(n=>n.userData.role==='core');q.camera.position.copy(n.position).add(new q.THREE.Vector3(0,1.8,1.6));q.controls.isLocked=true;q.interact();
    });
    for(const size of [{width:1280,height:720},{width:1920,height:1080}]){
        await page.setViewportSize(size);
        assert(await page.locator('#infinite-choice').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&e.scrollWidth<=e.clientWidth;}),'confirmation fits viewport');
        assert(await page.locator('#infinite-choice').evaluate(e=>{const r=e.getBoundingClientRect();return Math.abs(r.x+r.width/2-innerWidth/2)<2&&Math.abs(r.y+r.height/2-innerHeight/2)<2;}),'confirmation centered');
        if(process.env.QA_SCREENSHOTS)await page.screenshot({path:require('node:path').join(process.env.QA_SCREENSHOTS,`${releaseTag}-choice-${quality}-${size.height}.png`)});
    }
    await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>qa.campaign.stage),'choice');
    assert.equal(await page.locator('#infinite-choice').count(),0);
    await page.locator('#mainBtn').click();await page.waitForFunction(()=>qa.controls.isLocked);
    await page.keyboard.press('KeyE');await page.locator('#confirm-infinite').click();
    assert.equal(await page.evaluate(()=>qa.campaign.stage),'infinite');
    await page.locator('#mainBtn').click();await page.waitForFunction(()=>qa.controls.isLocked);
    await page.evaluate(()=>document.exitPointerLock());
    await page.evaluate(()=>{qa.resetGame();qa.controls.isLocked=false;});
    await page.setViewportSize({width:1440,height:960});
};
