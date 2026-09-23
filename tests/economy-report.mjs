// Analytical budget only: no claim of simulated navigation, accuracy or time-to-wave.
import { BALANCE, ScrapWallet, enemyHealth, weaponMultiplier, waveProfile } from '../game-systems.mjs';
const scrap=new ScrapWallet();let kills=0;
const rows=[];
for(let round=1;round<=20;round++){
    const count=waveProfile(round).total;
    scrap.beginRound(round);
    for(let i=0;i<count;i++)scrap.awardKill();
    kills+=count;
    if(![1,4,7,8,12,17,20].includes(round))continue;
    const upkeep=round*BALANCE.armor.plateCost+Math.floor(round/2)*BALANCE.economy.ammo;
    rows.push({round,kills,grossPoints:kills*BALANCE.economy.kill,scrap: scrap.amount,
        health:enemyHealth(round),pistolBodyShots:Math.ceil(enemyHealth(round)/42),
        rarePaPBodyShots:Math.ceil(enemyHealth(round)/(42*weaponMultiplier({configId:'pistol',rarity:2,packapunched:true}))),
        afterSamplePurchases:kills*BALANCE.economy.kill-upkeep-BALANCE.economy.mystery-BALANCE.armor.tier2Cost-BALANCE.economy.packAPunch});
}
console.log('Assumptions: special-round population included; all kills paid at 100; no generator rewards or reinforcements/Nuke/Double Points/headshots; one plate/round; one ordinary ammo refill/two rounds; one Mystery Box, tier-2 vest and PaP. Savings from guaranteed Max Ammo and later upgraded ammo costs are NOT modeled.');
console.table(rows);
