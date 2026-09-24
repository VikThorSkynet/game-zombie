// Test the released document unchanged, including the double-click file:// path.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
const filename=fs.readFileSync(path.join(root,'README.md'),'utf8').match(/\((game_version[^)]+\.html)\)/)[1];
const server=http.createServer((req,res)=>{
    const name=path.basename(decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    const file=path.join(root,name);
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type',name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.mjs')?'text/javascript':'audio/mpeg');
    fs.createReadStream(file).pipe(res);
});
(async()=>{
    let browser;
    try {
        await new Promise(r=>server.listen(0,'127.0.0.1',r));
        browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
        for(const [protocol,quality] of [['file','auto'],['file','low'],['file','high'],['http','auto']]) {
            const page=await browser.newPage();const failures=[];
            page.on('pageerror',e=>failures.push(String(e)));
            page.on('console',m=>{if(m.type()==='error')failures.push(m.text());});
            const url=protocol==='file'?pathToFileURL(path.join(root,filename)).href:`http://127.0.0.1:${server.address().port}/${filename}`;
            await page.goto(url+'?quality='+quality);
            try {await page.getByRole('button',{name:'INICIAR OPERAÇÃO'}).waitFor({timeout:20000});}
            catch(e){console.error({protocol,failures,status:await page.locator('#panel').innerText()});throw e;}
            await page.getByRole('button',{name:'INICIAR OPERAÇÃO'}).click();
            await page.waitForFunction(()=>document.getElementById('overlay').style.display==='none');
            assert.equal(await page.locator('canvas').count(),1);
            await page.keyboard.press('KeyV');
            assert(await page.evaluate(()=>window.gameBootComplete===true&&!window.qa));
            if(protocol==='file')assert(await page.evaluate(async()=>{
                const clip=new Audio(new URL('facada.mp3',location.href));clip.volume=0;
                await clip.play();const ready=clip.duration>0;clip.pause();return ready;
            }),'local MP3 plays through native audio');
            assert.equal(failures.filter(s=>!s.includes('404')).length,0,JSON.stringify(failures));
            console.log(JSON.stringify({protocol,quality,menu:true,started:true}));await page.close();
        }
        const offline=await browser.newPage();
        await offline.route('https://cdn.jsdelivr.net/**',route=>route.abort());
        await offline.goto(pathToFileURL(path.join(root,filename)).href);
        await offline.getByRole('button',{name:'TENTAR NOVAMENTE'}).waitFor({timeout:25000});
        assert.equal(await offline.locator('.loading-line').count(),0);
        console.log(JSON.stringify({blockedEngine:true,retryVisible:true}));await offline.close();
    } finally {await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
