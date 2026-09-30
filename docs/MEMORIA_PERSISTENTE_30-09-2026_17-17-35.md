# Memória persistente — v35

Pedido atual: aproveitar melhor o mapa, reduzindo a concentração de destinos
na rua central. Branch `codex/distribuicao-setores-mapa`, criada da versão
mais recente de `origin/main`, commit `c4c4744` (merge da v34 com Beretta e Thompson).

HTML atual: `game_version35_30-09-2026_17-17-35.html`. Versões anteriores
preservadas. README atualizado. Regras e telemetria continuam com fonte única
em seus módulos; build incorpora ambos e os assets das armas para file://.

## Implementação

- Layout fixo `cityServiceLayout`: perks e máquinas distribuídos nas laterais
  e extremos; colete próximo ao início, arsenal sudoeste, caixa sudeste, PaP nordeste.
- Geradores oeste, leste e norte; registros acompanham os geradores.
- Quatro caixas de liquidação nos cantos. Munição e acesso norte preservados.
- Ruas transversais, aberturas nas guias, placas e nomes de setor no HUD.
- Máquinas orientadas para suas vias de acesso; colisões de perks e caixa
  registradas também na grade espacial.
- Novo `tests/map-layout.cjs`, integrado ao smoke. Detalhes em `MAPA_SETORES_V35.md`.

## Verificações

29 testes unitários de regras, armas, ritmo e telemetria aprovados.
Build regenerado e conferido com `--check`.
`tests/boot.cjs` aprovado: file:// em auto/baixa/alta, HTTP, modos de
telemetria e recuperação da dependência CDN bloqueada.
`tests/smoke.cjs` completo aprovado em baixa e alta, incluindo campanha,
geradores, áreas, progressão, armas, rodadas especiais e recursos gráficos.
Teste espacial aprovado em baixa e alta: 18 destinos acessíveis, dez trechos
bidirecionais, 16/16 posições livres em cada círculo de defesa, compras,
registros, surgimentos e reinício. Relatório em `docs/measurements/v35-map-layout.json`.
Capturas automatizadas em `docs/captures/map/`; cruzamento e setor leste
inspecionados visualmente.

Pendência: avaliação humana do novo ritmo de deslocamento e combate.
Não interpretar testes automatizados como partida humana nem garantia de FPS.
