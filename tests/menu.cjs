// Real menu interaction plus idle invariants; no simulation is run for the backdrop.
module.exports=async(page,assert,quality,releaseTag)=>{
    const fs=require('node:fs'),path=require('node:path');
    for(const [width,height] of [[1280,720],[1920,1080],[390,844]]){
        await page.setViewportSize({width,height});
        await page.waitForFunction(()=>document.querySelector('canvas')?.clientWidth===innerWidth);
        await page.getByRole('button',{name:'JOGAR',exact:true}).waitFor();
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
        for(const name of ['JOGAR','OPÇÕES','COMO JOGAR','CRÉDITOS']){
            const box=await page.getByRole('button',{name,exact:true}).boundingBox();
            assert(box.x>=0&&box.y>=0&&box.x+box.width<=width&&box.y+box.height<=height,'visible '+name);
        }
        if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,releaseTag+'-title-'+quality+'-'+height+'.png')});}
        await page.getByRole('button',{name:'OPÇÕES',exact:true}).focus();
        await page.keyboard.press('Enter');
        await page.getByRole('dialog',{name:'Opções',exact:true}).waitFor();
        await page.locator('#volume').fill('0');
        await page.locator('#reduced-motion').check();
        await page.locator('#quality-select').selectOption(quality==='low'?'high':'low');
        assert(await page.getByRole('button',{name:'APLICAR E REINICIAR'}).isVisible());
        assert(new URL(page.url()).searchParams.get('quality')===quality,'quality selection alone does not discard run');
        for(let i=0;i<9;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>!!document.activeElement.closest('dialog')),'focus stays in dialog');}
        if(process.env.QA_SCREENSHOTS)await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,releaseTag+'-options-'+quality+'-'+height+'.png')});
        await page.keyboard.press('Escape');
        await page.waitForFunction(()=>!document.querySelector('dialog'));
        assert.equal(await page.evaluate(()=>document.activeElement.textContent),'OPÇÕES');
        assert.equal(await page.locator('dialog').count(),0);
        for(const name of ['COMO JOGAR','CRÉDITOS']){
            await page.getByRole('button',{name,exact:true}).click();
            await page.keyboard.press('KeyJ');
            assert.equal(await page.locator('#field-journal').count(),0,'J cannot open nested journal');
            await page.keyboard.press('Escape');
            await page.waitForFunction(()=>!document.querySelector('dialog'));
        }
    }
    await page.setViewportSize({width:1280,height:720});
    await page.waitForTimeout(200);
    const before=await page.evaluate(()=>{
        window.menuRenders=0;const render=qa.renderer.render.bind(qa.renderer);qa.renderer.render=(...args)=>{window.menuRenders++;return render(...args);};
        return JSON.stringify({stats:qa.runStats,wave:qa.waveDirector.wave,positions:qa.zombies.map(z=>z.position.toArray()),camera:qa.camera.position.toArray(),generators:qa.generatorNetwork.completed.size});
    });
    await page.waitForTimeout(1200);
    const after=await page.evaluate(()=>({state:JSON.stringify({stats:qa.runStats,wave:qa.waveDirector.wave,positions:qa.zombies.map(z=>z.position.toArray()),camera:qa.camera.position.toArray(),generators:qa.generatorNetwork.completed.size}),renders:window.menuRenders,volume:qa.settings.volume,reduced:qa.settings.reducedMotion}));
    assert.equal(after.state,before,'menu cannot advance the run or move the player');
    assert.equal(after.renders,0,'static menu performs no idle WebGL renders');
    assert.equal(after.volume,0);assert(after.reduced);
    assert(await page.evaluate(async()=>{
        await qa.loadAudioAsset('melee');
        qa.playAudioElementAsset('melee');
        const sounds=[...qa.activeAudioElements];
        const silent=sounds.length>0&&sounds.every(a=>a.volume===0);
        qa.settings.volume=.5;qa.applySettings();
        const audible=sounds.every(a=>a.volume===a.gameBaseVolume*.5);
        qa.settings.volume=0;qa.applySettings();
        return silent&&audible&&sounds.every(a=>a.volume===0);
    }),'native MP3 fallback obeys mute and changes while playing');
    await page.getByRole('button',{name:'DIÁRIO / RECORDES · J'}).click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#field-journal').count(),0);
    // Two activations in one event loop must dispatch only one pointer-lock request.
    const locks=await page.evaluate(()=>{const lock=qa.controls.lock;let calls=0;qa.controls.lock=()=>calls++;const b=document.getElementById('mainBtn');b.click();b.click();qa.controls.lock=lock;return calls;});
    assert.equal(locks,1);
    await page.waitForTimeout(650);
    await page.getByRole('button',{name:'JOGAR',exact:true}).click();
    await page.waitForFunction(()=>qa.controls.isLocked);
    await page.evaluate(()=>document.exitPointerLock());
    await page.getByRole('button',{name:'Continuar',exact:true}).waitFor();
    await page.getByRole('button',{name:'OPÇÕES',exact:true}).click();
    assert.equal(await page.locator('#volume').inputValue(),'0');
    await page.keyboard.press('Escape');
    assert(!await page.evaluate(()=>qa.controls.isLocked),'closing options keeps pause');
    await page.waitForFunction(()=>!document.querySelector('dialog'));
    await page.getByRole('button',{name:'OPÇÕES',exact:true}).click();
    const next=quality==='low'?'high':'low';
    await page.locator('#quality-select').selectOption(next);
    await page.getByRole('button',{name:'APLICAR E REINICIAR'}).click();
    await page.waitForURL(url=>url.searchParams.get('quality')===next);
    await page.getByRole('button',{name:'JOGAR',exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>qa.runStats.seconds),0,'quality reload starts at title');
    assert.equal(await page.evaluate(()=>qa.settings.volume),0,'mute survives quality reload');
    console.log(JSON.stringify({quality,menu:true,resolutions:['720p','1080p','390x844'],idleWindowMs:1200,idleWebGLRenders:after.renders,keyboard:true,doubleActivation:true,muted:true}));
};
