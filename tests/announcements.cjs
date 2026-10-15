// Exercise the borderless HUD, real perks/bonus timers and round transitions.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const file = fs.readFileSync(path.join(root, 'README.md'), 'utf8').match(/\((game_version[^)]+\.html)\)/)[1];
const hooks = `window.hudQA={resetGame,startWave,updateWaveHud,updateNotices,showWaveMessage,
    updateContainmentHud,renderScene,gameEvents,journal,waveDirector,generatorNetwork,
    updateUI,applyPowerup,updatePowerups,openJournal,closeJournal,
    setPerks(active){hasJuggernog=hasSpeedCola=hasDoubleTap=hasMoveSpeed=active;updateUI();},
    set score(value){score=value},get camera(){return camera},get weapons(){return playerWeapons},
    get controls(){return controls},
    show(){operationStarted=true;document.body.classList.remove('menu-open');overlay.style.display='none';}};`;
const source = fs.readFileSync(path.join(root, file), 'utf8').replace('        init();', hooks + '\n        init();');
const server = http.createServer((req,res) => {
    const name = path.basename(decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if(name.endsWith('.mp3')) {
        const audio = path.join(root,name);
        if(!fs.existsSync(audio)){res.writeHead(404);res.end();return;}
        res.setHeader('Content-Type','audio/mpeg');fs.createReadStream(audio).pipe(res);return;
    }
    res.setHeader('Content-Type','text/html;charset=utf-8');res.end(source);
});

async function layout(page) {
    return page.evaluate(() => {
        const visible = selector => [...document.querySelectorAll(selector)].filter(el =>
            el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
        const bounds = el => {const r=el.getBoundingClientRect();return {id:el.id,x:r.x,y:r.y,right:r.right,bottom:r.bottom};};
        const boxes = visible('#generator-hud,#wave-break,#waveMessage,#ui,#wave,#perk-badges,#weapon-ui,#active-bonuses,#round-intro').map(bounds);
        const overlap = [];
        for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++) {
            const a=boxes[i],b=boxes[j];
            if(Math.min(a.right,b.right)-Math.max(a.x,b.x)>.5 && Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>.5)
                overlap.push([a.id,b.id]);
        }
        const clipped = visible('#next-wave-label,#wave-countdown,#wave-skip,#wave-hold-hint,#waveMessage,#generator-instruction,#points-row,#weapon,#ammo,.active-bonus')
            .filter(el => {const r=el.getBoundingClientRect();return r.x<0||r.right>innerWidth+.5||r.y<0||r.bottom>innerHeight+.5||el.scrollWidth>el.clientWidth+1;})
            .map(el=>el.id||el.className);
        return {overlap,clipped,boxes};
    });
}

(async()=>{
    let browser;
    try {
        await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
        browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
        const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        const output=path.join(root,'docs/captures/v42/hud-classic');fs.mkdirSync(output,{recursive:true});
        for(const quality of ['low','high']) {
            await page.goto(`http://127.0.0.1:${server.address().port}/?quality=${quality}`);
            await page.waitForFunction(()=>window.gameBootComplete&&window.hudQA,null,{timeout:90000});
            await page.evaluate(()=>{
                const q=hudQA;q.resetGame();q.show();q.controls.isLocked=true;q.updateNotices(3);q.controls.isLocked=false;
                q.gameEvents.emit('waveCompleted',{wave:1});q.waveDirector.phase='intermission';q.waveDirector.remaining=2;q.updateWaveHud();q.renderScene();
            });
            assert.equal(await page.locator('#next-wave-label').innerText(),'Próxima: 02');
            assert.equal(await page.locator('#wave-countdown').innerText(),'2s');
            assert.equal(await page.locator('#challenge-preview').count(),0,'challenge details belong in the journal');
            await page.evaluate(()=>{
                const q=hudQA;q.setPerks(true);q.score=2850;
                q.applyPowerup('insta_kill');q.applyPowerup('double_points');q.applyPowerup('fire_sale');q.updateUI();
                q.controls.isLocked=true;q.updateNotices(3);q.controls.isLocked=false;
            });
            assert.equal(await page.locator('#perk-badges .hud-emblem').count(),4);
            assert.equal(await page.locator('#active-bonuses .active-bonus').count(),3);
            const sizes=[{width:1920,height:1080},{width:1280,height:720},{width:1024,height:768},
                {width:980,height:720},{width:800,height:600},{width:640,height:360},{width:427,height:360}];
            for(const size of sizes) {
                await page.setViewportSize(size);
                const result=await layout(page);
                const health=result.boxes.find(box=>box.id==='ui');
                assert(health&&health.x>size.width/2&&health.y<40&&health.right>size.width-35,'vitals stay in the upper right');
                assert.deepEqual(result.overlap,[],JSON.stringify({quality,size,...result}));
                assert.deepEqual(result.clipped,[],JSON.stringify({quality,size,...result}));
                if([1280,640].includes(size.width))await page.screenshot({path:path.join(output,`interval-${quality}-${size.width}.png`)});
            }
            const borderless=await page.evaluate(()=>['round-preparation','generator-hud','waveMessage','hud-announcements','ui','weapon-ui'].every(id=>{
                const style=getComputedStyle(document.getElementById(id));
                return style.backgroundImage==='none'&&style.backgroundColor==='rgba(0, 0, 0, 0)'&&parseFloat(style.borderTopWidth)===0&&style.boxShadow==='none';
            }));
            assert(borderless,'gameplay HUD has no cards or panel backgrounds');
            await page.evaluate(()=>hudQA.openJournal());
            assert(await page.locator('#field-journal').isVisible());
            assert(await page.locator('#field-journal').innerText().then(text=>text.includes('Eliminações com faca')));
            await page.evaluate(()=>{hudQA.closeJournal();hudQA.show();});
            // The same interval may be held while the generator, four perks and three bonuses are visible.
            await page.setViewportSize({width:640,height:360});
            await page.evaluate(()=>{
                const q=hudQA;q.waveDirector.advanceHolds.add('interaction');q.updateWaveHud();
                q.generatorNetwork.start(0,1);q.generatorNetwork.active.elapsed=14;q.updateContainmentHud();
                q.showWaveMessage('Retorne ao círculo para continuar a defesa',3);
            });
            assert.equal(await page.locator('#wave-countdown').innerText(),'EM ESPERA');
            assert(await page.locator('#wave-skip').isHidden());assert(await page.locator('#wave-hold-hint').isVisible());
            const held=await layout(page);
            assert.deepEqual(held.overlap,[],JSON.stringify(held));assert.deepEqual(held.clipped,[],JSON.stringify(held));
            await page.screenshot({path:path.join(output,`held-${quality}.png`)});
            await page.setViewportSize({width:427,height:360});
            const narrowHeld=await layout(page);assert.deepEqual(narrowHeld.overlap,[],JSON.stringify(narrowHeld));assert.deepEqual(narrowHeld.clipped,[],JSON.stringify(narrowHeld));
            await page.evaluate(()=>{
                const q=hudQA;q.generatorNetwork.reset();q.updateContainmentHud();q.waveDirector.advanceHolds.delete('interaction');
                q.controls.isLocked=true;q.updateNotices(3);q.controls.isLocked=false;q.startWave(7);
            });
            assert(await page.locator('#round-preparation').isHidden());
            assert(await page.locator('#round-intro').isVisible());
            assert.equal(await page.locator('#wave').getAttribute('aria-label'),'Rodada 7');
            assert(await page.locator('#round-marks path').count()>4,'round seven uses tally marks');
            await page.setViewportSize({width:1280,height:720});
            await page.screenshot({path:path.join(output,`round-intro-${quality}.png`)});
            await page.evaluate(()=>{hudQA.controls.isLocked=false;hudQA.updateNotices(10);});
            assert(await page.locator('#round-intro').isVisible(),'pause freezes round introduction');
            await page.evaluate(()=>{hudQA.controls.isLocked=true;hudQA.updateNotices(3);hudQA.controls.isLocked=false;});
            assert(await page.locator('#round-intro').isHidden(),'round introduction expires');
            await page.screenshot({path:path.join(output,`combat-${quality}.png`)});
            // Icons reflect actual duration and the existing pause rule; expired bonuses disappear.
            const before=await page.locator('#active-bonuses').innerText();
            await page.evaluate(()=>{hudQA.updatePowerups(100);hudQA.updateUI();});
            assert.equal(await page.locator('#active-bonuses').innerText(),before);
            await page.evaluate(()=>{hudQA.controls.isLocked=true;hudQA.updatePowerups(26);hudQA.updateUI();hudQA.controls.isLocked=false;});
            assert(await page.locator('#active-bonuses .expiring').count()>0);
            await page.evaluate(()=>{hudQA.controls.isLocked=true;hudQA.updatePowerups(10);hudQA.updateUI();hudQA.controls.isLocked=false;});
            assert(await page.locator('#active-bonuses').isHidden());
            for(const round of [1,5,10,11,100]) {
                await page.evaluate(round=>{const q=hudQA;q.startWave(round);q.controls.isLocked=true;q.updateNotices(3);q.controls.isLocked=false;},round);
                await page.setViewportSize({width:427,height:360});
                const result=await layout(page);assert.deepEqual(result.overlap,[],JSON.stringify({round,...result}));assert.deepEqual(result.clipped,[],JSON.stringify({round,...result}));
            }
            await page.evaluate(()=>{hudQA.resetGame();hudQA.show();});
            assert.equal(await page.locator('#perk-badges .perk-badge').count(),0);
            assert(await page.locator('#active-bonuses').isHidden());
            await page.evaluate(()=>document.body.classList.add('menu-open'));
            assert.equal(await page.locator('#survival-hud').evaluate(el=>getComputedStyle(el).visibility),'hidden');
            assert.equal(await page.locator('#round-intro').evaluate(el=>getComputedStyle(el).visibility),'hidden');
            console.log(JSON.stringify({quality,viewports:7,borderless:true,noOverlap:true,noClipping:true,perks:4,bonuses:3,journal:true,intro:true,expiry:true,reset:true}));
        }
        assert.deepEqual(errors,[]);
    } finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
