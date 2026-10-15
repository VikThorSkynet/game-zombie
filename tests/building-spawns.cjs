// Integration against the released HTML. Hooks exist only in this test server response.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const filename = fs.readFileSync(path.join(root, 'README.md'), 'utf8').match(/\((game_version[^)]+\.html)\)/)[1];
const hooks = `window.spawnQA={THREE,SPAWN_RULES,resetGame,startWave,updateWave,updateZombies,killZombie,createZombie,
    renderScene,updateUI,updateInteractables,waveDirector,zombieTypeConfigs,staticColliders,bulletBlockers,
    findNavigationPath,isPositionBlocked,hasClearNavigationLine,travelArea,areaRuntime,areaPortals,
    generatorNetwork,setContainmentDoor,
    get entrances(){return buildingEntrances},get camera(){return camera},get controls(){return controls},
    get zombies(){return zombies},get scene(){return scene},get score(){return score},
    show(){operationStarted=true;document.body.classList.remove('menu-open');overlay.style.display='none';}};`;
const source = fs.readFileSync(path.join(root, filename), 'utf8').replace('        init();', hooks + '\n        init();');
const server = http.createServer((req, res) => {
    const name = path.basename(decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (name.endsWith('.mp3')) {
        const file = path.join(root, name);
        if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
        res.setHeader('Content-Type', 'audio/mpeg'); fs.createReadStream(file).pipe(res); return;
    }
    res.setHeader('Content-Type', 'text/html;charset=utf-8'); res.end(source);
});

(async () => {
    let browser;
    try {
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        browser = await chromium.launch({ headless: true,
            ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
        const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
        const errors = []; page.on('pageerror', error => { errors.push(error.message); console.error(error.message); });
        const output = path.join(root, 'docs/captures/v42'); fs.mkdirSync(output, { recursive: true });
        for (const quality of ['low', 'high']) {
            await page.goto(`http://127.0.0.1:${server.address().port}/game.html?quality=${quality}`);
            await page.waitForFunction(() => window.gameBootComplete && window.spawnQA, null, { timeout: 90000 });
            const layout = await page.evaluate(() => {
                const q = spawnQA, manager = q.entrances;
                const all = manager.entries;
                const selected = manager.active.map(entry => entry.id);
                const safe = manager.active.every(entry => entry.exit.distanceTo(q.camera.position) >= q.SPAWN_RULES.minDistance);
                const reachable = all.every(entry => q.findNavigationPath(entry.exit, q.camera.position, .85).length);
                q.controls.isLocked = false;
                manager.update(100);
                return { entries: all.length, active: selected.length, unique: new Set(selected).size,
                    safe, reachable, paused: !all.some(entry => entry.actor), total: q.waveDirector.total };
            });
            assert(layout.entries >= 30, JSON.stringify(layout));
            assert.equal(layout.active, 4); assert.equal(layout.unique, 4);
            assert(layout.safe && layout.reachable && layout.paused, JSON.stringify(layout));
            assert.equal(layout.total, 7);
            const coverage = await page.evaluate(() => {
                const q = spawnQA, m = q.entrances, position = q.camera.position.clone();
                let checked = 0;
                for (const [x,z] of [[0,0],[140,140],[-140,140],[140,-140],[-140,-140],[140,0],[-140,0],[0,-140]]) {
                    if (q.isPositionBlocked(x,z,.65)) continue;
                    q.camera.position.set(x,1.8,z); m.beginWave();
                    if (m.active.length!==4 || m.active.some(entry=>Math.hypot(entry.exit.x-x,entry.exit.z-z)<q.SPAWN_RULES.minDistance)) {
                        throw Error('unsafe selection at '+x+','+z);
                    }
                    const ids=m.active.map(entry=>entry.id).join(',');
                    q.camera.position.set(0,1.8,0);m.update(.1);
                    if(m.active.map(entry=>entry.id).join(',')!==ids)throw Error('selection followed player');
                    checked++;
                }
                q.camera.position.copy(position);q.resetGame();return checked;
            });
            assert(coverage >= 6);
            const results = await page.evaluate(() => {
                const q = spawnQA, m = q.entrances, T = q.THREE;
                q.resetGame(); q.show(); q.controls.isLocked = true;
                const selected = m.active.map(entry => entry.id).join(',');
                const config = q.zombieTypeConfigs.brute;
                if (!m.trySpawn(config)) throw Error('brute could not spawn');
                const door = m.active.find(entry => entry.actor), zombie = door.actor;
                const dropAccessible = m.dropPosition(zombie).distanceTo(door.exit) < .01;
                for (let i = 0; i < 45; i++) { m.update(.05); q.updateZombies(.05); }
                const blocked = door.barricade.remaining > 0 && zombie.userData.spawnState === 'breaking';
                q.camera.position.copy(door.point(3.3, 1.8)); q.camera.lookAt(door.point(0, 1.8));
                q.camera.updateMatrixWorld(true); m.updateRepair(0);
                const blockedPrompt = m.prompt().includes('Elimine');
                q.controls.isLocked = false;
                const beforePause = door.barricade.remaining; m.update(20);
                const paused = door.barricade.remaining === beforePause;
                q.scene.updateMatrixWorld(true);
                const ray = new T.Raycaster(door.point(4, 2.28), door.normal.clone().negate(), 0, 6);
                const stopped = ray.intersectObjects(q.bulletBlockers, false).some(hit => door.boards.includes(hit.object));
                let gap = false;
                for (let y = .8; y < 3.8; y += .05) {
                    ray.set(door.point(4, y), door.normal.clone().negate());
                    if (!ray.intersectObjects(q.bulletBlockers, false).some(hit => hit.distance < 5)) { gap = true; break; }
                }
                q.killZombie(zombie, {awardScore:false,allowPowerup:false});
                const released = !door.actor && !door.barricade.attacker;
                const boardsBeforeRepair = door.barricade.remaining, score = q.score;
                m.repairHeld = true; m.updateRepair(.8); m.syncBoards(door, 0);
                const repaired = door.barricade.remaining === boardsBeforeRepair + 1 && q.score === score;
                const persisted = door.barricade.remaining;
                const fixedSelection = m.active.map(entry => entry.id).join(',') === selected;
                m.finishWave(); q.startWave(2);
                const persistence = door.barricade.remaining === persisted;
                q.controls.isLocked = true;
                // Full lifecycle for every currently available humanoid configuration.
                q.camera.position.set(0, 1.8, 0);
                const types = ['normal','runner','brute','shooter','detonator','dog'];
                const exits = [];
                for (const type of types) {
                    m.active.forEach(entry => entry.cooldown = 0);
                    if (!m.trySpawn(q.zombieTypeConfigs[type])) throw Error('spawn failed for '+type);
                    const d = m.active.find(entry => entry.actor), actor = d.actor;
                    for (let i = 0; i < 400 && actor.userData.spawnState !== 'street'; i++) {
                        m.update(.05); q.updateZombies(.05);
                    }
                    exits.push(actor.userData.spawnState === 'street');
                    q.killZombie(actor, {awardScore:false,allowPowerup:false});
                }
                q.controls.isLocked = false;
                q.resetGame();
                const reset = m.entries.every(entry => entry.barricade.remaining === 5 && !entry.actor) && m.active.length === 4;
                // Keep one selected door in view for a concrete visual preview.
                const preview = m.active[0];
                q.camera.position.copy(preview.point(6.5, 2.0)); q.camera.lookAt(preview.point(0,1.9));
                q.camera.updateMatrixWorld(true); q.updateUI(); q.renderScene();
                return {dropAccessible,blocked,blockedPrompt,paused,stopped,gap,released,repaired,persistence,exits,reset,
                    fixedSelection};
            });
            for (const [key, value] of Object.entries(results)) {
                if (key === 'exits') assert(value.every(Boolean), JSON.stringify(results));
                else assert(value, key + ': ' + JSON.stringify(results));
            }
            await page.screenshot({ path: path.join(output, `barricade-${quality}.png`) });
            await page.evaluate(() => {
                const q = spawnQA, m = q.entrances;
                q.controls.isLocked = true;
                m.trySpawn(q.zombieTypeConfigs.normal);
                const door = m.active.find(entry => entry.actor);
                q.camera.position.copy(door.point(5.5, 1.9)); q.camera.lookAt(door.point(0, 1.7));
                for (let frame=0; frame<100; frame++) { m.update(.05); q.updateZombies(.05); }
                q.controls.isLocked = false; q.updateUI(); q.renderScene();
            });
            await page.screenshot({ path: path.join(output, `breaking-${quality}.png`) });
            await page.evaluate(() => {
                const q=spawnQA,m=q.entrances;q.resetGame();q.show();q.controls.isLocked=true;
                q.waveDirector.holds.add('repair-test');
                const door=m.active[0];door.barricade.attack('fixture',2.4);door.barricade.release('fixture');
                m.syncBoards(door,0);q.camera.position.copy(door.point(3.3,1.8));q.camera.lookAt(door.point(0,1.8));
                q.camera.updateMatrixWorld(true);q.beforeRepairCount=door.barricade.remaining;q.beforeRepairScore=q.score;
            });
            await page.keyboard.down('KeyE');
            await page.waitForFunction(() => spawnQA.entrances.repairTarget?.barricade.remaining > spawnQA.beforeRepairCount,
                null,{timeout:15000});
            await page.keyboard.up('KeyE');
            assert(await page.evaluate(() => spawnQA.score === spawnQA.beforeRepairScore),'E repair must not grant points');
            await page.screenshot({path:path.join(output,`repair-${quality}.png`)});
            await page.evaluate(()=>{spawnQA.controls.isLocked=false;spawnQA.resetGame();});
            const lifecycle = await page.evaluate(() => {
                const q=spawnQA,m=q.entrances;q.resetGame();q.show();q.controls.isLocked=true;
                let steps=0;
                while(q.waveDirector.phase==='combat'&&steps++<2000){
                    m.update(.05);q.updateZombies(.05);
                    for(const zombie of [...q.zombies])if(zombie.userData.spawnState==='street')q.killZombie(zombie,{awardScore:false,allowPowerup:false});
                    q.updateWave(.05);
                }
                if(q.waveDirector.phase!=='intermission'||q.waveDirector.spawned!==7)throw Error('wave did not finish');
                const delay=q.waveDirector.remaining;q.controls.isLocked=false;q.updateWave(5);
                const paused=q.waveDirector.remaining===delay;
                q.controls.isLocked=true;q.updateWave(9.9);
                const waited=q.waveDirector.number===1&&q.waveDirector.remaining>0;
                q.updateWave(.11);
                const advanced=q.waveDirector.number===2&&m.active.length===4;
                q.controls.isLocked=false;
                return{steps,delay,paused,waited,advanced};
            });
            assert(lifecycle.paused && lifecycle.waited && lifecycle.advanced && lifecycle.delay === 10,JSON.stringify(lifecycle));
            console.log(JSON.stringify({ quality, layout, coverage, results, lifecycle }));
            assert.deepEqual(errors, []);
        }
    } finally {
        if (browser) await browser.close();
        server.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
