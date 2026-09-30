module.exports = async (page, assert, quality, release) => {
    const result = await page.evaluate(() => {
        const q=qa,T=q.THREE,layout=q.cityServiceLayout;
        q.resetGame();q.controls.isLocked=true;
        const nodes=[
            ['Caixa',q.mysteryBox,layout.mysteryBox],['PaP',q.papMachine,layout.packAPunch],
            ...q.perkMachines.map(p=>[p.name,p.mesh,layout.perks[p.id]]),
            ...q.upgradeStations.map(o=>[o.userData.kind,o,layout.upgrades[o.userData.kind]]),
            ...q.generators.map((o,i)=>['G'+(i+1),o,layout.generators[i]]),
            ...q.saleBoxes.map((o,i)=>['Liquidação '+(i+1),o,layout.saleBoxes[i]]),
            ...q.ammoStations.map((o,i)=>['Munição '+(i+1),o,null])
        ];
        const points=nodes.map(([name,object,location])=>{
            const forward=object.getWorldDirection(new T.Vector3());forward.y=0;forward.normalize();
            const approach=object.position.clone().addScaledVector(forward,3);approach.y=0;
            const expected=location?new T.Vector3(location.frontX-location.x,0,location.frontZ-location.z).normalize():forward;
            const route=q.findNavigationPath(new T.Vector3(),approach,.65);
            return {name,x:object.position.x,z:object.position.z,approach:approach.toArray(),
                solid:name.startsWith('Liquidação')||q.isPositionBlocked(object.position.x,object.position.z,.1),reachable:route.length>0,free:!q.isPositionBlocked(approach.x,approach.z,.65),facesRoad:forward.dot(expected)>.999};
        });
        // A full west/south/east/north circuit must work in both directions.
        const circuit=[[-88,0],[-88,-101],[88,-101],[88,101],[-88,101],[-88,40],[0,40],[88,40],[88,0],[0,0]];
        const routes=circuit.map((p,i)=>{
            const next=circuit[(i+1)%circuit.length],a=new T.Vector3(p[0],0,p[1]),b=new T.Vector3(next[0],0,next[1]);
            return {from:p,to:next,forward:q.findNavigationPath(a,b,.65).length>0,backward:q.findNavigationPath(b,a,.65).length>0};
        });
        const circles=q.generators.map(g=>Array.from({length:16},(_,i)=>{
            const angle=i*Math.PI/8;return !q.isPositionBlocked(g.position.x+Math.cos(angle)*8,g.position.z+Math.sin(angle)*8,.72);
        }).filter(Boolean).length);
        const records=q.campaignNodes.filter(n=>n.userData.role==='record').every(n=>q.findNavigationPath(new T.Vector3(),n.position,.65).length>0);
        q.score=20000;
        q.perkMachines.forEach(p=>{
            const point=points.find(n=>n.name===p.name);q.camera.position.fromArray(point.approach);q.camera.position.y=1.8;q.interact();
        });
        const perks=q.perks.every(Boolean);
        const spawns=q.generators.map(g=>{
            q.camera.position.copy(g.position).add(new T.Vector3(0,1.8,3));
            return Array.from({length:8},()=>q.getSpawnPosition()).every(p=>p&&p.distanceTo(q.camera.position)>=q.BALANCE.enemies.minSpawnDistance&&q.findNavigationPath(p,q.camera.position,.72).length>0);
        });
        const positions=points.map(p=>[p.x,p.z]);q.resetGame();
        const stable=nodes.every(([,o],i)=>o.position.x===positions[i][0]&&o.position.z===positions[i][1]);
        const buildings=q.layout.buildings.map(b=>({x:b.x,z:b.z,w:b.w,d:b.d}));
        q.controls.isLocked=false;
        return {points,routes,circles,records,perks,spawns,stable,buildings};
    });
    assert.equal(result.points.length,18);
    for(const p of result.points)for(const check of ['reachable','free','facesRoad','solid'])assert(p[check],`${quality} ${p.name}: ${check}`);
    assert(result.routes.every(r=>r.forward&&r.backward),'connected district circuits');
    assert(result.circles.every(n=>n>=14),'clear generator defense circles');
    assert(result.records&&result.perks&&result.spawns.every(Boolean)&&result.stable,'district gameplay and stable reset');
    const permanent=result.points.slice(0,11);
    assert(permanent.filter(p=>Math.abs(p.x)>25).length>=10,'services moved off the central avenue');
    assert(Math.max(...permanent.map(p=>p.x))-Math.min(...permanent.map(p=>p.x))>=170);
    assert(Math.max(...permanent.map(p=>p.z))-Math.min(...permanent.map(p=>p.z))>=180);
    for(const x of [-1,1])for(const z of [-1,1])assert(permanent.some(p=>Math.sign(p.x)===x&&Math.sign(p.z)===z&&Math.abs(p.x)>60&&Math.abs(p.z)>60),'each corner has a destination');
    console.log(JSON.stringify({quality,map:{points:result.points,routes:result.routes,circles:result.circles,records:result.records,perks:result.perks,spawns:result.spawns,stable:result.stable}}));
    if(process.env.QA_MAP_REPORT){
        const fs=require('node:fs'),path=require('node:path');
        fs.mkdirSync(path.dirname(process.env.QA_MAP_REPORT),{recursive:true});
        fs.writeFileSync(process.env.QA_MAP_REPORT,JSON.stringify({release,quality,...result},null,2)+'\n');
    }
    if(process.env.QA_SCREENSHOTS){
        const fs=require('node:fs'),path=require('node:path');fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});
        for(const view of ['crossroads','west','east','north']){
            await page.evaluate(view=>{
                const q=qa,T=q.THREE;q.resetGame();q.controls.dispatchEvent({type:'lock'});q.controls.isLocked=true;
                const views={crossroads:[[0,1.8,12],[-16,2.6,-8]],west:[[-88,1.8,-34],[-78,1.6,-46]],east:[[88,1.8,76],[78,2,88]],north:[[-22,1.8,101],[-36,1.4,101]]};
                q.camera.position.fromArray(views[view][0]);q.camera.lookAt(new T.Vector3(...views[view][1]));
                document.body.classList.remove('menu-open');document.getElementById('overlay').style.display='none';
                q.updateWeapon(0);q.updateUI();q.updateObjectiveHud();q.renderScene();q.controls.isLocked=false;
            },view);
            await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`${release}-${view}-${quality}.png`)});
        }
        await page.evaluate(()=>{qa.resetGame();qa.controls.isLocked=false;});
    }
};
