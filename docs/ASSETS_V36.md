# Assets importados — v36

Base: v35, commit `3ef92b3`. Fontes fornecidas em `Downloads/Assets`.

## No jogo

- D01 e D02 alternam como cães nas rodadas especiais e nos reforços.
  D01 veio sem esqueleto: recebeu um rig simples de quatro patas.
  D02 usa o esqueleto fornecido com movimento das patas controlado pelo jogo.
  A animação original continua disponível para inspeção na galeria.
- AK47 substitui o fuzil nas caixas, com os atributos existentes, raridade,
  recarga, mira e Pack-a-Punch. Malha reduzida para aproximadamente 18 mil
  triângulos e texturas limitadas a 1024 px.
- Caixa misteriosa importada usada também na Liquidação. A tampa foi separada
  para acompanhar a animação de sorteio; luz e feixe indicam a localização.

Os cães mantêm as regiões de dano do sistema anterior como volumes invisíveis.
Cada instância possui seu próprio esqueleto; geometrias reutilizáveis ficam em
cache, materiais são independentes e texturas dos esqueletos são descartadas
quando o cão é removido. O HTML incorpora armas, caixa e cães pelo build.
O jogo continua abrindo por dois cliques, com internet para o Three.js.

## Galeria para escolher os zumbis

Abra `abrir-galeria.cmd` na raiz. Ele inicia um servidor Python somente em
127.0.0.1 e abre a galeria no navegador. Também funciona no servidor existente:
`http://127.0.0.1:8765/docs/asset-gallery/index.html`.

| ID | Asset | Situação |
| --- | --- | --- |
| Z01 | Policial correndo | Animação disponível; duplicata removida |
| Z02 | Zombie (1) | Estático |
| Z03 | Zombie | Animação disponível |
| Z04 | Infectado | Estático |
| Z05 | Zombie Girl | Animação disponível |
| Z06 | Múmia | Estático |
| Z07 | Zombie Walk | Animação disponível |
| Z08 | PhychoZombie | FBX convertido para GLB; estático |
| D01 / D02 | Dois cães | Integrados ao jogo |
| P01 | Personagem principal | Apenas visualização |
| W01 / B01 | AK47 / caixa | Integrados ao jogo |

Arraste para girar e use a roda para aproximar. Os seletores de tipos incluem
Normal, Corredor, Bruto, Atirador, Detonador e Guardião. A escolha é salva
localmente no navegador e pode ser exportada em JSON. Ela ainda não altera
as partidas: os papéis dos oito zumbis aguardam a decisão do usuário.
[Catálogo em imagem](asset-gallery/catalogo.png).

## Fontes e reprodução

`assets/enemies` contém os GLBs da galeria, incluindo os dois cães usados no
jogo. `assets/weapons/ak47.glb` e `assets/props/mystery-box.glb` são conversões.
`tools/convert_new_assets.py` converte AK47, caixa e PhychoZombie no Blender 4.5:

```powershell
blender --background --factory-startup --python tools/convert_new_assets.py -- --source-dir "C:\Users\numbe\Downloads\Assets"
node scripts/build-game.mjs
```

Autores, licenças indicadas nos arquivos e alterações estão em
[ASSET_CREDITS_V36.md](ASSET_CREDITS_V36.md). Os créditos dos cães também
aparecem no menu do jogo.

## Verificação

- Build conferido; boot file:// e HTTP, auto/baixa/alta e recuperação de CDN.
- Smoke completo em baixa e alta: campanha, cães, navegação, economia e áreas.
- `tests/weapon-assets.cjs`: três armas importadas, mira, tiro, recarga, PaP
  e recursos estáveis após reinícios, nas duas qualidades.
- `tests/world-assets.cjs`: dois cães, esqueletos independentes, movimento,
  tampa da caixa e recursos estáveis em seis reinícios, nas duas qualidades.
- Capturas revistas em `docs/captures/assets-v36`; catálogo dos 13 modelos.

Essas verificações são automatizadas. A escolha dos zumbis e o playtest humano
com os novos modelos permanecem pendentes.
