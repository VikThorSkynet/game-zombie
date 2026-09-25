# P3 — Armas, armadura e economia

v30, 25/09/2026. Branch `codex/p3-armas-e-economia`, base v29 `cbfa9a1`.
Comparação **analítica**, complementada por testes de integração. Não houve novas
partidas humanas medidas; a P1 é uma referência de desempenho, não de precisão.

## Método reproduzível

`node tests/economy-report.mjs --write` gera
[p3-comparison.json](measurements/p3-comparison.json). A
[base v29](measurements/p3-v29-baseline.json) foi extraída dos atributos do HTML
e regras antes da edição; não é regenerada junto ao relatório.

São 1.560 casos por versão: seis armas, ondas 1/5/10/15/20, corpo/cabeça,
precisão hipotética de 35/60/85%, cinco raridades e PaP ligado/desligado.
Ray Gun tem somente categoria Especial. A matriz principal usa 5 m.
Comparações por família também usam 20 e 50 m, isolando:

1. Dano, intervalo, carregador e recarga.
2. Distância/dispersão.
3. Preços de abastecimento.
4. Resultado combinado.

Vida é a do inimigo normal, sem variar parâmetros de P4. Cada tiro bem-sucedido
da shotgun assume oito pellets atingindo o mesmo alvo: **limite superior**,
especialmente otimista de longe. A dispersão real não é simulada pela fórmula.
O benefício de penetrar alvos alinhados não entra no DPS de alvo único.
Tiros esperados = acertos necessários / precisão; tempo inclui aproximação
de recargas e cadência, sem aquisição de alvo, deslocamento, reação ou ataques.
Não interpretar como TTK medido em jogo.

## Funções e alterações

| Arma | Dano corpo/cabeça antes → depois | Intervalo / carregador depois | Função e limite |
|---|---|---|---|
| Pistola | 42/75, mantido | 200 ms / 20 | Economia inicial; baixo dano sustentado |
| Shotgun | 18/36 → 22/36 por pellet | 600 ms / 6 | Impacto próximo; dano cai de 100% a 25% entre 8–28 m |
| SMG | 32/56 → 40/70 | 90 → 80 ms / 40 | Cadência próxima; dano cai a 60% entre 16–42 m |
| Sniper | 300/800, mantido | 1.200 ms / 5 | Precisão, três alvos alinhados; recarga lenta |
| Fuzil | 75/150 → 65/130 | 150 ms / 30 | Média distância; dano cai a 75% entre 35–90 m |
| Ray Gun | 800/1.500 → 220/330 | 350 → 450 ms / 20 → 12 | Dois alvos alinhados; energia cara, recarga 2,5 → 3 s |

Shotgun: dispersão 0,015 → 0,055; multiplicador ao mirar 0,35 → 0,7.
Assim, a mira não transforma os oito pellets em um disparo de sniper.
As distâncias são unidades do mundo tratadas como metros; queda linear, com piso.
Raridade/PaP multiplicam o dano e preservam a queda. Sniper e Ray Gun mantêm dano
por distância dentro do alcance atual; paredes continuam bloqueando os disparos.

Ray Gun tinha DPS corporal sustentado de alvo único muito acima das alternativas,
além de 100 cargas num abastecimento normal. Agora são 60, ou 90 com PaP.
O ajuste é grande e deve receber atenção especial no próximo playtest: avaliar
se penetrar dois inimigos compensa custo, recarga e ausência de raridade.
Não é explosiva e não causa dano em área. A iluminação reduzida da v27 permanece.

### Indicador comparável de dano sustentado

Hipótese de 60% de precisão, corpo, comum, sem PaP, 5 m, recargas incluídas.

| Arma | DPS antes | DPS depois |
|---|---:|---:|
| Pistola | 98 | 98 |
| Shotgun (oito pellets) | 93 | 113 |
| SMG | 154 | 209 |
| Sniper (um alvo) | 106 | 106 |
| Fuzil | 214 | 186 |
| Ray Gun (um alvo) | 1.011 | 189 |

De perto, SMG supera fuzil em cadência sustentada; a 50 m, o fuzil preserva
vantagem. Sniper tem o maior dano crítico por disparo. A shotgun concentra o
dano num cartucho próximo. Não existe uma única métrica que determine a melhor arma.

