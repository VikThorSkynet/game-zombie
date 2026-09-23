// Run with Playwright installed; PLAYWRIGHT_MODULE and CHROME_PATH are optional overrides.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const filename = fs.readFileSync(path.join(root, 'README.md'), 'utf8').match(/\((game_version[^)]+\.html)\)/)[1];
const releaseTag = 'v' + filename.match(/^game_version(\d+)_/)[1];
const html = fs.readFileSync(path.join(root, filename), 'utf8');
assert(!html.includes('createOscillator'), 'only MP3 audio sources');
assert(!html.includes('updateAmmoSpawner'), 'automatic ammo spawner must be removed');
// Test hooks are injected in the response only, never in the released HTML.
const api = `window.qa = { THREE, settings, runStats, worldLODs, buildMysteryCrate, weaponConfigs, resetAim, impactParticles, impactPool, maxImpactEffects,
 BALANCE, waveDirector, gameEvents, startWave, updateWave, damageEnemy, killZombie, applyDamage,
 generatorNetwork, generators, get containmentDoor(){return containmentDoor}, updateContainment, isPositionBlocked, staticColliders, staticColliderGrid, bulletBlockers, hasClearNavigationLine,
 armor, scrap, upgradeStations, updateArmorPlate, startArmorPlate, switchWeapon, shoot, startPackAPunch, finishPackAPunch, weaponMultiplier, fireBullet, fireLaser, interact, updateInteractables,
 get isReloading(){return isReloading}, get currentWeaponIndex(){return currentWeaponIndex}, get mysteryBox(){return mysteryBox},
 getZombieBaseSpeed, zombieTypeConfigs, applyLegDamage, findNavigationPath, loadAudioAsset,
 spawnPowerup, createBonusModel, floatingLabel, bonusNames, powerupTypes, applyPowerup, updatePowerups, powerups, ammoStations, saleBoxes, interactSupply, nearestSupply, ammoPrice, getMysteryPrice, updateSaleBoxes, meleeAttack, updateMelee, createZombie, updateWeapon, renderScene,
 get renderer(){return renderer},
 get flashlight(){return flashlight}, get fireSaleTimer(){return fireSaleTimer}, set score(v){score=v},
 createZombieHitEffect, updateCombatEffects, resetGame, showHitmarker, startReload, finishReload, updateUI, updateZombies,
 get score(){return score}, get health(){return health}, get camera(){return camera}, get scene(){return scene},
 get controls(){return controls}, get weapons(){return playerWeapons}, get zombies(){return zombies},
 get layout(){return baseMapLayout}, get projectiles(){return zombieProjectiles} };`;
const server = http.createServer((req, res) => {
    const name = path.basename(decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (name.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html.replace('        init();', api + '\n        init();'));
    } else if (name === 'game-systems.mjs') {
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        fs.createReadStream(path.join(root, name)).pipe(res);
    } else if (name.endsWith('.mp3') && fs.existsSync(path.join(root, name))) {
        res.setHeader('Content-Type', 'audio/mpeg');
        fs.createReadStream(path.join(root, name)).pipe(res);
    } else { res.statusCode = 404; res.end(); }
});

