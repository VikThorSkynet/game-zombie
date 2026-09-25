# Memória persistente — P2.1, v28

24/09/2026 · America/Sao_Paulo.
Branch: `codex/p2-polimento-jogabilidade`, base v27 `1007d62`.
Atual: `game_version28_24-09-2026_22-24-29.html`.

## Pedido e escopo

Usuário pediu avançar à próxima etapa e relatou duas armas iniciais sobrepostas
ao clicar Reiniciar depois de morrer. Conforme a divisão explícita do plano,
esta entrega é P2.1 (correções/clareza); P2.2 (nova tela inicial) é a próxima
entrega separada. Foram lidos AGENTS, README, memória v27 e o plano atualizado.
Mantidos os ajustes do playtest, a instrumentação P1 e os HTML anteriores.

## Causa e correções

- `resetGame` ocultava os modelos antigos, mas criava pistola e escopeta novas
  com `visible=true` e só selecionava a pistola. Agora a escopeta nasce oculta;
  `updateWeapon` também garante que todos os slots inativos estejam ocultos.
  Luneta, facada, placa e PaP ainda podem ocultar a arma ativa.
  Reset também zera aviso de dano, hitmarker e tremor da morte anterior; o
  problema visual adicional foi identificado nas capturas e ganhou regressão.
- A troca usava dois `setTimeout` que sobreviviam à pausa/morte/reset. Agora
  `weaponSwitchTarget` e `updateWeaponSwitch(delta)` usam tempo ativo, congelam
  na pausa/morte e são descartados no reset. A duração continua 0,4 s e a
  mudança de slot ocorre na metade. Índices inválidos não iniciam troca.
- Avisos usam tempo ativo em `updateNotices`; atraso de Med Kit pertence à
  partida e é limpo ao reiniciar. Prioridade explícita de perigo (detonador,
  impacto do guardião) impede bônus secundário de apagar o aviso crítico.
- HUD identifica sobrevivência/caçada/névoa, intervalo, defesa, chefe e extração.
  Quando falta uma ameaça e todos os reforços já surgiram, mostra distância,
  direção relativa e se é rastejante. Some ao eliminar o alvo. O indicador não
  atravessa colisões nem muda a navegação; apenas orienta o jogador.
- Prompts explicam recarga, troca, placa, facada ou PaP em andamento. Placas
  de registros/componentes são exibidas a menos de 22 m para reduzir sobreposição.
- Recuperação de inimigo preso só aceita uma célula com caminho ao jogador,
  além de verificar colisão. Continua a recuperação existente, sem matar o
  inimigo, pagar recompensa ou modificar o orçamento da onda.
- Sobrevivência infinita abre diálogo modal, com retorno seguro em destaque.
  Cancelar ou Esc mantém extração disponível. Confirmar registra a escolha
  uma vez. Volta ao menu pausado; Continuar fornece o gesto para capturar mouse.
  Reinício remove qualquer diálogo pendente. Foco e Tab usam o modal nativo.

## Validação

- Regras e métricas: 22 testes unitários passaram; blocos incorporados conferidos
  por `node scripts/build-game.mjs --check`.
- `tests/polish.cjs` cobre visibilidade/duplicação dos modelos, morte durante
  troca, pausa, cinco reinícios, recarga/placa/facada/PaP, aviso atrasado e
  prioridade, último rastejante e recuperação de inimigo preso.
- Usa o botão real Reiniciar após morte, confirma uma arma visível e captura
  do mouse. Exercita cancelar por Esc, confirmar e retomar no diálogo real,
  com dimensões 1280×720 e 1920×1080. Executável isoladamente com `QA_P2_ONLY=1`.
- `tests/campaign.cjs` passou a exigir confirmação explícita do final infinito.
- A regressão completa inclui colisões, tiros/facadas/botes contra paredes,
  compra/PaP, cães, defesa, diário, ida/volta, morte, reinício e os dois finais.
  `QA_METRICS=1 node tests/smoke.cjs` passou em Desempenho e Alta.
- `node tests/boot.cjs` passou por file:// (auto/low/high), HTTP auto,
  exportação de métricas por file low/HTTP high e falha de CDN com recuperação.
- Capturas de reinício e diálogo em 720p/1080p revisadas. O modal é centralizado,
  tem botões separados, texto completo e foco visível. A correção final do aviso
  de dano e centralização foi validada pela suíte P2 isolada nos dois modos.

## Continuidade

Próxima entrega: P2.2, reformulação da tela inicial e linguagem dos menus,
conforme plano. P3–P8 e acabamento AAA completo permanecem pendentes.
Esta etapa não executa novo benchmark de balanceamento nem altera preços/dano;
as referências v26/P1 e v27 continuam disponíveis e não foram regravadas.

Repositório real permanece em
`Documents/Codex/2026-09-21/https-github-com-vikthorskynet-game-zombie/work/game-zombie`.
O diretório inicial `Documents/ChatGPT/zombies game` contém somente Git vazio.
