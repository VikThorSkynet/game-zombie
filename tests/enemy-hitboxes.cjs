const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),file=fs.readFileSync(path.join(root,'README.md'),'utf8').match(/\((game_version[^)]+\.html)\)/)[1];
const hooks=`window.hitQA={THREE,createZombie,createDog,resetGame,enemyHitboxes,humanoidVisuals,animateImportedDog,applyLegDamage,fireBullet,fireLaser,gameEvents,bulletBlockers,zombieTypeConfigs,get zombies(){return zombies},get meshes(){return zombieHitMeshes},get camera(){return camera},get scene(){return scene},get controls(){return controls}};`;
const source=fs.readFileSync(path.join(root,file),'utf8').replace('        init();',hooks+'\n        init();');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(source)});
(async()=>{let browser;try{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const quality of ['low','high']){await p.goto(`http://127.0.0.1:${server.address().port}/?quality=${quality}`);await p.waitForFunction(()=>window.gameBootComplete&&window.hitQA,{timeout:60000});
const results=await p.evaluate(()=>{
 const q=hitQA,T=q.THREE,results=[];q.bulletBlockers.splice(0);
 for(const id of ['z01','z02','z03','z04','z05','z06','z07','z08','dog1','dog2']){
  q.resetGame();q.controls.isLocked=false;
  if(id.startsWith('dog')){while(!q.zombies.some(z=>z.userData.assetId===id))q.createDog(new T.Vector3(0,0,-5));}
  else q.createZombie(new T.Vector3(0,0,-5),{...q.zombieTypeConfigs.normal,scale:id==='z05'?1.25:1,assetId:id});
  const z=q.zombies.find(z=>z.userData.assetId===id),meshes=z.userData.hitMeshes;
  for(const other of q.zombies)if(other!==z)other.position.x=100;
  const regions=new Set(),samples={},resultsByPose=[];let damageChecks=0;
  for(let pose=0;pose<3;pose++){
   if(z.userData.importedHumanoid){if(pose===2)q.applyLegDamage(z,1e6);q.humanoidVisuals.update(z.userData.importedHumanoid,pose===2?1:.4,z.userData,4);}
   else q.animateImportedDog(z.userData.importedDog,pose*1.9,pose===2?'lunge':'pursue');
   z.updateWorldMatrix(true,false);z.updateMatrixWorld(true);
   const reference=meshes.map(m=>{m.computeBoundingBox();m.computeBoundingSphere();return{m,box:m.boundingBox.clone(),sphere:m.boundingSphere.clone()}});
   const bounds=new T.Box3();for(const r of reference)bounds.union(r.box.clone().applyMatrix4(r.m.matrixWorld));
   let hits=0,misses=0,mismatches=0;
   for(let iy=0;iy<17;iy++)for(let ix=0;ix<13;ix++){
    const origin=new T.Vector3(T.MathUtils.lerp(bounds.min.x-.2,bounds.max.x+.2,ix/12),T.MathUtils.lerp(bounds.min.y-.1,bounds.max.y+.1,iy/16),bounds.max.z+2);
    const ray=new T.Raycaster(origin,new T.Vector3(0,0,-1),0,10),exact=[];
    for(const r of reference){r.m.boundingBox.copy(r.box);r.m.boundingSphere.copy(r.sphere);T.SkinnedMesh.prototype.raycast.call(r.m,ray,exact)}exact.sort((a,b)=>a.distance-b.distance);
    const actual=q.enemyHitboxes.intersect(ray,[z],meshes);
    if(!!actual.length!==!!exact.length||(actual.length&&Math.abs(actual[0].distance-exact[0].distance)>1e-5))mismatches++;
    if(actual.length){hits++;const region=q.enemyHitboxes.region(actual[0]);regions.add(region);if(pose===0&&!samples[region])samples[region]={origin:origin.toArray(),point:actual[0].point.toArray()};}else misses++;
   }
   resultsByPose.push({pose,hits,misses,mismatches});
   if(pose===0)for(const [expected,sample]of Object.entries(samples))for(const kind of ['bullet','laser']){
    z.userData.health=1e6;z.userData.legHealth=z.userData.legMaxHealth=1e6;
    q.camera.position.fromArray(sample.origin);q.camera.lookAt(new T.Vector3().fromArray(sample.point));q.camera.updateMatrixWorld(true);
    let event;const off=q.gameEvents.on('enemyDamaged',e=>event=e);
    if(kind==='bullet')q.fireBullet(100,20,0,1,false,false);else q.fireLaser(100,20,0,1);
    off();
    if(!event||event.headshot!==(expected==='head')||(z.userData.legHealth<1e6)!==(expected==='leg'))throw Error(id+' '+kind+' '+expected+' damage classification');
    damageChecks++;
   }
  }
  results.push({id,damageChecks,regions:[...regions],poses:resultsByPose,onlyVisibleGeometry:meshes.every(m=>m.userData.importedEnemy&&m.userData.animatedHitbox)});
 }
 q.resetGame();return results;
});
for(const r of results){assert.equal(r.damageChecks,6,r.id+' damage');assert(r.onlyVisibleGeometry,r.id+' old proxies');assert(r.regions.includes('head')&&r.regions.includes('body')&&r.regions.includes('leg'),JSON.stringify(r));for(const pose of r.poses)assert(pose.hits>0&&pose.misses>0&&pose.mismatches===0,JSON.stringify(r));}
assert.deepEqual(errors,[]);console.log(JSON.stringify({quality,results}));}
}finally{await browser?.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
