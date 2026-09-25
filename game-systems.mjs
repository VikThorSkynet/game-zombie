// Shared, renderer-independent rules. Stage 2 economy uses separate points and scrap.
export const BALANCE = Object.freeze({
    waves: Object.freeze({ baseCount: 4, countPerRound: 3, baseSpawnInterval: 0.95,
        intervalReduction: 0.05, minSpawnInterval: 0.25, retryInterval: 0.25,
        intermission: 10, maxActiveLow: 24, maxActiveHigh: 32 }),
    enemies: Object.freeze({ baseHealth: 100, healthPerRound: 12, healthGrowth: 1.12,
        lateHealthGrowth: 1.06, baseDamage: 8,
        damagePerRound: 0.7, baseSpeed: 1.8, speedPerRound: 0.18,
        speedCapRound: 15, speedVariation: 0.4, minSpawnDistance: 20 }),
    dogs: Object.freeze({healthMultiplier:.95,speedBonus:2.45,minSpeed:2.6,damageMultiplier:1.45,windup:.65,recovery:.8,lungeSpeed:13.5}),
    containment: Object.freeze({durations:Object.freeze([30,40,50]),budgets:Object.freeze([8,10,12])}),
    economy: Object.freeze({ mystery: 950, sale: 10, packAPunch: 5000,
        ammo: 250, upgradedAmmo: 1000, rayAmmo: 1500, upgradedRayAmmo: 3000,
        nuke: 400, kill: 100, skilledKill: 125, scrapPerKill: 3, scrapPerRound: 90 }),
    armor: Object.freeze({ plateHealth: 50, absorption: 0.6, plateCost: 150,
        reserveLimit: 5, applyDuration: 1.4, tier2Cost: 1500, tier3Cost: 3000 }),
    weapons: Object.freeze({ smgInterval: 90, smgMagazine: 40, smgBody: 32, smgHead: 56,
        shotgunBodyPerPellet: 18, shotgunHeadPerPellet: 36, doubleTapInterval: 0.75 }),
    upgrades: Object.freeze({ damage: 2.5, magazine: 1.5 }),
    melee: Object.freeze({ damage: 150, duration: 0.55, range: 2.5,
        coneDot: 0.72, stagger: 0.22, knockback: 0.3 }),
    drops: Object.freeze({ chance: 0.09, duration: 30 })
});

export const RARITIES = Object.freeze([
    Object.freeze({ name: 'Comum', color: '#b9c8d1', multiplier: 1, cost: 0 }),
    Object.freeze({ name: 'Incomum', color: '#74dd94', multiplier: 1.25, cost: 100 }),
    Object.freeze({ name: 'Rara', color: '#65baff', multiplier: 1.55, cost: 200 }),
    Object.freeze({ name: 'Épica', color: '#c396ff', multiplier: 1.9, cost: 350 }),
    Object.freeze({ name: 'Lendária', color: '#ffd16b', multiplier: 2.3, cost: 550 })
]);

export function waveProfile(round, normalCap = BALANCE.waves.maxActiveHigh) {
    let dogRound=5,index=0,previous=-10;
    while(dogRound<round){previous=dogRound;dogRound+=index%2===0?5:6;index++;}
    const dogs=round===dogRound;
    const fog=!dogs&&round>=8&&round%4===0&&round-previous>1&&dogRound-round>1;
    return Object.freeze({kind:dogs?'dogs':fog?'fog':'normal',
        total:dogs?Math.min(24,6+index*2):BALANCE.waves.baseCount+round*BALANCE.waves.countPerRound,
        cap:dogs?Math.min(normalCap,8,4+index):fog?Math.max(1,Math.floor(normalCap*.65)):normalCap,
        fogDensity:fog?.05:.006});
}

export function stepFog(density,target,delta,active=true) {
    if(!active||!Number.isFinite(delta)||delta<0)return density;
    if(Math.abs(target-density)<=delta*.008)return target;
    return density+Math.sign(target-density)*Math.min(Math.abs(target-density),delta*.008);
}

