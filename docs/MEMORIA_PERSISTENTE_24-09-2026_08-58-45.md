# Memória persistente — revisão do plano com direção AAA e tela inicial

Data: **24/09/2026, 08:58:45 — America/Sao_Paulo**.
Versão jogável permanece v25; branch codex/protocolo-contencao.
Base documental: 7e8dc3b.
Histórico: [plano inicial](MEMORIA_PERSISTENTE_24-09-2026_08-49-46.md).
Estado do jogo: [v25](MEMORIA_PERSISTENTE_24-09-2026_08-20-03.md).

Usuário pediu acrescentar melhoria da tela inicial e orientar as melhorias
para transformar o jogo no melhor resultado possível, com ambição AAA.
Foi ampliado o [plano P1–P8](PLANO_POLIMENTO_BALANCEAMENTO_GRAFICOS.md).
Ainda é planejamento; não começar código sem pedido de execução.

- AAA tratado como referência de acabamento, coerência artística, animação,
  áudio, clareza e estabilidade, sem promessa de escala de um grande estúdio.
- P2 agora inclui P2.1 correções e P2.2 tela inicial: fundo cinematográfico
  leve, título, JOGAR, opções organizadas, como jogar, diário/recordes e créditos.
- Preservar teclado, movimento reduzido, volume/mudo e abertura file://.
  Carregamento com estado verdadeiro, sem progresso fictício. Não criar opção
  que sugira save inexistente; fundo não avança uma partida escondida.
- Uniformizar pausa, diário, derrota e vitória com a nova direção visual.
- P5 valida amostra de rua/arma/zumbi/interior e proposta de menu antes de
  expandir arte em P6/P7. Recursos gráficos escolhidos pelo ganho e custo medidos.
- Modelos/texturas originais ou licenciados podem ser avaliados seletivamente,
  sujeitos à compatibilidade local e memória. Sem compra ou migração automática.
- P6/P7 reforçam materiais, mãos/armas, criaturas, animação e sincronização MP3.
- P8 avalia a experiência completa; não rotular melhorias como equivalência AAA.

A ordem continua P1–P8, começando por medições quando solicitado. Etapas terão
testes, versão, documentação e commit/push conforme fluxo existente.
Nesta revisão só documentos foram alterados. Conferência de diff realizada;
testes de jogo não repetidos porque não houve alteração de código ou assets.
