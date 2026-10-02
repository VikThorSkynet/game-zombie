// Asset integration checks; hooks exist only in this test's HTTP response.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const filename = fs.readFileSync(path.join(root, 'README.md'), 'utf8').match(/\((game_version[^)]+\.html)\)/)[1];
const source = fs.readFileSync(path.join(root, filename), 'utf8');
const hooks = `window.assetQA = {
    templates: loadedWeaponAssets,
    equip(id, pap) {
        resetGame(); operationStarted=true; controls.isLocked=true;
        document.body.classList.remove('menu-open'); overlay.style.display='none';
        const w=playerWeapons[0];camera.remove(w.model);disposeObject3D(w.model);
        w.configId=id;w.packapunched=pap;w.ammoInMag=weaponConfigs[id].magSize;
        w.reserveAmmo=weaponConfigs[id].magSize*3;
        w.model=pap?createPaPWeaponModel(weaponConfigs[id]):weaponConfigs[id].createModel();
        camera.add(w.model);updateWeapon(.016);updateUI();renderScene();
    },
    verify(id, pap) {
        const w=playerWeapons[0],model=w.model,template=loadedWeaponAssets.get(id);
        const cached=new Set();template.traverse(m=>{if(m.isMesh){cached.add(m.geometry);cached.add(m.material);}});
        let independent=true,maps=0,normals=0,meshCount=0,triangles=0;
        model.traverse(m=>{if(m.isMesh && !m.userData.keepOptic){meshCount++;triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3;
            independent &&= !cached.has(m.geometry) && !cached.has(m.material);
            if(m.material.map)maps++;if(m.material.normalMap)normals++;}});
        const bounds=new THREE.Box3().setFromObject(model),position=model.position.toArray();
        const cfg=weaponConfigs[id];lastShotTime=0;shoot();const fired=w.ammoInMag===cfg.magSize-1;
        startReload();updateReload(cfg.reloadDuration+1);
        const reloaded=w.ammoInMag===(pap?Math.ceil(cfg.magSize*papMagMultiplier):cfg.magSize)&&!isReloading;
        document.dispatchEvent(new MouseEvent('mousedown',{button:2}));
        for(let i=0;i<90;i++)updateWeapon(1/60);
        const aimed=model.userData.optic.visible&&Math.abs(model.position.x+model.userData.sightX)<.001&&Math.abs(model.position.y+model.userData.sightY)<.001;
        document.dispatchEvent(new MouseEvent('mouseup',{button:2}));resetAim();
        const muzzle=model.userData.muzzleLocal.toArray();controls.isLocked=false;renderScene();
        return {asset:model.userData.assetId,pap:!!model.userData.isPaP,independent,maps,normals,meshCount,triangles,fired,reloaded,aimed,muzzle,
            finite:[...position,...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite),
            stats:{magSize:cfg.magSize,fireRate:cfg.fireRate,damageBody:cfg.damageBody}};
    },
    pose(aim) {
        updateTracers(2);updateCombatEffects(2);
        controls.isLocked=true;aimHeld=aim;
        for(let i=0;i<90;i++)updateWeapon(1/60);
        updateUI();controls.isLocked=false;renderScene();
    },
    resources() {
        resetAim();controls.isLocked=false;const samples=[];
        for(let i=0;i<8;i++){resetGame();operationStarted=true;renderScene();samples.push({...renderer.info.memory});}
        return samples;
    }
};`;
const server = http.createServer((req,res)=>{
    const name = path.basename(new URL(req.url,'http://localhost').pathname);
    if(name.endsWith('.html')){
        res.setHeader('Content-Type','text/html; charset=utf-8');
        res.end(source.replace('        init();',hooks+'\n        init();'));
    } else {res.writeHead(404);res.end();}
});
(async()=>{
    let browser;
    try {
        await new Promise(r=>server.listen(0,'127.0.0.1',r));
        browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
        const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
        page.on('pageerror',e=>errors.push(String(e)));
        const captures=process.env.QA_SCREENSHOTS;
        if(captures)fs.mkdirSync(captures,{recursive:true});
        for(const quality of ['low','high']){
            await page.goto(`http://127.0.0.1:${server.address().port}/game.html?quality=${quality}`);
            await page.waitForFunction(()=>window.gameBootComplete&&window.assetQA);
            assert.equal(await page.evaluate(()=>assetQA.templates.size),3);
            for(const id of ['pistol','smg','assault_rifle'])for(const pap of [false,true]){
                await page.evaluate(([id,pap])=>assetQA.equip(id,pap),[id,pap]);
                const result=await page.evaluate(([id,pap])=>assetQA.verify(id,pap),[id,pap]);
                assert.equal(result.asset,id);assert.equal(result.pap,pap);
                for(const key of ['independent','fired','reloaded','aimed','finite'])assert(result[key],`${id} ${quality} ${key}`);
                assert(result.maps>0 && result.normals>0,'PBR textures survive PaP');
                assert(result.muzzle[2]<(id==='pistol'?-.99:-1.30),'flash at barrel tip');
                if(id==='smg')assert.equal(result.stats.magSize,40,'preserve P3 SMG balance');
                console.log(JSON.stringify({quality,id,...result}));
                if(captures&&!pap)for(const aim of [false,true]){
                    await page.evaluate(aim=>assetQA.pose(aim),aim);
                    await page.screenshot({path:path.join(captures,`v36-${id}-${aim?'ads':'hip'}-${quality}.png`)});
                }
            }
            const resources=await page.evaluate(()=>assetQA.resources());
            assert(resources.every(r=>r.geometries===resources[0].geometries&&r.textures===resources[0].textures),'stable reset resources');
            console.log(JSON.stringify({quality,resetResources:resources}));
            assert.deepEqual(errors,[]);
        }
    } finally {await browser?.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
