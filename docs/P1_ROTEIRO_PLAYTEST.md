# P1 — medições e roteiro de playtest

Base de regras e arte: v25, commit 7d851f8. Instrumentação: v26, branch
`codex/p1-medicoes`. O HTML v25 permanece no repositório para comparação.
P1 acrescenta observação; preços, dano, cadência, ondas e arte não foram ajustados.

## Coletar e exportar

Abra a v26 por dois cliques ou HTTP. No menu, selecione **Ativar medições locais**;
essa ação recarrega a página, portanto faça isso antes de iniciar uma partida.
Também pode acrescentar `?quality=low&metrics=1&route=economia&run=1` ao endereço.
`quality=high` seleciona Alta. Use a mesma qualidade e resolução nas comparações.
No menu de pausa ou no fim da partida, clique **EXPORTAR MEDIÇÕES**.
O arquivo JSON é baixado pelo navegador; não há transmissão, conta ou servidor de coleta.
Após reiniciar, o botão **EXPORTAR PARTIDA ANTERIOR** preserva a última partida
somente na memória da página. Exportar antes de fechar/recarregar ou trocar qualidade.
A exportação não é um save. Os arquivos incluem identificação técnica do navegador/GPU.

Para ler resumos: `node scripts/summarize-metrics.mjs caminho/relatorio.json`.
Ausência de amostras, mortes ou marcos não significa sucesso: valores não medidos
permanecem nulos ou ausentes. Não preencher tempos de campanha com estimativas.

## Significado dos dados

- `activeSeconds`: tempo real entre quadros de jogo ativo, sem pausa, aba oculta
  e carregamento. `simulationSeconds`: tempo usado pelo jogo, limitado a 50 ms
  por quadro. A diferença evidencia desaceleração da simulação sob travadas.
  O primeiro quadro após mudança de contexto é descartado da medição temporal.
- `waves`: início, conclusão e duração ativa, incluindo defesas no meio da onda.
  Onda ainda aberta não tem duração final. O intervalo fica fora da onda concluída.
- `totals`: disparos que consumiram munição, disparos que causaram dano, mortes,
  eliminações, uso de placas e acertos críticos. Precisão = disparos com dano /
  disparos; vários pellets e alvos perfurados contam uma vez. Escudo do chefe
  sem perda de vida não conta como acerto. Faca não consome tiros nem aumenta precisão.
  Tiros por eliminação considera eliminações por bala/laser, incluindo o chefe;
  mortes por Nuke/explosão/faca ficam separadas por causa no histórico.
- `weapons`: tiros, disparos com dano e eliminações por arma. `state.weapons`:
  munição restante, raridade e PaP na hora da exportação.
- `economy` e `purchases`: ganhos e gastos brutos de pontos/sucata, incluindo
  geradores, desafios, chefe, Nuke, munição, caixas, perks, placas, colete, raridade
  e PaP. A compra PaP registra o pagamento; `firstPaP` registra a conclusão.
- `milestones`: portão aberto, primeira entrada na instalação, primeira interação
  junto ao núcleo (`coreReached`), núcleo liberado,
  início/fim do chefe, início/fim da extração e escolha infinita, com onda e tempo.
- `lastDamage`: ataque recebido mais recente; no encerramento por morte identifica
  o golpe fatal. Registra cão, corpo a corpo, projétil, explosão ou guardião.
- `performance`: intervalos reais entre quadros, mediana, p95, contagem >50 ms,
  duração de trabalho síncrono no thread principal, draw calls de todos os passes,
  triângulos, tamanho real do canvas e contagens de geometria/textura/programas.
  Contextos separados por cidade/instalação, onda normal, caçada, névoa, defesa,
  chefe, extração e menu. O menu atual só renderiza ao mudar: não existe FPS
  contínuo representativo nele. CPU inclui submissão de render e pode incluir
  espera do driver; não é tempo isolado de CPU nem tempo de execução da GPU.
- `areaChanged`/`areaLoadFailed`: duração da passagem incluindo espera por quadros.
  `initialLoadMs` começa na configuração do módulo e termina na primeira imagem;
  exclui o download inicial da CDN. `gpu` mede comandos de renderização via
  `EXT_disjoint_timer_query_webgl2`, quando disponível, uma vez a cada dez renders.
  Consultas são lidas depois de prontas, sem espera ativa; resultados disjuntos
  são descartados. Há no máximo quatro consultas pendentes, liberadas ao zerar
  a janela/reiniciar. Amostras pendentes no momento da exportação ficam de fora.
  Sem suporte, a contagem GPU permanece zero e os percentis nulos.
  Memória do processo/heap e bytes da GPU não são inferidos das contagens de objetos.

O histórico guarda no máximo 5.000 eventos; `droppedEvents` informa descarte.
Totais, compras e marcos continuam contando. Ondas guardam as últimas 1.000.
Histogramas de quadro têm precisão de 0,1 ms até 10 s, com overflow explícito.
A coleta é opcional; comparar sempre relatórios com a mesma configuração de coleta.

## Protocolo de referência humana

