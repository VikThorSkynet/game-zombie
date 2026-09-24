// Local opt-in measurements; no browser or renderer dependency.
export class MetricHistogram {
    constructor(){this.bins=new Map();this.count=0;this.sum=0;this.max=0;this.over50=0;}
    add(value){
        if(!Number.isFinite(value)||value<0)return;
        // Fixed 0.1 ms buckets up to 10 s; overflow is explicit in reports.
        const bin=Math.min(100000,Math.round(value*10));
        this.bins.set(bin,(this.bins.get(bin)||0)+1);this.count++;this.sum+=value;
        this.max=Math.max(this.max,value);if(value>50)this.over50++;
    }
    report(){
        const sorted=[...this.bins].sort((a,b)=>a[0]-b[0]);
        const percentile=p=>{let n=0;for(const [v,c]of sorted){n+=c;if(n>=Math.ceil(this.count*p))return v/10;}return null;};
        return {samples:this.count,medianMs:percentile(.5),p95Ms:percentile(.95),meanMs:this.count?this.sum/this.count:null,maxMs:this.count?this.max:null,over50ms:this.over50,overflow10s:this.bins.get(100000)||0};
    }
}

// Asynchronous WebGL2 GPU samples; at most four outstanding queries, one per ten renders.
export class GPUFrameTimer {
    constructor(gl,onSample){this.gl=gl;this.onSample=onSample;this.ext=gl.createQuery?gl.getExtension('EXT_disjoint_timer_query_webgl2'):null;this.pending=[];this.counter=0;this.discarded=0;}
    poll(){
        if(!this.ext)return;
        const gl=this.gl,disjoint=gl.getParameter(this.ext.GPU_DISJOINT_EXT);
        this.pending=this.pending.filter(p=>{
            if(disjoint){gl.deleteQuery(p.query);this.discarded++;return false;}
            if(!gl.getQueryParameter(p.query,gl.QUERY_RESULT_AVAILABLE))return true;
            const ms=gl.getQueryParameter(p.query,gl.QUERY_RESULT)/1e6;
            this.onSample(p.context,ms,p.window);gl.deleteQuery(p.query);return false;
        });
    }
    begin(context,window){
        if(!this.ext||this.gl.isContextLost())return null;
        this.poll();if(this.counter++%10!==0||this.pending.length>=4)return null;
        const query=this.gl.createQuery();if(!query)return null;
        this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT,query);return {query,context,window};
    }
    end(sample){if(sample){this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);this.pending.push(sample);}}
    clear(){for(const p of this.pending)this.gl.deleteQuery(p.query);this.pending=[];}
}

