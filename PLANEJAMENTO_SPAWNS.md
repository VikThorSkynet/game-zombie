# Planejamento — zumbis saindo dos prédios

Plano consolidado a partir das 15 respostas do usuário. Implementado na v42 sobre a main atualizada do repositório game-zombie; veja docs/SPAWNS_V42.md. As análises iniciais usaram game_9.html, um baseline antigo, e foram adaptadas à cidade e aos sistemas da v41.

## 1. Regras confirmadas

| Tema | Decisão do usuário |
|---|---|
| Jogador | Permanece nas ruas; não entra nos prédios |
| Origem dos inimigos | Nascem dentro dos prédios e saem pelas portas barricadas |
| Candidatos | Todos os prédios podem participar |
| Seleção | Exatamente quatro prédios sorteados por round |
| Proximidade | Distância segura, favorecendo entradas próximas |
| Falta de entradas próximas | Completar com prédios mais distantes |
| Duração da seleção | Os mesmos quatro até o fim do round, mesmo se o jogador se afastar |
| Mapa | Manter a geração atual dos prédios |
| Identificação | Sons e luz discreta na entrada ativa |
| Madeiras | Quebradas individualmente pelos zumbis |
| Liberação da porta | Somente após quebrar todas as tábuas |
| Travessia | Um zumbi por vez, com pequeno intervalo |
| Persistência | Tábuas mantêm seu estado entre rounds |
| Reparo | Segurar E olhando para a porta; não concede pontos |
| Reparo sob ataque | Bloqueado; eliminar os atacantes primeiro |
| Tiros | Podem atingir inimigos pelos vãos; tábuas bloqueiam |
| Inimigos | Normal, corredor, bruto e atirador |
| Preparação | 10 segundos entre rounds |

Todas as perguntas principais foram respondidas. Detalhes e números nas próximas seções são propostas ajustáveis, não escolhas adicionais atribuídas ao usuário.

## 2. Ciclo de uma rodada

1. A contagem de preparação termina e a posição do jogador orienta o sorteio.
2. Quatro entradas são ativadas, com som e luz locais.
3. A população da onda é distribuída entre esses prédios, sem multiplicar o total por quatro.
4. Os zumbis surgem numa área interna curta, aproximam-se da porta e quebram tábuas.
5. O jogador pode atirar pelos vãos. Para reparar, precisa eliminar os atacantes e segurar E olhando para a porta.
6. Quando todas as tábuas estão quebradas, os zumbis saem individualmente e passam a perseguir o jogador na rua.
7. Os mesmos quatro prédios continuam ativos, independentemente dos deslocamentos do jogador.
8. Quando não existem inimigos vivos, em passagem ou aguardando liberação, começa a preparação de 10 segundos.
9. As madeiras ficam como estavam. Ao terminar a preparação, um novo sorteio considera a posição atual do jogador.

Um prédio destruído pode ser sorteado novamente e oferecer saída imediata. Reparar prepara o mapa para ondas futuras, sem gerar renda.

## 3. Entradas e geração do mapa

A main atual utiliza 34 prédios com disposição definida por baseMapLayout/expandCityLayout. Preservar essa disposição e registrar os prédios efetivamente construídos. A referência anterior a até 14 prédios era do baseline antigo.

Proposta: uma porta por prédio, com identificador, fachada, ponto interno, ponto externo, tábuas, fila e estado de atividade. Escolher uma face acessível à rua; se estiver bloqueada, testar outras faces do mesmo prédio. Não mover prédios.

Construir apenas uma área curta e escura atrás da porta. O restante do prédio permanece fechado. A fachada precisa de abertura visual real; o bloco original não pode encobrir a porta e seus inimigos.

Separar permissões:

- O volume do prédio continua bloqueando o jogador, mesmo sem tábuas.
- O zumbi vinculado à entrada pode sair pelo corredor autorizado.
- Paredes e tábuas bloqueiam tiros; vãos permitem acertar os inimigos.

O bruto precisa caber fisicamente na entrada. Considerar seu raio e sua escala ao definir o tamanho do vão.

## 4. Sorteio e distância

