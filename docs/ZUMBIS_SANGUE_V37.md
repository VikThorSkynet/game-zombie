# Zumbis escolhidos e sangue — v37

A versão parte de `origin/main` (`0d28523`, merge da v36). O usuário forneceu
`Downloads/Assets/escolhas-zumbis.json` e confirmou Z03 nos dois especiais,
com cores diferentes. A decisão consolidada está em
`assets/enemies/escolhas-zumbis.json`.

| Asset | Papel aplicado |
| --- | --- |
| Z01 — policial | Guardião da campanha |
| Z02 — Zombie (1) | Corredor |
| Z03 — Zombie | Atirador verde e Detonador laranja |
| Z04 — infectado | Corredor |
| Z05 — Zombie Girl | Bruto, correspondente ao tanque |
| Z06 — múmia | Corredor |
| Z07 — Zombie Walk | Normal |
| Z08 — PhychoZombie | Normal |

Os comuns alternam entre dois modelos e os corredores entre três. O chefe usa
Z01 durante o confronto da campanha. Os sinais verde/laranja dos ataques especiais
continuam visíveis. Os dois cães da v36 seguem no jogo.

## Animação e distribuição

`enemy-visuals.mjs` é a fonte do sistema visual, incorporada pelo build. Os
modelos com clipes usam suas animações esqueléticas, sem deslocamento pela
animação: a navegação controla a posição. Z02/Z04/Z06 receberam um esqueleto
simples, e Z08 usa seu esqueleto original com movimento procedural. Inimigos
com pernas danificadas ficam mais baixos e lentos.

Cada inimigo tem seu próprio esqueleto. Partes do mesmo personagem compartilham
esqueletos equivalentes, evitando uma textura de ossos por parte. As regiões
invisíveis de dano continuam separando cabeça, corpo e pernas. O visual importado
não desaparece com a redução de detalhes à distância.

`tools/prepare_zombie_assets.py` gera os GLBs de `assets/enemies/game` a partir
dos originais da galeria. Limita cada modelo a cerca de 12 mil triângulos e
redimensiona texturas para até 1024 px. Morph targets dos modelos simplificados
são removidos; os clipes esqueléticos são mantidos. Os originais ficam intactos.
O HTML incorpora os GLBs e abre em file:// ou HTTP; Three.js exige internet.

## Sangue

`blood-effects.mjs` gera uma textura procedural para gotas e manchas. Os acertos
produzem respingos e marcas; mortes deixam uma marca maior. As manchas duram
28 segundos nos acertos e 45 nas mortes, encolhendo nos últimos cinco segundos.
O limite é 40 em Desempenho e 80 em Alta, desenhadas em um lote. Reinício e
mudança de área limpam as marcas. A pausa congela a simulação.

## Verificação

- `node scripts/build-game.mjs --check`: fontes incorporadas conferidas.
- `node tests/boot.cjs`: file://, HTTP, qualidades e recuperação de CDN aprovados.
- `node tests/smoke.cjs`: campanha, geradores, áreas, progressão, cães, armas,
  navegação e recursos gráficos aprovados em baixa e alta.
- `node tests/humanoid-assets.cjs`: mapeamento, animação dos oito modelos,
  independência dos esqueletos, Guardião, cores especiais, sangue por tiro real,
  limite, expiração, reinício e estabilidade de recursos.
- Capturas em `docs/captures/zombies-v37`, revistas visualmente.

As verificações são automatizadas. Uma partida humana prolongada continua
pendente para avaliar aparência, leitura dos ataques e desempenho no computador
usado para jogar. Autores e links originais constam nos créditos do menu e em
`ASSET_CREDITS_V36.md`.