export class PlaytestMetrics {
    constructor(metadata={}){this.metadata={...metadata};this.reset();}
    reset(){
        this.activeSeconds=0;this.simulationSeconds=0;this.events=[];this.droppedEvents=0;
        this.milestones={};this.waves=[];this.currentWave=null;this.weapons={};this.shot=null;
        this.totals={shots:0,hitShots:0,firearmKills:0,kills:0,headHits:0,plates:0,deaths:0};
        this.economy={points:{earned:0,spent:0},scrap:{earned:0,spent:0}};
        this.purchases={};this.clearPerformance();this.lastDamage=null;this.outcome=null;
    }
    clearPerformance(){this.performance={};this.metadata.performanceStartActiveSeconds=this.activeSeconds;}
    tick(realSeconds,simulationSeconds){if(this.outcome)return;this.activeSeconds+=Math.max(0,realSeconds);this.simulationSeconds+=Math.max(0,simulationSeconds);}
    log(type,data={}){if(this.events.length<5000)this.events.push({type,activeSeconds:this.activeSeconds,...data});else this.droppedEvents++;}
    mark(name,wave){if(!this.milestones[name])this.milestones[name]={activeSeconds:this.activeSeconds,wave};}
    event(e){
        if(this.outcome)return;
        if(e.type==='waveStarted'){
            if(this.waves.length>=1000)this.waves.shift();
            this.currentWave={wave:e.wave,kind:e.kind,startSeconds:this.activeSeconds,completed:false};this.waves.push(this.currentWave);
        }
        if(e.type==='waveCompleted'&&this.currentWave){this.currentWave.completed=true;this.currentWave.durationSeconds=this.activeSeconds-this.currentWave.startSeconds;}
        if(e.type==='weaponFired'){
            this.totals.shots++;this.shot={weapon:e.weapon,hit:false};
            const w=this.weapons[e.weapon]??={shots:0,hitShots:0,kills:0};w.shots++;
        }
        if(e.type==='enemyDamaged'){
            if(e.headshot)this.totals.headHits++;
            if(this.shot&&['bullet','laser'].includes(e.cause)&&!this.shot.hit){this.shot.hit=true;this.totals.hitShots++;this.weapons[this.shot.weapon].hitShots++;}
            return;
        }
        if(e.type==='enemyKilled'){
            this.totals.kills++;
            if(['bullet','laser'].includes(e.cause)){this.totals.firearmKills++;if(this.shot)this.weapons[this.shot.weapon].kills++;}
        }
        if(e.type==='purchase'){
            this.economy[e.currency].spent+=e.cost;
            const key=e.currency+':'+e.item,p=this.purchases[key]??={count:0,total:0};p.count++;p.total+=e.cost;
        }
        if(e.type==='income')this.economy[e.currency].earned+=e.amount;
        if(e.type==='plateEquipped')this.totals.plates++;
        if(e.type==='playerDamaged')this.lastDamage={cause:e.cause,enemyType:e.enemyType,lostHealth:e.lostHealth,activeSeconds:this.activeSeconds};
        if(e.type==='doorOpened')this.mark('gate',e.wave);
        if(e.type==='areaChanged'&&e.to==='installation')this.mark('installation',e.wave);
        if(e.type==='milestone')this.mark(e.name,e.wave);
        if(e.type==='gameEnded'){
            this.outcome=e.outcome;
            if(e.outcome==='death')this.totals.deaths++;
            this.mark(e.outcome,e.wave);
        }
        this.log(e.type,e);
    }
    endShot(){this.shot=null;}
    frame(context,frameMs,cpuMs,render){
        // Context names are controlled by the integration, never positions or wave numbers.
        const p=this.performance[context]??={frame:new MetricHistogram(),cpu:new MetricHistogram(),gpu:new MetricHistogram(),renders:0,drawCalls:0,triangles:0,maxDrawCalls:0,maxTriangles:0,ranges:{},first:null,last:null};
        if(frameMs!==null)p.frame.add(frameMs);p.cpu.add(cpuMs);
        if(render){p.renders++;p.drawCalls+=render.calls;p.triangles+=render.triangles;p.maxDrawCalls=Math.max(p.maxDrawCalls,render.calls);p.maxTriangles=Math.max(p.maxTriangles,render.triangles);p.first??={...render};p.last={...render};}
        if(render)for(const key of ['width','height','pixelRatio','geometries','textures','programs','enemies']){
            if(!Number.isFinite(render[key]))continue;
            const range=p.ranges[key]??={min:render[key],max:render[key]};range.min=Math.min(range.min,render[key]);range.max=Math.max(range.max,render[key]);
        }
    }
    gpuFrame(context,ms){if(!this.performance[context])this.frame(context,null,null,null);this.performance[context].gpu.add(ms);}
    report(state={}){
        const performance=Object.fromEntries(Object.entries(this.performance).map(([key,p])=>[key,{frame:p.frame.report(),cpuSubmission:p.cpu.report(),gpu:p.gpu.report(),renders:p.renders,meanDrawCalls:p.renders?p.drawCalls/p.renders:null,meanTriangles:p.renders?p.triangles/p.renders:null,maxDrawCalls:p.maxDrawCalls,maxTriangles:p.maxTriangles,ranges:p.ranges,first:p.first,last:p.last}]));
        return JSON.parse(JSON.stringify({schemaVersion:1,metadata:this.metadata,activeSeconds:this.activeSeconds,simulationSeconds:this.simulationSeconds,outcome:this.outcome,totals:{...this.totals,accuracy:this.totals.shots?this.totals.hitShots/this.totals.shots:null,shotsPerFirearmKill:this.totals.firearmKills?this.totals.shots/this.totals.firearmKills:null},weapons:this.weapons,economy:this.economy,purchases:this.purchases,waves:this.waves,milestones:this.milestones,lastDamage:this.lastDamage,performance,events:this.events,droppedEvents:this.droppedEvents,state,limitations:['CPU is main-thread update/render submission, not GPU time.','GPU is sampled asynchronously when supported; pending/disjoint queries are excluded. Total process memory unavailable; resource counts are not bytes.','Frame percentiles use 0.1 ms bins capped at 10 seconds; overflow is reported.','Shot accuracy counts shots causing health damage, including pellets/penetration once.','Automation is not a human balance playtest.']}));
    }
}
