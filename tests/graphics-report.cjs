const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../docs/measurements'),rows=[];
for(const quality of ['low','high']){
    const before=JSON.parse(fs.readFileSync(path.join(root,'p5-before-'+quality+'.json')));
    const after=JSON.parse(fs.readFileSync(path.join(root,'p5-after-'+quality+'.json')));
    for(const scenario of [...new Set(before.reports.map(r=>r.scenario))]){
        const stats=data=>{
            const samples=data.reports.filter(r=>r.scenario===scenario).map(r=>r.report.performance['benchmark:'+scenario]);
            const range=fn=>{const a=samples.map(fn);return [Math.min(...a),Math.max(...a)];};
            return {drawCalls:range(p=>p.meanDrawCalls),triangles:range(p=>p.meanTriangles),geometry:range(p=>p.last.geometries),texture:range(p=>p.last.textures),
                frameMedianMs:range(p=>p.frame.medianMs),frameP95Ms:range(p=>p.frame.p95Ms),cpuMedianMs:range(p=>p.cpuSubmission.medianMs),gpuMedianMs:range(p=>p.gpu.medianMs),
                over50ms:samples.reduce((n,p)=>n+p.frame.over50ms,0),resolution:samples.map(p=>p.last.width+'x'+p.last.height)};
        };
        rows.push({quality,scenario,before:stats(before),after:stats(after)});
    }
}
const result={method:'3 repetitions per scenario and preset; 2s warm-up + 5s collection; paused actors, fixed gameplay camera, 1920x1080 DPR1, headless Chrome. Range is min/max among repetitions, never a combined percentile.',limitations:'No human/gameplay FPS claim. Random world decoration and system load are not fully controlled. Inspect draw calls and geometry alongside timings. New camera fix makes these not directly comparable to prior P1 files.',rows};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,'p5-comparison.json'),JSON.stringify(result,null,2)+'\n');
console.table(rows.map(r=>({preset:r.quality,scene:r.scenario,callsBefore:r.before.drawCalls.join('–'),callsAfter:r.after.drawCalls.join('–'),geoBefore:r.before.geometry.join('–'),geoAfter:r.after.geometry.join('–'),p95Before:r.before.frameP95Ms.join('–'),p95After:r.after.frameP95Ms.join('–')})));
