# P5 — Orçamento gráfico e otimização

v32 · 27/09/2026 · base v31 af1e95f · branch codex/p5-orcamento-grafico.

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

Referência v31 e medição pós-mudança v32 deveriam usar três repetições por cena e qualidade,
2 s de aquecimento + 5 s de coleta, 1920×1080, DPR 1, Chrome headless.
Cenas: cidade vazia, limite normal de inimigos, quatro cães e guardião/interior.
Atores permanecem pausados; renderização é repetida. Não é sessão humana,
teste de IA ativa nem garantia de FPS em combate.

O teste agora aciona o estado de partida antes de pausar: desde P2.2 existia
uma câmera de menu independente que podia contaminar enquadramentos de um
benchmark antigo. A correção está nas duas medições novas. Os arquivos P1
originais permanecem intactos e não servem de comparação direta com este par.

Os arquivos `p5-before-low.json` e `p5-before-high.json` registram a referência
pré-mudança. A rodada pós-mudança foi bloqueada pela revisão automática ao atingir
o limite de uso; portanto não há comparação de FPS/tempos e nenhum ganho temporal
é afirmado. Os relatórios `p5-audit-*.json` são auditorias de contagem de recursos,
não substituem a medição de desempenho.

Hardware/navegador/GPU ficam registrados nos JSON. Energia, temperatura e
processos externos não foram controlados; decoração contém aleatoriedade.
Comparar contagens e intervalos das três amostras, sem fundir percentis.
Geometrias/texturas são contagens de recursos WebGL, não memória em bytes.

Reproduzir a medição pós-mudança com QA_P1_ONLY=1, P1_SCENARIOS=quiet-city,enemy-cap,dogs,boss,
P1_WARMUP_SECONDS=2, P1_SAMPLE_SECONDS=5 e P1_OUTPUT_PREFIX exclusivo.
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
