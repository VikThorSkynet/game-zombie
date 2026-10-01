const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),file=fs.readFileSync(path.join(root,'README.md'),'utf8').match(/\((game_version[^)]+\.html)\)/)[1];
const hooks=`window.enemyQA={THREE,createZombie,resetGame,renderScene,updateUI,updateWeapon,updateZombies,updateCombatEffects,fireBullet,killZombie,applyLegDamage,startCampaignBoss,zombieTypeConfigs,humanoidVisuals,bloodEffects,get scene(){return scene},get camera(){return camera},get renderer(){return renderer},get zombies(){return zombies},get controls(){return controls},show(){document.body.classList.remove('menu-open');overlay.style.display='none';operationStarted=true;controls.isLocked=false;}};`;
const source=fs.readFileSync(path.join(root,file),'utf8').replace('        init();',hooks+'\n        init();');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(source)});
(async()=>{let browser;try{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});const p=await browser.newPage({viewport:{width:1000,height:720}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/?quality=high`);await p.waitForFunction(()=>window.gameBootComplete,{timeout:60000});fs.mkdirSync(path.join(root,'docs/captures/crawl-v39'),{recursive:true});
for(const id of ['z01','z02','z03','z04','z05','z06','z07','z08']){
 const result=await p.evaluate(id=>{const q=enemyQA,T=q.THREE;q.resetGame();q.show();q.createZombie(new T.Vector3(0,0,-4),{...q.zombieTypeConfigs.normal,assetId:id});const z=q.zombies[0],m=z.userData.importedHumanoid;
 const scale=m.crawl.bones.map(b=>b.scale.toArray());q.applyLegDamage(z,1e6);q.humanoidVisuals.update(m,.25,z.userData,4);const falling=m.fall>0&&m.fall<1;
 for(let i=0;i<60;i++)q.humanoidVisuals.update(m,1/60,z.userData,4);
 z.updateMatrixWorld(true);const bounds=new T.Box3();m.root.traverse(mesh=>{if(mesh.isSkinnedMesh){const pt=new T.Vector3();for(let i=0;i<mesh.geometry.attributes.position.count;i++)bounds.expandByPoint(mesh.getVertexPosition(i,pt).applyMatrix4(mesh.matrixWorld))}});
 const before=m.crawl.bones.map(b=>b.quaternion.clone());q.humanoidVisuals.update(m,.15,z.userData,4);const moves=m.crawl.bones.some((b,i)=>b.quaternion.angleTo(before[i])>1e-5);
 const sameScale=m.root.scale.equals(new T.Vector3(1,1,1))&&m.crawl.bones.every((b,i)=>b.scale.toArray().every((v,j)=>Math.abs(v-scale[i][j])<1e-4));
 q.camera.position.set(3,2.3,-.5);q.camera.lookAt(0,.65,-4);if(!q.scene.getObjectByName('crawl-test-light')){const light=new T.HemisphereLight(0xffffff,0x665555,2);light.name='crawl-test-light';q.scene.add(light);}q.updateWeapon(0);q.renderScene();return{id,falling,moves,sameScale,size:bounds.getSize(new T.Vector3()).toArray(),bottom:bounds.min.y,height:m.crawl.height};},id);
 console.log(JSON.stringify(result));assert(result.falling&&result.moves&&result.sameScale);assert(result.size[1]<1.9&&result.size[2]>2,JSON.stringify(result));assert(result.bottom>-.25&&result.bottom<.4,JSON.stringify(result));await p.screenshot({path:path.join(root,'docs/captures/crawl-v39',id+'.png')});}
assert.deepEqual(errors,[]);
}finally{await browser?.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