Use o computador de referência descrito em P1_RESULTADOS.md, na tomada, sem gravação
de tela ou outras cargas durante a medição. Anote modelo do computador, RAM, GPU,
driver, Windows, versão completa do navegador, resolução de saída, DPR, qualidade,
resolução interna e modo de energia. Registre mudanças: não juntar máquinas diferentes.
`metadata.viewport` representa a janela no boot; `state.viewport` e o tamanho do
canvas indicam a resolução na exportação/amostra, inclusive após redimensionamento.

Em cada cenário, aqueça por **30 segundos**, depois colete **60 segundos**, com
**três repetições** por qualidade, 1920×1080 de saída. Após aquecer, pause e clique
**ZERAR AMOSTRA DE DESEMPENHO**; continue e colete o período, pause e exporte.
Isso limpa apenas a amostra de desempenho, preservando economia e campanha.
O início da janela fica em `metadata.performanceStartActiveSeconds`.
Não subtraia percentis de relatórios diferentes. O benchmark automatizado também
limpa a coleta após o aquecimento.

| Cenário | Rota e observação |
|---|---|
| Menu | Aguardar, abrir opções, percorrer por teclado; medir abertura e resposta, sem inventar FPS de menu estático. |
| Cidade tranquila | Centro → depósito oeste → centro, olhando para a rua; manter arma inicial e registrar inimigos visíveis. |
| Limite de inimigos | Mesma rua, acumular o limite simultâneo (24 Desempenho / 32 Alta em onda normal); correr na rota e registrar onda. |
| Caçada | Onda 5, repetir deslocamento lateral e esquiva; primeira caçada tem limite de quatro cães. |
| Névoa | Onda 8, mesma rua/câmera e arma; não comparar diretamente à cidade vazia. |
| Guardião | Instalação, núcleo liberado; registrar equipamento e cada fase, com reposição de munição. |

## Rotas de economia e campanha

Executar três partidas novas por rota; exportar inclusive tentativas com morte.
Manter ordem dos geradores e caminho da cidade idênticos, anotar desvios e bônus.
Não usar hooks, dinheiro artificial, teleporte ou avanço manual da simulação.

1. **Economia:** pistola/faca no começo; defender geradores 0 → 1 → 2; comprar
   munição/placa quando necessário; poupar para o primeiro PaP. Anotar todas as
   mudanças de arma, raridade, bônus e despesas. Abrir portão assim que viável.
2. **Sobrevivência:** mesma rota; priorizar placas/colete e uma arma alternativa.
   Medir diferença de mortes, consumo, saldo e atraso até o portão/PaP.
3. **Campanha:** geradores, registros, portão, instalação, componentes e símbolos,
   núcleo, chefe e rádio. Repetir com equipamento comum e aprimorado. Em sessão
   separada validar escolha infinita. Registrar duração total e motivo de morte.

Metas provisórias: portão ondas 5–8; primeiro PaP ondas 7–10 na rota econômica;
chefe 90–180 s; Desempenho próximo de 60 FPS/p95 ≤25 ms; Alta próximo de 45 FPS/
p95 ≤33 ms. Só avaliar essas metas com partidas e cargas comparáveis.

Ficha por tentativa: data, arquivo JSON, rota/repetição, equipamento, bônus,
sensação de precisão, legibilidade, ataques percebidos, inimigos presos, pausas,
compras forçadas e motivo para abandonar. Anotar três principais dificuldades.
Perguntas: falta munição antes de haver renda? A faca compensa o risco? Placas
competem demais com PaP? O portão chega cedo demais? As fases do chefe são claras?

## Reprodução automatizada

`node --test tests/systems.test.mjs tests/telemetry.test.mjs`

`node scripts/build-game.mjs --check`, `node tests/boot.cjs` e `node tests/smoke.cjs`.
Playwright pode ser indicado por `PLAYWRIGHT_MODULE`; Chrome por `CHROME_PATH`.
`QA_METRICS=1` executa regressões com coleta habilitada.
`QA_P1_ONLY=1 node tests/smoke.cjs` executa integração P1 e 3 repetições de menu,
cidade vazia, limite de inimigos, cães, névoa e chefe em baixa/alta a 1080p.
No PowerShell, defina as variáveis com `$env:NOME='valor'` antes do comando.
Padrão: 5 s de aquecimento + 10 s de coleta por repetição; configurar com
`P1_WARMUP_SECONDS` e `P1_SAMPLE_SECONDS`. Saídas: `docs/measurements/p1-low.json`
e `p1-high.json`. A câmera e os inimigos ficam fixos; são cargas de renderização
controladas, sem representar toda a IA/combate, dificuldade ou FPS de uma partida.
Os testes injetam hooks somente na resposta HTTP; o HTML distribuído não expõe QA.
Para conferir só a integração de medições e marcos da campanha, use também
`P1_SKIP_BENCH=1` junto de `QA_P1_ONLY=1`. `P1_SCENARIOS=enemy-cap` repete apenas
esse cenário e substitui suas três amostras no arquivo existente; os demais
relatórios preservam suas próprias datas e metadados. Não comparar qualidades
ou ambientes diferentes como se fossem repetições da mesma configuração.

Referência de implementação: [especificação WebGL2 do Khronos](https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query_webgl2/).