export function areaTravelReason({phase,unlocked,objective,busy}) {
    if(!unlocked)return 'Restaure os três geradores e abra o acesso norte';
    if(objective)return 'Conclua a defesa do gerador antes de viajar';
    if(busy)return 'Conclua a ação atual antes de viajar';
    if(phase!=='intermission')return 'Disponível entre ondas';
    return '';
}

// Optional, wave-scoped contracts. Only paid player eliminations count.
export class ContainmentCampaign {
    constructor(){this.reset();}
    reset(){this.records=new Set();this.parts=new Set();this.code=0;this.stage='records';this.phase=1;this.health=2400;this.shield=0;this.extraction=0;}
    get busy(){return this.stage==='boss'||this.stage==='extracting';}
    collect(kind,id,powered){
        if(!powered||!Number.isInteger(id)||id<0||id>2)return false;
        const set=kind==='record'&&this.stage==='records'?this.records:kind==='part'&&this.stage==='parts'?this.parts:null;
        if(!set||set.has(id))return false;set.add(id);
        if(set.size===3)this.stage=kind==='record'?'parts':'symbols';return true;
    }
    symbol(id){if(this.stage!=='symbols')return false;this.code=id===[2,0,1][this.code]?this.code+1:0;if(this.code===3)this.stage='ready';return this.code>0;}
    start(eligible){if(this.stage!=='ready'||!eligible)return false;this.stage='boss';this.shield=2;return true;}
    hit(amount){
        if(this.stage!=='boss'||this.shield>0||!Number.isFinite(amount)||amount<=0)return 0;
        const dealt=Math.min(amount,this.health-(3-this.phase)*800);this.health-=dealt;
        if(this.health===0)this.stage='choice';
        else if(this.health===(3-this.phase)*800){this.phase++;this.shield=2;}
        return dealt;
    }
    choose(mode,eligible){if(this.stage!=='choice'||!eligible||!['infinite','extracting'].includes(mode))return false;this.stage=mode;return true;}
    step(delta,active,inside=false,enemies=0){
        if(!active||!Number.isFinite(delta)||delta<0)return false;
        this.shield=Math.max(0,this.shield-delta);
        if(this.stage==='extracting'&&inside){this.extraction=Math.min(15,this.extraction+delta);if(this.extraction===15&&enemies===0){this.stage='extracted';return true;}}
        return false;
    }
}

export class FieldJournal {
    constructor(){this.reset();}
    reset(){this.entries=[];this.discoveries=new Set();this.contract=null;this.completed=0;this.bestWave=0;this.seen=new Set();}
    discover(id,text){if(this.discoveries.has(id))return false;this.discoveries.add(id);this.entries.push(text);return true;}
    offer(wave,kind='normal',canHeadshot=true){
        if(this.contract?.wave===wave)return;
        this.finish();this.seen.clear();
        const type=kind==='normal'&&wave<=3?'melee':kind==='normal'&&wave%2===0&&canHeadshot?'head':'kills';
        this.contract={wave,type,target:type==='melee'?3:type==='head'?3:5,progress:0,status:'offered',reward:300};
    }
    accept(eligible=true){if(!eligible||this.contract?.status!=='offered')return false;this.contract.status='active';return true;}
    abandon(){if(this.contract?.status!=='active')return false;this.contract.status='abandoned';return true;}
    kill(event){
        const c=this.contract;
        if(!c||c.status!=='active'||event.wave!==c.wave||!(event.reward>0)||this.seen.has(event.enemyId))return 0;
        this.seen.add(event.enemyId);
        if(c.type==='melee'&&event.cause!=='melee'||c.type==='head'&&!event.headshot)return 0;
        c.progress=Math.min(c.target,c.progress+1);
        if(c.progress<c.target)return 0;
        c.status='completed';this.completed++;return c.reward;
    }
    finish(){if(this.contract&&['active','offered'].includes(this.contract.status))this.contract.status=this.contract.status==='active'?'failed':'expired';}
}

