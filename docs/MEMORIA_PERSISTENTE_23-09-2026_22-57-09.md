# Memória persistente — Protocolo Sobreviva v23, etapa 5/7

Versão: **23/09/2026 às 22:57:09 — America/Sao_Paulo (UTC−03:00)**.
HTML: `game_version23_23-09-2026_22-57-09.html`.
Branch: `codex/protocolo-contencao`. Base: `a7d0eb4` (v22).
Histórico: [v22](MEMORIA_PERSISTENTE_23-09-2026_13-15-17.md).
Plano: [Protocolo de Contenção](PLANO_PROTOCOLO_CONTENCAO.md).

## Pedido e implementação

Usuário pediu a próxima etapa. Executar instalação separada, carregamento e
preservação de estado; testar, documentar e enviar commit ao GitHub autorizado.
Não iniciar objetivos/diário da etapa 6.

- Portal INSTALAÇÃO no fundo do pátio norte (0,145), depois do portão. E entra
  somente entre ondas, sem gerador ativo ou ação pendente. Porta precisa estar
  aberta. Recarga, placa, troca, facada, PaP e arma pendente nas caixas bloqueiam
  a viagem; prompt informa o motivo. Saída interna (0,28) volta à cidade.
- `areaTravelReason` em game-systems.mjs centraliza regras básicas. Parte Three.js
  valida distância/linha livre, portal ativo, controles, morte e carregamento.
- `areaRuntime` controla área, carregamento, cache de duas áreas e geração de
  transição. E repetido não sobrepõe viagens; reset invalida operação pendente.
- Tela de carregamento é pintada antes da construção. Desbloqueia mouse, limpa
  entrada pelo evento existente e suspende loop/ondas. CONTINUAR pede novo clique
  após sucesso ou recuperação; não tenta capturar mouse sem gesto do usuário.
- Vida, armas/munição/modelos/raridade/PaP/slot, colete, sucata, pontos, perks,
  bônus, onda/intervalo, estatísticas e geradores permanecem nos objetos globais.
  Não usa resetGame durante viagem. Tempo do intervalo preservado durante carga
  e pausa. Bônus voltam a contar quando a partida é retomada.
- Cenas distintas: câmera e armas compartilhadas são reparentadas. Colisores,
  buckets espaciais, bloqueadores de tiros, LOD, máquinas, pickups, efeitos e
  portais são trocados por área; navegação reconstruída. RenderPass recebe cena
  ativa e cache de listas do renderer é limpo. Área inativa não renderiza/anima.
- Libera geometria/material/texturas exclusivos e mapas de sombras da área que
  sai da GPU; texturas são marcadas para reenvio ao retornar. Texturas globais de
  flash/labels compartilhados são preservadas. Duas descrições completas de cena
  em memória principal preservam pickups/timers/estado local; não é streaming
  completo da RAM nem armazenamento em disco. Cache cresce até duas áreas apenas.
- Instalação procedural 44×60, teto, paredes, corredores, bancadas/painéis,
  iluminação e depósito de munição com preços existentes. Chegada em (0,25),
  retorno à cidade em (0,142). Sem novos assets externos ou imports locais.
- Spawns internos em seis pontos a pelo menos 20 m do jogador, dentro da sala,
  validando colisão e rota. Ondas comuns, cães e névoa usam o mesmo controlador.
  Medkits aleatórios usam limites internos. Equipamentos de upgrade continuam
  na cidade. Sem novas recompensas ou conteúdo narrativo desta etapa.
- Falha de construção recupera cena, colisores, câmera/posição/rotação e área
  anterior; recursos parciais descartados. Eventos `areaChanged`/`areaLoadFailed`.
- Reiniciar restaura cidade, limpa cache interno e progresso como antes. Regras
  geradas no HTML por scripts/build-game.mjs; dois cliques continuam suportados.

## Verificação e limites

- 14 testes Node aprovados, incluindo condições de passagem e regressões.
- Chrome baixa/alta: bloqueio sem energia/em combate/com objetivo/placa, exclusão
  de cargas concorrentes, intervalo congelado, inventário preservado, cenas
  distintas, colisão/rota/spawns, retorno com pickups congelados, seis viagens
  completas sem crescimento de contagens de geometria/textura na GPU, falha
  simulada após construção parcial, ondas/cães internos, reset e cancelamento.
- Suítes anteriores de armas, armadura, raridades, bônus, ADS/LOD, geradores e
  especiais passaram. Compra dos quatro perks antes da viagem, persistência de
  perks/bônus e passagem pela tecla E também aprovadas em baixa/alta.
- Seis ciclos completos: 44 geometrias/17 texturas em baixa e 119/31 em alta
  na vista de retorno usada pelo teste; valores constantes em cada sequência.
- Boot sem hooks aprovado por file:// em auto/low/high e HTTP/auto, MP3 local
  reproduzível e botão de nova tentativa quando a CDN é bloqueada.
- Capturas internas de baixa e alta revisadas. Arquivos em docs/previews/v23-*.
- Contagens do renderer são evidência limitada de estabilidade de recursos GPU,
  não medição de bytes totais/heap ou promessa de FPS. Sem playtest prolongado.

## Próxima etapa

Etapa 6: objetivos secundários, desafios e diário. Preservar suporte file://,
cache limitado entre áreas e estado dos objetivos fora dos objetos gráficos.
