# P6 — Iluminação, materiais e cenário

v33 · 28/09/2026 · base v32, commit 860196f.
Branch: `codex/p6-iluminacao-materiais`.

## Alterações visuais

- Exterior frio com preenchimento ambiente um pouco maior. Exposição ACES
  1,12 → 1,08; bloom 0,52 → 0,32, limiar 0,76 → 0,88. A lanterna passou de
  80 para 60 de intensidade normal, mantendo 0,45 na mira e sua posição original.
- Asfalto e concreto têm grãos, manchas e fissuras reproduzíveis por semente.
  Metal e ferrugem recebem desgaste em escalas distintas. Cor, altura e rugosidade
  usam mapas separados; apenas a cor é sRGB. Os mapas de ambiente continuam em
  256×256, compartilhados entre materiais. Piso principal repete a cada 4 m;
  caixas/painéis usam a escala de UV existente de 1,5 m.
- Fachadas ganham manchas verticais, menos emissão nas janelas e identificação
  por região: oeste/quarentena, leste/evacuação e norte/logística. Texto e desgaste
  ficam nas texturas existentes, sem novos letreiros geométricos.
- Instalação recebe painéis com juntas, fixações e marcas de oxidação. Faixas
  e luminárias alternam tons âmbar e frios. Tubulações e bancadas existentes
  recebem os materiais revistos. Os volumes e corredores permanecem iguais.
- Manchas suaves de contato sob os carros melhoram seu assentamento no chão,
  inclusive no modo sem sombras. São instâncias divididas em quatro setores,
  com uma textura de 128×128 e sem custo de mapa de sombras.
- Duas áreas têm pequenos conjuntos estáticos de poeira/neblina junto às laterais:
  18 pontos por área, textura compartilhada de 128×128, sem atualização por quadro.
  A névoa atmosférica e a névoa das rodadas especiais mantêm as regras existentes.

As alterações usam recursos procedurais incorporados ao HTML. Abertura local não
precisa de arquivos novos de textura. O Three.js ainda é obtido do CDN existente.
Esta etapa melhora superfícies e iluminação; a revisão de modelos e animações
permanece na P7. Não representa conclusão da ambição de qualidade AAA.

## Capturas e verificação visual

Pares em 1440×960, mesma posição e semente de teste. Rua com alvo a 8 m,
ampliação de 4× com alvo a 40 m e entrada da instalação com alvo a 12 m.
Na captura ampliada o teste fixa FOV/máscara/atenuação da lanterna; o acionamento
real da sniper é coberto pela suíte completa. A iluminação de Desempenho preserva
a direção visual sem usar bloom ou sombras. HUD, silhuetas e interações foram
inspecionados nas imagens.

| Cena | Desempenho antes / depois | Alta antes / depois |
|---|---|---|
| Rua | [v32](captures/p6/v32-street-low.png) / [v33](captures/p6/v33-street-low.png) | [v32](captures/p6/v32-street-high.png) / [v33](captures/p6/v33-street-high.png) |
| Ampliação | [v32](captures/p6/v32-scope-low.png) / [v33](captures/p6/v33-scope-low.png) | [v32](captures/p6/v32-scope-high.png) / [v33](captures/p6/v33-scope-high.png) |
| Instalação | [v32](captures/p6/v32-installation-low.png) / [v33](captures/p6/v33-installation-low.png) | [v32](captures/p6/v32-installation-high.png) / [v33](captures/p6/v33-installation-high.png) |

`tests/environment.cjs` compara os limites de todas as colisões, quantidade de
bloqueadores de tiros, hit meshes e lista de luzes/sombras contra a v32. Também
verifica o tamanho máximo das texturas compartilhadas. `QA_P6_ONLY=1` executa
a auditoria e `QA_SCREENSHOTS` escolhe a pasta de capturas. `QA_GAME_FILE` permite
selecionar a versão de referência explicitamente. Relatórios: `p6-v32-*.json`
e `p6-v33-*.json`, em `docs/measurements`.