export function readRecords(value){
    let data;try{data=JSON.parse(value||'{}');}catch{data={};}
    return Object.fromEntries(['wave','kills','challenges'].map(key=>[key,Number.isSafeInteger(data?.[key])&&data[key]>=0?data[key]:0]));
}

export class DogAttack {
    constructor(){this.phase='pursue';this.remaining=0;this.hit=false;}
    recover(){this.phase='recover';this.remaining=BALANCE.dogs.recovery;}
    step(delta,distance,clear,active=true){
        if(!active||!Number.isFinite(delta)||delta<0)return;
        if(this.phase==='pursue'){
            if(distance<=5&&clear){this.phase='windup';this.remaining=BALANCE.dogs.windup;this.hit=false;}
            return;
        }
        this.remaining=Math.max(0,this.remaining-delta);
        if(this.remaining>0)return;
        if(this.phase==='windup'){this.phase='lunge';this.remaining=.35;}
        else if(this.phase==='lunge')this.recover();
        else this.phase='pursue';
    }
    consumeHit(){if(this.phase!=='lunge'||this.hit)return false;this.hit=true;return true;}
}
export function rarityOf(weapon) {
    return weapon.configId === 'ray_gun'
        ? { name: 'Especial', color: '#69f5de', multiplier: 1, cost: 0 }
        : RARITIES[weapon.rarity || 0] || RARITIES[0];
}
export function weaponMultiplier(weapon) {
    return rarityOf(weapon).multiplier * (weapon.packapunched ? BALANCE.upgrades.damage : 1);
}
export function rarityUpgrade(weapon, scrap) {
    if (weapon.configId === 'ray_gun') return { ok: false, message: 'Ray Gun: categoria especial, use Pack-a-Punch' };
    const next = RARITIES[(weapon.rarity || 0) + 1];
    if (!next) return { ok: false, message: 'Raridade máxima' };
    if (scrap < next.cost) return { ok: false, message: `Faltam ${next.cost - scrap} sucatas` };
    weapon.rarity = (weapon.rarity || 0) + 1;
    return { ok: true, cost: next.cost, message: `Arma ${next.name.toLowerCase()}` };
}

// Cumulative thresholds. No legendary before round 15; the same roll improves with round.
export function rollRarity(round, random = Math.random()) {
    const thresholds = round < 5 ? [0.75, 1, 1, 1]
        : round < 10 ? [0.35, 0.8, 1, 1]
        : round < 15 ? [0.1, 0.4, 0.9, 1] : [0.05, 0.2, 0.55, 0.9];
    const roll = Math.min(1 - Number.EPSILON, Math.max(0, random));
    const index = thresholds.findIndex(threshold => roll < threshold);
    return index < 0 ? 4 : index;
}
export function killReward(cause, headshot, doublePoints = false) {
    return (cause === 'melee' || headshot ? BALANCE.economy.skilledKill : BALANCE.economy.kill)
        * (doublePoints ? 2 : 1);
}

export class ScrapWallet {
    constructor() { this.reset(); }
    reset() { this.amount = 0; this.round = 0; this.earned = 0; }
    beginRound(round) { if (round > this.round) { this.round = round; this.earned = 0; } }
    awardKill() {
        const grant = Math.max(0, Math.min(BALANCE.economy.scrapPerKill, BALANCE.economy.scrapPerRound - this.earned));
        this.earned += grant; this.amount += grant;
        return grant;
    }
}

