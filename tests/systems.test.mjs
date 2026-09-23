import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BALANCE, WaveDirector, GameEvents, enemyHealth, enemyDamage, enemySpeed } from '../game-systems.mjs';

test('spawning has a finite budget, honors simultaneous cap and retries failures without consuming a zombie', () => {
    const director = new WaveDirector(2);
    director.start(1);
    assert.equal(director.total, 7);
    assert.equal(director.step(0, 0), 'spawn');
    director.acknowledgeSpawn(false);
    assert.equal(director.spawned, 0);
    assert.equal(director.step(0.1, 0), null);
    assert.equal(director.step(0.15, 0), 'spawn');
    director.acknowledgeSpawn(true);
    assert.equal(director.step(1, 1), 'spawn');
    director.acknowledgeSpawn(true);
    assert.equal(director.step(100, 2), null);
    assert.equal(director.spawned, 2);
    for (let i = 2; i < 7; i++) {
        assert.equal(director.step(1, 1), 'spawn');
        director.acknowledgeSpawn(true);
    }
    director.acknowledgeSpawn(true);
    assert.equal(director.spawned, 7);
    assert.equal(director.step(1, 1), null, 'last live enemy blocks completion');
    assert.equal(director.step(1, 0), 'completed');
    assert.equal(director.remaining, 10);
    assert.equal(director.step(9, 0), null);
    assert.equal(director.step(1, 0), 'next');
    assert.equal(director.step(1, 0), null, 'next emitted only once');
});

test('pause, overlapping holds, skip and restart cannot advance a wave accidentally', () => {
    const director = new WaveDirector();
    director.start(1);
    assert.equal(director.skipIntermission(), false);
    assert.equal(director.step(20, 0, false), null);
    assert.equal(director.spawned, 0);
    director.holds.add('loading'); director.holds.add('menu');
    director.holds.delete('loading');
    assert.equal(director.step(20, 0), null);
    director.holds.clear();
    for (let i = 0; i < 7; i++) {
        assert.equal(director.step(1, 0), 'spawn'); director.acknowledgeSpawn(true);
    }
    director.advanceHolds.add('generator');
    assert.equal(director.step(30, 0), null);
    director.advanceHolds.delete('generator');
    assert.equal(director.step(0, 0), 'completed');
    const remaining = director.remaining;
    director.step(10, 0, false);
    assert.equal(director.remaining, remaining);
    director.advanceHolds.add('objective');
    assert.equal(director.skipIntermission(), false);
    director.advanceHolds.clear();
    assert.equal(director.skipIntermission(), true);
    assert.equal(director.step(0, 0), 'next');
    director.holds.add('loading'); director.advanceHolds.add('objective');
    director.reset(); director.start(1);
    assert.equal(director.holds.size + director.advanceHolds.size, 0);
    assert.equal(director.step(0, 0), 'spawn');
});

test('100 waves keep correct population totals and exactly one completion per wave', () => {
    const director = new WaveDirector(24);
    for (let round = 1; round <= 100; round++) {
        director.start(round);
        for (let i = 0; i < 4 + round * 3; i++) {
            assert.equal(director.step(1, 0), 'spawn');
            director.acknowledgeSpawn(true);
        }
        assert.equal(director.step(0, 0), 'completed');
        assert.equal(director.step(10, 0), 'next');
        assert.equal(director.step(10, 0), null);
    }
});

test('existing enemy tuning remains unchanged, including speed cap', () => {
    const type = { speedBonus: 1.2 };
    assert.equal(enemyHealth(1), 112);
    assert.equal(enemyHealth(20, 2.2), 748);
    assert.equal(enemyDamage(10, 2), 30);
    assert.equal(enemySpeed(15, type, 0.5), enemySpeed(100, type, 0.5));
    assert(enemySpeed(14, type, 0.5) < enemySpeed(15, type, 0.5));
    assert(Object.isFrozen(BALANCE.waves));
});

test('event subscribers can unsubscribe; payloads are immutable and event name cannot be spoofed', () => {
    const bus = new GameEvents(), seen = [];
    const unsubscribe = bus.on('enemyKilled', event => seen.push(event));
    bus.emit('enemyKilled', { type: 'wrong', cause: 'melee', reward: 10 });
    unsubscribe(); bus.emit('enemyKilled', { cause: 'nuke' });
    assert.equal(seen.length, 1);
    assert.equal(seen[0].type, 'enemyKilled');
    assert.equal(seen[0].cause, 'melee');
    assert(Object.isFrozen(seen[0]));
});
