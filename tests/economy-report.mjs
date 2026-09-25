// Analytical scenarios, never human skill or a navigation/combat simulation.
import {readFileSync,writeFileSync} from 'node:fs';
import {BALANCE,WEAPON_STATS,RARITIES,enemyHealth,waveProfile} from '../game-systems.mjs';
const baseline=JSON.parse(readFileSync(new URL('../docs/measurements/p3-v29-baseline.json',import.meta.url)));
const accuracies=[.35,.6,.85],rounds=[1,5,10,15,20];
const range=(w,d)=>1-(1-w.minDamage)*Math.max(0,Math.min(1,(d-w.falloffStart)/(w.falloffEnd-w.falloffStart)));
export function engagement(w,{round,accuracy,head=false,rarity=0,pap=false,distance=5}){
    const multiplier=(w.id==='ray_gun'?1:RARITIES[rarity].multiplier)*(pap?BALANCE.upgrades.damage:1);
    const damage=(head?w.damageHead:w.damageBody)*w.pellets*multiplier*range(w,distance);
    const hits=Math.ceil(enemyHealth(round)/damage),shots=hits/accuracy;
    const mag=Math.ceil(w.magSize*(pap?BALANCE.upgrades.magazine:1));
    const reloads=Math.floor((Math.ceil(shots)-1)/mag);
    return {weapon:w.id,round,accuracy,head,rarity,pap,distance,damage,hits,expectedShots:shots,
        estimatedSeconds:Math.max(0,shots-1)*w.fireRate/1000+reloads*w.reloadDuration,
        sustainedDps:damage*accuracy*mag/(mag*w.fireRate/1000+w.reloadDuration),
        refillCost:pap?w.papAmmoCost:w.ammoCost,ammoCostPerKill:shots*(pap?w.papAmmoCost:w.ammoCost)/(mag*5)};
}
function matrix(weapons){
    const rows=[];
    for(const w of Object.values(weapons))for(const round of rounds)for(const accuracy of accuracies)
    for(const head of [false,true])for(const rarity of w.id==='ray_gun'?[0]:[0,1,2,3,4])for(const pap of [false,true])
        rows.push(engagement(w,{round,accuracy,head,rarity,pap}));
    return rows;
}
export function route(weapons,accuracy,objectives){
    const w=weapons.pistol;let points=0,scrap=0,ammo=80,pap=false,rarity=0,vest=false;
    let firstPap=null,firstRarity=null,unfundedAmmo=0;const rows=[];
    for(let round=1;round<=20;round++){
        let earned=0,spent=0,shots=0,refills=0,scrapThisRound=0;
        const mag=()=>Math.ceil(w.magSize*(pap?BALANCE.upgrades.magazine:1));
        const encounter=(count,threat,multiplier=1)=>{
            for(let i=0;i<count;i++){
                const head=i%4===3,damage=(head?w.damageHead:w.damageBody)*(pap?BALANCE.upgrades.damage:1)*RARITIES[rarity].multiplier;
                const required=Math.ceil(Math.ceil(enemyHealth(threat,multiplier)/damage)/accuracy);
                for(let n=0;n<required;n++){
                    if(ammo===0){const cost=pap?w.papAmmoCost:w.ammoCost;if(points<cost)unfundedAmmo+=cost-points;points-=cost;spent+=cost;refills++;ammo=mag()*5;}
                    ammo--;shots++;
                }
                const reward=head?BALANCE.economy.skilledKill:BALANCE.economy.kill;
                points+=reward;earned+=reward;
                const grant=Math.min(BALANCE.economy.scrapPerKill,BALANCE.economy.scrapPerRound-scrapThisRound);scrap+=grant;scrapThisRound+=grant;
            }
        };
        const profile=waveProfile(round);encounter(profile.total,round,profile.kind==='dogs'?BALANCE.dogs.healthMultiplier:1);
        if(profile.kind==='dogs')ammo=mag()*5;
        if(objectives){points+=300;earned+=300;}
        const generator=[3,5,7].indexOf(round);
        if(objectives&&generator>=0){
            const count=BALANCE.containment.budgets[generator],threat=Math.max(round,3+generator*2);
            for(let i=0;i<count;i++)encounter(1,threat,i%4===3?BALANCE.dogs.healthMultiplier:i%3===2?.72:1);
            points+=300;earned+=300;
        }
        if(points>=BALANCE.armor.plateCost){points-=BALANCE.armor.plateCost;spent+=BALANCE.armor.plateCost;}
        if(!rarity&&scrap>=RARITIES[1].cost){scrap-=RARITIES[1].cost;rarity=1;firstRarity=round;}
        if(!vest&&round>=4&&points>=BALANCE.armor.tier2Cost){points-=BALANCE.armor.tier2Cost;spent+=BALANCE.armor.tier2Cost;vest=true;}
        if(vest&&!pap&&points>=BALANCE.economy.packAPunch){points-=BALANCE.economy.packAPunch;spent+=BALANCE.economy.packAPunch;pap=true;firstPap=round;ammo=mag()*5;}
        rows.push({round,earned,spent,points,scrap,shots,refills,pap,rarity});
    }
    return {accuracy,objectives,firstPap,firstRarity,unfundedAmmo,rows};
}
const variants={
    before:baseline.weapons,
    damageCadenceOnly:Object.fromEntries(Object.entries(baseline.weapons).map(([id,w])=>[id,{...w,...Object.fromEntries(['damageHead','damageBody','fireRate','magSize','reloadDuration','penetration'].map(k=>[k,WEAPON_STATS[id][k]]))}])),
    rangeOnly:Object.fromEntries(Object.entries(baseline.weapons).map(([id,w])=>[id,{...w,...Object.fromEntries(['falloffStart','falloffEnd','minDamage','spread','adsSpread'].map(k=>[k,WEAPON_STATS[id][k]]))}])),
    ammoOnly:Object.fromEntries(Object.entries(baseline.weapons).map(([id,w])=>[id,{...w,ammoCost:WEAPON_STATS[id].ammoCost,papAmmoCost:WEAPON_STATS[id].papAmmoCost}])),
    after:WEAPON_STATS
};
const output={base:'cbfa9a1',release:'v30',kind:'analytical-not-human-playtest',
    assumptions:['35/60/85% are assumed successful-shot probabilities, not measured player skill.',
    'Weapon matrix: normal enemy, all pellets hit on a successful shot (shotgun upper bound), one target; penetration benefits excluded.',
    'Matrix covers body/head, every eligible rarity and PaP; time includes reloads but excludes travel, aim acquisition, recoil and enemy attacks.',
    'Route uses pistol, 25% headshot targets, ordinary enemies approximated as normal, dogs actual health; no random drops, Double Points, Nuke, box or perks.',
    'One plate bought per wave when affordable; vest tier 2 from wave 4; first uncommon then saves scrap; PaP after vest and upkeep.',
    'Objective route assumes every optional contract completed (+300), generators on waves 3/5/7 with mixed finite reinforcements and +300 each.',
    'Guaranteed dog Max Ammo collected immediately; PaP refills. Unfunded ammo reports impossible financing, not a viable playthrough.',
    'No claims about gate/boss/extraction time. Generator interactions, melee risk and navigation are not simulated.'],
    matrix:{before:matrix(variants.before),after:matrix(variants.after)},
    families:Object.fromEntries(Object.entries(variants).map(([name,ws])=>[name,Object.values(ws).flatMap(w=>[5,20,50].map(distance=>engagement(w,{round:10,accuracy:.6,distance})))])),
    routes:Object.fromEntries(['before','after'].map(name=>[name,accuracies.flatMap(a=>[false,true].map(o=>route(variants[name],a,o)))])),
    reviewedUnchanged:{plate:BALANCE.armor.plateCost,vest2:BALANCE.armor.tier2Cost,vest3:BALANCE.armor.tier3Cost,pap:BALANCE.economy.packAPunch,rarities:RARITIES.map(r=>r.cost),contract:300,generator:300,scrapCap:BALANCE.economy.scrapPerRound}};
if(process.argv.includes('--write'))writeFileSync(new URL('../docs/measurements/p3-comparison.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
console.table(Object.entries(output.routes).flatMap(([version,rs])=>rs.map(r=>({version,accuracy:r.accuracy,objectives:r.objectives,rarity:r.firstRarity,pap:r.firstPap,unfundedAmmo:r.unfundedAmmo}))));
console.table(output.families.after.filter(r=>r.distance===5).map(r=>({weapon:r.weapon,bodyDps:Math.round(r.sustainedDps),wave10Shots:+r.expectedShots.toFixed(1),ammoPerKill:+r.ammoCostPerKill.toFixed(1)})));
