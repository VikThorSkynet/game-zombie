# Memória persistente — Protocolo Sobreviva v24, etapa 6/7

Versão: **23/09/2026 às 23:17:24 — America/Sao_Paulo (UTC−03:00)**.
HTML: `game_version24_23-09-2026_23-17-24.html`.
Branch: `codex/protocolo-contencao`. Base: `a6b9451` (v23).
Histórico: [v23](MEMORIA_PERSISTENTE_23-09-2026_22-57-09.md).
Plano: [Protocolo de Contenção](PLANO_PROTOCOLO_CONTENCAO.md).

## Pedido e implementação

Usuário pediu a próxima etapa. Implementados objetivos, desafios opcionais e
diário; manter uma etapa por commit, com envio ao GitHub já autorizado.

- J ou botão do menu abre diário e pausa a partida. J, Esc e botão de retorno
  fecham para o menu pausado; CONTINUAR recaptura o mouse com gesto do jogador.
  Painel rolável, foco contido no diálogo, botões acessíveis pelo teclado.
- Objetivo principal no HUD e diário acompanha geradores 0/3, abertura do portão,
  primeira visita à instalação e sobrevivência. Não introduz uma nova missão
  obrigatória nem recompensa adicional para esses marcos já implementados.
- Cada gerador, abertura do portão e primeira visita interna geram um registro
  único por partida. São descobertas automáticas, não os três registros
  coletáveis da cadeia do easter egg prevista para a etapa 7.
- `FieldJournal` centraliza estado sem referências gráficas em game-systems.mjs.
  Eventos registrados uma vez antes de init; reset limpa progresso sem duplicar
  assinaturas. Trocas de cena mantêm o mesmo diário e contrato.
- Oferta por onda: três mortes com faca nas ondas normais 1–3; três mortes na
  cabeça nas normais pares seguintes se o inventário tiver arma convencional;
  cinco mortes nas demais ondas, inclusive cães e névoa. Nenhuma arma de caixa
  específica é obrigatória. Aceitação explícita, apenas uma tentativa por onda.
- Apenas eventos de eliminação paga na onda correta contam após aceitar.
  Identidades dos inimigos deduplicadas; Nuke não conta. Completar paga 300
  pontos fixos uma vez, sem multiplicação por Pontos Duplos/sucata adicional.
  Expira no fim da onda; abandono/falha não remove recursos nem trava história.
- Desafio ativo bloqueia início de defesa de gerador e defesa ativa bloqueia
  aceitação. Abandonar no diário libera a atividade; não é possível reaceitar
  na mesma onda. Aceitação tardia pode não deixar alvos suficientes, explicitado
  no README. Recompensa e metas são valores iniciais, não balanceamento final.
- Recordes locais: máximos de ondas concluídas, mortes e desafios em uma partida.
  Salvos ao terminar ondas/desafios e na morte, em `sobreviva.records.v1`.
  `readRecords` valida inteiros seguros não negativos, ignorando campos inválidos.
  Falha de leitura/escrita é tratada sem impedir a partida. Nenhum bônus permanente.
  Dados dependem do navegador/endereço, especialmente em file:// com novo nome.
  Não há save da partida ou sincronização entre dispositivos.
- HTML renomeado para v24; regras incorporadas por scripts/build-game.mjs.
  README, plano, testes e capturas v24 atualizados.

## Verificações

- 16 testes Node aprovados: regras anteriores, seleção de contratos, aceite,
  eventos duplicados, recompensa única, falha/abandono/reset e dados inválidos.
- Regras incorporadas sincronizadas com a fonte.
- Chrome baixa/alta: J abre/pausa, botão aceita, retorno permanece pausado,
  exclusão entre desafio/gerador, recompensa via eliminação real de inimigos,
  não duplicação, término da onda, gravação local, registros únicos, reset
  preservando recordes e teclado Tab/Esc. Suítes anteriores também aprovadas.
- Seis idas e voltas entre áreas em baixa/alta mantêm diário, descoberta única
  e contrato; regressões de inventário, cache, falhas e cancelamento passaram.
- Interface do diário revisada visualmente; capturas em docs/previews/v24-*.
- Boot sem hooks aprovado em file:// auto/low/high e HTTP auto; motor bloqueado
  mostra opção de tentar novamente. Nenhum import local foi introduzido.

## Próxima etapa

Etapa 7: easter egg, chefe em três fases e extração ou sobrevivência infinita.
Preservar a cidade principal, suporte file://, carregamento separado, registros
de estado independentes da cena e economia limitada. Ainda falta playtest
prolongado para medir ritmo, consumo de munição e recompensas opcionais.
