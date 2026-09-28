# P5 — Orçamento gráfico e otimização

v32 · 27/09/2026 · base v31 af1e95f · branch codex/p5-orcamento-grafico.

Validação complementada em 28/09/2026, sobre o commit 82e5e24.

## Mudanças

Geometrias primitivas idênticas de zumbis e cães são compartilhadas em um cache
com limite de 64 variantes. Materiais mutáveis continuam individuais, evitando
que ferimentos/olhos de um inimigo alterem outro. O cache pertence à sessão;
matar/reiniciar não descarta buffers ainda usados. As geometrias exclusivas
continuam sendo descartadas. Troca de área respeita o mesmo proprietário.

Detalhes decorativos pequenos somem além de 16 m em Desempenho e 22 m em Alta,
com retorno abaixo de 85% desse limiar para evitar alternância na borda.
A distância considera o campo de visão: ampliar a luneta restaura o detalhe.
Hit meshes, suas geometrias, transformações e classificação cabeça/pernas não
são alterados. Núcleos de perigo e avisos dos cães são preservados; guardião
sempre mantém o detalhe. Não foi simplificada a navegação ou a física.

Agrupamento por material, LOD por prédio/carro, detalhes instanciados de cenário,
sombras estáticas e pool de impactos já existiam. Foram mantidos: não agrupar
toda a cidade numa malha única, pois isso prejudicaria descarte fora da câmera.
Não reduzir resolução interna para apresentar a redução de nitidez como ganho.

## Método de medição e resultado disponível

Referência v31 e medição pós-mudança v32 usam três repetições por cena e qualidade,
2 s de aquecimento + 5 s de coleta, 1920×1080, DPR 1, Chrome headless.
Cenas: cidade vazia, limite normal de inimigos, quatro cães e guardião/interior.
Atores permanecem pausados; renderização é repetida. Não é sessão humana,
teste de IA ativa nem garantia de FPS em combate.

O teste agora aciona o estado de partida antes de pausar: desde P2.2 existia
uma câmera de menu independente que podia contaminar enquadramentos de um
benchmark antigo. A correção está nas duas medições novas. Os arquivos P1
originais permanecem intactos e não servem de comparação direta com este par.

Os arquivos `p5-before-low.json` e `p5-before-high.json` registram a referência
pré-mudança, de 27/09. A rodada pós-mudança, inicialmente bloqueada pelo limite de
uso da revisão automática, foi concluída em 28/09 e está nos arquivos
`p5-after-low.json` e `p5-after-high.json`. O agregado está em
[p5-comparison.json](measurements/p5-comparison.json). Os relatórios
`p5-audit-*.json` registram separadamente a estabilidade em dez ciclos.

Hardware/navegador/GPU ficam registrados nos JSON. Energia, temperatura e
processos externos não foram controlados; decoração contém aleatoriedade.
Comparar contagens e intervalos das três amostras, sem fundir percentis.
Geometrias/texturas são contagens de recursos WebGL, não memória em bytes.

As duas rodadas usaram Ryzen 7 5700U, Radeon integrada via ANGLE/D3D11, cerca de
15,35 GiB de RAM disponível ao sistema e Chrome headless 153 no Windows 11.
Cada amostra verificou o buffer renderizado em 1920×1080. O campo de viewport
da metadata registra a abertura da página; no preset baixo ele antecede o resize.

| Qualidade / cena | Chamadas de desenho antes → depois | Geometrias antes → depois | p95 de quadro antes → depois (ms) |
|---|---:|---:|---:|
| Desempenho / cidade | 290 → 291 | 271 → 272 | 17,1–31,3 → 17,1–31,1 |
| Desempenho / 24 inimigos | 914 → 801 | 895 → 585 | 17,0–22,7 → 17,1–17,2 |
| Desempenho / cães | 470–479 → 471–473 | 451–457 → 296–297 | 17,0–34,0 → 17,1–32,7 |
| Desempenho / chefe | 83 → 83 | 118 → 133 | 17,0–17,1 → 17,2–17,4 |
| Alta / cidade | 324 → 312 | 332 → 322 | 17,3–32,2 → 17,0–31,5 |
| Alta / 32 inimigos | 1156 → 1106 | 1164 → 839 | 17,3–21,3 → 18,3–20,1 |
| Alta / cães | 504–513 → 492–501 | 512–518 → 346–352 | 17,0–34,5 → 17,1–32,9 |
| Alta / chefe | 97 → 97 | 119 → 134 | 17,0–17,1 → 16,9–17,1 |