(async () => {
    let browser;
    try {
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const url = `http://127.0.0.1:${server.address().port}/game.html`;
        browser = await chromium.launch({headless: true, ...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {})});
        const page = await browser.newPage({viewport: {width: 1440, height: 960}});
        const errors = [];
        page.on('requestfailed', r=>console.error('Network:',r.url(),r.failure()?.errorText));
        page.on('pageerror', e => { errors.push(String(e)); console.error(e); });
        for (const quality of ['low', 'high']) {
            await page.goto(`${url}?quality=${quality}`);
            await page.waitForFunction(() => window.qa?.weapons[0]?.model);
            assert.equal(await page.evaluate(() => qa.score), 0, 'fresh game economy');
            const balance = await page.evaluate(() => {
                const q=qa,T=q.THREE,stations=q.ammoStations;
                const distances=stations.flatMap((a,i)=>stations.slice(i+1).map(b=>a.position.distanceTo(b.position)));
                const reachable=stations.every(s=>q.findNavigationPath(new T.Vector3(),s.position.clone().add(new T.Vector3(0,0,2)),0.65).length>0);
                const capped=Object.values(q.zombieTypeConfigs).every(t=>q.getZombieBaseSpeed(t,14,0.5)<q.getZombieBaseSpeed(t,15,0.5) && q.getZombieBaseSpeed(t,15,0.5)===q.getZombieBaseSpeed(t,100,0.5));
                q.createZombie(new T.Vector3(0,0,-10));const z=q.zombies.at(-1),base=z.userData.baseSpeed;
                q.applyLegDamage(z,z.userData.legMaxHealth/2);const injured=z.userData.speed<base&&z.userData.speed>base*0.45;
                q.applyLegDamage(z,z.userData.legMaxHealth);const crawling=z.userData.legsDestroyed&&Math.abs(z.userData.speed/base-0.45)<1e-8;
                q.applyLegDamage(z,100);const staysCrawling=Math.abs(z.userData.speed/base-0.45)<1e-8;
                q.resetGame();return {count:stations.length,distance:Math.min(...distances),reachable,capped,injured,crawling,staysCrawling};
            });
            assert(balance.count===3&&balance.distance>155&&balance.reachable&&balance.capped&&balance.injured&&balance.crawling&&balance.staysCrawling,JSON.stringify(balance));
            console.log(JSON.stringify({quality,balance}));
            await page.locator('#sensitivity').fill('1.5');
            await page.locator('#volume').fill('0.3');
            await page.locator('#reduced-motion').check();
            await page.reload();
            await page.waitForFunction(() => window.qa?.weapons[0]?.model);
            assert.deepEqual(await page.evaluate(() => ({...qa.settings})), {sensitivity: 1.5, volume: 0.3, reducedMotion: true});
            if (process.env.QA_SCREENSHOTS) {
                fs.mkdirSync(process.env.QA_SCREENSHOTS, {recursive: true});
                await page.screenshot({path: path.join(process.env.QA_SCREENSHOTS, `${releaseTag}-menu-${quality}.png`)});
            }
            const pool = await page.evaluate(() => {
                const q = qa, point = q.camera.position.clone(); point.z -= 4;
                for (let i = 0; i < 200; i++) q.createZombieHitEffect(point, i % 2 === 0);
                const bounded = q.impactParticles.length === q.maxImpactEffects;
                const ids = new Set(q.impactParticles.map(p => p.geometry.uuid));
                q.updateCombatEffects(1);
                for (let i = 0; i < q.maxImpactEffects; i++) q.createZombieHitEffect(point);
                const reused = q.impactParticles.every(p => ids.has(p.geometry.uuid));
                q.updateCombatEffects(1);
                return {bounded, reused, inactive: q.impactPool.length, active: q.impactParticles.length};
            });
            assert(pool.bounded && pool.reused && pool.active === 0);
            await page.getByRole('button', {name: 'INICIAR OPERAÇÃO'}).click();
            assert(await page.evaluate(async()=>{const clip=await qa.loadAudioAsset('melee');return clip?.duration>0;}),'melee MP3 decodes');
            await page.mouse.down({button: 'right'});
            await page.waitForFunction(() => document.body.classList.contains('aiming') && qa.camera.fov < 56 && qa.flashlight.intensity < 0.6, null, {timeout:15000});
            assert(await page.evaluate(() => document.body.classList.contains('aiming') && qa.camera.fov < 57 && qa.controls.pointerSpeed < 1));
            assert(await page.evaluate(() => qa.flashlight.intensity < 0.6 && qa.flashlight.position.z === 0), 'ADS flashlight dimming');
            if (process.env.QA_SCREENSHOTS) await page.screenshot({path: path.join(process.env.QA_SCREENSHOTS, `${releaseTag}-ads-${quality}.png`)});
            await page.mouse.up({button: 'right'});
            const scope=await page.evaluate(()=>{
                const q=qa,w=q.weapons[0];q.camera.remove(w.model);w.configId='sniper';w.model=q.weaponConfigs.sniper.createModel();q.camera.add(w.model);return true;
            });
            await page.mouse.down({button:'right'});
            await page.waitForFunction(()=>document.body.classList.contains('scoped')&&qa.camera.fov<22.5);
            assert(await page.evaluate(()=>!qa.weapons[0].model.visible&&!qa.weapons[0].model.userData.optic.visible&&qa.controls.pointerSpeed<0.4));
            if(process.env.QA_SCREENSHOTS)await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`${releaseTag}-scope-${quality}.png`)});
            await page.mouse.up({button:'right'});
            await page.waitForFunction(()=>!document.body.classList.contains('scoped'));
            const lod=await page.evaluate(()=>{
                const q=qa,T=q.THREE,old=q.camera.position.clone(),item=q.worldLODs[0],pos=item.getWorldPosition(new T.Vector3());
                q.resetAim();q.camera.position.copy(pos).add(new T.Vector3(0,2,5));q.renderScene();const near=item.levels[0].object.visible;
                q.camera.position.copy(pos).add(new T.Vector3(0,2,110));q.renderScene();const far=item.levels[1].object.visible;
                q.camera.fov=21.7;q.camera.updateProjectionMatrix();q.renderScene();const zoom=item.levels[0].object.visible;
                q.camera.position.copy(old);q.resetAim();
                const w=q.weapons[0];q.camera.remove(w.model);w.configId='pistol';w.model=q.weaponConfigs.pistol.createModel();q.camera.add(w.model);
                return {count:q.worldLODs.length,near,far,zoom};
            });
            assert(lod.count>=50&&lod.near&&lod.far&&lod.zoom,JSON.stringify(lod));
            console.log(JSON.stringify({quality,lod,scope}));
            const reload = await page.evaluate(() => {
                qa.weapons[0].ammoInMag--; qa.startReload(); qa.updateUI();
                const track = document.getElementById('reload-track');
                return {display: getComputedStyle(track).display, height: track.getBoundingClientRect().height, value: track.getAttribute('aria-valuenow')};
            });
            assert(reload.display === 'block' && reload.height === 3 && reload.value === '0', JSON.stringify(reload));
            await page.evaluate(() => {qa.finishReload(); qa.showHitmarker(true, true);});
            assert.equal(await page.locator('#combat-feedback').textContent(), 'ELIMINAÇÃO CRÍTICA');
            assert.equal(await page.evaluate(() => qa.runStats.criticalHits), 1);
            await page.keyboard.press('Escape');
            await page.waitForFunction(() => !qa.controls.isLocked);
            assert.equal(await page.evaluate(() => qa.flashlight.intensity), 80);
            assert(await page.locator('#sensitivity').isVisible(), 'settings available on pause');
            // Attack across a building must be blocked, but the same shooter in clear space fires.
            const attacks = await page.evaluate(() => {
                const q = qa, z = q.zombies[0], b = q.layout.buildings[0];
                Object.assign(z.userData, {isShooter: true, attackCooldown: 0, speed: 0});
                z.position.set(b.x - b.w/2 - 1, 0, b.z);
                q.camera.position.set(b.x + b.w/2 + 1, 1.8, b.z);
                q.controls.isLocked = true;
                const before = q.projectiles.length;
                q.updateZombies(0.016);
                const blocked = q.projectiles.length === before;
                z.position.set(0, 0, -5); q.camera.position.set(0, 1.8, 0);
                z.userData.attackCooldown = 0;
                q.updateZombies(0.016);
                const clear = q.projectiles.length > before;
                q.controls.isLocked = false;
                q.resetGame();
                return {blocked, clear, reset: q.score === 0 && q.runStats.criticalHits === 0 && q.impactParticles.length === 0};
            });
            assert(attacks.blocked && attacks.clear && attacks.reset, JSON.stringify(attacks));
            const bonuses = await page.evaluate(() => {
                const q=qa,T=q.THREE;
                q.controls.isLocked=true;q.score=2000;
                const station=q.ammoStations[0];
                q.camera.position.copy(station.position).add(new T.Vector3(0,1.8,2));
                const near=q.nearestSupply()===station;
                const w=q.weapons[0];w.ammoInMag=0;w.reserveAmmo=0;
                const cost=q.ammoPrice();q.interactSupply(station);
                const bought=q.score===2000-cost && w.ammoInMag>0 && w.reserveAmmo>0;
                const paid=q.score;q.interactSupply(station);const fullNoCharge=q.score===paid;
                q.score=0;w.ammoInMag=0;w.reserveAmmo=0;q.interactSupply(station);
                const insufficient=w.ammoInMag===0 && q.score===0;
                q.applyPowerup('max_ammo');const maxAmmo=q.weapons.every(w=>w.ammoInMag>0&&w.reserveAmmo>0);
                q.score=100;q.applyPowerup('fire_sale');
                const sale=q.saleBoxes.length>=2 && q.saleBoxes.every(b=>b.visible) && q.getMysteryPrice()===10;
                const box=q.saleBoxes[0];q.interactSupply(box);q.updateSaleBoxes(3.1);
                const rolled=box.userData.state==='ready'&&q.score===90;
                q.updatePowerups(31);q.updateSaleBoxes(0);
                const expires=q.fireSaleTimer===0 && q.getMysteryPrice()===950 && box.visible;
                q.interactSupply(box);const collected=box.userData.state==='idle'&&!box.visible;
                q.camera.position.set(0,1.8,0);q.camera.rotation.set(0,0,0);
                q.createZombie(new T.Vector3(0,0,-1.5));const zombie=q.zombies.at(-1);zombie.userData.health=100;
                document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyV'}));
                const knife=!q.zombies.includes(zombie);
                q.createZombie(new T.Vector3(0,0,-1.5));const guarded=q.zombies.at(-1);guarded.userData.health=10000;q.meleeAttack();
                const cooldown=guarded.userData.health===10000;
                q.updateMelee(1);const beforeHit=guarded.position.clone();q.meleeAttack();
                const knifeFeedback=guarded.userData.health===9850&&guarded.userData.meleeStagger>0&&guarded.position.distanceTo(beforeHit)>0.1&&document.getElementById('combat-feedback').textContent.includes('150');
                q.updateMelee(1);q.applyPowerup('insta_kill');q.meleeAttack();
                const instaKnife=!q.zombies.includes(guarded);
                q.updateMelee(1);
                q.createZombie(new T.Vector3(0,0,-10));const distant=q.zombies.at(-1);distant.userData.health=100;q.meleeAttack();
                const range=distant.userData.health===100;q.updateMelee(1);
                const wall=q.layout.buildings[0];q.camera.position.set(wall.x+wall.w/2+0.7,1.8,wall.z);
                q.createZombie(new T.Vector3(wall.x+wall.w/2-0.7,0,wall.z));const covered=q.zombies.at(-1);covered.userData.health=1000;
                q.camera.lookAt(covered.position.x,1.8,covered.position.z);q.meleeAttack();const knifeWall=covered.userData.health===1000;q.updateMelee(1);
                q.camera.position.set(0,1.8,0);q.camera.rotation.set(0,0,0);
                q.applyPowerup('double_points');const before=q.score;q.applyPowerup('nuke');
                const nuke=q.zombies.length===0&&q.score===before+800;
                const price=q.ammoPrice();q.weapons[0].packapunched=true;const upgradePrice=q.ammoPrice()>price;
                const drop=q.spawnPowerup(q.camera.position.clone(),'max_ammo');q.weapons[0].ammoInMag=0;q.updatePowerups(0.016);
                const pickup=!q.powerups.includes(drop)&&q.weapons[0].ammoInMag>0;
                const far=q.spawnPowerup(new T.Vector3(100,0,100),'nuke');q.updatePowerups(26);const expiry=!q.powerups.includes(far);
                q.controls.isLocked=false;q.resetGame();
                return {near,bought,fullNoCharge,insufficient,maxAmmo,sale,rolled,expires,collected,knife,knifeFeedback,cooldown,instaKnife,knifeWall,range,nuke,upgradePrice,pickup,expiry};
            });
            assert(Object.values(bonuses).every(Boolean),JSON.stringify(bonuses));
            console.log(JSON.stringify({quality,bonuses}));
            const lifecycle = await page.evaluate(() => {
                const q=qa,T=q.THREE,kills=[],hits=[];
                const offKill=q.gameEvents.on('enemyKilled',e=>kills.push(e));
                const offHit=q.gameEvents.on('enemyDamaged',e=>hits.push(e));
                q.controls.isLocked=true;q.camera.position.set(0,1.8,0);q.camera.rotation.set(0,0,0);
                q.createZombie(new T.Vector3(0,0,-1.5),q.zombieTypeConfigs.normal);
                const target=q.zombies.at(-1);target.userData.health=100;
                const before=q.score;q.meleeAttack();const paid=q.score;
                q.killZombie(target,{cause:'melee'});
                const once=kills.length===1&&hits.length===1&&hits[0].amount===100&&kills[0].cause==='melee'&&paid>before&&q.score===paid;
                offKill();offHit();q.resetGame();q.controls.isLocked=true;
                q.startWave(20);
                for(let i=0;i<100;i++)q.updateWave(1);
                const cap=q.zombies.length===q.waveDirector.maxActive&&q.waveDirector.spawned===q.zombies.length;
                const count=q.waveDirector.spawned;q.updateWave(100);
                const noBurst=q.waveDirector.spawned===count;
                q.resetGame();q.controls.isLocked=true;
                // Exhaust a real wave through the game adapter, then kill its remaining enemies.
                for(let i=0;i<100&&q.waveDirector.spawned<q.waveDirector.total;i++)q.updateWave(1);
                [...q.zombies].forEach(z=>q.killZombie(z,{awardScore:false,allowPowerup:false}));
                q.updateWave(0);const countdown=q.waveDirector.phase==='intermission'&&q.waveDirector.remaining===10&&!document.getElementById('wave-break').hidden;
                q.controls.isLocked=false;q.updateWave(20);
                const paused=q.waveDirector.remaining===10;
                document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyN'}));
                const blockedSkip=q.waveDirector.remaining===10;
                q.controls.isLocked=true;
                document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyN'}));q.updateWave(0);
                const skipped=q.waveDirector.number===2&&q.waveDirector.phase==='combat';
                q.controls.isLocked=false;q.resetGame();
                return {once,cap,noBurst,countdown,paused,blockedSkip,skipped};
            });
            assert(Object.values(lifecycle).every(Boolean),JSON.stringify(lifecycle));
            console.log(JSON.stringify({quality,lifecycle}));
            await require('./progression.cjs')(page,assert,quality,releaseTag);
            await require('./containment.cjs')(page,assert,quality,releaseTag);
            if (process.env.QA_SCREENSHOTS) {
                await page.waitForTimeout(150);
                await page.evaluate(() => {
                    const q=qa,T=q.THREE;q.camera.position.set(0,2.2,5);q.camera.lookAt(0,1.2,-3);
                    q.weapons.forEach(w=>w.model.visible=false);
                    q.powerupTypes.forEach((type,i)=>q.spawnPowerup(new T.Vector3((i-2)*2,0,-3),type));
                    document.querySelectorAll('body>div').forEach(e=>e.style.display='none');q.renderScene();
                });
                await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`${releaseTag}-drops-${quality}.png`)});
                await page.evaluate(() => {
                    const q=qa,T=q.THREE,scene=new T.Scene();scene.background=new T.Color(0x081511);
                    scene.add(new T.HemisphereLight(0xffefca,0x224d36,3));
                    const light=new T.DirectionalLight(0xffffff,3);light.position.set(2,4,5);scene.add(light);
                    q.powerupTypes.forEach((type,i)=>{const model=q.createBonusModel(type);model.position.set((i-2)*2.1,0,0);scene.add(model);
                        const label=q.floatingLabel(q.bonusNames[type]);label.position.set((i-2)*2.1,-0.8,0);label.scale.set(1.9,0.35,1);scene.add(label);});
                    const camera=new T.OrthographicCamera(-5.6,5.6,3.73,-3.73,0.1,100);camera.position.set(0,0,8);
                    document.querySelectorAll('body>div').forEach(e=>e.style.display='none');q.renderer.render(scene,camera);
                });
                await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`${releaseTag}-bonus-${quality}.png`)});
            }
            if(process.env.QA_SCREENSHOTS){
                await page.evaluate(()=>{
                    const q=qa,T=q.THREE,scene=new T.Scene();scene.background=new T.Color(0x142028);
                    scene.add(new T.HemisphereLight(0xffefdb,0x344754,3));const light=new T.DirectionalLight(0xffffff,3);light.position.set(1,5,5);scene.add(light);
                    for(const [i,sale] of [false,true].entries()){const box=q.buildMysteryCrate(sale);box.position.x=(i-.5)*3.4;box.userData.lid.rotation.x=-0.45;scene.add(box);}
                    const camera=new T.PerspectiveCamera(45,1.5,0.1,150);camera.position.set(4,4,10);camera.lookAt(0,1,0);q.renderer.render(scene,camera);
                });
                await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`${releaseTag}-crates-${quality}.png`)});
            }
            console.log(JSON.stringify({quality, pool, attacks, passed: true}));
        }
        await page.evaluate(() => localStorage.setItem('sobreviva.settings.v1', '{broken'));
        await page.reload();
        await page.waitForFunction(() => window.qa?.weapons[0]?.model);
        assert.equal(await page.evaluate(() => qa.settings.sensitivity), 1, 'corrupt storage fallback');
        assert.deepEqual(errors, []);
    } finally {
        await browser?.close();
        await new Promise(resolve => server.close(resolve));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
