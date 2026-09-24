import {readFileSync} from 'node:fs';
const files=process.argv.slice(2);
if(!files.length){console.error('Uso: node scripts/summarize-metrics.mjs relatório.json [outro.json]');process.exitCode=1;}
for(const file of files){
    const input=JSON.parse(readFileSync(file,'utf8'));
    const reports=input.reports||[{report:input,scenario:input.metadata?.route,repetition:input.metadata?.runLabel}];
    console.log(file);
    for(const {report:r,scenario,repetition}of reports){
        const boss=r.milestones?.bossStarted,defeated=r.milestones?.bossDefeated;
        console.log(JSON.stringify({scenario,repetition,quality:r.metadata.quality,automated:r.metadata.automated,activeSeconds:r.activeSeconds,shots:r.totals.shots,accuracy:r.totals.accuracy,shotsPerFirearmKill:r.totals.shotsPerFirearmKill,points:r.economy.points,scrap:r.economy.scrap,gate:r.milestones.gate??null,firstPaP:r.milestones.firstPaP??null,bossSeconds:boss&&defeated?defeated.activeSeconds-boss.activeSeconds:null,extraction:r.milestones.extracted??null,frames:Object.fromEntries(Object.entries(r.performance).filter(([key])=>!key.startsWith('menu')).map(([key,p])=>[key,{...p.frame,cpu:p.cpuSubmission,gpu:p.gpu,meanDrawCalls:p.meanDrawCalls,meanTriangles:p.meanTriangles,internalResolution:p.last?[p.last.width,p.last.height]:null}]))}));
    }
}
