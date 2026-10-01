# Memória persistente — v38

Pedido: corrigir as hitboxes dos zumbis.
Branch `codex/hitboxes-zumbis`, baseada na v37 em `6c074cb`.
HTML atual: `game_version38_01-10-2026_19-10-52.html`; v37 preservada.
Decisões de assets, cores e sangue continuam na memória anterior:
[Zumbis e sangue v37](MEMORIA_PERSISTENTE_01-10-2026_10-43-03.md).

## Implementação

- Malhas animadas importadas substituem as antigas caixas procedurais nos tiros.
- Cabeça/corpo/pernas vêm dos pesos do rig; D01 tem cabeça definida na geometria
  de origem porque seu rig gerado só separa as pernas.
- Atualização da pose antes de disparar e limites conservadores por osso.
- Balas e laser compartilham o sistema, incluindo cães. Placas do Guardião mantidas.
- Fonte nova `enemy-hitboxes.mjs`; editar a fonte e rodar o build, nunca o bloco
  gerado. `scripts/build-game.mjs` incorpora o módulo para preservar file://.
- README e HTML atualizados; testes em `tests/enemy-hitboxes.cjs` e
  `tests/graphics.cjs`. Detalhes em [Hitboxes v38](HITBOXES_V38.md).

## Verificações

Boot sem hooks file:// e HTTP aprovado. Smoke completo em baixa e alta aprovado.
29 testes unitários aprovados. Build regenerado e `--check` aprovado.
Teste dedicado compara dez silhuetas em três poses com triângulos animados,
além de disparos reais de bala e laser nas três regiões. Aprovado em baixa e alta:
13.260 raios sem divergências e 120 disparos com classificação correta.

## Pendência real

Playtest humano para sensação de acerto e desempenho em ondas completas.
Testes automatizados não representam partida humana nem medição de FPS.
Nenhum desligamento do computador faz parte deste pedido.
