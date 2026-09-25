# Memória persistente — P2.2, v29

24/09/2026 · America/Sao_Paulo.
Branch: `codex/p2-tela-inicial`, criada sobre v28 `7b5ef1f`.
Atual: `game_version29_24-09-2026_22-51-41.html`.

## Pedido e entrega

Usuário pediu a próxima etapa. Executada P2.2 do plano, após a P2.1 entregue
e enviada. Lidos README, AGENTS, memória v28 e plano. Versões anteriores
preservadas; regras e telemetria continuam nas fontes centrais, sem alteração.

- Tela inicial com título em duas linhas, composição assimétrica, paleta fria
  e acentos âmbar, JOGAR em destaque e versão discreta.
- Câmera independente enquadra a cidade existente. Não move o jogador, oculta
  os modelos da câmera de jogo só durante essa renderização e não avança a
  simulação. Fundo estático em todos os modos, sem assets ou canvas adicionais.
- Navegação separada para opções, instruções, diário/recordes e créditos.
  Opções agrupadas em gráficos, áudio, controles e acessibilidade.
- Qualidade exige botão explícito APLICAR E REINICIAR, com aviso de descarte
  da partida; escolher no seletor não recarrega. Demais opções persistem.
- Diálogos nativos com foco cíclico, Esc e retorno ao botão de origem.
  Atalho J não abre um diário por trás de outro diálogo.
- Pausa, derrota e extração usam a mesma linguagem de menu. Continuar só
  aparece para a sessão pausada. Instruções explicam ausência de save e reset.
- Botão principal bloqueia duas ativações imediatas; não há transição atrasando
  o controle. Menu não toca música automaticamente.
- Carregamento distingue motor pela internet e construção do cenário, sem
  porcentagem fictícia. Falha informa a fase e oferece nova tentativa.
- Revisão encontrou fallback HTMLAudio ignorando volume geral. Agora multiplica
  pelo volume e atualiza sons ativos quando a opção muda, inclusive volume zero.

## Verificação

- 22 testes unitários de sistemas e telemetria passaram; build --check passou.
- Regressão completa com QA_METRICS=1 passou em Desempenho e Alta, incluindo
  armas, pausa, morte/reinício, economia, colisões, cães, geradores, instalação,
  diário e os dois finais. Correção de armas sobrepostas preservada.
- Boot sem hooks passou em file:// auto/low/high, HTTP auto, exportação file
  low/HTTP high e falha do CDN com tentativa novamente.
- Nova suíte `QA_MENU_ONLY=1 node tests/smoke.cjs` testa opções por teclado,
  foco, Esc, ausência de diálogo sobreposto, duplo acionamento, mute real do
  fallback MP3 e reinício explícito por mudança de qualidade.
- Capturas em 1280×720, 1920×1080 e 390×844 revisadas. Janela estreita serve
  para verificar layout; jogo continua dependendo de teclado/mouse.
- Medição automatizada do menu após resize/aquecimento: zero chamadas novas
  a renderer.render em 1,2 segundo parado em cada qualidade; estatísticas,
  inimigos, geradores e posição do jogador permaneceram iguais. Não é benchmark
  de FPS, consumo elétrico ou playtest humano; requestAnimationFrame permanece.
  Referências P1/v26 e feedback v27 não foram regravados.

## Continuidade

Próxima etapa: P3 — funções das armas e economia, baseada nos dados disponíveis
e no roteiro de playtest. Não houve novo balanceamento nesta entrega.
Modelagem, iluminação e animações completas de P6/P7 seguem pendentes.
Fundo usa a cidade procedural existente; acabamento AAA continua direção do ciclo.

Repositório real: Documents/Codex/2026-09-21/https-github-com-vikthorskynet-game-zombie/work/game-zombie.
Diretório inicial Documents/ChatGPT/zombies game contém somente Git vazio.
