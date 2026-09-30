# Memória persistente — armas importadas, v34

30/09/2026 · America/Sao_Paulo · branch `codex/beretta-thompson-assets`.
HTML atual: `game_version34_30-09-2026_16-53-32.html`.

## Base e autorização

Usuário pediu colocar os assets locais da Beretta no lugar da pistola e da
Thompson no lugar da SMG, em nova branch. Depois esclareceu que o checkout
inicial tinha o jogo antigo e pediu baixar a versão nova do GitHub.

`git fetch origin` encontrou a v33 em `origin/main`, commit `c46ffa1` (P6).
AGENTS, README e memória P6 foram lidos. A branch foi reaplicada sobre esse
commit. O trabalho anterior da v9 foi preservado na branch local
`codex/beretta-thompson-assets-v9-backup`. A v33 e as versões anteriores do
GitHub permanecem intactas; a v34 é a distribuição atual indicada no README.

## Alterações

- Beretta M9: FBX fornecido com carregador montado e mapas PNG.
- Thompson II: blend fornecido, com imagens empacotadas. Backdrop e carregador
  extra removidos; subdivisão limitada e geometria simplificada/agrupada.
- GLBs em `assets/weapons`, convertidos por `tools/convert_weapon_assets.py`.
  Beretta: 9.646 triângulos, 2.499.712 bytes, uma primitiva de material.
  Thompson: 69.117 triângulos, 5.784.816 bytes, oito primitivas.
- Build incorpora os bytes dos GLBs no HTML e o loader usa `parseAsync`,
  permitindo file:// e HTTP sem buscar arquivos locais por CORS.
- Instâncias têm materiais/geometrias próprios e texturas compartilhadas.
  Cache preservado no descarte, reinício e PaP. Mapas PBR preservados no upgrade.
- Posição, luva/punho e saída do cano ajustados. Red dot mantém o contrato
  `optic`/`sightY`, inclusive no PaP. Mira e movimento reduzido seguem a v33.
- Nomes no HUD/arsenal e créditos atualizados. Preview permite `weapon=smg`.
- Balanceamento P3 mantido: SMG 40 tiros, 80 ms, dano corporal 40; nenhuma
  alteração em `game-systems.mjs`, `telemetry.mjs`, campanha ou gráficos P6.

## Validação e limites

- `node scripts/build-game.mjs --check`: fontes e blocos incorporados sincronizados.
- 29 testes Node de regras, métricas, armas e ritmo passaram.
- `node tests/boot.cjs`: abertura sem hooks em file:// automática/baixa/alta,
  HTTP, exportação de métricas nos dois protocolos, MP3 local e falha de CDN.
- Smoke completo em baixa/alta passou: tiros, recarga, mira/luneta, ambas as
  caixas, raridade, PaP, campanha e finais, desafios, inimigos, áreas, pausa,
  reinício e auditorias de recursos P5.
- `tests/weapon-assets.cjs`: ambas as armas, normal/PaP, baixa/alta; carregamento,
  geometria/material independentes, mapas PBR, tiro, recarga, mira, cano e
  oito reinícios com contagem de geometrias/texturas estável.
- Oito capturas em `docs/captures/weapons`, com/sem ADS nas duas qualidades.
  Inspeção visual de Beretta ADS, Thompson hip e ADS realizada.

O HTML tem aproximadamente 11,5 MB por incorporar os assets. Triângulos/texturas
custam mais que os modelos procedurais anteriores; agrupamento reduz chamadas
de desenho. Não foi feito benchmark prolongado nem partida humana nesta tarefa;
não prometer FPS. A substituição atende somente estas duas armas e não conclui
todo o escopo P7. Conversão e comandos documentados em `ARMAS_IMPORTADAS_V34.md`.
