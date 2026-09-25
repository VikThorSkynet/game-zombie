# Memória persistente — P3, v30

25/09/2026 · America/Sao_Paulo.
Branch `codex/p3-armas-e-economia`, base v29 `cbfa9a1`.
Atual: `game_version30_25-09-2026_06-16-03.html`.

Usuário pediu executar P3. Lidos AGENTS, README, memória v29, plano, resultado
P1 e código de economia/armas. Versões anteriores preservadas.

## Implementação

- WEAPON_STATS em game-systems.mjs é fonte única para seis armas, incluindo fuzil.
  HTML acrescenta somente apresentação/modelos. Build incorpora regras/telemetria.
- weaponRangeMultiplier aplica queda linear a shotgun, SMG e fuzil em hits reais.
  Sniper permanece precisa e atravessa três inimigos; Ray Gun agora atravessa dois.
- Ajustes de dano/cadência/carregador/recarga e preços estão tabelados em
  P3_ARMAS_E_ECONOMIA.md. Ray Gun sofreu redução grande, justificativa e necessidade
  de playtest explícitas. Modelagem/iluminação preservadas.
- weaponAmmoPrice usa arma/PaP, sem quatro custos genéricos duplicados em BALANCE.
  HUD, instruções e prompts comunicam funções e custo de abastecimento.
- Placas/coletes, raridades, PaP, recompensas e limites de sucata revisados e
  mantidos; não foram acrescentadas travas de compra por onda.

## Análise

Base congelada em docs/measurements/p3-v29-baseline.json, extraída antes da edição.
tests/economy-report.mjs --write gera p3-comparison.json: 1.560 casos por versão,
35/60/85% de precisão hipotética, ondas 1/5/10/15/20, corpo/cabeça, raridades e PaP.
Famílias isoladas de dano/cadência, alcance e preço; casos a 5/20/50 m.
Rotas de pistola incluem munição, placa, colete, raridade, PaP, Max Ammo de cães
e cenário otimista com contratos e geradores finitos.

Raridade nas ondas 3–4; PaP 6–7 sem renda extra e 5 com renda otimista. Esta última
fica antes da meta 7–10, inclusive na base v29. Não afirmar meta cumprida nem
balanceamento humano validado; não inflar preço global a partir desse modelo.
Relatório explicita pellets ideais, aproximação de inimigos, condições dos
contratos não simuladas e ausência de navegação, risco e tempos humanos.

## Validação

- 25 testes Node passaram (systems, telemetry, weapons).
- Build e sincronização da fonte central conferidos.
- Smoke completo com QA_METRICS=1 passou em low/high, incluindo campanha/finais,
  paredes, compras, armadura, geradores, cães, diário, áreas e reinício.
- tests/weapons.cjs, também integrado ao smoke: 36 combinações por qualidade de
  dano/compra a 5/20/50 m, normal/PaP. Disparo real das seis armas verifica
  pellets, consumo e bloqueio de cadência; sniper/Ray Gun penetram limites corretos.
  Alvos de teste de distância ficam sem bloqueadores de cenário, restaurados
  ao fim; testes separados de paredes permanecem na regressão.
- QA_P3_ONLY=1 permite executar isoladamente.
- Boot sem hooks passou em file auto/low/high, HTTP auto, exportação file low/
  HTTP high e erro de CDN. Testes de integração P1 com P1_SKIP_BENCH=1 conferem
  os novos preços sem regravar benchmarks: saldo 225 após ganhos 525/gastos 300.

## Continuidade

Próxima etapa: P4 — ritmo, inimigos, campanha e chefe. Playtest humano ainda
necessário, sobretudo Ray Gun, shotgun, custo de SMG e PaP cedo com objetivos.
Não alterados vida/ritmo dos inimigos nesta P3. Modelagem/arte P6/P7 pendentes.
Repositório real segue em Documents/Codex/2026-09-21/https-github-com-vikthorskynet-game-zombie/work/game-zombie.
