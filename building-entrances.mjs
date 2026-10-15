import { SPAWN_RULES, Barricade, selectSpawnEntries, segmentClear } from './game-systems.mjs';

export class BuildingSpawnScene {
    constructor({ THREE, scene, camera, buildings, colliders, bulletBlockers, zombies,
        createZombie, damagePlayer, playVoice, isRunning, isExitValid, onChange = () => {} }) {
        Object.assign(this, { THREE, scene, camera, colliders, bulletBlockers, zombies,
            createZombie, damagePlayer, playVoice, isRunning, isExitValid, onChange });
        this.entries = [];
        this.active = [];
        this.repairHeld = false;
        this.repairTarget = null;
        this.lights = Array.from({length: SPAWN_RULES.activeBuildings}, () => {
            const light = new THREE.PointLight(0xffb76b, 0, 9, 2);
            scene.add(light); return light;
        });
        buildings.forEach(building => this.buildEntrance(building));
    }

    buildEntrance(building) {
        const T = this.THREE;
        const normals = [new T.Vector3(0, 0, 1), new T.Vector3(1, 0, 0),
            new T.Vector3(0, 0, -1), new T.Vector3(-1, 0, 0)];
        const options = normals.map(normal => {
            const depth = normal.z ? building.depth : building.width;
            const origin = building.group.position.clone().addScaledVector(normal, depth / 2);
            const exit = origin.clone().addScaledVector(normal, 2.3);
            const outside = origin.clone().addScaledVector(normal, 1.1);
            const obstacles = this.colliders.filter(box => box !== building.collider);
            return { normal, origin, exit, depth,
                valid: segmentClear(outside, exit.clone().addScaledVector(normal, 1.5), obstacles, 1.05) &&
                    this.isExitValid(exit) };
        }).filter(option => option.valid)
            .sort((a, b) => a.exit.lengthSq() - b.exit.lengthSq());
        if (!options.length) return;
        const chosen = options[0];
        const width = chosen.normal.z ? building.width : building.depth;
        const openingWidth = 2.9, openingHeight = 3.35, thickness = 0.18;
        const shell = new T.Group();
        shell.rotation.y = Math.atan2(chosen.normal.x, chosen.normal.z);
        building.group.add(shell);
        building.body.removeFromParent();
        // Keep facade decoration out of the real doorway before batching it.
        building.detail.updateMatrixWorld(true);
        for (const mesh of [...building.detail.children]) {
            if (!mesh.isMesh || !mesh.geometry) continue;
            mesh.geometry.computeBoundingBox();
            const bounds = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrix);
            const transform = new T.Matrix4().makeRotationY(-shell.rotation.y);
            bounds.applyMatrix4(transform);
            if (bounds.min.y < openingHeight && bounds.max.y > 0 &&
                bounds.min.x < openingWidth / 2 && bounds.max.x > -openingWidth / 2 &&
                bounds.max.z >= chosen.depth / 2 - 0.4) {
                mesh.removeFromParent(); mesh.geometry.dispose();
            }
        }
        building.body.geometry.dispose();
        const wall = (w, h, d, x, y, z) => {
            const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), building.material);
            mesh.position.set(x, y, z);
            mesh.castShadow = mesh.receiveShadow = true;
            shell.add(mesh);
            this.bulletBlockers.push(mesh);
        };
        const side = (width - openingWidth) / 2;
        wall(side, building.height, thickness, -(openingWidth + side) / 2, building.height / 2, chosen.depth / 2);
        wall(side, building.height, thickness, (openingWidth + side) / 2, building.height / 2, chosen.depth / 2);
        wall(openingWidth, building.height - openingHeight, thickness, 0,
            openingHeight + (building.height - openingHeight) / 2, chosen.depth / 2);
        wall(width, building.height, thickness, 0, building.height / 2, -chosen.depth / 2);
        wall(thickness, building.height, chosen.depth, -width / 2, building.height / 2, 0);
        wall(thickness, building.height, chosen.depth, width / 2, building.height / 2, 0);
        wall(width, thickness, chosen.depth, 0, building.height, 0);
        // Keep old window decoration off the new opening.
        for (const mesh of [...building.group.children]) {
            if (!mesh.userData.buildingWindow || mesh.position.y > openingHeight) continue;
            const world = mesh.position.clone().applyAxisAngle(new T.Vector3(0, 1, 0), -shell.rotation.y);
            if (Math.abs(world.x) < openingWidth / 2 + 0.5 && world.z > chosen.depth / 2 - 0.2) {
                building.group.remove(mesh); mesh.geometry.dispose();
            }
        }
        const group = new T.Group();
        group.position.copy(chosen.origin);
        group.rotation.y = shell.rotation.y;
        this.scene.add(group);
        const entry = { ...chosen, id: building.id, collider: building.collider, group,
            valid: true, barricade: new Barricade(), boards: [], queue: [], actor: null,
            active: false, cooldown: 0, soundTimer: 0, floorWidth: openingWidth };
        entry.point = (offset, y = 0) => chosen.origin.clone().addScaledVector(chosen.normal, offset).setY(y);
        entry.inner = entry.point(-Math.min(2.1, chosen.depth - 1));
        entry.attackPoint = entry.point(-1.05);
        building.simple.clear();
        building.simple.add(shell.clone(true));
        const frameMaterial = new T.MeshStandardMaterial({ color: 0x34302c, roughness: 0.95 });
        for (const x of [-1.55, 1.55]) {
            const post = new T.Mesh(new T.BoxGeometry(0.16, openingHeight, 0.3), frameMaterial);
            post.position.set(x, openingHeight / 2, 0.1); group.add(post); this.bulletBlockers.push(post);
        }
        const lintel = new T.Mesh(new T.BoxGeometry(3.25, 0.18, 0.3), frameMaterial);
        lintel.position.set(0, openingHeight, 0.1); group.add(lintel); this.bulletBlockers.push(lintel);
        const woodCanvas = document.createElement('canvas');
        woodCanvas.width = 512; woodCanvas.height = 64;
        const paint = woodCanvas.getContext('2d');
        paint.fillStyle = '#806044'; paint.fillRect(0, 0, 512, 64);
        for (let grain = 0; grain < 75; grain++) {
            paint.strokeStyle = grain % 3 ? 'rgba(35,19,9,.22)' : 'rgba(200,161,108,.18)';
            paint.lineWidth = grain % 4 === 0 ? 2 : 1;
            paint.beginPath();
            const y = (grain * 17.3) % 64;
            paint.moveTo(0, y); paint.bezierCurveTo(150, y + 4, 350, y - 5, 512, y + 1); paint.stroke();
        }
        for (const x of [25, 487]) {
            paint.fillStyle = '#302923'; paint.beginPath(); paint.arc(x,32,4,0,Math.PI*2); paint.fill();
            paint.fillStyle = '#7a7166'; paint.fillRect(x-2,31,4,1);
        }
        const woodTexture = new T.CanvasTexture(woodCanvas); woodTexture.colorSpace = T.SRGBColorSpace;
        const wood = new T.MeshStandardMaterial({ color: 0xc2aa89, map: woodTexture, roughness: 0.96 });
        for (let index = 0; index < SPAWN_RULES.boardCount; index++) {
            const board = new T.Mesh(new T.BoxGeometry(3.08, 0.34, 0.16), wood);
            board.position.set(0, 0.36 + index * 0.48, 0.22);
            board.rotation.z = index % 2 ? 0.075 : -0.065;
            board.castShadow = true;
            board.userData.homeY = board.position.y;
            board.userData.homeRotation = board.rotation.z;
            board.userData.intact = true;
            board.userData.fallTime = 0;
            group.add(board); entry.boards.push(board); this.bulletBlockers.push(board);
        }
        const lampMaterial = new T.MeshStandardMaterial({ color: 0x69523b, emissive: 0xff9c42, emissiveIntensity: 0 });
        const lamp = new T.Mesh(new T.BoxGeometry(0.38, 0.16, 0.2), lampMaterial);
        lamp.position.set(0, openingHeight + 0.25, 0.25); group.add(lamp);
        entry.lamp = lamp;

        this.entries.push(entry);
        shell.updateMatrixWorld(true); group.updateMatrixWorld(true);
    }

    beginWave() {
        this.finishWave();
        const candidates = [...this.entries];
        while (true) {
            this.active = selectSpawnEntries(candidates, this.camera.position);
            const invalid = this.active.filter(entry => !this.isExitValid(entry.exit));
            if (!invalid.length) break;
            for (const entry of invalid) candidates.splice(candidates.indexOf(entry), 1);
        }
        this.active.forEach((entry,index) => {
            entry.active = true; entry.spawned = 0; entry.cooldown = 0;
            entry.soundTimer = 0.3 + Math.random() * 1.5;
            entry.lamp.material.emissiveIntensity = 1.8;
            this.lights[index].position.copy(entry.point(0.8, 2.8));
            this.lights[index].intensity = 1.8;
        });
    }
    finishWave() {
        for (const entry of this.entries) {
            entry.active = false; entry.lamp.material.emissiveIntensity = 0;
        }
        this.lights.forEach(light => light.intensity = 0);
        this.active = [];
    }
    trySpawn(config) {
        const available = this.active.filter(entry => !entry.actor && entry.cooldown <= 0 && this.isExitValid(entry.exit));
        if (!available.length) return false;
        const minimum = Math.min(...available.map(entry => entry.spawned));
        const balanced = available.filter(entry => entry.spawned === minimum);
        const entry = balanced[Math.floor(Math.random() * balanced.length)];
        const zombie = this.createZombie(entry.inner, config);
        if (!zombie) return false;
        zombie.userData.spawnEntry = entry;
        zombie.userData.spawnState = 'approaching';
        zombie.userData.attackCooldown ??= 0;
        zombie.userData.attackInterval ??= 2;
        entry.actor = zombie; entry.spawned++;
        return true;
    }
    update(delta) {
        if (!this.isRunning()) return;
        for (const entry of this.entries) {
            entry.cooldown = Math.max(0, entry.cooldown - delta);
            if (entry.active) {
                entry.soundTimer -= delta;
                if (entry.soundTimer <= 0 && entry.actor) {
                    this.playSound(entry, false); entry.soundTimer = 2.5 + Math.random() * 3;
                }
            }
            if (entry.actor) this.updateActor(entry, delta);
            this.syncBoards(entry, delta);
        }
        this.updateRepair(delta);
    }

    updateActor(entry, delta) {
        const zombie = entry.actor, data = zombie.userData;
        const moveTowards = target => {
            const dx = target.x - zombie.position.x, dz = target.z - zombie.position.z;
            const distance = Math.hypot(dx, dz);
            if (distance < 0.04) return true;
            const step = Math.min(distance, Math.max(0.65, data.speed) * delta);
            zombie.position.x += dx / distance * step; zombie.position.z += dz / distance * step;
            return false;
        };
        zombie.rotation.y = Math.atan2(entry.normal.x, entry.normal.z);
        if (data.spawnState === 'approaching') {
            if (!moveTowards(entry.attackPoint)) return;
            data.spawnState = 'breaking';
        }
        if (data.spawnState === 'breaking') {
            const broken = entry.barricade.attack(zombie.uuid, delta);
            if (broken.length) this.playSound(entry, true);
            if (entry.barricade.remaining) return;
            if (entry.barricade.reservePassage(zombie.uuid)) data.spawnState = 'exiting';
        }
        if (data.spawnState === 'exiting') {
            const next = zombie.position.clone().addScaledVector(entry.normal, Math.max(0.65, data.speed) * delta);
            const playerDistance = Math.hypot(next.x - this.camera.position.x, next.z - this.camera.position.z);
            const radius = data.radius || 0.72;
            const occupied = this.zombies.some(other => other !== zombie && (!other.userData.spawnState || other.userData.spawnState === 'street') &&
                Math.hypot(next.x - other.position.x, next.z - other.position.z) < radius + other.userData.radius);
            if (playerDistance < radius + 0.65) {
                if (data.attackCooldown <= 0 && segmentClear(zombie.position, this.camera.position,
                    this.colliders.filter(box => box !== entry.collider), 0)) {
                    this.damagePlayer(data.attackDamage); data.attackCooldown = data.attackInterval;
                }
                return;
            }
            if (occupied) return;
            if (moveTowards(entry.exit)) {
                entry.barricade.release(zombie.uuid);
                data.spawnState = 'street';
                entry.actor = null; entry.cooldown = SPAWN_RULES.exitSeconds;
            }
        }
    }

    releaseZombie(zombie) {
        const entry = zombie.userData.spawnEntry;
        if (!entry) return;
        entry.barricade.release(zombie.uuid);
        if (entry.actor === zombie) { entry.actor = null; entry.cooldown = SPAWN_RULES.exitSeconds; }
    }
    dropPosition(zombie) {
        return zombie.userData.spawnEntry && zombie.userData.spawnState !== 'street'
            ? zombie.userData.spawnEntry.exit.clone() : zombie.position.clone();
    }
    syncBoards(entry, delta) {
        entry.boards.forEach((board, index) => {
            const intact = entry.barricade.boards[index];
            if (intact !== board.userData.intact) {
                board.userData.intact = intact;
                this.onChange();
                if (intact) {
                    board.visible = true; board.position.y = board.userData.homeY;
                    board.rotation.set(0, 0, board.userData.homeRotation);
                    board.userData.fallTime = 0;
                    this.bulletBlockers.push(board);
                } else {
                    const blocker = this.bulletBlockers.indexOf(board);
                    if (blocker >= 0) this.bulletBlockers.splice(blocker, 1);
                    board.userData.fallTime = 0.45;
                }
                board.updateMatrixWorld(true);
            }
            if (board.userData.fallTime > 0) {
                board.userData.fallTime = Math.max(0, board.userData.fallTime - delta);
                board.position.y -= delta * 5; board.rotation.x += delta * 3;
                if (!board.userData.fallTime) board.visible = false;
            }
        });
    }

    getTarget() {
        const direction = this.camera.getWorldDirection(new this.THREE.Vector3());
        let best = null, bestDistance = Infinity;
        for (const entry of this.entries) {
            const outward = this.camera.position.clone().sub(entry.origin).dot(entry.normal);
            const denominator = direction.dot(entry.normal);
            if (outward < 0 || denominator >= -0.08) continue;
            const distance = -outward / denominator;
            if (distance > SPAWN_RULES.repairRange || distance >= bestDistance) continue;
            const hit = this.camera.position.clone().addScaledVector(direction, distance).sub(entry.origin);
            const horizontal = hit.x * entry.normal.z - hit.z * entry.normal.x;
            if (Math.abs(horizontal) > 1.6 || hit.y < 0 || hit.y > 3.35) continue;
            if (!segmentClear(this.camera.position, entry.origin,
                this.colliders.filter(box => box !== entry.collider), 0)) continue;
            best = entry; bestDistance = distance;
        }
        return best;
    }
    updateRepair(delta) {
        const target = this.getTarget();
        if (this.repairTarget && (target !== this.repairTarget || !this.repairHeld)) {
            this.repairTarget.barricade.repairTime = 0;
        }
        this.repairTarget = target;
        if (!target || !this.repairHeld) return;
        if (target.barricade.repair(delta).length) {
            this.playSound(target, true); this.syncBoards(target, 0);
        }
    }
    prompt() {
        const target = this.repairTarget;
        if (!target) return null;
        const barricade = target.barricade;
        if (barricade.attacker) return 'Elimine os zumbis que atacam a porta';
        if (barricade.occupant) return 'Aguarde a passagem ficar livre';
        if (barricade.remaining === SPAWN_RULES.boardCount) return 'Barricada intacta';
        const progress = Math.floor(barricade.repairTime / SPAWN_RULES.repairSeconds * 100);
        return `Segure [E] para reparar · ${barricade.remaining}/${SPAWN_RULES.boardCount} tábuas${this.repairHeld ? ` · ${progress}%` : ''}`;
    }
    reset() {
        this.repairHeld = false; this.repairTarget = null; this.active = [];
        for (const entry of this.entries) {
            entry.queue = []; entry.actor = null; entry.cooldown = 0;
            entry.barricade.reset(); this.syncBoards(entry, 0);
        }
        this.finishWave();
    }

    playSound(entry, impact) {
        // No dedicated wood MP3 exists. Keep impacts silent, use the supplied
        // spatial zombie voices for active entrances instead of synthesizing audio.
        if (!impact && entry.actor) this.playVoice(entry.actor);
    }
}
