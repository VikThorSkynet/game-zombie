# Memória persistente — v37

Pedido atual: usar as escolhas em `Downloads/Assets/escolhas-zumbis.json`,
integrar os zumbis, adicionar sangue e fazer commit no GitHub.
O usuário confirmou Z03 como Atirador e Detonador, com cores diferentes.

Branch `codex/zumbis-escolhidos-sangue`, criada de `origin/main` em `0d28523`.
HTML atual `game_version37_01-10-2026_10-43-03.html`; v36 preservada.

## Decisões e implementação

- Z07/Z08 Normal; Z02/Z04/Z06 Corredor; Z05 Bruto; Z01 Guardião.
- Z03 Atirador verde e Detonador laranja. Decisão consolidada em
  `assets/enemies/escolhas-zumbis.json`.
- Humanoides importados com clipes nativos ou movimento procedural em rig.
  Três fontes estáticas receberam rig simples; Z08 usa o rig original.
- `enemy-visuals.mjs` e `blood-effects.mjs` são fontes incorporadas pelo build;
  editar essas fontes e regenerar, sem editar os blocos gerados.
- GLBs reduzidos em `assets/enemies/game`, reproduzíveis com Blender e
  `tools/prepare_zombie_assets.py`; originais da galeria preservados.
- Sangue nos impactos/mortes, 40/80 manchas temporárias em lote, com limpeza
  no reinício e na troca de área. Efeitos param na pausa.
- Créditos dos oito zumbis incluídos no menu; README aponta para a v37.

## Verificação

Boot file:// e HTTP aprovado. Smoke completo aprovado em baixa e alta.
Teste específico de humanoides aprovado em baixa e alta: tipos, rigs,
movimento, tiro gerando sangue, limite/expiração e recursos estáveis após resets.
Capturas dos oito modelos e do sangue inspecionadas. A revisão final confirmou
Guardião e cores distintas após compartilhar rigs entre partes do modelo.
Detalhes em `docs/ZUMBIS_SANGUE_V37.md`.

## Pendência real

Playtest humano para aparência, ritmo e desempenho. Testes automatizados não
representam uma partida humana nem garantem FPS. Nenhum tipo aguarda decisão.
O desligamento autorizado na entrega anterior foi específico daquela execução;
este pedido autoriza implementação, commit e envio ao GitHub.
