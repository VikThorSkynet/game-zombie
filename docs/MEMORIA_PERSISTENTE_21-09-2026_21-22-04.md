# Memória persistente — Protocolo Sobreviva v13

Atualização: **21/09/2026 às 21:22:04 — America/Sao_Paulo (UTC−03:00)**.
Branch: `codex/maquinas-perks-armas-v13`.
Origem: `dbf14c9`, branch `codex/hud-inicio-performance`, PR #11 ainda aberto no início desta atualização.
HTML atual: `game_version13_21-09-2026_21-22-04.html`.

## Escopo autorizado

Melhorar graficamente máquinas de refrigerante/perks, Mystery Box, Pack-a-Punch e revisar as armas, especialmente a pistola, com inspiração em COD Zombies. Atualizar documentação, commit e PR no GitHub. O novo PR usa a branch do PR #11 como base para mostrar somente esta atualização; essa base deve ser integrada antes de direcionar a v13 para main.

## Direção visual e implementação

- Máquinas retrô com pintura por perk, molduras metálicas, letreiro circular, rótulo de garrafa, preço, porta de retirada, bandeja, entrada de moedas e ventilação. Texturas geradas em canvas com desgaste determinístico.
- Mystery Box de madeira envelhecida com ferragens, rebites, fecho e tampa articulada. A tampa acompanha os estados existentes idle/rolling/waiting_pickup, sem mudar sorteio ou custo.
- Pack-a-Punch com gabinete industrial, placa, bobinas de cobre, mostradores e bandeja de alimentação com roletes. Referências animadas em userData continuam disponíveis.
- Emblemas dos quatro perks no HUD, com cor, símbolo, nome e indicação acessível. Atualizações do DOM ocorrem quando muda o conjunto de perks.
- Pistola reconstruída com ferrolho cobrindo o cano, empunhadura inclinada, janela de ejeção, miras, serrilhas, trava lateral e base do carregador. Ponto original muzzleLocal preservado.
- Revisão das seis armas e ajuste da ligação visual entre luva e punho. Detalhes estáticos de armas e máquinas são agrupados por material com mergeGeometries; tampa e elementos animados permanecem separados.
- HUD, qualidade adaptativa e renderização direta em qualidade baixa da v12 permanecem em uso.

A referência é a linguagem visual de equipamentos de Zombies; não foram importados modelos ou texturas do jogo comercial. Referência consultada: [guia oficial de equipamentos de Zombies](https://www.callofduty.com/blog/2023/11/call-of-duty-modern-warfare-III-zombies-operation-deadbolt-launch-content).

## Verificações

Teste local em Chrome headless com cena e aleatoriedade controladas, comparado ao commit dbf14c9:

- Configurações das seis armas, muzzleLocal, colisores estáticos, bloqueadores de tiro e layout: iguais à base.
- Seis variantes Pack-a-Punch construídas, cada uma com os três elementos de energia esperados.
- Mystery Box: custo de 950 descontado; estados de sorteio/retirada, abertura e fechamento verificados.
- Pack-a-Punch: início, conclusão e arma marcada como melhorada verificados.
- Quatro perks aplicados e quatro emblemas exibidos no HUD.
- Qualidades baixa e alta inicializadas; nenhum erro de JavaScript ou erro de mergeGeometries.
- Capturas de modelos em iluminação de inspeção e captura em jogo. Galerias e API de teste existem somente no script temporário, fora do HTML entregue.
- Módulo JavaScript extraído validado com node --check; git diff --check.

| Arma | Malhas antes | Malhas depois |
| --- | ---: | ---: |
| Pistola | 20 | 6 |
| Shotgun | 23 | 6 |
| SMG | 32 | 5 |
| Sniper | 37 | 6 |
| Fuzil | 33 | 6 |
| Ray Gun | 19 | 6 |

Isso mede agrupamento do modelo, não ganho percentual de FPS. A decoração das máquinas acrescenta geometria. Não foi realizado benchmark prolongado com hordas ou teste físico em dispositivos móveis.

## Continuidade

- Usar o HTML indicado no README; a v12 está preservada no histórico Git.
- Preservar os colisores originais ao modificar decoração; nunca incluir os detalhes agrupados nas listas de hitboxes.
- Não agrupar tampa/elementos de animação na geometria estática.
- O agrupamento converte geometrias indexadas para não indexadas para compatibilidade com ExtrudeGeometry. Reduz chamadas de desenho, mas pode aumentar a memória de vértices.
- Continuam válidos os contratos documentados nas memórias de 14:16:02 e 20:54:31.
- O Three.js 0.160.0 e BufferGeometryUtils são carregados pelo CDN existente. MP3 locais e controles de teclado/mouse permanecem necessários.
