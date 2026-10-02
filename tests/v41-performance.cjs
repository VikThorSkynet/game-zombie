// Controlled CPU samples; these do not substitute for the user's GPU/playtest.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
const file=process.env.QA_GAME_FILE||fs.readFileSync(path.join(root,'README.md'),'utf8').match(/\((game_version[^)]+\.html)\)/)[1];
const hooks=`window.perfQA={THREE,createZombie,resetGame,enemyHitboxes,humanoidVisuals,renderScene,zombieTypeConfigs,get zombies(){return zombies},get meshes(){return zombieHitMeshes},get camera(){return camera},get scene(){return scene},get renderer(){return renderer},get controls(){return controls}};`;
const source=fs.readFileSync(path.join(root,file),'utf8').replace('        init();',hooks+'\n        init();');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(source)});
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/?quality=low`);await page.waitForFunction(()=>window.gameBootComplete&&window.perfQA,{timeout:90000});
 const result=await page.evaluate(()=>{
  const q=perfQA,T=q.THREE;q.controls.isLocked=false;q.resetGame();
  const spawn=[],shots=[],r=new T.Raycaster(),ids=['z07','z08','z02','z04','z06','z05','z03','z01'];
  for(let i=0;i<ids.length;i++){const t=performance.now();q.createZombie(new T.Vector3((i%4-1.5)*2,0,-8-Math.floor(i/4)*4),{...q.zombieTypeConfigs.normal,assetId:ids[i]});spawn.push(performance.now()-t);}
  q.scene.updateMatrixWorld(true);
  for(let i=0;i<30;i++){const target=new T.Vector3((i%4-1.5)*2,1+(i%3)*.5,-8),origin=new T.Vector3(0,1.8,0);r.set(origin,target.sub(origin).normalize());const t=performance.now();q.enemyHitboxes.intersect(r,q.zombies,q.meshes);shots.push(performance.now()-t);}
  const summarize=rows=>{rows.sort((a,b)=>a-b);return {median:rows[Math.floor(rows.length/2)],p95:rows[Math.floor(rows.length*.95)],max:rows.at(-1)}};
  return {spawnMs:summarize(spawn),raycastMs:summarize(shots),meshCount:q.meshes.length,triangleStats:q.enemyHitboxes.stats||null};
 });console.log(JSON.stringify({file,...result},null,2));if(process.env.QA_PERF_REPORT)fs.writeFileSync(process.env.QA_PERF_REPORT,JSON.stringify({file,...result},null,2));
 }finally{await browser?.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
