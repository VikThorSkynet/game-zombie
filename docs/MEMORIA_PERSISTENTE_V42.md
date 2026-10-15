# Memória persistente — v42

Pedido: implementar prédios sorteados por round como origem dos zumbis, com portas barricadas, seguindo o repositório `https://github.com/VikThorSkynet/game-zombie.git`.

## Base e preservação

O checkout inicial estava no baseline isolado `38cf99d`, diferente da main atual. O rascunho feito nessa base foi preservado no stash com a mensagem `building spawns draft preserved before aligning with remote v41`, sem commit de implementação ou envio.

Após `git fetch origin --prune`, a base remota confirmada foi `origin/main`, `d94516e`, merge da v41. A branch de trabalho é `codex/building-spawns-v42`. O HTML da v41 permanece preservado.

Versão atual: `game_version42_15-10-2026_18-44-03.html`.
Data do arquivo: 15/10/2026, 18:44:03, America/Sao_Paulo.

## Decisões do usuário

Jogador nas ruas; todos os prédios candidatos; quatro ativos por round, próximos com margem segura e fallback distante; seleção fixa durante a onda; sinais por som e luz discreta. Zumbis quebram todas as tábuas antes de sair individualmente. Madeiras persistem entre ondas. Reparo segurando E olhando para a porta, sem pontos e bloqueado enquanto há atacantes. Tiros pelos vãos; tábuas bloqueiam. Dez segundos entre ondas. Manter disposição atual dos prédios e os tipos de inimigo.

O plano completo está em `PLANEJAMENTO_SPAWNS.md`. A análise inicial e as referências foram preservadas, mas descrevem também o baseline antigo; não substituem o README atual.

## Implementação

Regras puras adicionadas a `game-systems.mjs`; apresentação e máquina de estados em `building-entrances.mjs`. O build incorpora a integração, removendo os imports de desenvolvimento, para manter abertura por arquivo e HTTP. Não editar blocos gerados.

Todos os 34 prédios receberam portas acessíveis nos testes do mapa atual. A navegação e o WaveDirector existentes são reutilizados. Modelos importados, sons MP3 e os sistemas atuais continuam integrados. Cães e Detonador também usam as entradas nas ondas da cidade; encontros específicos da campanha/geradores e spawns da instalação mantêm suas regras próprias.

Detalhes e parâmetros em [SPAWNS_V42.md](SPAWNS_V42.md).

## Validação concluída

35 testes unitários de regras, métricas, armas, ritmo, novas barricadas e sintaxe aprovados. Boot sem hooks aprovado por file:// (auto/baixa/alta), HTTP, exportação de métricas, MP3 local e falha de CDN recuperável.

A integração específica de barricadas passou em baixa e alta: 34 entradas acessíveis; sorteios seguros em oito regiões do mapa; seleção fixa; pausa; bloqueio de tiros pelas tábuas e passagem pelos vãos; reparo bloqueado; drops acessíveis; limpeza; persistência; reset; saída individual de normais, corredores, brutos, atiradores, detonadores e cães. O teste também segurou E pelo navegador, verificou ausência de pontos e concluiu uma onda real com sete inimigos, dez segundos de intervalo e novo sorteio. Capturas em `docs/captures/v42` são cenários automatizados.

Os limites de espera de assets foram alinhados a 90 segundos em `tests/boot.cjs` e `tests/smoke.cjs`; o boot também aceita `QA_GAME_FILE` para comparação de versões. Fixtures antigas de ondas agora avançam as entradas ou transferem explicitamente o inimigo para a rua quando o foco é o diretor de ondas. O teste de caçadas avança o cooldown das portas. A captura do mapa restaura o menu antes dos demais testes.

Antes do ajuste de layout, a suíte completa `tests/smoke.cjs` terminou com código 0 nas duas qualidades. Cobriu mapa e caminhos, menu/opções, mira/LOD, combate, bônus, limite simultâneo e ciclo de ondas, progressão/economia, campanha completa, diário, geradores, caçadas, áreas e recuperação de falhas, interação, armas, ritmo, gráficos, efeitos e armazenamento corrompido. Não houve erro de JavaScript. `node scripts/build-game.mjs --check` e `git diff --check` passaram. O HTML da v41 não foi alterado.

Não houve partida humana nem benchmark comparativo de FPS nesta entrega. Proximidade, quebra e reparo precisam de ajuste por playtest. Madeira tem textura procedural e animação; impactos continuam sem MP3 dedicado.

