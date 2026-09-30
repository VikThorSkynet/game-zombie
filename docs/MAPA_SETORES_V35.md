# v35 — distribuição pelos setores

A v35 parte da v34 de `origin/main` (`c4c4744`). O sorteio anterior usava
somente as calçadas centrais. Agora os destinos são fixos para que o jogador
aprenda rotas e tenha motivos para circular pela cidade inteira.

| Região | Destinos |
| --- | --- |
| Centro / início | Colete |
| Oeste | Gerador 1, Juggernog e Movespeed |
| Sudoeste | Arsenal |
| Leste | Gerador 2 e Speed Cola |
| Sudeste | Caixa misteriosa |
| Sul | Double Tap |
| Norte | Gerador 3 e acesso à instalação |
| Nordeste | Pack-a-Punch |
| Quatro cantos | Caixas temporárias de liquidação |

Os três depósitos de munição permanecem a oeste, leste e norte. Os registros
acompanham os geradores. Duas ruas transversais conectam as avenidas laterais;
as guias centrais têm aberturas nos cruzamentos. Placas indicam os destinos,
o HUD identifica o setor atual e o gerador próximo informa seu setor.

As máquinas ficam voltadas para a rua de acesso. O registro das colisões da
caixa e dos perks foi corrigido para incluir a grade espacial de navegação.
Os preços, ondas, armas e regras de campanha não foram alterados.

## Validação

`tests/map-layout.cjs`, integrado ao smoke, verifica os 18 pontos, orientação,
aproximação livre, colisões das máquinas permanentes, compras de perks,
registros, persistência das posições após reinício e surgimentos de inimigos.
Verifica também dez segmentos do circuito nos dois sentidos e 16 amostras
livres ao redor de cada gerador. O relatório está em
[v35-map-layout.json](measurements/v35-map-layout.json).

Capturas dos quatro setores em qualidade baixa e alta ficam em
`docs/captures/map/`. São capturas automatizadas; a avaliação do ritmo de
deslocamento e da dificuldade em uma partida humana ainda está pendente.

Comandos adicionais: `node scripts/build-game.mjs --check`,
`node --test tests/*.test.mjs`, `node tests/boot.cjs` e `node tests/smoke.cjs`.
Todos aprovados: 29 testes unitários, abertura file:// e HTTP e regressão
completa de gameplay nas qualidades baixa e alta.
