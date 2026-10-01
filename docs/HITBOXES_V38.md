# Hitboxes — v38

## Correção

Os zumbis importados ainda registravam as caixas dos modelos procedurais antigos.
A v38 registra as próprias malhas animadas de Z01–Z08 e dos dois cães como alvos.
Balas e laser fazem a interseção com os triângulos deformados pela animação.
Cabeça, corpo e pernas são classificados pelos pesos dos ossos no ponto atingido;
o cão D01 usa uma região da geometria original para a cabeça, pois seu rig não
possui osso separado nessa região. O corpo abaixado não é classificado como perna
apenas pela altura no mundo.

`enemy-hitboxes.mjs` é incorporado por `scripts/build-game.mjs` no HTML v38.
As matrizes da pose são atualizadas antes dos disparos. Envelopes por osso,
armazenados em cache, mantêm os limites de busca alinhados com a animação sem
recalcular todos os vértices para construir esses limites a cada disparo.
Os triângulos continuam sendo a decisão final de acerto. Placas do Guardião
continuam alvos físicos. As regras de distância, penetração e obstáculos permanecem.

## Validação

- Boot sem hooks por file:// e HTTP, qualidades automáticas/baixa/alta e métricas;
  recuperação da indisponibilidade do motor também verificada.
- Smoke completo em baixa e alta: combate, obstáculos, penetração, cães,
  campanha, áreas, recursos, LOD, economia e reinícios.
- 29 testes unitários de regras, telemetria, armas e ritmo aprovados.
- Build regenerado e conferido com `--check`.
- `tests/enemy-hitboxes.cjs`: dez modelos, três poses e duas qualidades.
  A grade de 221 raios por pose compara acertos, erros e distâncias com uma
  referência de triângulos animados e limites recalculados vértice a vértice.
  Também verifica cabeça/corpo/pernas por disparos reais de bala e laser.
  Resultado: 13.260 raios sem divergências e 120 disparos aprovados.
- O teste de geometria compartilhada em `tests/graphics.cjs` agora cria duas
  instâncias do mesmo asset: modelos diferentes não devem compartilhar geometria.

Os testes são automatizados. Ainda cabe playtest humano para avaliar sensação
de mira e desempenho durante ondas completas; não foi medido FPS nesta alteração.
