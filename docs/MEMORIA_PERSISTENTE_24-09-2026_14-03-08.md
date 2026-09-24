# Memória persistente — P1, medições locais

Data: **24/09/2026 — America/Sao_Paulo**.
Branch: `codex/p1-medicoes`, criada a partir de `7d851f8`.
Versão atual: `game_version26_24-09-2026_13-47-37.html`.
A v25 permanece intacta no repositório como base de comparação.

## Pedido e contexto

Usuário autorizou explicitamente ler o projeto/conversas, criar nova branch e
executar apenas P1. Foram consultados AGENTS, README, memórias v25/planejamento,
plano P1–P8 e histórico das tarefas “Ajustar mira, áudio e renderização” e
“Explore game-zombie repository”. O repositório real está em
`Documents/Codex/2026-09-21/https-github-com-vikthorskynet-game-zombie/work/game-zombie`;
a pasta inicial `Documents/ChatGPT/zombies game` contém apenas Git sem commits.

## Implementação

- `telemetry.mjs`: coletor independente, histogramas limitados, eventos, métricas
  por arma/onda, economia, marcos, desempenho CPU/GPU e snapshots exportáveis.
- `scripts/build-game.mjs`: incorpora regras e medições no HTML, sem importação
  de módulos locais. Editar fontes, nunca os dois blocos gerados.
- Coleta opcional com `?metrics=1`; link no menu para ativar, botão para baixar
  JSON e zerar apenas a janela de desempenho depois do aquecimento. Nenhum envio.
- Partida anterior preservada em memória ao reiniciar, com seu saldo/inventário
  antes do reset. Recarregar/fechar perde essa cópia; não existe save de campanha.
- Compras antes não observadas receberam eventos; ganhos incluem desafios,
  geradores, Nuke e chefe. Placas contam só ao concluir aplicação.
- Precisão por disparo que causou dano, sem multiplicar pellets/perfuração.
  Dano do guardião agora também emite evento; escudo sem dano não conta.
- Causas do dano fatal: cão, corpo a corpo, projétil, explosão e guardião.
  Marcos de portão, instalação, núcleo, PaP, chefe, extração e escolha infinita.
- Tempo ativo real separado do tempo de simulação limitado por quadro. Pausa,
  carregamento e aba oculta excluídos. CPU mede update/submissão síncrona;
  GPU consulta WebGL2 assíncrona a cada dez renders, no máximo quatro pendentes.
  Descartar queries disjuntas e de janela antiga; liberar ao reiniciar/zerar.
- Draw calls incluem passes do composer; resolução e recursos têm min/max.
  Menu estático não recebe FPS artificial. Carregamento de área medido separadamente.

Preços, dano, cadência, regras de ondas e arte não mudaram. Tela inicial AAA
continua prevista na P2.2; P1 só acrescentou controles necessários às medições.

## Validação e referência

Ver [resultados P1](P1_RESULTADOS.md) para resultados finais, ambiente e limitações.
Os arquivos `docs/measurements/p1-low.json` e `p1-high.json` são a referência
automatizada. `tests/telemetry.test.mjs` cobre cálculos, limites, reset e consultas
GPU; `tests/telemetry.cjs` cobre eventos reais do jogo e os cenários controlados.
`tests/boot.cjs` verifica também download JSON, pausa e zeragem sem hooks em
file:// e HTTP. `QA_METRICS=1` permite regressões completas com coleta ligada.

O benchmark fixa câmera e inimigos; não mede custo completo de IA/combate nem
certifica diversão/dificuldade. A onda normal usada para limite de inimigos é 9;
a onda 10 é caçada e não serve para validar 24/32 inimigos. O teste confere o
número real no relatório. CPU de referência: Ryzen 7 5700U; Radeon integrada;
Windows build 26200, Chrome 153.0.8010.53, aproximadamente 16 GB de RAM.

## Continuidade

P1 entrega instrumentação e referência controlada. As rotas humanas de economia,
sobrevivência e campanha estão no [roteiro](P1_ROTEIRO_PLAYTEST.md), com três
tentativas por rota e hipóteses explícitas. Não há tempos humanos medidos para
portão, PaP, chefe ou extração; não usar testes com teleporte/avanço de tempo
como se fossem uma partida. Metas numéricas permanecem provisórias.

Próxima implementação, se solicitada: P2.1 correções/clareza, depois P2.2 menu.
Não iniciar automaticamente P3–P8 nem anunciar equivalência AAA. Manter abertura
por dois cliques, MP3, qualidade baixa/alta e a fonte única de regras.