Medir distância horizontal até a saída da porta, não até o centro do prédio.

Algoritmo proposto:

1. Filtrar entradas acessíveis e fora do raio mínimo de segurança.
2. Separar candidatas dentro do alcance preferido.
3. Sortear até quatro, sem repetição na mesma onda, favorecendo as próximas.
4. Completar vagas com candidatas mais distantes, preservando o raio mínimo.
5. Manter as quatro selecionadas até o próximo round.

Proposta inicial: permitir que um prédio se repita em rounds consecutivos. Não adicionar regra oculta de alternância.

A geração atual não garante quatro entradas seguras em toda posição. Validar esse requisito em várias gerações e em posições nos limites da arena. Se uma configuração excepcional não o atender, registrar a falha durante os testes. O plano não autoriza reduzir silenciosamente o número de spawns, aproximar uma saída dentro da margem segura, criar inimigos na rua ou mover prédios. Os valores de distância serão calibrados para a geometria real.

## 5. Barricada e reparo

Cada tábua tem estado e animação próprios. Visual e bloqueio de tiro devem mudar no mesmo evento de quebra ou reposição.

Proposta inicial: um zumbi ataca a porta, com outros esperando em posições internas separadas. Sua morte libera o posto ao próximo. O reparo fica bloqueado enquanto houver atacante na barricada; inimigos esperando no fundo não bloqueiam por si só. Se outro assumir o ataque, interromper o reparo.

Verificar continuamente: E mantido, alvo sob a mira, jogador do lado externo, distância válida e ausência de atacante ou ocupante no vão. Soltar E ou perder uma condição interrompe a ação. Tábuas já concluídas permanecem reparadas; reiniciar o progresso parcial da tábua atual é a proposta inicial.

Uma travessia reserva o vão até terminar. Não inserir madeira sobre o corpo do zumbi. O jogador continua podendo combater ou se afastar.

Prompts propostos:

- “Segure E para reparar”
- “Elimine os zumbis que atacam a porta”
- “Aguarde a passagem ficar livre”
- “Barricada intacta”

Tiros testam paredes, tábuas e hitboxes por distância. A primeira superfície bloqueadora encerra o tiro. Tábuas não são removidas pelos tiros do jogador. Aplicar a regra a todas as armas, incluindo pellets e o laser atual da Ray Gun. Adaptar o bloqueador sólido atual da fachada para não impedir tiros pelos vãos.

Novos explosivos e dano de explosões nas tábuas ficam fora da primeira entrega.

## 6. Filas e inimigos

Estados propostos:

na fila → surgindo no interior → aproximando da barricada → quebrando tábua → aguardando vão → atravessando → perseguindo na rua

Se a porta já estiver destruída, pular a quebra e aguardar passagem livre. Se houver reparo antes de iniciar a travessia, voltar a atacar a madeira.

Distribuir o total da onda aproximadamente por igual entre as quatro entradas, sorteando a distribuição do restante. Preservar a progressão atual: normais no início, corredores a partir da onda 2, brutos e atiradores a partir da onda 3.

Propostas de compatibilidade:

- Os quatro tipos usam o mesmo protocolo inicial de quebra e saída.
- O atirador começa a disparar contra o jogador após chegar à rua.
- Um inimigo que perca as pernas dentro do prédio mantém rota e capacidade de sair, sem travar a onda.
- Matar dentro do prédio concede os pontos normais de morte. Se houver drop, colocá-lo em um ponto externo acessível junto à entrada, validando espaço.
- Morte, remoção por power-up ou mudança de estado sempre libera postos de ataque e passagem.
- Se o jogador ocupar a saída, o inimigo da frente pode ameaçá-lo por um ataque com alcance e linha de contato válidos; os demais aguardam. Não atravessar jogador nem atacar através de paredes.

Após sair, os zumbis precisam contornar prédios, carros e máquinas. A perseguição direta atual não garante isso. Busca de rota externa e separação local são dependências desta funcionalidade.

## 7. Valores iniciais propostos

Números ajustáveis para o protótipo; não foram escolhidos pelo usuário.