## Ajuste de layout após a prévia

O usuário mostrou sobreposição entre contagem e desafio e pediu organização antes do commit. `origin/main` foi novamente consultada e permaneceu em `d94516e`, a mesma base da branch.

Os avisos passaram para `#hud-announcements`, uma coluna compartilhada. O painel de preparação contém contagem, próxima onda e tecla N, seguido do desafio com divisor, título e meta. O gerador e mensagens temporárias ocupam blocos separados no mesmo fluxo. O estado “Em espera” explica o bloqueio de avanço por interação. Cores, tamanhos e espaçamentos distinguem as informações; no combate o painel é ocultado.

`tests/announcements.cjs` passou em baixa e alta, com sete viewports (1920×1080, 1280×720, 1024×768, 980×720, 800×600, 640×360 e 427×360). Verificou ausência de interseção e texto cortado, convivência com gerador/alerta, espera por interação, transição para combate e menu. Os 35 testes unitários foram repetidos e aprovados. As novas capturas usam prefixos `hud-rounds-*` e `hud-held-*`. Após o ajuste, `tests/boot.cjs` e `tests/building-spawns.cjs` também terminaram com código 0. Foram novamente verificados file:// e HTTP, qualidades, métricas, MP3, falha recuperável de CDN, reparo real por E e ciclo de ondas. As seis capturas de barricadas/reparo foram regeneradas com o novo HUD. Capturas intermediárias da regressão anterior foram removidas desta nova pasta; a entrega mantém doze capturas relevantes, incluindo as seis do novo layout.

## Commit e publicação

O usuário autorizou explicitamente o commit depois do ajuste de layout. A entrega fica na branch `codex/building-spawns-v42`, com prévia e documentação atualizadas. O pedido atual autoriza commit local; nenhum push ao GitHub foi solicitado ou executado.


## Revisão com referências de Zombies — HUD sem caixas

Após o commit `35ad323`, o usuário forneceu seis imagens e pediu HUD baseado nelas, retirando a caixa central por excesso de informação. A branch já contém a main remota atualizada (`d94516e`); novo fetch confirmou ausência de mudanças remotas.

O HUD anterior com painel central foi substituído: rodada vermelha/perks/barras no canto inferior esquerdo; pontos e munição à direita; bônus temporários como emblemas brancos na parte inferior. Rodadas têm apresentação curta em vermelho, o intervalo usa texto pequeno e o desafio fica no diário. O gerador e os avisos são sem caixa; FPS fica restrito ao modo de medições.

Arte vetorial original em `hud-visuals.mjs`, incorporada pelo build no HTML atual para preservar file://. Detalhes e testes em [HUD_CLASSICO_V42.md](HUD_CLASSICO_V42.md). As capturas novas ficam em `docs/captures/v42/hud-classic`; as anteriores documentam etapas anteriores.

O teste visual foi ampliado para quatro perks e três bônus simultâneos, sete tamanhos, expiração real, pausa, diário, reinício e marcas/números nas rodadas 1/5/10/11/100. Passou nas qualidades baixa e alta; os 35 testes unitários também passaram. Boot por arquivo/HTTP (incluindo métricas, MP3 e falha recuperável de CDN) e regressão completa `tests/smoke.cjs` terminaram com código 0 nas duas qualidades após a revisão do HUD. Build e diff passaram. A regressão específica `tests/v41.cjs` de diário, desafios, geradores, efeitos, reinício e menus também passou em baixa/alta. Depois da solicitação de vida em cima à direita, somente a posição/estilo do bloco vital e a distribuição responsiva dos avisos foram alterados; a verificação visual foi repetida e aprovada em baixa/alta para essa posição final, incluindo avisos de gerador/alerta em 427×360 sem sobrepor as barras.


Correção durante a revisão: o usuário pediu explicitamente vida em cima à direita, com a imagem das três barras. O bloco de vida/fôlego/colete foi movido ao canto superior direito; rodada e perks continuam embaixo à esquerda. O teste de HUD passou a verificar a posição das barras em todos os sete tamanhos.

A revisão do HUD continua a autorização anterior de commit local após os ajustes. Nenhum push foi realizado. O HTML da v41 e a implementação dos spawns foram preservados; as mudanças novas são de apresentação e seus testes.
