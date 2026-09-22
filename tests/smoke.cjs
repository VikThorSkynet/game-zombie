// Run with Playwright installed; PLAYWRIGHT_MODULE and CHROME_PATH are optional overrides.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const filename = fs.readFileSync(path.join(root, 'README.md'), 'utf8').match(/\((game_version[^)]+\.html)\)/)[1];
const html = fs.readFileSync(path.join(root, filename), 'utf8');
// Test hooks are injected in the response only, never in the released HTML.
const api = `window.qa = { settings, runStats, impactParticles, impactPool, maxImpactEffects,
 createZombieHitEffect, updateCombatEffects, resetGame, showHitmarker, startReload, finishReload, updateUI, updateZombies,
 get score(){return score}, get health(){return health}, get camera(){return camera}, get scene(){return scene},
 get controls(){return controls}, get weapons(){return playerWeapons}, get zombies(){return zombies},
 get layout(){return baseMapLayout}, get projectiles(){return zombieProjectiles} };`;
const server = http.createServer((req, res) => {
    const name = path.basename(new URL(req.url, 'http://localhost').pathname);
    if (name.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html.replace('        init();', api + '\n        init();'));
    } else if (name.endsWith('.mp3') && fs.existsSync(path.join(root, name))) {
        res.setHeader('Content-Type', 'audio/mpeg');
        fs.createReadStream(path.join(root, name)).pipe(res);
    } else { res.statusCode = 404; res.end(); }
});

(async () => {
    let browser;
    try {
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const url = `http://127.0.0.1:${server.address().port}/game.html`;
        browser = await chromium.launch({headless: true, ...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {})});
        const page = await browser.newPage({viewport: {width: 1440, height: 960}});
        const errors = [];
        page.on('pageerror', e => errors.push(String(e)));
        for (const quality of ['low', 'high']) {
            await page.goto(`${url}?quality=${quality}`);
            await page.waitForFunction(() => window.qa?.weapons[0]?.model);
            assert.equal(await page.evaluate(() => qa.score), 0, 'fresh game economy');
            await page.locator('#sensitivity').fill('1.5');
            await page.locator('#volume').fill('0.3');
            await page.locator('#reduced-motion').check();
            await page.reload();
            await page.waitForFunction(() => window.qa?.weapons[0]?.model);
            assert.deepEqual(await page.evaluate(() => ({...qa.settings})), {sensitivity: 1.5, volume: 0.3, reducedMotion: true});
            if (process.env.QA_SCREENSHOTS) {
                fs.mkdirSync(process.env.QA_SCREENSHOTS, {recursive: true});
                await page.screenshot({path: path.join(process.env.QA_SCREENSHOTS, `v15-menu-${quality}.png`)});
            }
            const pool = await page.evaluate(() => {
                const q = qa, point = q.camera.position.clone(); point.z -= 4;
                for (let i = 0; i < 200; i++) q.createZombieHitEffect(point, i % 2 === 0);
                const bounded = q.impactParticles.length === q.maxImpactEffects;
                const ids = new Set(q.impactParticles.map(p => p.geometry.uuid));
                q.updateCombatEffects(1);
                for (let i = 0; i < q.maxImpactEffects; i++) q.createZombieHitEffect(point);
                const reused = q.impactParticles.every(p => ids.has(p.geometry.uuid));
                q.updateCombatEffects(1);
                return {bounded, reused, inactive: q.impactPool.length, active: q.impactParticles.length};
            });
            assert(pool.bounded && pool.reused && pool.active === 0);
            await page.getByRole('button', {name: 'INICIAR OPERAÇÃO'}).click();
            await page.mouse.down({button: 'right'});
            await page.waitForTimeout(900);
            assert(await page.evaluate(() => document.body.classList.contains('aiming') && qa.camera.fov < 57 && qa.controls.pointerSpeed < 1));
            if (process.env.QA_SCREENSHOTS) await page.screenshot({path: path.join(process.env.QA_SCREENSHOTS, `v15-ads-${quality}.png`)});
            await page.mouse.up({button: 'right'});
            const reload = await page.evaluate(() => {
                qa.weapons[0].ammoInMag--; qa.startReload(); qa.updateUI();
                const track = document.getElementById('reload-track');
                return {display: getComputedStyle(track).display, height: track.getBoundingClientRect().height, value: track.getAttribute('aria-valuenow')};
            });
            assert(reload.display === 'block' && reload.height === 3 && reload.value === '0', JSON.stringify(reload));
            await page.evaluate(() => {qa.finishReload(); qa.showHitmarker(true, true);});
            assert.equal(await page.locator('#combat-feedback').textContent(), 'ELIMINAÇÃO CRÍTICA');
            assert.equal(await page.evaluate(() => qa.runStats.criticalHits), 1);
            await page.keyboard.press('Escape');
            await page.waitForFunction(() => !qa.controls.isLocked);
            assert(await page.locator('#sensitivity').isVisible(), 'settings available on pause');
            // Attack across a building must be blocked, but the same shooter in clear space fires.
            const attacks = await page.evaluate(() => {
                const q = qa, z = q.zombies[0], b = q.layout.buildings[0];
                Object.assign(z.userData, {isShooter: true, attackCooldown: 0, speed: 0});
                z.position.set(b.x - b.w/2 - 1, 0, b.z);
                q.camera.position.set(b.x + b.w/2 + 1, 1.8, b.z);
                q.controls.isLocked = true;
                const before = q.projectiles.length;
                q.updateZombies(0.016);
                const blocked = q.projectiles.length === before;
                z.position.set(0, 0, -5); q.camera.position.set(0, 1.8, 0);
                z.userData.attackCooldown = 0;
                q.updateZombies(0.016);
                const clear = q.projectiles.length > before;
                q.controls.isLocked = false;
                q.resetGame();
                return {blocked, clear, reset: q.score === 0 && q.runStats.criticalHits === 0 && q.impactParticles.length === 0};
            });
            assert(attacks.blocked && attacks.clear && attacks.reset, JSON.stringify(attacks));
            console.log(JSON.stringify({quality, pool, attacks, passed: true}));
        }
        await page.evaluate(() => localStorage.setItem('sobreviva.settings.v1', '{broken'));
        await page.reload();
        await page.waitForFunction(() => window.qa?.weapons[0]?.model);
        assert.equal(await page.evaluate(() => qa.settings.sensitivity), 1, 'corrupt storage fallback');
        assert.deepEqual(errors, []);
    } finally {
        await browser?.close();
        await new Promise(resolve => server.close(resolve));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
