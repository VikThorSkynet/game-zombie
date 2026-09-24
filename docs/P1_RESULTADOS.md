# P1 — referência de medições da v26

Data: 24/09/2026. Base: v25/7d851f8. Branch: `codex/p1-medicoes`.
Instrumentação entregue na v26, com a v25 preservada. Não houve mudança de
balanceamento ou arte. A P1 estabelece coleta local e referência automatizada;
as rotas humanas ainda precisam ser executadas para avaliar dificuldade/economia.

## Ambiente de referência

- CPU: AMD Ryzen 7 5700U, 16 processadores lógicos informados pelo navegador.
- Memória visível ao sistema: 15,35 GiB (aproximadamente 16 GB instalados).
- GPU WebGL: AMD Radeon(TM) Graphics, ANGLE Direct3D11, dispositivo 0x164C.
- Sistema: Windows NT 10.0.26200. Chrome instalado: 153.0.8010.53.
- Execução: Chrome headless via Playwright, HTTP local, saída 1920×1080, DPR 1.
- Qualidades: Desempenho e Alta, com coleta ligada. Conferir canvas real em cada
  amostra; a janela no boot foi 1440×960, redimensionada antes dos cenários.
- Driver exato, modo de energia e cargas de outros processos não foram medidos.
  Esses controles devem ser fixados nas comparações humanas seguintes.

## Método

Três repetições por cenário/qualidade, 5 segundos de aquecimento e 10 segundos de
coleta. O teste limpa o coletor após aquecer. Seis cenários: menu, cidade vazia,
limite de inimigos, caçada, névoa e guardião. A câmera e os atores ficam parados,
com renderização repetida; a simulação normal permanece pausada. Isso mede cargas
visuais reproduzíveis, sem simular deslocamento, IA ativa, combate ou um jogador.
Geometrias decorativas podem variar entre reinícios pela aleatoriedade existente.

O cenário de limite usa a **onda 9 normal**, com 24 inimigos em Desempenho e 32
em Alta. Caçada usa a onda 5 (quatro cães); névoa usa a onda 8 (15/20 inimigos).
Guardião usa o interior e o chefe presente. O teste verifica população e resolução.
Uma primeira tentativa com onda 10 foi descartada porque essa onda é uma caçada.
Os arquivos finais substituem essa tentativa pelas amostras corretas.

GPU usa queries assíncronas a cada dez renders; resultados ainda pendentes ou
disjuntos não são usados. CPU mede o trecho de submissão no thread principal,
incluindo chamadas ao driver; GPU mede comandos gráficos. Não somar diretamente
essas duas medidas, pois há execução sobreposta. O benchmark roda com coleta
ligada e não mede isoladamente o custo de instrumentação contra coleta desligada.

Dados completos: [Desempenho](measurements/p1-low.json) e [Alta](measurements/p1-high.json).
Para reproduzir ou coletar uma partida, siga o [roteiro P1](P1_ROTEIRO_PLAYTEST.md).

## Resultados das 36 amostras

Faixas abaixo são o menor/maior resultado das três repetições, sem misturar os
percentis. Tempos em ms; CPU/GPU são medianas. Travadas = soma de quadros >50 ms.
Todas as 30 amostras renderizadas confirmaram canvas de 1920×1080 e tempos GPU
válidos; as seis amostras de menu não renderizam continuamente.

| Modo | Cenário | Quadro mediano | p95 de quadro | CPU mediana | GPU mediana | Draw calls | Travadas |
|---|---|---:|---:|---:|---:|---:|---:|
| Desempenho | Cidade vazia | 16,7 | 17,1 | 7,0–7,3 | 11,5 | 316 | 0 |
| Desempenho | 24 inimigos | 16,7 | 17,1 | 10,5–11,4 | 13,6–14,0 | 940 | 0 |
| Desempenho | 4 cães | 16,7 | 17,1–17,3 | 6,6–7,8 | 12,0 | 424 | 0 |
| Desempenho | Névoa / 15 inimigos | 16,7 | 17,0–17,2 | 8,7–8,8 | 13,9–14,0 | 706 | 0 |
| Desempenho | Guardião | 16,7 | 17,0–17,1 | 2,1 | 2,7 | 73 | 0 |
| Alta | Cidade vazia | 16,8–17,9 | 18,2–18,5 | 6,4–8,2 | 13,3–13,5 | 326 | 1 |
| Alta | 32 inimigos | 19,3–20,6 | 22,5–44,6 | 14,2–16,9 | 14,9–16,8 | 1158 | 10 |
| Alta | 4 cães | 18,3–20,3 | 21,8–22,1 | 7,5–7,7 | 14,1–19,3 | 434–443 | 0 |
| Alta | Névoa / 20 inimigos | 16,7–18,2 | 17,0–21,0 | 12,0–12,3 | 14,5–18,8 | 846 | 0 |
| Alta | Guardião | 16,7 | 17,1 | 2,5–2,6 | 5,5 | 87 | 0 |

