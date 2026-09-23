// Shared, renderer-independent rules. Stage 2 economy uses separate points and scrap.
export const BALANCE = Object.freeze({
    waves: Object.freeze({ baseCount: 4, countPerRound: 3, baseSpawnInterval: 0.95,
        intervalReduction: 0.05, minSpawnInterval: 0.25, retryInterval: 0.25,
        intermission: 10, maxActiveLow: 24, maxActiveHigh: 32 }),
    enemies: Object.freeze({ baseHealth: 100, healthPerRound: 12, healthGrowth: 1.12,
        lateHealthGrowth: 1.06, baseDamage: 8,
        damagePerRound: 0.7, baseSpeed: 1.8, speedPerRound: 0.18,
        speedCapRound: 15, speedVariation: 0.4, minSpawnDistance: 20 }),
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
        this.maxActive = maxActive;
        this.holds = new Set();
        this.advanceHolds = new Set();
        this.reset();
    }
    reset() {
        this.number = 0; this.phase = 'idle'; this.total = 0; this.spawned = 0;
        this.spawnTimer = 0; this.remaining = 0;
        this.holds.clear(); this.advanceHolds.clear();
    }
    start(number) {
        if (!Number.isInteger(number) || number < 1) throw new RangeError('Invalid wave');
        this.number = number;
        this.total = BALANCE.waves.baseCount + number * BALANCE.waves.countPerRound;
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
