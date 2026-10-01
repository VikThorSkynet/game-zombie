# Memória persistente — v40

Pedido: aumentar o asset da AK47, que parecia pequeno na mão do jogador.
Branch `codex/ak47-tamanho`, base v39 / `0a1d363`.
HTML atual: `game_version40_01-10-2026_20-01-13.html`; v39 preservada.
[Contexto anterior](MEMORIA_PERSISTENTE_01-10-2026_19-31-28.md).

## Implementação

- Escala uniforme 1,35 apenas no modelo importado da AK47.
- Posição [.28, -.33, -.87], altura da mira -.11. Mão e punho abaixados
  para acompanhar a empunhadura maior. Socket do cano acompanha a escala.
- Configuração em `weaponAssetPlacements`; criação multiplica a escala do
  template, preservando os GLBs originais. Configuração também vale para PaP.
- HTML v40 e README atualizados; build regenerado e conferido.

## Verificação

`tests/weapon-assets.cjs` aprovado em baixa e alta: três armas importadas,
versões normal/PaP, tiro, recarga, mira, texturas, posição do cano e estabilidade
após reinícios. Capturas da AK47 sem mira e mirando inspecionadas em
`docs/captures/ak47-v40`. `scripts/build-game.mjs --check` aprovado.
Boot sem hooks por file:// e HTTP verificado com qualidades e métricas.

## Pendência real

Ajuste subjetivo de enquadramento pode ser refinado após o usuário jogar.
Capturas e verificações automatizadas não representam uma partida humana.