| Parâmetro | Proposta inicial |
|---|---|
| Portas por prédio | 1 |
| Tábuas por porta | 5 |
| Distância mínima de seleção | 12 unidades de mapa |
| Alcance preferido | Até 45 unidades de mapa |
| Tempo de quebra | 1,2 segundo por tábua |
| Tempo de reparo | 0,8 segundo por tábua |
| Alcance de reparo | 3 unidades de mapa |
| Intervalo mínimo de saída | 0,8 segundo, sujeito a espaço livre |
| Atacantes por porta | 1 |
| Inimigos internos visíveis | Até 2 por entrada; demais aguardam liberação |
| Evolução da quebra | Tempos iguais na primeira versão |

As unidades atuais não foram calibradas como metros. Validar escala dos prédios, tamanho do bruto, distância de câmera e deslocamento antes de fixar números. Uma barricada completa levaria inicialmente cerca de 6 segundos para quebrar e 4 segundos para reparar, sem interrupções.

## 8. Sinais, pausa e persistência

A luz indica atividade de spawn, não integridade da madeira. Proposta: luz quente fraca junto à porta. Usar áudio espacial para movimento interno, gemidos e golpes na madeira, com variações e limite de vozes simultâneas.

Ao terminar o round, desativar o sinal e contar 10 segundos. Permitir reparar portas danificadas, inclusive inativas, durante preparação ou combate, respeitando as condições de segurança do reparo.

Pausa congela filas, quebra, reparo, travessia e intervalo entre rounds. Reinício limpa ocupantes e filas, restaura todas as tábuas e faz nova seleção. A persistência vale entre rounds da mesma partida; não há salvamento permanente nesta entrega.

## 9. Ordem de implementação

| Etapa | Entrega | Critério para avançar |
|---|---|---|
| 1 | Entradas nos prédios existentes | Fachada aberta, jogador bloqueado, tiros pelos vãos, bruto cabe |
| 2 | Uma barricada funcional | Quebra individual, reparo com E, bloqueio por atacante |
| 3 | Fila e saída | Um por vez; morte do ocupante libera o próximo |
| 4 | Navegação externa | Inimigos contornam obstáculos e não ficam presos |
| 5 | Sorteio de quatro entradas | Preferência por proximidade, fallback distante, seleção fixa |
| 6 | Ciclo das ondas | População correta, persistência e 10 segundos de preparação |
| 7 | Apresentação e validação | Luz, som, prompts, pausa, reinício e desempenho |

## 10. Critérios de conclusão

- Quatro prédios distintos, com distância segura e fallback para opções mais distantes.
- A seleção não muda quando o jogador se afasta durante o round.
- Jogador permanece fora dos prédios, em qualquer estado da barricada.
- Tábuas quebram/reparam individualmente e persistem entre rounds.
- Nenhum zumbi atravessa enquanto houver madeira intacta.
- Tiros acertam pelos vãos e param nas tábuas, com todas as armas.
- Atacante vivo impede reparo; sua eliminação permite reparar até outro assumir.
- Reparar não concede pontos e não insere tábuas sobre um ocupante.
- Saídas individuais não empilham inimigos nem permitem bloquear a fila indefinidamente ficando parado diante da porta.
- Bruto, atirador e rastejante concluem a saída sem travar a onda.
- Mortes dentro da entrada, inclusive por power-up, liberam postos e mantêm contadores corretos.
- Drops internos permanecem coletáveis do lado externo.
- A próxima onda só avança quando acabarem população pendente e inimigos vivos/em transição.
- Pausa congela todos os novos temporizadores; reinício restaura o estado inicial.
- Várias gerações são testadas para detectar fachadas inacessíveis e candidatas insuficientes.
- Quatro entradas simultâneas cabem no orçamento de desempenho, limitando objetos, vozes e agentes internos.

## 11. Limites desta entrega

Implementar o sistema nos prédios e tipos atuais. Interiores exploráveis, novos tipos, novas armas, mudanças amplas de economia e escadas físicas pertencem a fases futuras.

O plano está consolidado. Os parâmetros propostos são o ponto de partida técnico; ritmo, distância e sensação precisam de avaliação em jogo antes de serem considerados balanceados.
