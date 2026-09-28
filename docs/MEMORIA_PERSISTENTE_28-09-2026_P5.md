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

Limitação: a medição temporal pós-alteração foi bloqueada pela revisão automática
por limite de uso. Não existe `p5-after-*` nem afirmação de ganho de FPS. A medição
de referência prévia está guardada; repetir com as instruções em
`docs/P5_ORCAMENTO_GRAFICO.md` para gerar comparação. Esta limitação não invalida
os testes funcionais/estabilidade, mas deixa o ganho de desempenho sem comprovação.

## Continuidade

P5 concluída na v32. Próxima etapa do plano: P6 — iluminação, materiais e cenário.
Antes de expandir arte, medir os assets contra o orçamento documentado. Manter
colisões, hitboxes e leitura pela luneta.
