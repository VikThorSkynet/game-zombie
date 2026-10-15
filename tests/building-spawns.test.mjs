import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { SPAWN_RULES, Barricade, selectSpawnEntries, distributeWave, segmentClear } from '../game-systems.mjs';

function randomSeed(seed) {
    return () => ((seed = Math.imul(1664525, seed) + 1013904223 >>> 0) / 4294967296);
}
const entry = (id, x, z = 0) => ({ id, valid: true, exit: { x, z } });

test('four distinct safe buildings: nearby first, distant fallback, no mutation', () => {
    const entries = [entry(0, 3), entry(1, 15), entry(2, 25), entry(3, 60), entry(4, 80), entry(5, 90)];
    for (let seed = 1; seed <= 200; seed++) {
        const chosen = selectSpawnEntries(entries, { x: 0, z: 0 }, randomSeed(seed));
        assert.equal(chosen.length, 4);
        assert.equal(new Set(chosen).size, 4);
        assert(chosen.includes(entries[1]) && chosen.includes(entries[2]));
        assert(!chosen.includes(entries[0]));
    }
    assert.equal(entries.length, 6);
    assert.throws(() => selectSpawnEntries(entries.slice(0, 4), { x: 0, z: 0 }), /quatro/);
});

test('wave distribution preserves population and all type configurations', () => {
    const entries = [entry(1, 15), entry(2, 25), entry(3, 35), entry(4, 45)];
    let type = 0;
    const queues = distributeWave(19, entries, () => type++ % 4, randomSeed(4));
    assert.equal([...queues.values()].flat().length, 19);
    assert([...queues.values()].every(queue => queue.length >= 4 && queue.length <= 5));
    assert.equal(new Set([...queues.values()].flat()).size, 4);
});

test('all boards must break, only one attacker and occupant, no repair under attack', () => {
    const door = new Barricade();
    door.attack('first', 1.2);
    assert.equal(door.remaining, 4);
    assert.deepEqual(door.attack('second', 5), []);
    assert.deepEqual(door.repair(10), []);
    assert.equal(door.reservePassage('first'), false);
    door.attack('first', 4.8);
    assert.equal(door.remaining, 0);
    assert.equal(door.reservePassage('first'), true);
    assert.equal(door.reservePassage('second'), false);
    assert.deepEqual(door.repair(10), []);
    door.release('first');
    assert.equal(door.repair(0.8).length, 1);
    assert.equal(door.remaining, 1);
    assert.equal(door.reservePassage('second'), false);
});

test('death releases attack ownership and incomplete repair does not repair a board', () => {
    const door = new Barricade();
    door.attack('dead', 2.4);
    door.release('dead');
    assert.equal(door.remaining, 3);
    door.repair(0.4);
    assert.equal(door.remaining, 3);
    door.repairTime = 0;
    door.repair(0.4);
    assert.equal(door.remaining, 3);
    door.repair(0.4);
    assert.equal(door.remaining, 4);
    door.reset();
    assert.equal(door.remaining, 5);
    assert.equal(door.occupant, null);
});

test('swept clearance catches thin walls and refuses diagonal corner cutting', () => {
    const wall = { minX: -0.05, maxX: 0.05, minZ: -5, maxZ: 5 };
    assert.equal(segmentClear({ x: -8, z: 0 }, { x: 8, z: 0 }, [wall], 0.8), false);
    assert.equal(segmentClear({ x: -8, z: 7 }, { x: 8, z: 7 }, [wall], 0.8), true);
});

test('HTML module remains valid JavaScript', () => {
    const html = readFileSync(new URL('../game_version42_15-10-2026_18-44-03.html', import.meta.url), 'utf8');
    const source = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
    const result = spawnSync(process.execPath, ['--check', '--input-type=module'], { input: source, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
});
