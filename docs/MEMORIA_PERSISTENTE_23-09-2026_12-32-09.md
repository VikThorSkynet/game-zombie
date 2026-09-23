# Memória persistente — Protocolo Sobreviva v20, etapa 3/7

Versão: **23/09/2026 às 12:32:09 — America/Sao_Paulo (UTC−03:00)**.
HTML: `game_version20_23-09-2026_12-32-09.html`; regras em `game-systems.mjs`.
Branch: `codex/protocolo-contencao`. Base: `b5ef887` (v19/etapa 2).
Histórico: [v19](MEMORIA_PERSISTENTE_23-09-2026_10-29-08.md).
Plano: [Protocolo de Contenção](PLANO_PROTOCOLO_CONTENCAO.md).

## Pedido e escopo

Usuário pediu a próxima etapa: geradores, defesa finita, primeira porta e navegação
dinâmica; testar, atualizar documentação e enviar commit ao GitHub autorizado
VikThorSkynet/game-zombie. Não iniciar etapa 4 neste turno.

## Implementação

- `GeneratorNetwork` concentra regras independentes do renderer: três IDs, ordem
  livre, uma defesa ativa, carga de 25/35/45 s e orçamento de 6/8/10 reforços normais.
  Começar novamente não reinicia progresso nem concede recompensa. São 24 reforços
  no máximo por partida, além dos inimigos das ondas comuns.
- E inicia gratuitamente junto ao gerador, respeitando os bloqueios de interação
  existentes (recarga, facada, placa, troca, PaP). Distância e linha livre verificadas.
  Círculo de 10 m delimita a defesa; sair congela carga e novos reforços. Inimigos já
  presentes continuam ativos. Pausa e morte congelam a regra por completo.
- Completar exige tempo carregado, todo o orçamento gerado e nenhum reforço daquele
  gerador vivo. Recompensa fixa de 300 pontos, evento `generatorCompleted` único.
  Reforços mantêm pontos e chance de bônus comuns; sucata continua limitada por onda.
- `waveDirector.holds` suspende spawns comuns e avanço enquanto a defesa estiver
  ativa; inimigos comuns existentes continuam atacando. Não descarta seu orçamento.
  Spawns de defesa respeitam limite simultâneo global, distância mínima 20 m,
  colisão e caminho alcançável. Falhas tentam novamente sem consumir orçamento.
- Modelos procedurais sinalizados, lâmpada âmbar/ativa/verde e anel de defesa.
  Geradores usam posições livres de colisão e afastadas de outras máquinas, em
  três regiões das ruas. HUD mostra concluídos, distância, porcentagem, retorno ao
  círculo e reforços restantes (inclui ainda não gerados).
- Pátio norte fechado por paredes em x ±8, z 137–147. Portal central em (0,137),
  após depósito de munição norte. Todos os geradores energizam; E abre sem cobrar.
  O pátio não contém ainda o interior da instalação; esse é escopo da etapa 5.
- Abrir remove colisor da lista e de todos os buckets da grade espacial, retira
  painel dos bloqueadores de tiros e oculta o portão. Reconstrói grade de navegação
  e invalida caminhos/timers dos zumbis. Reinício reinsere o colisor sem duplicar.
  A visualização de debug da navegação também é reconstruída sem acumular geometria.
- Spawns comuns passaram a validar caminho até o jogador para não gerar inimigos
  presos no pátio fechado. Eventos adicionais: `generatorStarted` e `doorOpened`.
- Reset limpa geradores, carga, porta e hold. Não persiste partida em localStorage.
- Corrigidos rótulos antigos V16 do menu inicial/pausa; agora mostram V20 e data.
  Capturas de progressão agora também recebem o prefixo da versão do README,
  preservando o histórico de imagens v19.

## Verificação e limites

- 11 testes Node: regressões de ondas/armadura/economia e nova regra de geradores,
  ordem livre, exclusividade, pausa, saída, falha de spawn, orçamento e porta única.
- Chrome baixa/alta: geradores alcançáveis, E inicia e abre, porta bloqueia caminho
  fechado e permite caminho aberto, limite simultâneo, interrupção de ondas,
  24 reforços, 900 pontos de conclusão sem duplicação, invalidação de caminhos e
  bloqueador de tiro, retomada de ondas, morte e três resets sem acumular colisores.
- Suíte anterior de combate, ADS/LOD, munição, bônus, PaP, raridades, placa e ondas
  passou nas duas qualidades. Nenhum erro JavaScript de página.
- Capturas em `docs/previews/v20-*`; gerador e porta revisados visualmente.
- São testes automatizados e inspeção visual, não um playtest prolongado. Meta de
  abertura nas ondas 5–8 ainda não foi medida. Sem requisito artificial de onda,
  jogadores podem priorizar os geradores mais cedo. Não afirmar balanceamento final
  nem aumento de FPS. Não há novo áudio nem assets externos nesta etapa.

## Próxima etapa

Etapa 4: cão com modelo quadrúpede, bote anunciado/recuperação, rodadas especiais,
Munição Máxima no último cão e névoa variável. Sem MP3 de cão fornecido: não sintetizar.
Continuar com testes, documentação, versão e commit próprios.
