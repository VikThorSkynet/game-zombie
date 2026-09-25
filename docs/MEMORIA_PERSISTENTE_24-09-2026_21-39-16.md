# Memória persistente — feedback de playtest, v27

Data: 24/09/2026 · America/Sao_Paulo.
Branch: `codex/playtest-progressao-visuais`, criada a partir de P1 `3a0fe0b`.
HTML atual: `game_version27_24-09-2026_21-26-17.html`.
v25 e v26 foram preservadas, assim como os JSON da referência P1.

## Pedido atual

Após várias partidas, usuário pediu dificultar geradores (exploit do rastejante
permitia todos na onda 1), resolver percepção de arquivos não reconhecidos e
entrada bloqueada, fortalecer/remodelar cães, melhorar texturas/modelagem rumo
a AAA e reduzir a luz da Ray Gun. Isso autoriza antecipar partes de P2/P4/P6/P7;
não se limita à instrumentação P1 do pedido anterior. README, memória anterior,
plano e regras locais foram consultados. Sem pedido de novos subagentes.

## Implementado

Detalhes e validação: [PLAYTEST_V27.md](PLAYTEST_V27.md).

- `BALANCE.dogs` e `BALANCE.containment` centralizam os novos números.
  `GeneratorNetwork.start(id,wave)` armazena onda da defesa e recusa outra na mesma
  onda concluída. O HTML só permite começar após eliminar toda a onda. Defesa
  mista e finita, com onda mínima de força 3/5/7, sem impor portão na onda 5.
- Registros/partes permanecem visíveis com marca COLETADO e confirmação N/3.
  Não havia perda reproduzida no Set dos registros; o teste demonstrou bloqueio
  intencional por inimigo vivo e informação genérica. Rádio agora reconhece N/3,
  orienta a instalação e mantém extração só depois do chefe. Porta explica
  inimigos restantes, inclusive rastejantes. `advanceHolds` com chave `interaction`
  mantém o intervalo próximo a portas/rádio/núcleo/geradores elegíveis; sair libera.
- Cães: mais vida, velocidade/dano e bote mais rápido. Geometria da face, quadril,
  ombros, patas/garras, cauda e pelo revisada. Hitboxes continuam ligadas ao cão,
  tiro de torso não vira tiro nas pernas, parede/esquiva/aviso permanecem válidos.
- Biblioteca compartilhada de seis pares de mapas de superfície; não gerar por
  inimigo. Madeira das armas também passou a usar um mapa compartilhado após
  detectar crescimento a cada reset. `releaseAreaGraphics` preserva mapas com
  `userData.sharedSurface` e textura de pele compartilhada. Tubos/divisórias e
  marcações na instalação. UVs de caixas em escala local; não altera colisões.
- Ray Gun: modelo, PaP/pulso, feixe, flash e luz de impacto atenuados. `t.laser`
  diferencia opacidade/intensidade durante fade sem mudar os tiros comuns.
- Regras foram incorporadas pelo build; não editar blocos gerados. v27 continua
  abrindo via file:// ou HTTP e usando somente os MP3 existentes.

## Testes

- 22 unitários de regras e telemetria passaram.
- Regressão completa `QA_METRICS=1 node tests/smoke.cjs` passou em low/high:
  mira/luneta, LOD, economia, combate, pausa/reset, geradores, cães/névoa, diário,
  viagens, chefe e ambos os finais. Seis idas/voltas mantiveram recursos estáveis.
- Novo `tests/playtest-feedback.cjs` cobre a situação humana por teclado E,
  geradores, confirmação/entrada e Ray normal/PaP/fade. Após cache final,
  quatro reinícios mantiveram constante a contagem de texturas nos dois modos.
- `node tests/boot.cjs` passou sem hooks: file auto/low/high, HTTP auto, exportação
  JSON file low/HTTP high, falha de CDN e botão de recuperação.
- Capturas de cães, geradores e instalação inspecionadas. A arte permanece
  procedural/estilizada; não anunciar acabamento AAA completo.
- `tests/telemetry.cjs` aceita `P1_OUTPUT_PREFIX` para salvar novas medições sem
  sobrescrever a P1. Mantém metadados, medições GPU e limitações do ensaio.
- Relatórios finais em `docs/measurements/v27-feedback-{low,high}.json`: 18
  amostras, três cenários × três repetições × dois modos, 1080p, 3 s aquecendo e
  5 s coletando. Mediana 16,6–16,8 ms; p95 chegou a 40,2 ms e máximo a 45,9 ms.
  Primeiras amostras da cidade/caçada oscilaram. Texturas constantes em cada
  cenário após o cache de madeira. É um teste curto com atores parados, não uma
  partida nem comparação percentual válida com a P1 de janelas mais longas.

## Continuidade

Seguir o plano P2–P8, preservando o feedback aplicado. Tela inicial em P2.2,
trabalho completo de materiais/iluminação em P6 e modelos/animações em P7.
O atual pedido não conclui essas etapas inteiras. Ainda faltam novos playtests
humanos com JSON para validar portão 5–8, PaP 7–10 e duração do chefe. Não usar
tempos das regressões com teleporte como evidência de ritmo real.

Repositório real: `Documents/Codex/2026-09-21/https-github-com-vikthorskynet-game-zombie/work/game-zombie`.
Pasta inicial `Documents/ChatGPT/zombies game` tem somente Git vazio.
Para testes Chrome: usar `PLAYWRIGHT_MODULE` no runtime Node empacotado e
`CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe`; CDN exige rede.
