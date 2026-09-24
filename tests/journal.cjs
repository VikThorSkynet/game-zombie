module.exports=async function(page,assert,quality,releaseTag){
    const result=await page.evaluate(()=>{
        const q=qa,T=q.THREE,c={};q.resetGame();q.controls.isLocked=true;
        document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyJ'}));
        c.open=!!document.getElementById('field-journal')&&!q.controls.isLocked;
        const before=q.waveDirector.spawned;q.updateWave(30);c.paused=q.waveDirector.spawned===before;
        document.querySelector('#contract-actions button').click();c.accepted=q.journal.contract.status==='active';
        document.getElementById('close-journal').click();c.closed=!document.getElementById('field-journal')&&!q.controls.isLocked;
        q.controls.isLocked=true;const gen=q.generators[0];q.camera.position.copy(gen.position).add(new T.Vector3(0,1.8,2));q.interact();c.exclusive=!q.generatorNetwork.active;
        q.score=0;
        for(let i=0;i<3;i++){q.createZombie(new T.Vector3(0,0,-10));q.killZombie(q.zombies.at(-1),{awardScore:true,allowPowerup:false,cause:'melee'});}
        c.reward=q.score===675&&q.journal.completed===1&&q.journal.contract.status==='completed';
        q.gameEvents.emit('enemyKilled',{wave:1,enemyId:12345,cause:'melee',reward:125});c.once=q.score===675;
        q.startWave(2);q.generatorNetwork.start(0);c.defenseBlock=!q.acceptContract();q.generatorNetwork.reset();q.acceptContract();
        q.waveDirector.spawned=q.waveDirector.total;q.updateWave(0);c.failed=q.journal.contract.status==='failed';
        c.records=q.records.wave>=2&&q.records.challenges>=1&&JSON.parse(localStorage.getItem('sobreviva.records.v1')).kills>=3;
        q.gameEvents.emit('generatorCompleted',{generator:0});q.gameEvents.emit('generatorCompleted',{generator:0});
        q.gameEvents.emit('areaChanged',{from:'city',to:'installation'});c.entries=q.journal.entries.length===2;
        q.openJournal();return c;
    });
    for(const [key,value]of Object.entries(result))assert(value,`journal ${quality}: ${key}`);
    if(process.env.QA_SCREENSHOTS)await page.screenshot({path:require('node:path').join(process.env.QA_SCREENSHOTS,`${releaseTag}-journal-${quality}.png`)});
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'close-journal');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#field-journal').count(),0);
    await page.evaluate(()=>{const q=qa,record=q.records.challenges;q.resetGame();if(q.journal.entries.length||q.journal.completed||q.records.challenges!==record)throw Error('journal reset/record persistence');q.controls.isLocked=false;});
    console.log(`Journal ${quality}:`,result);
};
