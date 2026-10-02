# Memória persistente — v41

Pedido de 02/10/2026: branch Versão 41; destaque elétrico para a carga do
gerador no topo central; otimização de tiros e nascimento de zumbis; diário
como livro aberto, objetivos claros e desafios automáticos entre ondas;
remoção da sinalização flutuante; geradores maiores com nome na carcaça e
arquivos representados por papéis no chão.

Base confirmada por `git fetch origin --prune`: `origin/main`, `7cf866a`, v40.
Branch criada e enviada ao GitHub por autorização expressa do pedido:
`codex/versao-41`. A branch remota foi criada na base antes da implementação. Após a prévia
e os refinamentos, o usuário autorizou o commit/envio da v41 em 02/10/2026.
HTML atual: `game_version41_02-10-2026_16-21-36.html`. V40 preservada.
[Contexto anterior](MEMORIA_PERSISTENTE_01-10-2026_20-01-13.md).

## Interface e cenário

- Barra de carga central no topo, percentual e identificação do gerador,
  gradiente ciano, brilho e arco elétrico animado. Mostra quando retornar ao
  círculo. A opção de movimento reduzido desliga a animação.
- Diário em duas páginas de papel envelhecido, lombada e capa, com próximo
  objetivo, seis etapas, descobertas e recordes locais. Em telas estreitas,
  vira uma coluna rolável. J/Esc ou FECHAR DIÁRIO retorna ao menu pausado;
  CONTINUAR retoma com o gesto necessário para capturar o mouse.
- Desafio da próxima onda aparece no intervalo e começa automaticamente no
  evento `waveStarted`. Não há aceite/abandono na interface nem bloqueio de
  gerador/campanha causado pelo desafio. Apenas eliminações diretas válidas
  na onda correspondente contam; recompensa única de 300 pontos preservada.
- Textos flutuantes não geram mais sprites. Marcadores vazios mantêm referências
  usadas pelo ciclo de vida. Barricadas têm faixas pintadas; pequenos postes
  recebem setas físicas. Nomes de terminais e caixas de munição ficam nas
  próprias superfícies.
- Geradores com escala uniforme 1,2 e placa GERADOR 01/02/03 na carcaça.
  O círculo de defesa mantém o raio original de 10 m. Colisores acompanham o
  corpo maior. Cada arquivo usa cinco folhas espalhadas e desaparece ao coletar.
- Enquadramento aprovado da AK47 e HUD compacto da v40 preservados.

## Otimização

O código anterior criava/removia luzes pontuais, geometrias e materiais a cada
tiro; isso altera a composição de iluminação e pode provocar compilação de
programas gráficos. Também construía um corpo procedural invisível para cada
zumbi importado e recalculava vértices animados repetidos em cada triângulo.
São custos identificados no código, sem diagnóstico de uma partida humana.

- Pool por cena de 12/24 rastros, clarões e impactos em baixa/alta qualidade.
  Duas luzes fixas de combate mudam intensidade; não são adicionadas por tiro.
- Preparação dos shaders, efeitos e limites conservadores dos rigs durante
  o carregamento inicial e as viagens entre cidade e instalação.
- Zumbis usam o modelo importado e âncoras de animação sem corpo invisível.
  Materiais são compartilhados por variante; esqueletos/animações continuam
  independentes. Atirador e Detonador preservam cores distintas.
- Hitboxes mantêm triângulos reais. Cada vértice animado é calculado uma vez
  por consulta, com cache ativo apenas dentro do raycast nativo; classificação
  por região e mudanças de pose fora da consulta continuam atualizadas.
- Matrizes dos inimigos são atualizadas uma vez por consulta; o disparo não
  atualiza toda a cidade para sincronizar a câmera.
- Limites iniciais de modelos estáticos convertidos para rigs são preparados
  no carregamento. Descartes preservam geometrias/materiais compartilhados;
  reinícios e trocas de área não acumulam recursos ativos.

## Verificação

