module.exports=async function(page,assert,quality,releaseTag) {
    const result=await page.evaluate(()=>{
        const q=qa,T=q.THREE,c={};q.resetGame();q.controls.isLocked=true;
        const near=g=>q.camera.position.copy(g.position).add(new T.Vector3(0,1.8,2));
        const before=new T.Vector3(0,0,134),after=new T.Vector3(0,0,143);
        const colliderCount=q.staticColliders.length,blockerCount=q.bulletBlockers.length;
        c.closed=q.isPositionBlocked(0,137,.65)&&!q.hasClearNavigationLine(before,after,.65)&&q.findNavigationPath(before,after,.65).length===0;
        c.reachable=q.generators.length===3&&q.generators.every(g=>q.findNavigationPath(new T.Vector3(),g.position.clone().add(new T.Vector3(0,0,2)),.65).length>0);
        near(q.containmentDoor);q.camera.position.z=135;q.interact();c.locked=!q.generatorNetwork.open;
        let completed=0,opened=0;const off=q.gameEvents.on('generatorCompleted',()=>completed++),offDoor=q.gameEvents.on('doorOpened',()=>opened++);
        q.startWave(4);let spent=0;
        for(const [order,id] of [2,0,1].entries()) {
            const g=q.generators[id];near(g);document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'}));
            if(!q.generatorNetwork.active)throw new Error('Generator activation failed '+id);
            c['order'+order]=q.generatorNetwork.active.duration===[25,35,45][order];
            const spawned=q.waveDirector.spawned;q.updateWave(5);c.hold=q.waveDirector.spawned===spawned&&q.waveDirector.holds.has('generator');
            near(q.generators[(id+1)%3]);q.interact();c.exclusive=q.generatorNetwork.active.id===id;
            q.camera.position.set(0,1.8,0);const elapsed=q.generatorNetwork.active.elapsed;q.updateContainment(5);
            c.outside=q.generatorNetwork.active.elapsed===elapsed&&q.generatorNetwork.active.spawned===0;
            near(g);q.controls.isLocked=false;q.updateContainment(5);c.pause=q.generatorNetwork.active.elapsed===elapsed;
            q.controls.isLocked=true;
            const cap=q.waveDirector.maxActive;q.waveDirector.maxActive=0;q.updateContainment(1);
            c.cap=q.generatorNetwork.active.spawned===0;q.waveDirector.maxActive=cap;
            const budget=q.generatorNetwork.active.budget;
            let produced=0;
            for(let n=0;n<120&&q.generatorNetwork.active;n++) {
                q.updateContainment(1);
                for(const z of [...q.zombies])if(z.userData.generatorId===id) {
                    produced++;spent++;q.killZombie(z,{awardScore:false,allowPowerup:false});
                }
            }
            c['finite'+order]=produced===budget&&!q.generatorNetwork.active;
            const points=q.score;q.interact();q.updateContainment(100);
            c.unique=q.score===points&&!q.generatorNetwork.active;
        }
        c.reward=q.score===900&&completed===3&&spent===24&&!q.waveDirector.holds.has('generator');
        q.createZombie(before);const z=q.zombies.at(-1);z.userData.navPath=[before.clone()];z.userData.navRepathTimer=10;
        near(q.containmentDoor);q.camera.position.z=135;document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'}));q.interact();
        c.open=q.generatorNetwork.open&&opened===1&&!q.isPositionBlocked(0,137,.65)&&q.hasClearNavigationLine(before,after,.65)&&q.findNavigationPath(before,after,.65).length>0;
        c.invalidate=z.userData.navPath.length===0&&z.userData.navRepathTimer===0;
        c.bullets=!q.bulletBlockers.includes(q.containmentDoor.userData.panel);
        for(let n=0;n<20&&q.waveDirector.spawned===0;n++)q.updateWave(1);c.resume=q.waveDirector.spawned>0;
        for(let n=0;n<3;n++)q.resetGame();
        c.reset=!q.generatorNetwork.open&&!q.generatorNetwork.active&&q.generatorNetwork.completed.size===0&&q.isPositionBlocked(0,137,.65)&&q.staticColliders.length===colliderCount&&q.bulletBlockers.length===blockerCount;
        near(q.generators[0]);q.controls.isLocked=true;q.interact();q.applyDamage(9999);
        const elapsed=q.generatorNetwork.active.elapsed;q.updateContainment(100);c.death=q.generatorNetwork.active.elapsed===elapsed;
        off();offDoor();q.resetGame();q.controls.isLocked=false;
        return c;
    });
    for(const [name,passed] of Object.entries(result))assert(passed,`containment ${quality}: ${name}: ${JSON.stringify(result)}`);
    console.log(JSON.stringify({quality,containment:result}));
    if(process.env.QA_SCREENSHOTS) {
        const path=require('node:path');
        for(const view of ['generator','gate']) {
            await page.evaluate(view=>{
                const q=qa,T=q.THREE;q.resetGame();q.controls.isLocked=true;
                const g=view==='generator'?q.generators[0]:q.containmentDoor;
                q.camera.position.copy(g.position).add(new T.Vector3(0,1.8,view==='generator'?2:-2));
                if(view==='generator'){q.interact();q.generatorNetwork.active.elapsed=12;}
                q.camera.position.copy(g.position).add(new T.Vector3(4,2.8,view==='generator'?7:-9));
                q.camera.lookAt(g.position.clone().add(new T.Vector3(0,1,0)));
                document.body.classList.remove('menu-open');document.getElementById('overlay').style.display='none';q.updateUI();q.updateInteractables(0);q.updateWeapon(1/60);q.renderScene();q.controls.isLocked=false;
            },view);
            await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`${releaseTag}-${view}-${quality}.png`)});
        }
        await page.evaluate(()=>qa.resetGame());
    }
};