Intervalos representam mínimo/máximo entre três repetições. No cenário cheio,
as geometrias caíram 34,6% em Desempenho e 27,9% em Alta. As chamadas de desenho
caíram 12,4% e 4,3%, respectivamente. A decoração aleatória também muda contagens
na cidade vazia, por isso nem toda diferença entre execuções vem da otimização.
O cache retém 15 geometrias extras no cenário do chefe, após as cenas anteriores;
é o custo de manter buffers compartilhados prontos para reutilização. A auditoria
de dez ciclos verificou estabilidade dessa retenção.

As medianas pós-mudança ficaram entre 16,7 e 16,9 ms, próximas de 60 FPS, e não
demonstram aumento de FPS sobre a referência. O p95 baixo excedeu 25 ms nas
primeiras repetições de cidade/cães; a meta não foi atendida em todas as amostras.
Alta ficou abaixo de 33 ms nos cenários medidos. São amostras curtas com atores
pausados: combate ativo, sessões longas e metas humanas continuam pendentes.

Verificações em 28/09: boot sem instrumentação passou por file/HTTP, exportação
de métricas e falha de CDN. Smoke completo passou em baixa/alta, incluindo armas,
campanha e ambos os finais, pausa/reinício, hitboxes/luneta, dez trocas de área
e auditoria P5. A implementação permanece na v32; esta revisão acrescenta as
medições e corrige a documentação.

Reproduzir a medição pós-mudança com QA_P1_ONLY=1, P1_SCENARIOS=quiet-city,enemy-cap,dogs,boss,
P1_WARMUP_SECONDS=2, P1_SAMPLE_SECONDS=5 e P1_OUTPUT_PREFIX=p5-after.
Isso substitui os arquivos pós-mudança; use outro prefixo para preservar uma rodada.
Depois de gerar low/high, o relatório agregado é gerado por
`node tests/graphics-report.cjs --write`.

## Orçamento para a amostra visual de P6/P7

Esta etapa fixa uma amostra de referência: rua com arma e zumbi de perto,
mesmo zumbi a 40 m sem/com ampliação e trecho industrial. A aparência próxima
é preservada; nova arte AAA não foi adicionada nesta otimização.

| Recurso | Limite/regra para ampliar a amostra |
|---|---|
| Texturas procedurais | Superfícies 256² e pele 128²; rótulos até 512². Reusar mapas; revisar qualquer aumento |
| Texturas externas futuras | Teto inicial 1024² por mapa, máximo 4 mapas por material; medir antes de incorporar |
| Novo modelo de arma | Até 20 mil triângulos visíveis; sem nova luz com sombra |
| Novo inimigo | Até 8 mil triângulos perto; manter hitboxes separadas, validar LOD na luneta |
| Instâncias estáticas | Agrupar por objeto/setor, preservando frustum culling; evitar lote único do mapa |
| Geometrias de inimigos | Cache de até 64 variantes; vida útil da sessão |
| Sombras | Desempenho sem sombras; Alta mantém mapa 2048² existente, atualização de cenário quando necessária |
| Novas luzes | Nenhuma nova luz dinâmica nesta etapa; qualquer adição exige nova medição do cenário cheio |
| Efeitos existentes | Pool de impactos 20/40 em baixa/alta; cartuchos limitados a 32 |
| Áreas | Cache de duas descrições de cena; recursos GPU da área desativada são liberados |
| Aceite de expansão | 1080p real; alvo low mediana ~60 FPS/p95 ≤25 ms, high mediana ~45 FPS/p95 ≤33 ms; testar combate ativo também |

Esses limites para arte futura são critérios de revisão, não um validador de
importação nem promessa de que todo objeto atual satisfaz o orçamento novo.
Sem ganho comprovado ou com perda visual, manter a amostra anterior.