- 29 testes unitários de regras, métricas, armas e ritmo aprovados.
- `tests/enemy-hitboxes.cjs`: baixa/alta, dez modelos, três poses, 221 raios
  por pose; zero divergências frente à referência, seis verificações de dano
  por modelo e qualidade; silhueta visível e regiões anatômicas preservadas.
- `tests/humanoid-assets.cjs`: baixa/alta; mapeamento, cores, proporções,
  animações independentes, sangue e quatro reinícios com recursos estáveis.
- `tests/smoke.cjs`: suíte completa aprovada em baixa/alta, incluindo armas,
  geradores, diário, desafios, campanha, áreas, reinícios e recursos gráficos.
  O teste agora espera o boot e o fechamento efetivo do diálogo de opções
  antes de enviar controles, evitando corridas na fixture de automação.
- `tests/boot.cjs`: documento sem hooks por file:// (auto/baixa/alta) e HTTP,
  métricas e exportação, MP3 local, falha de CDN e botão de tentar novamente.
- Regressão de gráficos/áreas (`QA_P5_ONLY=1`): baixa/alta após incluir a
  preparação por área; dez viagens mantêm recursos estáveis; compras, estados,
  caminhos, spawns, falhas, cancelamento e controles aprovados.
- `tests/v41.cjs`: carga central, escala e placa do gerador, folhas espalhadas,
  anúncio/ativação dos desafios, diário responsivo e efeitos limitados.
  Capturas finais inspecionadas; build --check e diff --check aprovados.

As medições em `docs/v41-performance-before.json` e
`docs/v41-performance-after.json` usam oito spawns e trinta consultas de tiro
em Chrome headless, qualidade baixa. Não representam FPS ou uma partida humana.
Medições finais: criação mediana 2,8 → 2,1 ms, p95 11,5 → 7,3 ms; consulta
de tiro mediana 4,5 → 1,8 ms, p95 9,6 → 5,3 ms. Ver
[relatório e limites da medição](V41_OTIMIZACAO.md).
Capturas específicas ficam em `docs/captures/v41`.

## Pendências e execução

Prévia local: `http://127.0.0.1:8765/game_version41_02-10-2026_16-21-36.html`,
servida pelo Python ligado a 127.0.0.1 neste computador. O HTML também suporta
abertura por dois cliques; o motor Three.js ainda requer internet.

Prévia apresentada conforme AGENTS.md. O usuário aprovou o resultado final
e autorizou o commit/envio com “pode commitar” em 02/10/2026.
Capturas antigas não rastreadas em `docs/captures/ak47-reference` foram
preservadas e não pertencem ao envio desta versão. Capturas v37 geradas pela
validação foram restauradas para não alterar a documentação histórica.

## Refinamento solicitado após a prévia

Fetch confirmou `origin/codex/versao-41` igual ao HEAD `7cf866a`; trabalho
local da v41 preservado. Usuário pediu HUD de recursos no canto superior
esquerdo e botão de retorno ao menu inicial no Game Over.

- HUD movido para top/left 28 px no desktop e 16 px em telas compactas,
  mantendo barras e ícones sem bordas/rótulos permanentes.
- Game Over mantém REINICIAR e acrescenta VOLTAR AO MENU INICIAL com estilo
  secundário. Retorno limpa a partida, restaura saúde/recursos/onda e câmera,
  mostra a tela inicial com JOGAR e mantém o jogo pausado até nova interação.
- Tela inicial usa `showMainMenu()` tanto no boot quanto no retorno.
- `tests/v41.cjs` valida morte → menu inicial → Jogar, estado limpo e HUD
  superior esquerdo em desktop/640x360; capturas game-over e hud-top-left
  em baixa/alta. Prévia do refinamento apresentada e aprovada pelo usuário.

Validação do refinamento concluída: v41.cjs aprovado em baixa/alta, incluindo
retorno e início de nova partida; boot sem hooks aprovado por arquivo e HTTP,
com métricas e falha de CDN. Capturas finais inspecionadas; build/diff --check
aprovados. Commit/envio autorizado após a apresentação dessas capturas.
O envio corresponde à branch codex/versao-41; a main permanece na v40.
