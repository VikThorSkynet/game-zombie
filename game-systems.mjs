// Shared, renderer-independent rules. Values remain at v17 balance unless noted.
export const BALANCE = Object.freeze({
    waves: Object.freeze({ baseCount: 4, countPerRound: 3, baseSpawnInterval: 0.95,
        intervalReduction: 0.05, minSpawnInterval: 0.25, retryInterval: 0.25,
        intermission: 10, maxActiveLow: 24, maxActiveHigh: 32 }),
    enemies: Object.freeze({ baseHealth: 100, healthPerRound: 12, baseDamage: 8,
        damagePerRound: 0.7, baseSpeed: 1.8, speedPerRound: 0.18,
        speedCapRound: 15, speedVariation: 0.4, minSpawnDistance: 20 }),
    economy: Object.freeze({ mystery: 950, sale: 10, packAPunch: 5000,
        ammo: 250, upgradedAmmo: 1000, rayAmmo: 1500, upgradedRayAmmo: 3000,
        nuke: 400, fallbackKill: 10 }),
    upgrades: Object.freeze({ damage: 2.5, magazine: 1.5 }),
    melee: Object.freeze({ damage: 150, duration: 0.55, range: 2.5,
        coneDot: 0.72, stagger: 0.22, knockback: 0.3 }),
    drops: Object.freeze({ chance: 0.09, duration: 30 })
});

export function enemyHealth(round, multiplier = 1) {
    return Math.floor((BALANCE.enemies.baseHealth + round * BALANCE.enemies.healthPerRound) * multiplier);
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