// One finite defense at a time. Leaving the area freezes both charge and reinforcements.
export class GeneratorNetwork {
    constructor() { this.reset(); }
    reset() { this.completed = new Set(); this.active = null; this.open = false; this.lastCompletedWave = 0; }
    start(id, wave = 1) {
        if (!Number.isInteger(wave) || wave <= this.lastCompletedWave || !Number.isInteger(id) || id < 0 || id > 2 || this.active || this.completed.has(id)) return false;
        const order = this.completed.size;
        this.active = { id, wave, threatWave:Math.max(wave,3+order*2), duration: BALANCE.containment.durations[order], elapsed: 0, budget: BALANCE.containment.budgets[order], spawned: 0, timer: 0 };
        return true;
    }
    step(delta, inside, alive, active = true) {
        const a = this.active;
        if (!a || !active || !inside || !Number.isFinite(delta) || delta < 0) return null;
        a.elapsed = Math.min(a.duration, a.elapsed + delta);
        a.timer = Math.max(0, a.timer - delta);
        if (a.spawned < a.budget && a.timer === 0) return 'spawn';
        if (a.elapsed === a.duration && a.spawned === a.budget && alive === 0) {
            this.completed.add(a.id); this.lastCompletedWave = a.wave; this.active = null;
            return 'completed';
        }
        return null;
    }
    acknowledgeSpawn(created) {
        if (!this.active || this.active.spawned >= this.active.budget) return;
        if (created) this.active.spawned++;
        this.active.timer = created ? 2.5 : 0.5;
    }
    openDoor() {
        if (this.open || this.completed.size !== 3) return false;
        this.open = true; return true;
    }
}

export class ArmorState {
    constructor() { this.reset(); }
    reset() { this.tier = 1; this.protection = 0; this.reserve = 0; this.remaining = 0; }
    get maximum() { return this.tier * BALANCE.armor.plateHealth; }
    get plating() { return this.remaining > 0; }
    get upgradeCost() { return this.tier === 1 ? BALANCE.armor.tier2Cost : this.tier === 2 ? BALANCE.armor.tier3Cost : 0; }
    buyPlate(points) {
        if (this.reserve >= BALANCE.armor.reserveLimit) return { ok: false, message: 'Reserva de placas cheia' };
        if (points < BALANCE.armor.plateCost) return { ok: false, message: 'Pontos insuficientes!' };
        this.reserve++;
        return { ok: true, cost: BALANCE.armor.plateCost, message: 'Placa comprada · [F] Equipar' };
    }
    upgrade(points) {
        if (!this.upgradeCost) return { ok: false, message: 'Colete no nível máximo' };
        if (points < this.upgradeCost) return { ok: false, message: 'Pontos insuficientes!' };
        const cost = this.upgradeCost; this.tier++;
        return { ok: true, cost, message: `Colete ${this.tier} · compre placas para preencher` };
    }
    start() {
        if (this.plating || this.reserve <= 0 || this.protection >= this.maximum) return false;
        this.remaining = BALANCE.armor.applyDuration;
        return true;
    }
    cancel() { this.remaining = 0; }
    step(delta, active = true) {
        if (!active || !this.plating || !Number.isFinite(delta) || delta < 0) return false;
        this.remaining = Math.max(0, this.remaining - delta);
        if (this.remaining > 0) return false;
        this.reserve--; this.protection = Math.min(this.maximum, this.protection + BALANCE.armor.plateHealth);
        return true;
    }
    absorb(amount) {
        if (!Number.isFinite(amount) || amount <= 0) return { healthDamage: 0, absorbed: 0, broken: false };
        const before = this.protection;
        const absorbed = Math.min(before, amount * BALANCE.armor.absorption);
        this.protection = Math.max(0, before - absorbed);
        return { healthDamage: amount - absorbed, absorbed,
            broken: Math.ceil(before / BALANCE.armor.plateHealth) > Math.ceil(this.protection / BALANCE.armor.plateHealth) };
    }
}

export function enemyHealth(round, multiplier = 1) {
    const b = BALANCE.enemies;
    const base = b.baseHealth + Math.min(round, 5) * b.healthPerRound;
    return Math.floor(base * b.healthGrowth ** Math.max(0, Math.min(round, 20) - 5)
        * b.lateHealthGrowth ** Math.max(0, round - 20) * multiplier);
}
export function enemyDamage(round, multiplier = 1) {
    return (BALANCE.enemies.baseDamage + round * BALANCE.enemies.damagePerRound) * multiplier;
}
export function enemySpeed(round, type, variation = Math.random()) {
    const b = BALANCE.enemies;
    return Math.max(type.minSpeed || 1.2, b.baseSpeed + Math.min(round, b.speedCapRound) * b.speedPerRound
        + variation * b.speedVariation + type.speedBonus);
}

