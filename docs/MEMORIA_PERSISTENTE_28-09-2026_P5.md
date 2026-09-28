# Memória persistente — P5, v32

28/09/2026 · America/Sao_Paulo. Branch `codex/p5-orcamento-grafico`.
Base v31 `af1e95f`; HTML entregue: `game_version32_27-09-2026_09-01-35.html`.

Pedido: executar a próxima etapa do plano, P5 — orçamento gráfico e otimização.
Leia README, plano e memórias anteriores antes de alterar. v25 continua preservada.

## Implementação

- Cache limitado a 64 geometrias primitivas idênticas de zumbis/cães. Materiais
  mutáveis permanecem individuais. Morte, reset e troca de área não descartam
  geometria compartilhada em uso; recursos exclusivos são liberados.
- Detalhes decorativos pequenos são ocultos além de 16 m em Desempenho e 22 m
  em Alta, restaurados abaixo de 85% do limite. FOV da luneta ajusta o limiar.
  Hitboxes, física, perigos, avisos dos cães e detalhe do guardião são preservados.
- Adicionadas `tests/graphics.cjs` e `tests/graphics-report.cjs`; repetição de
  áreas passou de 6 para 10 ciclos. O benchmark P1 agora fixa o estado/câmera de
  gameplay antes de pausar, corrigindo contaminação introduzida pela tela de menu.
- `docs/P5_ORCAMENTO_GRAFICO.md` descreve orçamento, método, resultados e limites.
  `p5-before-low/high.json` contém a referência da v31; `p5-audit-low/high.json`
  registra estabilidade dos recursos após alterações.

## Validação

29 testes Node passaram; `node scripts/build-game.mjs --check` confirmou os
blocos incorporados e `git diff --check` não encontrou erros. A suíte de browser
P5 passou em baixa/alta: cache compartilhado, alcance, luneta, histerese, geometria
de hit, rastejantes, ownership e estabilidade. Em cada qualidade, dez ciclos
mantiveram constantes as contagens de recursos. Testes de área também passaram.

Complemento de 28/09 após o pedido de continuar a P5: o bloqueio anterior de
revisão automática foi resolvido. Benchmark completo da v32 executado com três
repetições de cidade, limite de inimigos, cães e chefe, em baixa/alta, 1080p,
2 s de aquecimento e 5 s de coleta. Criados `p5-after-low.json`,
`p5-after-high.json` e `p5-comparison.json`; referência v31 preservada.

No cenário cheio: geometrias 895 → 585 em baixa e 1164 → 839 em alta;
chamadas de desenho 914 → 801 e 1156 → 1106. O cache mantém 15 geometrias extras
após transitar para o chefe. Medianas de quadro 16,7–16,9 ms; não houve aumento
de FPS demonstrado. p95 baixo ainda excede 25 ms em primeiras repetições de
cidade/cães. Decoração aleatória e condições externas limitam causalidade entre
execuções. Combate ativo e sessões longas continuam pendentes.

Boot da v32 sem hooks passou em file/HTTP, incluindo exportação de métricas e
falha de CDN. Smoke completo passou em baixa/alta, incluindo campanha e os dois
finais, geradores, armas, reinício sem sobreposição, luneta, dez ciclos de áreas
e auditoria P5. As novas execuções não alteraram o HTML v32 nem os JSON anteriores.
README agora aponta esta memória como atual. Plano e relatório P5 atualizados.

## Continuidade

P5 concluída na v32. Próxima etapa do plano: P6 — iluminação, materiais e cenário.
Antes de expandir arte, medir os assets contra o orçamento documentado. Manter
colisões, hitboxes e leitura pela luneta.
