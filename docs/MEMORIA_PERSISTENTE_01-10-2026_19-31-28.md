# Memória persistente — v39

Pedido: substituir o encolhimento após tiros nas pernas por queda e rastejamento.
Branch `codex/zumbis-rastejando`, base v38 / `a74e397`.
HTML atual: `game_version39_01-10-2026_19-31-28.html`; v38 preservada.
[Contexto anterior: hitboxes](MEMORIA_PERSISTENTE_01-10-2026_19-10-52.md).

## Implementação

- `enemy-visuals.mjs`: queda progressiva de 0,75 s, tronco horizontal,
  cabeça levantada, braços alternados e pernas para trás. Escala do modelo
  e dos ossos preservada; mistura por quaternions com a pose de locomoção.
- Postura calculada uma vez por template usando direções dos ossos, para
  acomodar os diferentes eixos/rigs dos oito modelos. Altura sobre o chão
  calculada pela malha em quatro fases do movimento dos braços.
- Rigs simples Z02/Z04/Z06 usam o centro dos vértices ligados ao braço para
  orientar o membro sem exigir osso de cotovelo. Pesos das mãos abaixo da
  cintura corrigidos para não serem confundidos com pernas (eliminando
  estiramentos vistos em Z06).
- No HTML, removido o deslocamento de -0,5 do inimigo ao perder as pernas;
  posicionamento vertical agora pertence à animação. Barra de vida abaixada.
- `enemy-hitboxes.mjs`: reconhecimento das panturrilhas LeftLeg/RightLeg
  também com prefixo Mixamo sanitizado pelo GLTFLoader.
- README aponta para v39. Blocos incorporados regenerados pelo build.
- Não há amputação de geometria. O movimento é procedural; modelos com rig
  simples têm menos articulações que os modelos com esqueleto completo.

## Verificação

- `tests/crawling.cjs`: oito modelos, queda gradual, movimento dos braços,
  preservação da escala e limites de altura/contato com o chão. Aprovado.
- Capturas em `docs/captures/crawl-v39`; inspeção visual da postura e mãos.
- Boot sem hooks file:// e HTTP aprovado, incluindo modos de qualidade,
  métricas e recuperação de falha do motor.
- Smoke completo aprovado em baixa e alta: combate, progressão, campanha,
  cães, mapa, áreas, LOD, recursos e reinícios.
- `tests/enemy-hitboxes.cjs` passa a verificar a postura final de rastejamento,
  após concluir a queda. Aprovado em baixa e alta: 13.260 raios sem
  divergências e 120 disparos de bala/laser com classificação correta.
- Build regenerado e conferido com `--check`.

## Pendência real

Playtest humano para sensação do rastejamento em combate. Capturas e testes
são automatizados; não representam partida humana nem medição de FPS.
