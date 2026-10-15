// Exercise real round/challenge/notice states and their rendered layout.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const file = fs.readFileSync(path.join(root, 'README.md'), 'utf8').match(/\((game_version[^)]+\.html)\)/)[1];
const hooks = `window.hudQA={resetGame,startWave,updateWaveHud,updateNotices,showWaveMessage,
    updateContainmentHud,renderScene,gameEvents,journal,waveDirector,generatorNetwork,
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
        const boxes = visible('#generator-hud,#wave-break,#challenge-preview,#waveMessage,#ui,#mission-ui').map(bounds);
        const overlap = [];
        for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++) {
            const a=boxes[i],b=boxes[j];
            if(Math.min(a.right,b.right)-Math.max(a.x,b.x)>.5 && Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>.5)
                overlap.push([a.id,b.id]);
        }
        const clipped = visible('#next-wave-label,#wave-countdown,#wave-skip,#wave-hold-hint,.challenge-kicker,#challenge-title,#challenge-target,#waveMessage,#generator-instruction')
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
        const output=path.join(root,'docs/captures/v42');fs.mkdirSync(output,{recursive:true});
        for(const quality of ['low','high']) {
            await page.goto(`http://127.0.0.1:${server.address().port}/?quality=${quality}`);
            await page.waitForFunction(()=>window.gameBootComplete&&window.hudQA,null,{timeout:90000});
            await page.evaluate(()=>{
                const q=hudQA;q.resetGame();q.show();q.controls.isLocked=true;q.updateNotices(3);q.controls.isLocked=false;
                q.gameEvents.emit('waveCompleted',{wave:1});q.waveDirector.phase='intermission';q.waveDirector.remaining=2;q.updateWaveHud();q.renderScene();
            });
            assert.equal(await page.locator('#next-wave-label').innerText(),'Próxima onda 02');
            assert.equal(await page.locator('#wave-countdown').innerText(),'2s');
            assert(await page.locator('#challenge-preview').isVisible());
            for(const size of [{width:1920,height:1080},{width:1280,height:720},{width:1024,height:768},
                {width:980,height:720},{width:800,height:600},{width:640,height:360},{width:427,height:360}]) {
                await page.setViewportSize(size);
                const result=await layout(page);
                assert.deepEqual(result.overlap,[],JSON.stringify({quality,size,...result}));
                assert.deepEqual(result.clipped,[],JSON.stringify({quality,size,...result}));
                if([1280,640].includes(size.width))await page.screenshot({path:path.join(output,`hud-rounds-${quality}-${size.width}.png`)});
            }
            // A terminal can hold the interval while a generator and an alert are visible.
            await page.setViewportSize({width:640,height:360});
            await page.evaluate(()=>{
                const q=hudQA;q.waveDirector.advanceHolds.add('interaction');q.updateWaveHud();
                q.generatorNetwork.start(0,1);q.generatorNetwork.active.elapsed=14;q.updateContainmentHud();
                q.showWaveMessage('Retorne ao círculo para continuar a defesa',3);
            });
            assert.equal(await page.locator('#wave-countdown').innerText(),'EM ESPERA');
            assert(await page.locator('#wave-skip').isHidden());
            assert(await page.locator('#wave-hold-hint').isVisible());
            const held=await layout(page);
            assert.deepEqual(held.overlap,[],JSON.stringify(held));assert.deepEqual(held.clipped,[],JSON.stringify(held));
            await page.screenshot({path:path.join(output,`hud-held-${quality}.png`)});
            await page.evaluate(()=>{
                const q=hudQA;q.generatorNetwork.reset();q.updateContainmentHud();q.waveDirector.advanceHolds.delete('interaction');q.startWave(2);
            });
            assert(await page.locator('#round-preparation').isHidden());
            assert(await page.locator('#challenge-preview').isHidden());
            assert.equal(await page.locator('#waveMessage').innerText(),'Retorne ao círculo para continuar a defesa');
            await page.evaluate(()=>{hudQA.controls.isLocked=true;hudQA.updateNotices(3);hudQA.controls.isLocked=false;});
            assert(await page.locator('#waveMessage').isHidden());
            await page.evaluate(()=>document.body.classList.add('menu-open'));
            assert.equal(await page.locator('#hud-announcements').evaluate(el=>getComputedStyle(el).visibility),'hidden');
            console.log(JSON.stringify({quality,viewports:7,noOverlap:true,noClipping:true,held:true,combat:true,menu:true}));
        }
        assert.deepEqual(errors,[]);
    } finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
