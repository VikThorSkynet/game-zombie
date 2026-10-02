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


## HUD compacto — 02/10/2026

Base confirmada por fetch: origin/main, c58b494 (v40). Alterações anteriores
em game_9.html preservadas no stash "HUD antigo e regra AGENTS preservados
antes de atualizar main". A regra de sincronização foi incorporada ao AGENTS.md
atual, preservando suas instruções anteriores.

HTML v40 ajustado: painéis transparentes sem bordas; vida, fôlego e placas
no canto inferior esquerdo; telemetria compacta com SVGs no superior direito;
munição e nome discreto da arma no inferior direito. Rótulos permanentes,
controles repetidos, função/raridade da arma e detalhes longos da missão não
ocupam a tela. Diário segue acessível por J, com indicador de desafio e progresso;
geradores e reserva de placas mantêm contadores. Alertas situacionais de cão,
última ameaça, interação e recarga foram preservados. Regras de gameplay intactas.

Verificações: build --check; 20 testes de regras e armas aprovados; boot sem
hooks por file:// e HTTP aprovado em auto/low/high, inclusive métricas e falha
de CDN; captura desktop inspecionada e captura 640x360 gerada em
`docs/captures/hud-clean`. Navegação de captura sem erros JavaScript.
Não houve partida humana. Prévia apresentada e envio ao GitHub autorizado pelo usuário em 02/10/2026.

AGENTS.md também exige prévia, consulta sobre ajustes e autorização antes de
commit/envio, respeitando autorizações explícitas já dadas para o resultado.