/** All game events contain scalar snapshots, never meshes or live scene objects.
 * Consumers subscribe once at boot and retain subscriptions across resetGame.
 * on() returns an unsubscribe function; dispatch uses a snapshot of listeners.
 */
export class GameEvents {
    #listeners = new Map();
    on(type, listener) {
        if (!this.#listeners.has(type)) this.#listeners.set(type, new Set());
        const bucket = this.#listeners.get(type);
        bucket.add(listener);
        return () => {
            bucket.delete(listener);
            if (!bucket.size) this.#listeners.delete(type);
        };
    }
    emit(type, details = {}) {
        const event = Object.freeze({ ...details, type });
        for (const listener of [...(this.#listeners.get(type) || [])]) listener(event);
    }
}

/** One authority for ordinary wave spawning and transitions.
 * step requests a spawn; acknowledgeSpawn counts it only after creation succeeds.
 * holds suspend everything; advanceHolds let combat continue but hold the next wave.
 * Total enemies per round and maximum simultaneous enemies are independent.
 */
export class WaveDirector {
    constructor(maxActive = BALANCE.waves.maxActiveHigh) {
        this.baseMaxActive = maxActive;
        this.maxActive = maxActive;
        this.holds = new Set();
        this.advanceHolds = new Set();
        this.reset();
    }
    reset() {
        this.number = 0; this.phase = 'idle'; this.total = 0; this.spawned = 0;
        this.profile = null; this.maxActive = this.baseMaxActive;
        this.spawnTimer = 0; this.remaining = 0;
        this.holds.clear(); this.advanceHolds.clear();
    }
    start(number, profile = null) {
        if (!Number.isInteger(number) || number < 1) throw new RangeError('Invalid wave');
        this.number = number;
        this.total = BALANCE.waves.baseCount + number * BALANCE.waves.countPerRound;
        this.profile=profile;
        this.maxActive=this.baseMaxActive;
        if(profile){this.total=profile.total;this.maxActive=profile.cap;}
        this.spawned = 0; this.spawnTimer = 0; this.remaining = 0; this.phase = 'combat';
    }
    get spawnInterval() {
        return Math.max(BALANCE.waves.minSpawnInterval,
            BALANCE.waves.baseSpawnInterval - this.number * BALANCE.waves.intervalReduction);
    }
    acknowledgeSpawn(created) {
        if (this.phase !== 'combat' || this.spawned >= this.total) return;
        if (created) this.spawned++;
        this.spawnTimer = created ? this.spawnInterval : BALANCE.waves.retryInterval;
    }
    skipIntermission() {
        if (this.phase !== 'intermission' || this.holds.size || this.advanceHolds.size) return false;
        this.remaining = 0;
        return true;
    }
    step(delta, activeEnemies, active = true) {
        if (!active || this.holds.size || !Number.isFinite(delta) || delta < 0) return null;
        if (this.phase === 'combat') {
            if (this.spawned < this.total) {
                this.spawnTimer = Math.max(0, this.spawnTimer - delta);
                if (activeEnemies < this.maxActive && this.spawnTimer === 0) return 'spawn';
            } else if (activeEnemies === 0 && !this.advanceHolds.size) {
                this.phase = 'intermission'; this.remaining = BALANCE.waves.intermission;
                return 'completed';
            }
        } else if (this.phase === 'intermission' && !this.advanceHolds.size) {
            this.remaining = Math.max(0, this.remaining - delta);
            if (this.remaining === 0) { this.phase = 'idle'; return 'next'; }
        }
        return null;
    }
}