## Compras e progressão

| Arma | Abastecimento antes normal/PaP | Depois normal/PaP |
|---|---:|---:|
| Pistola | 250 / 1.000 | 150 / 600 |
| Shotgun | 250 / 1.000 | 250 / 1.000 |
| SMG | 250 / 1.000 | 350 / 1.200 |
| Sniper | 250 / 1.000 | 400 / 1.400 |
| Fuzil | 250 / 1.000 | 300 / 1.100 |
| Ray Gun | 1.500 / 3.000 | 1.500 / 3.000 |

Abastecimento completa carregador e reserva de quatro carregadores. Sem cobrança
com munição cheia, sem compra com saldo insuficiente. Depósito mostra preço e arma;
HUD e Como jogar explicam a função de cada arma.

Mantidos após revisão: placa 150; coletes 1.500/3.000; raridades incrementais
100/200/350/550 sucatas; PaP 5.000, dano ×2,5 e carregador ×1,5; contrato e
gerador +300; sucata +3 por eliminação, limite 90 por onda. Nenhuma trava por onda
foi acrescentada. A pistola barata dá alternativa de manutenção sem exigir caixa.

### Rotas de orçamento (não partidas)

Pistola inicial, alvos com aproximadamente 25% de tiros finais na cabeça, uma placa
por onda quando há saldo, colete 2 a partir da onda 4, primeira raridade e depois
economia para PaP. Precisão é aplicada com arredondamento de tiros por alvo,
uma aproximação conservadora diferente da média fracionária da matriz.
Munição Máxima garantida após cães e reposição pelo PaP entram no saldo.
Sem perks, caixa, Nuke, Pontos Duplos ou drops aleatórios.

A rota extra assume todos os contratos pagos e geradores nas ondas 3/5/7,
com reforços finitos de vida correspondente (inclui cães/corredores). Ela é um
**cenário otimista de renda**: o combate da pistola não simula cumprir as condições
de faca dos contratos, risco, distâncias nem as defesas reais. Inimigos normais
da onda são aproximados por um tipo normal; as caçadas usam a vida dos cães.

| Rota | Precisão | Raridade antes/depois | PaP antes/depois |
|---|---|---|---|
| Sem renda de objetivos | 35% | 4 / 4 | 7 / 7 |
| Sem renda de objetivos | 60% | 4 / 4 | 7 / 7 |
| Sem renda de objetivos | 85% | 4 / 4 | 7 / 6 |
| Objetivos, renda otimista | 35%, 60%, 85% | 3 / 3 | 5 / 5 |

Nenhuma dessas projeções precisou financiar munição sem saldo. Isso não comprova
sustentabilidade em combate real. Objetivos antecipam compras; a meta provisória
de PaP entre 7–10 não foi atingida na rota otimista, já antes da P3. Não aumentar
o preço global com base só nessa aproximação: poderia punir quem não completa
contratos/geradores cedo. Validar esses percursos humanos antes de rever recompensas.

## Testes e próximos playtests

- 25 testes Node: regras, telemetria, distância, especialização e multiplicadores.
- Chrome baixa/alta: 36 combinações reais de arma/PaP/distância por modo, incluindo
  dano de hits, preço/capacidade de compra, saldo insuficiente e estoque cheio.
- Disparo real das seis armas: um cartucho por gatilho, pellets, bloqueio de
  repetição imediata; penetração de sniper e Ray Gun em alvos distintos.
- Regressão completa: paredes, recarga, raridade/PaP, recompensas únicas,
  armadura, cães, objetivos, campanha, morte e reinício.
- Boot original file:// e HTTP; exportações locais e falha de CDN.
- Integração de telemetria: 525 ganhos, 300 gastos (placa + munição da pistola),
  saldo 225; reset preserva relatório anterior. Referências P1 antigas preservadas.

Próxima etapa é P4. Para ajustar P3 com evidência humana, exportar três partidas
por rota do roteiro P1 e anotar compras, precisão, falta de munição, uso de cada
arma, PaP e mortes. Priorizar sensação da Ray Gun, utilidade da shotgun de perto
e custo da SMG. Esta entrega não certifica campanha balanceada nem meta de chefe.
