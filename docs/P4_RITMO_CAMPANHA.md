# P4 — Ritmo, inimigos, campanha e chefe

27/09/2026 · v31 · base v30 `26b1805` · branch `codex/p4-ritmo-campanha`.

## Surgimentos e ondas

Correção concreta: limitar coordenadas à borda da cidade podia colocar um inimigo
perto demais do jogador, mesmo quando o raio sorteado era grande. Agora a posição
final deve ficar a pelo menos 20 m no plano da cidade, fora de colisões e com
caminho navegável. A alternativa aleatória também é validada, inclusive quando
a busca devolve sua posição padrão. Na instalação, candidatos precisam de caminho.
Sem posição válida, retorna null; o controlador tenta novamente sem consumir
o orçamento de inimigos e sem acumular surgimentos em rajada.

Foram mantidos os totais, limite simultâneo 24/32, limite de velocidade na onda
15, intervalo entre ondas de 10 s e antecipação com N. Pausa congela tudo.
Os tempos mínimos teóricos de emissão, sem mortes/limite simultâneo, continuam:
onda 1: 7 inimigos em pelo menos 5,4 s; onda 5: 6 cães em pelo menos 3,5 s;
onda 8: 28 inimigos em pelo menos 14,85 s. Não são durações de ondas: deslocamento,
capacidade simultânea e combate predominam. Não há amostra humana que justifique
alterar todos esses parâmetros simultaneamente.

## Cães e névoa

Preservados os ajustes da v27: aviso de 0,65 s, recuperação de 0,8 s, bote limitado
a um acerto, movimento em passos curtos contra paredes e dano interceptado pelo
colete. Testes repetem esquiva, pausa, ataque anunciado e paredes.

Névoa especial passa de 0,05 para 0,04 (FogExp2), mantendo mudança gradual,
menor limite simultâneo e ausência de atiradores nessa onda. A contribuição
teórica de névoa a 10 m cai de cerca de 22% para 15%; a 20 m, de 63% para 47%.
É uma comparação da equação do efeito, não uma medição de percepção humana.
Avisos de cães e objetivos em HTML não são obscurecidos pela névoa 3D.

## Guardião

Vida **fixa em 2.400**, três segmentos de 800, escudo de 2 s no início/transições.
Nenhum aumento baseado no equipamento ou durante a luta. Ataques não começam
enquanto o escudo está ativo. Limpeza de avisos e temporizadores permanece no reset.

| Fase | Forma e ação segura | Aviso | Recuperação | Dano |
|---|---|---:|---:|---:|
| Impacto | Círculo de 3 m; sair | 1,55 s | 2,4 s | 20 |
| Anel | Raio 2,5–6 m; centro ou exterior seguros | 1,8 s | 2,8 s | 26 |
| Ruptura | Círculo de 5 m; afastar-se | 1,6 s | 2,2 s | 32 |

Antes, todas as fases eram o mesmo círculo crescente com aviso progressivamente
menor. Agora forma, nome, cor e texto descrevem o perigo; preenchimento translúcido
mostra a região perigosa e a borda marca seu limite. Linha de visão continua
obrigatória para anunciar e causar dano. Centro do anel é testado como seguro.

Transições continuam repondo munição e chamando reforços finitos: quatro zumbis,
depois quatro cães. Os pontos de chegada são filtrados por distância mínima de
10 m, colisão e caminho. Só candidatos seguros são usados; a lista não faz
reposição infinita. Os reforços têm 1,2 s sem movimento/ataque ao chegar.

## Campanha, geradores e extração

Reforços de chefe e extração antes herdavam dano/velocidade da onda atual, embora
tivessem vida fixa. Agora usam a onda atual limitada ao intervalo 5–10. Vida
mantida em 180; vida das pernas coerente (72). O teto do dano dos cães de
campanha é 21,75 antes da armadura. Inimigos normais das ondas não recebem esse
limite. As regras centrais ficam em campaignThreatRound.

Extração mantém seis inimigos finitos, reposição inicial de munição, 15 s perto
do rádio e obrigação de limpar os alvos. Não aparecem novas levas ao sair/voltar.
Pausa/morte congelam a contagem. Recompensas únicas e final infinito preservados.

Geradores continuam só após limpar a onda, um por onda, duração 30/40/50 s,
orçamento 8/10/12, tipos mistos e recompensa única. O portão ainda pode ser
aberto após três defesas em três ondas distintas; **não foi imposto bloqueio
nas ondas 5–8**. A meta de portão 5–8 é provisória e não foi certificada:
sem partidas humanas, prolongar defesas ou aumentar custos seria especulativo.

## Testes e comparação de equipamentos

- 29 testes Node (sistemas, telemetria, armas, ritmo).
- Smoke completo low/high: fases, escudos, dano através de paredes bloqueado,
  esquiva, cães, névoa, geradores, campanha, dois finais, recompensas e reinício.
- P4: 60 amostras de surgimento por qualidade, centro/cantos; verifica posição
  segura quando existe, permitindo null. A disponibilidade também é exercitada
  pelo smoke, que precisa completar as ondas e os orçamentos finitos.
- Reforços nas ondas 1/5/20/100: dano limitado, vida, pernas e chegada;
  pausa não gasta o período de chegada.
- Boot original file:// auto/low/high, HTTP, exportação de métricas e falha CDN.
- Capturas dos três padrões revisadas em baixa/alta.

[Low](measurements/p4-low.json) e [High](measurements/p4-high.json) guardam testes
controlados de três combinações. Executar `QA_P4_ONLY=1`,
`P4_WRITE_REPORT=1 node tests/smoke.cjs`, com Playwright/Chrome configurados.
O teste alterna o slot na fase 2, usa rays reais e contabiliza munição.

| Equipamento | Disparos contra chefe | Tempo nominal |
|---|---:|---:|
| Pistola + shotgun comuns | 45 | 17,00 s |
| SMG + sniper raras com PaP | 13 | 8,16 s |
| Fuzil épico + Ray Gun com PaP | 8 | 7,80 s |

**Esses tempos não são duração de confronto real.** Somam cadência e escudos,
com mira corporal perfeita, shotgun sem dispersão, sem custo de esquiva/troca,
sem pressão dos reforços e sem navegação. Geradores/travel usam hooks, reforços
são removidos de forma controlada; extração usa dano fixo para eliminar seus
seis alvos. A suíte de campanha separada valida a sequência de descobertas.
Isso comprova integração e suficiência de munição nesses cenários, não três
partidas completas nem dificuldade justa.

A meta de **90–180 s não foi atingida nem validada**. A margem entre o dano puro
e essa meta é grande, sobretudo com PaP. Não aumentar HP para compensar sem
medir o confronto completo: isso pode produzir uma esponja de balas com equipamento
comum e anular a recompensa de upgrades. Registrar três partidas humanas por
equipamento, tempo dedicado aos reforços, erros, mortes e tempo total. Se o
confronto continuar curto, ajustar a composição/atividade entre fases antes
de decidir uma única vida inicial limitada. Pendência explícita para nova calibração.

Próxima etapa de implementação: P5. Não foram alterados os benchmarks P1 nem os
relatórios históricos P3; não alegar melhoria de FPS a partir desta entrega.