Em Desempenho, a carga visual controlada ficou próxima de 60 quadros/s e dentro
do p95 provisório. Em Alta, a primeira repetição de 32 inimigos teve p95 de
44,6 ms, acima da meta de 33 ms; as seguintes tiveram 23,4 e 22,5 ms. Houve
10 quadros >50 ms nessa primeira repetição, com máximo de 89,6 ms. Cidade vazia
em Alta teve um quadro de 121,2 ms. Esses picos foram mantidos no relatório.
A causa da variação não foi isolada; não atribuir automaticamente à GPU,
temperatura ou coleta de lixo. É necessário repetir com sessão ativa e condições
de energia/carga controladas antes de declarar estabilidade ou escolher uma correção.

O menu permanece estático após desenhar: não há mediana/p95 de FPS contínuo nele.
O tempo inicial registrado começa no módulo e termina na primeira imagem, sem
incluir o download da CDN; não representa sozinho o tempo total de abertura.
Não anunciar 60 FPS em partidas completas a partir de cenários com atores pausados.

## Economia, combate e campanha

Integração verificada em baixa/alta: um disparo real consumiu munição e contou
um acerto; a eliminação com faca rendeu 125 pontos/3 sucatas; Nuke rendeu 400;
uma placa custou 150 e seu uso foi registrado; munição custou 250. O relatório
encerrou com **525 ganhos, 400 gastos e 125 de saldo**, além da causa fatal correta.
Reset zerou a nova partida e preservou o relatório anterior com seu saldo real.

A cadeia controlada de campanha registrou instalação, núcleo, início/fim do
guardião, recompensa de 600 e extração. Pausa, morte, escolha infinita e reset
passaram. Esses testes usam posicionamento/avanço controlados: seus tempos não
são tempos de jogadores e não foram usados para avaliar as metas de 5–8 ondas,
7–10 ondas para PaP ou 90–180 segundos de chefe.

O relatório econômico preexistente também executou. Continua sendo uma projeção
com precisão ideal e hipóteses restritas, sem todos os bônus, despesas e reforços.
Não substitui dados de partida e não motivou qualquer alteração de preços.

## Verificações

- 22 testes Node aprovados: 17 de regras e 5 de métricas/GPU.
- Build sincronizado; fonte de regras e HTML v25 sem alterações.
- Suíte completa de gameplay aprovada em baixa/alta com coleta ligada: armas,
  luneta/LOD, bônus, economia, geradores, cães/névoa, diário, áreas e campanha.
- Boot sem hooks aprovado em file:// auto/low/high e HTTP auto.
- Download JSON real, tempo de pausa excluído e zeragem da janela aprovados em
  file:// low e HTTP high. Falha simulada da CDN mostrou a opção de tentar novamente.
- Integração P1/campanha aprovada em baixa/alta; consultas GPU testadas quanto a
  espera não bloqueante, descarte de disjunção, falta de suporte e liberação.

## Pendências para as próximas etapas

Executar três partidas humanas por rota descrita no roteiro, com equipamento,
precisão, compras e bônus registrados. Ainda não há evidência humana para decidir
novos preços, vida do chefe ou metas de progressão. Confirmar fluidez com IA,
movimento, combate e equipamento comum/aprimorado antes de tratar os objetivos
de FPS e duração como atingidos. Medir heap/memória total e driver quando houver
acesso confiável; contagens de geometria/textura não são consumo em bytes.

P2 deve partir dos problemas de clareza/uso e da tela inicial já aprovados no plano.
P3/P4 usarão os relatórios de partida para balanceamento. P5 deve comparar as
mesmas câmeras/cargas, além de partidas reais, e auditar recursos ao reiniciar.
Na cidade vazia em Desempenho, os três reinícios terminaram com 71, 72 e 73
texturas; no cenário do guardião, a contagem ficou em 29 nas três repetições.
Esse crescimento entre reinícios da cidade merece investigação controlada em
P5. Não prova sozinho vazamento em bytes: há caches e variação procedural, e
a suíte de troca de área apresentou contagens estáveis em seis retornos.
