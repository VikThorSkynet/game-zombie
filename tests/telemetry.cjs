// Integration plus reproducible render workloads. This is not a player simulation.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
module.exports=async(page,assert,quality)=>{
    const result=await page.evaluate(()=>{
        const q=qa;q.resetGame();q.controls.isLocked=true;
        q.createZombie(new q.THREE.Vector3(0,0,-6));const z=q.zombies.at(-1);
        q.camera.lookAt(0,1.4,-6);q.scene.updateMatrixWorld(true);q.shoot();
        const shot=q.metrics.report();q.damageEnemy(z,99999,'melee');q.killZombie(z,{cause:'melee',allowPowerup:false});
        q.applyPowerup('nuke');
        const station=q.upgradeStations.find(s=>s.userData.kind==='armor');
        q.camera.position.copy(station.position).add(new q.THREE.Vector3(0,1.8,2));
        q.interactSupply(station);q.startArmorPlate();q.updateArmorPlate(2);
        q.interactSupply(q.ammoStations[0]);
        q.applyDamage(99999,'dog-lunge','Cão');
        const dead=q.metrics.report(q.metricsState());q.resetGame();q.controls.isLocked=false;
        return {shot,dead,previous:q.metricsPrevious,reset:q.metrics.report()};
    });
    assert.equal(result.shot.totals.shots,1);assert.equal(result.shot.totals.hitShots,1);
    assert.equal(result.dead.economy.points.earned,525);assert.equal(result.dead.economy.scrap.earned,3);
    assert.equal(result.dead.economy.points.spent,300);assert.equal(result.dead.totals.plates,1);
    assert.equal(result.dead.state.points,225);assert.equal(result.dead.totals.deaths,1);
    assert.equal(result.dead.lastDamage.cause,'dog-lunge');assert.equal(result.previous.state.points,225);
    assert.equal(result.reset.totals.shots,0);assert.equal(result.reset.activeSeconds,0);
    if(process.env.P1_SKIP_BENCH){
        await page.evaluate(()=>{window.p1Ends=[];window.p1Off=qa.gameEvents.on('gameEnded',()=>window.p1Ends.push(qa.metrics.report()));});
        await require('./campaign.cjs')(page,assert,quality,qaReleaseTag());
        const ends=await page.evaluate(()=>{window.p1Off();return window.p1Ends;});
        const extraction=ends.find(r=>r.outcome==='extracted');assert(extraction);
        for(const name of ['installation','coreReady','bossStarted','bossDefeated','extractionStarted','extracted'])assert(extraction.milestones[name],name);
        assert(extraction.events.some(e=>e.type==='income'&&e.source==='boss'&&e.amount===600));
        assert(extraction.totals.deaths===0);console.log('P1 measurements and campaign events passed: '+quality);return;
    }
    const seconds=Number(process.env.P1_SAMPLE_SECONDS||10),warmup=Number(process.env.P1_WARMUP_SECONDS||5);
    const reports=[];
    await page.setViewportSize({width:1920,height:1080});
    const scenarios=process.env.P1_SCENARIOS?process.env.P1_SCENARIOS.split(','):['menu','quiet-city','enemy-cap','dogs','fog','boss'];
    for(const scenario of scenarios){
        for(let repetition=1;repetition<=3;repetition++){
            await page.evaluate(async({scenario})=>{
                const q=qa;q.resetGame();q.controls.isLocked=false;q.metricsGPU.contextOverride='benchmark:'+scenario;
                if(scenario==='boss'){
                    for(let n=0;n<3;n++)q.generatorNetwork.completed.add(n);q.generatorNetwork.openDoor();q.setContainmentDoor(true);
                    q.waveDirector.phase='intermission';q.waveDirector.remaining=8;q.camera.position.set(0,1.8,143);q.controls.isLocked=true;await q.travelArea(q.areaPortals[0]);
                    q.campaign.stage='ready';const core=q.campaignNodes.find(n=>n.userData.role==='core');q.camera.position.copy(core.position).add(new q.THREE.Vector3(0,1.8,1.6));q.controls.isLocked=true;q.interact();q.controls.isLocked=false;
                    q.camera.position.set(0,1.8,-7);q.camera.lookAt(0,1.8,-16);
                }else{
                    q.startWave(scenario==='dogs'?5:scenario==='fog'?8:9);q.camera.position.set(0,1.8,0);q.camera.lookAt(0,1.8,-15);
                    if(['enemy-cap','dogs','fog'].includes(scenario)){
                        const type=scenario==='dogs'?Object.values(q.zombieTypeConfigs).find(t=>t.isDog):q.zombieTypeConfigs.normal;
                        for(let n=0;n<q.waveDirector.maxActive;n++)q.createZombie(new q.THREE.Vector3((n%6-2.5)*2,0,-8-Math.floor(n/6)*3),type);
                    }
                    if(scenario==='fog')q.scene.fog.density=.05;
                }
                document.getElementById('overlay').style.display=scenario==='menu'?'flex':'none';
                document.body.classList.toggle('menu-open',scenario==='menu');q.scene.updateMatrixWorld(true);q.renderScene();
                // Controlled render loop; ordinary game and actors remain paused.
                window.p1Stop=false;window.p1Last=null;window.p1Collect=false;
                window.p1Loop=()=>{
                    if(window.p1Stop)return;
                    const start=performance.now(),dt=window.p1Last===null?null:start-window.p1Last;window.p1Last=start;
                    if(scenario!=='menu'){q.updateZombies(Math.min((dt||16)/1000,.05));q.renderScene();}
                    if(window.p1Collect)q.metrics.frame('benchmark:'+scenario,scenario==='menu'?null:dt,performance.now()-start,scenario==='menu'?null:q.metricsRender);
                    window.p1Frame=requestAnimationFrame(window.p1Loop);
                };window.p1Frame=requestAnimationFrame(window.p1Loop);
            },{scenario});
            await page.waitForTimeout(warmup*1000);
            await page.evaluate(()=>{qa.metricsGPU.clear();qa.metrics.reset();window.p1Last=null;window.p1Collect=true;});
            await page.waitForTimeout(seconds*1000);
            const report=await page.evaluate(()=>{window.p1Stop=true;cancelAnimationFrame(window.p1Frame);qa.metricsGPU.poll();qa.metrics.metadata.gpuDiscardedSamples=qa.metricsGPU.discarded;return qa.metrics.report(qa.metricsState());});
            if(scenario!=='menu'){
                const render=report.performance['benchmark:'+scenario]?.last;assert(render,'render sample');
                assert.equal(render.width,1920);assert.equal(render.height,1080);
                if(report.metadata.gpuTimerSupported)assert(report.performance['benchmark:'+scenario].gpu.samples>0,'GPU samples');
                if(scenario==='enemy-cap')assert.equal(render.enemies,quality==='low'?24:32,'ordinary wave enemy cap');
                if(scenario==='dogs')assert.equal(render.enemies,4);
                if(scenario==='boss')assert.equal(render.enemies,1);
            }
            reports.push({scenario,repetition,sampleSeconds:seconds,warmupSeconds:warmup,report});
            console.log(JSON.stringify({quality,scenario,repetition,frame:report.performance['benchmark:'+scenario]?.frame}));
            if(process.env.QA_SCREENSHOTS&&repetition===3)await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`${qaReleaseTag()}-benchmark-${scenario}-${quality}.png`)});
        }
    }
    const output=path.join(__dirname,'../docs/measurements');fs.mkdirSync(output,{recursive:true});
    const prefix=process.env.P1_OUTPUT_PREFIX||'p1';
    if(!/^[a-z0-9-]+$/.test(prefix))throw Error('Invalid measurement output prefix');
    const file=path.join(output,prefix+'-'+quality+'.json');
    const previous=process.env.P1_SCENARIOS&&fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')).reports.filter(r=>!scenarios.includes(r.scenario)):[];
    fs.writeFileSync(file,JSON.stringify({kind:'headless-controlled-render-baseline',hardware:{cpu:os.cpus()[0]?.model,memoryGB:os.totalmem()/2**30,os:os.type()+' '+os.release()},limitations:'Paused actors, fixed camera, headless Chrome; not end-to-end gameplay or player FPS. Menu is static and does not render continuously.',reports:[...previous,...reports]},null,2));
    console.log('P1 integration passed: '+quality);
};
function qaReleaseTag(){return 'v'+fs.readFileSync(path.join(__dirname,'../README.md'),'utf8').match(/game_version(\d+)_/)[1];}