## Medição de desempenho

Referência: `p5-after-low/high.json` da v32, coletada em 28/09. Medição da v33:
`p6-after-low/high.json`. Mesmo protocolo P5: 1080p/DPR 1, Chrome headless,
Ryzen 7 5700U/Radeon integrada, três repetições por cena, 2 s de aquecimento e
5 s de coleta. Atores pausados; não é uma partida humana nem teste prolongado.
Decoração aleatória e carga externa podem mudar contagens/tempos entre execuções.

Para reproduzir, execute `node tests/smoke.cjs` com `QA_P1_ONLY=1`,
`P1_SCENARIOS=quiet-city,enemy-cap,dogs,boss`, `P1_WARMUP_SECONDS=2`,
`P1_SAMPLE_SECONDS=5` e `P1_OUTPUT_PREFIX=p6-after`. O agregado é gerado por
`node tests/graphics-report.cjs --write` com `GRAPHICS_BEFORE=p5-after`,
`GRAPHICS_AFTER=p6-after` e `GRAPHICS_OUTPUT=p6-comparison`.

Resultados em [p6-comparison.json](measurements/p6-comparison.json). Intervalos
abaixo são mínimo/máximo entre as três repetições; os percentis não foram unidos.

| Qualidade / cena | Chamadas antes → depois | p95 antes → depois (ms) |
|---|---:|---:|
| Desempenho / cidade | 291 → 302 | 17,1–31,1 → 17,1–31,3 |
| Desempenho / 24 inimigos | 801 → 812 | 17,1–17,2 → 17,0–23,3 |
| Desempenho / cães | 471–473 → 482–484 | 17,1–32,7 → 17,1–33,2 |
| Desempenho / chefe | 83 → 84 | 17,2–17,4 → 17,1–17,2 |
| Alta / cidade | 312 → 328 | 17,0–31,5 → 17,2–33,9 |
| Alta / 32 inimigos | 1106 → 1122 | 18,3–20,1 → 17,0–23,4 |
| Alta / cães | 492–501 → 508–510 | 17,1–32,9 → 17,0–34,5 |
| Alta / chefe | 97 → 98 | 16,9–17,1 → 17,1–17,2 |

Medianas da v33: 16,7–16,9 ms, próximas de 60 FPS neste teste. Nenhuma amostra
registrou quadro acima de 50 ms. As primeiras repetições de cidade/cães excedem
a meta de p95 de 25 ms em baixa e 33 ms em alta; portanto a meta não foi cumprida
em todas as amostras. O maior p95 em algumas cenas precisa ser acompanhado em
partidas longas antes de ampliar o orçamento novamente.

A auditoria visual com semente fixa isola melhor a contagem: +4 chamadas de
desenho na rua/ampliação e +1 na instalação, sem aumentar luzes ou sombras.
Texturas residentes: rua 82 → 88 em baixa e 96 → 102 em alta; instalação após
troca de área 23 → 34 e 36 → 47. Parte desse aumento interno são mapas
compartilhados retidos na sessão. O benchmark temporal usa decoração aleatória,
por isso suas diferenças de contagem incluem também variação entre execuções.

## Resultado das regressões

29 testes Node e sincronização dos blocos incorporados passaram. Boot do HTML
sem hooks passou por file/HTTP, incluindo exportação de métricas e falha do CDN.
Smoke completo passou em baixa/alta: compras/armas, geradores, cães/névoa,
campanha e os dois finais, reinício com uma arma visível, mira e luneta.
Dez ciclos de troca de área e dez reinícios da auditoria gráfica mantiveram
contagens de recursos estáveis em cada qualidade. As comparações P6 de colisões,
luzes e tamanhos de textura também passaram. Revisão visual realizada nos pares
da rua, ampliação e instalação; modelagem e animações ficam para P7.
