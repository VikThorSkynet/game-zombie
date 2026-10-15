# Estudo de evolução do FPS de zumbis

Data: 15 de outubro de 2026. Projeto analisado: `game_9.html`.

Referência solicitada: [Kino der Toten, single player, armas clássicas](https://vel.gg/bo1z/kino?mode=single&guns=classic).

## 1. Escopo e leitura das evidências

Este documento propõe o que implementar e como encaixar cada sistema na base existente. Não é uma alteração da jogabilidade.

- **Código confirmado:** funcionalidades e limitações encontradas diretamente no HTML local.
- **Site observado:** informações efetivamente vistas durante a navegação, registradas na seção 2.
- **Proposta:** design sugerido para o nosso jogo. Valores são pontos de partida para testes, e não medições ou regras extraídas de Black Ops.

A prioridade recomendada é melhorar a perseguição, o controle e o desenho do mapa antes de multiplicar armas ou inimigos. O projeto já possui várias mecânicas de progressão; o desafio é fazê-las funcionar juntas em uma partida com decisões e tensão.

## 2. Registro da referência

O endereço abriu com o título “Kino der Toten · Single player”, identificação de single player, canvas de jogo e carregamento de pacotes. Foram observados `SOUNDS.PACK` e `ZOMBIE_THEATER.FF`, além de uma tela de carregamento em quadrinhos e indicação de progresso. O menu inicial expôs “OPTIONS”.

Após carregar, o menu mostrou sensibilidade do mouse, volume, fullscreen e opções de controle. A ajuda de controle lista movimento, câmera, mira/disparo secundário, tiro, pulo, agachamento, uso/recarga, troca de arma, granadas, sprint, corpo a corpo, equipamentos, pausa e placar. O texto informa movimento digital e ausência de assistência de mira. Trata-se de uma ajuda compartilhada com referências a outros modos; não comprova que cada ação esteja disponível com toda arma ou nessa partida específica.

**Primeira inspeção:** ao iniciar, o navegador integrado informou que o documento não era válido para captura do mouse (`pointer lock`). Uma tentativa no Chrome perdeu a conexão de inspeção durante o carregamento. Naquele momento não foi possível observar uma partida jogável.

**Atualização:** depois, a pedido do usuário, foi possível acompanhar a partida que ele estava jogando no Chrome. As observações diretas, capturas e informações técnicas dessa segunda inspeção estão na seção 14. A observação foi feita por capturas espaçadas, sem assumir o controle; não houve medição de velocidade, latência, duração dos clips ou cadência.

A presença desses nomes descreve o carregamento visível; não demonstra formato interno, motor, licença de redistribuição ou possibilidade de importar esses arquivos no nosso projeto. Não foi feita extração dos pacotes do site.

As propostas abaixo são especificações para a nossa base. Uma funcionalidade sugerida não deve ser entendida automaticamente como funcionalidade verificada nessa versão do site.

## 3. O que o jogo atual já possui

| Área | Situação confirmada no código | Evolução recomendada |
|---|---|---|
| Motor | Three.js 0.160.0, WebGL, PointerLockControls e pós-processamento | Manter a base e separar responsabilidades gradualmente |
| Jogador | WASD, mouse, sprint com carga, colisão horizontal | Ajustar sprint; adicionar ADS, agachamento e controle vertical |
| Armas | Pistola, shotgun, SMG, sniper, fuzil e Ray Gun | Diferenciar funções, balancear e melhorar braços/animações |
| Combate | Raycast, headshot, dano nas pernas e penetração em inimigos | Hitboxes ligadas ao rig e respostas visuais ao impacto |
| Zumbis | Normal, corredor, bruto e atirador | Estados, rotas, separação e ataques com preparação |
| Ondas | Quantidade, vida, velocidade e dano crescem com a onda | Limite de ativos, composição e diretor de spawns |
| Economia | Pontos por morte, compras de perks e caixa de 950 pontos | Pontos por acerto/reparo, compras de parede e portas |
| Melhorias | Pack-a-Punch de 5.000; dano ×2,5 e carregador ×1,5 | Melhorias distintas por arma e acesso condicionado à exploração |
| Perks | Vida, recarga, cadência e movimento | Limites, leitura visual e números coerentes com a economia |
| Power-ups | Munição máxima, nuke, insta-kill e pontos em dobro | Melhorar apresentação, avisos e regras de distribuição |
| Mundo | Arena urbana, prédios, carros e colisores estáticos em XZ | Setores conectados, interiores e caminhos alternativos |
| Apresentação | Névoa, bloom, luzes, partículas, cápsulas e hitmarkers | Direção de arte consistente e som espacial |

## 4. Problemas concretos que devem vir primeiro

1. **Economia de teste:** a primeira partida começa com `score = 10000000`, enquanto o reinício usa zero. Centralizar o valor inicial e separar modo normal de modo de depuração. Com 10–35 pontos por morte, também é preciso revisar custos e fontes de renda.
2. **Sprint sem cooldown efetivo:** as duas constantes de cooldown são zero, embora o tutorial prometa cooldown. A regra permite sprint em qualquer direção e combina gasto/recuperação com um limiar que pode provocar alternância com Shift mantido.
3. **Perseguição direta:** `updateZombies()` aponta para o jogador e tenta deslocar em linha reta. Colidir com uma parede não produz uma rota ao redor dela.
4. **Sobreposição da horda:** o movimento consulta colisores estáticos, sem resolver espaço entre zumbis ou bloquear fisicamente a passagem do jogador pela horda. Isso prejudica cerco e formação de grupos.
5. **Ataque por distância:** o golpe corpo a corpo é aplicado quando a distância horizontal entra no alcance e o cooldown acaba. Faltam preparação, janela de contato e verificação de parede entre atacante e alvo.
6. **Velocidade sem teto:** a velocidade dos zumbis cresce linearmente com a onda. A longo prazo pode superar as possibilidades de fuga, sem uma decisão clara de design.
7. **Sem verticalidade física:** a altura da câmera é fixada em `playerEyeHeight` a cada atualização. Pulo, agachamento e escadas precisam de controlador e colisão adequados.
8. **Pausa parcial:** alguns sistemas verificam `controls.isLocked`, outros continuam atualizando timers e efeitos. Consolidar `menu / playing / paused / gameOver` para a partida não avançar em partes enquanto está pausada.
9. **Cadência extrema:** a SMG tem intervalo de 20 ms; o perk aplica fator 0,4 ao intervalo. Essa configuração pode tornar o disparo dependente do ritmo de quadros e consumir muitos efeitos por segundo. Ajustar antes de julgar a dificuldade.

Os itens acima foram identificados por inspeção estática; seu impacto visual deve ser medido em uma sessão de testes do projeto.

## 5. Movimentação do jogador

| Sistema | Proposta de comportamento | Custo relativo |
|---|---|---|
| Caminhada | Aceleração curta, parada previsível e velocidade diagonal normalizada | Baixo |
| Sprint | Apenas para frente ou diagonal frontal; carga e recuperação legíveis | Baixo |
| Retomar disparo | Pequeno intervalo entre sair do sprint e atirar | Baixo |
| ADS | Botão direito aproxima arma, reduz FOV, sensibilidade e dispersão | Médio |
| Agachamento | Interpolar câmera e cápsula; impedir levantar sob teto baixo | Médio |
| Pulo | Gravidade, aterrissagem e limite de repetição; preservar controle previsível | Médio |
| Escadas | Colisão tridimensional ou rampas invisíveis coerentes com o mapa | Alto |
| Transpor obstáculos | Pontos autorizados, animação e verificação de destino livre | Alto |
| Deitar/mergulhar | Opcional, depois de resolver corpo, câmera e colisão vertical | Alto |
| Acessibilidade | FOV, sensibilidade, remapeamento, alternar/segurar ADS e redução de balanço | Médio |

**Parâmetros iniciais sugeridos:** depois de definir 1 unidade como 1 metro, testar caminhada entre 4 e 5 m/s, sprint entre 6 e 7 m/s, carga de 3–4 segundos e recuperação completa em 4–6 segundos. São propostas, não valores do site. O `baseMoveSpeed` atual alimenta aceleração com amortecimento; não pode ser tratado diretamente como metros por segundo.

Adicionar balanço de arma, deslocamento ao mirar e recuperação de recuo, com intensidade ajustável. Recuo visual e dispersão de tiro devem ser parâmetros distintos. Escorregar e correr na parede seriam escolhas de outro estilo; ficam fora da primeira versão proposta.

## 6. Movimentação e inteligência dos zumbis

### 6.1 Estados e transições

Fluxo principal proposto:

`surgir → ir até a entrada → romper barricada → atravessar entrada → perseguir → preparar ataque → contato → recuperar → perseguir`

Reações paralelas: `receber impacto`, `cambalear`, `perder pernas`, `rastejar` e `morrer`. Um estado de travamento solicita nova rota. Estados temporários precisam devolver o controle à perseguição sem deixar o inimigo parado indefinidamente.

### 6.2 Navegação em duas camadas

- **Rota global:** para a arena plana atual, começar com grade navegável e A*. Inflar obstáculos conforme o raio do inimigo. Em mapa com corredores e muitos agentes indo ao mesmo alvo, considerar campo de fluxo compartilhado. Com escadas e pisos sobrepostos, avaliar navmesh.
- **Movimento local:** seguir pontos da rota, desacelerar em curvas e separar vizinhos próximos usando partição espacial. Ter rota não resolve sozinho o empilhamento.
- **Atualização distribuída:** recalcular caminhos em intervalos diferentes por agente ou ao mudar porta/alvo; evitar A* para todos em todo quadro.
- **Recuperação:** detectar pouco deslocamento por cerca de 1–2 segundos e tentar nova rota. Se não houver rota, selecionar outra entrada válida; reposicionar só fora da visão e em situação controlada.
- **Alcance real:** somente atacar se alcance, direção e linha de contato estiverem válidos. Revalidar no instante do golpe.

Para o primeiro protótipo, testar planejamento de rotas em 5–10 Hz distribuídos e movimento/colisão em passo fixo, por exemplo 60 Hz. Esses números são hipóteses de orçamento a verificar.

### 6.3 Horda e dificuldade

Variar fase da passada, postura, velocidade dentro de uma faixa e animação de ataque. Evitar que todos virem instantaneamente ou levantem os braços no mesmo quadro. Vincular cadência da passada à velocidade real para reduzir pés deslizando.

A horda deve pressionar várias entradas. O cerco pode surgir das rotas do mapa e dos spawns válidos, sem todos os inimigos preverem perfeitamente o movimento do jogador. Limitar perseguidores ativos e manter os demais na fila de spawn.

Começar com caminhante, corredor e rastejante. O bruto pode entrar como pressão ocasional. O atirador já existe no projeto, mas deve ter preparação visível, projétil legível e tempo para esquiva. Cães, inimigos de gás e chefes são expansões posteriores, cada um com silhueta, som e função próprios.

### 6.4 Animações mínimas

| Grupo | Clips sugeridos |
|---|---|
| Base | Idle, caminhada lenta, caminhada irregular e corrida |
| Entrada | Sair do chão, bater em madeira e atravessar janela |
| Ataque | Dois golpes alternados e recuperação |
| Dano | Reação frontal/lateral e transição para rastejar |
| Rastejante | Locomoção e ataque baixo |
| Morte | Duas quedas; desaparecimento após alguns segundos |

Usar transições suaves entre clips. Para a primeira entrega, priorizar caminhada, corrida, dois ataques, reação e morte. Ragdoll completo pode esperar; quedas animadas custam menos integração e facilitam o controle dos corpos.

## 7. Mapa e ciclo da partida

Proposta para adaptar a arena urbana existente:

`rua inicial → loja/oficina → prédio de energia → pátio de circulação → laboratório de melhoria → atalho para a rua`

Construir primeiro esses setores com blocos simples. A rua oferece espaço para formar a horda; a loja aperta as rotas; a energia dá um objetivo; o laboratório cria uma viagem de risco. Abrir um atalho deve alterar tanto a fuga quanto as entradas de inimigos.

| Mecânica | Regra sugerida | Dependências |
|---|---|---|
| Portas compráveis | Gastar pontos para abrir setor; mostrar preço e estado | Economia, interação e atualização de rotas |
| Barricadas | Zumbis removem tábuas; jogador segura interação para reparar | Entradas, estados e animação |
| Energia | Alavanca ativa máquinas e parte da iluminação | Estados do mapa e feedback visual |
| Armas de parede | Compra previsível de arma e reposição de munição | Inventário e economia |
| Caixa aleatória | Manter a atual; adicionar pesos e apresentação | Tabela de armas e animação |
| Melhoria de arma | Manter a atual; diferenciar resultado por arma | Inventário, arma e estado da máquina |
| Armadilhas | Custo, área ativa, duração e recarga visíveis | Energia e regras de dano |
| Deslocamento especial | Teleporte/elevador como acesso temporário opcional | Segurança de destino e fluxo do mapa |
| Segredos | Objetivos curtos que recompensam explorar | Setores estáveis e persistência de estado |

Pontos por acerto, morte, headshot e reparo devem incentivar escolhas sem permitir geração infinita em um inimigo ou barricada. Simular as primeiras dez ondas para ajustar quando o jogador consegue sua primeira porta, arma e melhoria.

Ondas precisam de intervalo legível, limite de ativos, entradas habilitadas por setor e proteção contra spawn na frente do jogador. Definir teto de velocidade e curva de vida separadamente. Uma onda termina quando a fila foi consumida e não existem inimigos vivos nem entradas em transição.

## 8. Armas, dano e sobrevivência

- Adicionar braços em primeira pessoa e animações de equipar, tiro, recarga parcial/vazia e sprint. O modelo visto nas mãos pode ser diferente do modelo exposto na caixa.
- Manter slots limitados, com substituição explícita na compra. Mostrar claramente arma, carregador e reserva.
- Fazer pistola, SMG, fuzil, shotgun e sniper terem vantagens diferentes. Revisar especialmente dano por pellet da shotgun e cadência da SMG.
- Trocar hitboxes das primitivas por volumes simples associados aos ossos. A malha visual detalhada não precisa ser a colisão de tiro.
- Evoluir o dano de pernas existente para rastejante com pose, raio, hitboxes e animação próprios.
- Adicionar golpe corpo a corpo com alcance curto e janela de contato. Granadas entram depois com explosão, obstrução e dano próprio configuráveis.
- Definir recuperação de vida: uma opção é regeneração após tempo sem receber dano; outra é manter kits. Não misturar números sem ajustar a pressão das ondas.
- Em solo, uma autorreanimação limitada pode prolongar partidas; exige estado de queda e regras para os inimigos. Cooperativo demanda projeto de rede e fica para uma fase própria.

## 9. Assets necessários

| Pacote | Conteúdo mínimo | Diretriz |
|---|---|---|
| Zumbi | Um humanoide com rig e 3 variações visuais | Compartilhar rig e animações |
| Animações | Locomoção, dois ataques, impacto e morte | Padronizar escala, ossos e orientação |
| Jogador | Braços, mãos e poses por tipo de arma | Garantir alinhamento de ADS |
| Armas | Seis modelos em primeira pessoa e versões simplificadas no mundo | Começar com três totalmente finalizadas |
| Arquitetura | Parede, piso, teto, porta, janela e corredor modular | Dimensões consistentes e colisão separada |
| Objetos | Tábuas, caixas, móveis, cabos, gerador e máquinas | Reutilizar módulos e materiais |
| Texturas | Concreto, metal, madeira, reboco e tecido | PBR, textura repetível e desgaste coerente |
| Efeitos | Flash, impacto, sangue opcional, poeira e energia | Pool de partículas e duração limitada |
| Som | Passos, respiração, gemidos, ataques, armas, recargas e máquinas | Variações e áudio espacial |
| Interface | Ícones de perks, power-ups, interação e resultado | Leitura rápida e estilo próprio |

### Fontes verificadas e adequação

- [Kenney — Graveyard Kit](https://kenney.nl/assets/graveyard-kit): kit 3D com animações e licença CC0. Bom para prototipagem ou direção estilizada; avaliar os arquivos antes de contar com um inimigo/clip específico.
- [Poly Haven — licença](https://polyhaven.com/license): texturas, modelos e HDRIs sob CC0. Útil para materiais e cenário; selecionar e reduzir assets para uso em tempo real.
- [Adobe — Mixamo FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html): personagens e animações podem ser incorporados a jogos pessoais e comerciais, segundo a FAQ. O auto-rig é para humanoides bípedes. Validar os clips escolhidos e a integração ao personagem; não pressupor que sirva para cães ou braços de FPS.

Adotar modelos próprios ou de bibliotecas com termos adequados ao projeto. O estudo do site orienta comportamento e apresentação; os pacotes carregados por ele não fazem parte da lista de assets reutilizáveis verificados.

### Pipeline recomendado

`modelo/rig → ajuste no Blender → exportação GLB → carregamento único → clones → animação e hitboxes → perfil de desempenho`

No Three.js, usar [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader) para GLB/glTF, [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html) para clips e [SkeletonUtils.clone](https://threejs.org/docs/pages/module-SkeletonUtils.html) para clones com esqueleto. Texturas comprimidas podem usar [KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html). A documentação consultada é atual; a integração precisa usar os addons compatíveis com a versão 0.160.0 fixada no projeto, ou uma atualização do conjunto testada separadamente.

Preferir animações in-place com posição controlada pelo jogo para a primeira integração. Clones podem compartilhar geometria e materiais: a rotina atual `disposeObject3D()` não deve liberar esses recursos compartilhados cada vez que um zumbi morre. Criar controle de propriedade dos recursos ou manter os recursos até o descarregamento da fase.

## 10. Visual e som

Direção sugerida: bairro abandonado à noite, luz fria no ambiente e pontos quentes nas áreas de compra, com silhuetas legíveis. Um conjunto consistente de modelos, iluminação e materiais rende mais do que objetos de estilos misturados.

Priorizar sujeira nos materiais, marcas de impacto, pequenas variações nas roupas e iluminação que indique caminhos. Controlar bloom e luzes emissivas para os efeitos não apagarem o alvo.

Áudio deve informar direção e risco: gemido atrás do jogador, madeira sendo quebrada, máquina funcionando e passos de corredor. Usar variações de pitch e amostras, limite de vozes simultâneas, atenuação por distância e mixagem que preserve os avisos importantes. Prever volumes separados para música, efeitos e interface.

HUD sugerido: munição, pontos e onda nos cantos; perks compactos; prompt central apenas para o alvo de interação. Barras de vida dos inimigos podem ser opcionais para manter legibilidade com hordas grandes.

## 11. Estrutura técnica e desempenho

Extrair gradualmente os sistemas do HTML: `PlayerController`, `WeaponSystem`, `ZombieAI`, `Navigation`, `WaveDirector`, `InteractionSystem`, `MapState`, `AssetManager`, `AudioManager` e `HUD`. Não é necessário reescrever tudo para iniciar; separar primeiro configurações, estado da partida e navegação.

Metas iniciais propostas, sujeitas a medição em hardware definido:

| Item | Alvo de protótipo |
|---|---|
| Fluidez | 60 FPS no perfil de referência; opção de qualidade para 30 FPS |
| Horda | Começar com 24–32 zumbis ativos; ampliar conforme perfil de CPU/GPU |
| Zumbi visual | Aproximadamente 3–8 mil triângulos e poucos materiais por instância |
| Texturas | 1K para objetos comuns; 2K onde fizer diferença visível |
| IA | Rotas distribuídas no tempo e consultas por proximidade |
| Efeitos | Pool e tetos para cápsulas, partículas, corpos e luzes |
| Carregamento | Carregar a área inicial primeiro e exibir progresso real |

Medir tempo de quadro, draw calls, triângulos e memória. Usar instancing para objetos estáticos repetidos; zumbis com esqueleto e animação independente exigem outra estratégia. Sombras, pixel ratio e pós-processamento devem entrar nas opções de qualidade. Um limite no delta não substitui um passo fixo de simulação com limite de recuperação.

## 12. Ordem de implementação

| Etapa | Entrega revisável | Critério de conclusão |
|---|---|---|
| 1 — Base | Economia inicial, sprint, pausa e limites de onda | Primeira partida e reinício seguem as mesmas regras; pausa congela a simulação |
| 2 — Horda | Rotas, separação, estados e golpe com contato | Zumbis contornam obstáculo em U e portas, não se empilham e não atacam através de parede |
| 3 — Sensação | Um zumbi com rig, braços, ADS e três armas polidas | Clips mudam sem saltos, pés acompanham a velocidade e mira alinha com o tiro |
| 4 — Mapa | Cinco setores, portas, barricadas, energia e compras de parede | Abrir setor muda rotas e cria uma decisão útil de gasto |
| 5 — Progressão | Perks, caixa e melhoria rebalanceados | Dez ondas oferecem progressão sem recursos infinitos ou bloqueio involuntário |
| 6 — Acabamento | Áudio espacial, efeitos, opções e medição | Horda alvo cabe no orçamento de quadros e sinais de perigo continuam legíveis |
| 7 — Expansão | Especial, armadilha, segredo ou segundo mapa | Cada adição resolve uma necessidade de gameplay observada nos testes |

Primeira versão recomendada: **mapa compacto com cinco setores, um rig de zumbi com variações, caminhantes/corredores/rastejantes, três armas finalizadas, ADS, sprint consistente, portas, barricadas e energia**, aproveitando as compras e melhorias existentes. Cooperativo, ragdoll completo e grande catálogo de inimigos entram após essa base ficar estável.

## 13. Roteiro de validação

1. Repetir deslocamento e disparo em 30, 60 e 120 FPS; comparar distância, cadência e consumo de sprint.
2. Testar uma parede, um obstáculo em U, uma passagem estreita e uma porta que abre durante a perseguição.
3. Fazer 30 zumbis chegarem de direções diferentes; observar travamento, sobreposição e custo por quadro.
4. Sair do alcance durante a preparação do golpe; verificar que o dano depende do contato efetivo.
5. Pausar durante recarga, caixa, melhoria, projétil e power-up; verificar o tempo restante após retomar.
6. Simular dez ondas com renda e gastos registrados; ajustar preços, munição, vida e composição.
7. Reiniciar várias partidas; conferir memória, recursos de GPU, áudio e igualdade do estado inicial.

Esses testes são critérios de aceitação para implementação futura. Não foram executados como parte deste estudo.

## 14. Complemento: observação da partida do usuário e inspeção técnica

### 14.1 Método e evidências

Foi acompanhada a aba existente do usuário no Chrome, sem cliques, teclas, recarregamento ou mudança de configurações da partida. Foram observados vários momentos da área inicial e nove capturas foram salvas. Também foram lidos o DOM, o inventário dos recursos carregados e mensagens de console já emitidas pelo jogo. Não foi preciso abrir um painel sobre a partida.

Capturas e inventário estão em `C:/Users/numbe/.codex/visualizations/2026/10/15/01a140c2-1286-7720-b329-97533b4fe303/`, com os nomes `kino-observacao-1.jpg` a `kino-observacao-9.jpg` e `kino-recursos-observados.json`.

As imagens são amostras, não uma gravação contínua. Elas permitem verificar poses e estados, mas não demonstram a duração exata das animações. A observação não incluiu análise do áudio.

### 14.2 O que foi visto e como transformar em sistemas próprios

| Evidência observada | Inspiração concreta para o nosso projeto | Implementação proposta |
|---|---|---|
| Mãos e antebraços segurando pistola e shotgun | Dar presença física e escala à arma | Rig de braços em primeira pessoa com poses por família de arma |
| Pistola centralizada na linha de visão durante a mira | ADS com alinhamento real | Transição entre pose de quadril e pose de mira; sensibilidade própria |
| Arma e mãos em poses de recarga | Comunicar indisponibilidade de tiro pela animação | Estado de recarga com eventos para transferência de munição |
| Shotgun vista com `1/36` e depois `2/35` | Recarga por cartucho, em vez de uma recarga genérica | Entrada, inserção repetida e saída; esses números são compatíveis com a proposta, sem medição do ciclo completo |
| Zumbi próximo com tronco inclinado, braços assimétricos e olhos acesos | Ataque mais legível e menos mecânico | Clips de aproximação e golpe; olhos emissivos discretos |
| Zumbi com um braço levantado à frente do jogador | Preparação visual do golpe | Separar preparação, contato e recuperação; a divisão é proposta, não confirmação do algoritmo do site |
| Inimigo visível atrás das tábuas de uma janela | Fazer as entradas pertencerem ao cenário | Spawns associados a janelas e sequência de romper/atravessar |
| Texto para segurar F e reconstruir barreira | Interação prolongada em local vulnerável | Progresso de reparo, interrupção ao soltar e recompensa limitada |
| Indicador `+10` junto do prompt de reparo | Pequenas recompensas como feedback de interação | Evento de pontos com motivo e teto por barricada/onda; a causalidade exata requer teste controlado |
| Prompt de arma com preços de arma, munição e munição melhorada | A compra de parede resolve três decisões no mesmo local | Escolher a ação a partir da arma equipada e do estado de melhoria |
| Mensagem exigindo energia primeiro | Mostrar o motivo de uma interação bloqueada | Condições explícitas: disponível, sem pontos, sem energia e em uso |
| Pontos e munição nos cantos, onda como riscos vermelhos | Preservar o centro para o combate | HUD compacto e prompts temporários |
| Acréscimos de pontos exibidos perto do total | Reforçar ação e recompensa | Animação curta de ganho, com cor e duração consistentes |
| Indicador vermelho de dano na parte superior e imagem alterada | Mostrar ameaça sem ocupar a tela inteira | Indicação direcional e intensidade de dano, com opção de reduzir efeitos |
| Cadáver no chão e objeto de pickup visível após o combate | Dar continuidade visual aos acontecimentos | Corpos temporários e pickups reconhecíveis; o tipo do pickup não foi identificado com segurança |
| Máquina destacada por luz colorida, silhueta de arma na parede e área circular no piso | Orientação por marcos visuais | Cor e forma por função, sem depender só de texto |
| Escadas, mezanino, passagens sob escadas e obstruções no salão | Criar caminhos curtos, gargalos e diferentes linhas de visão | Mapa em setores com colisão e navegação coerentes com a verticalidade |

O prompt da arma de parede mostrou **500 para arma, 250 para munição e 4.500 para munição melhorada**. São valores observados naquele ponto da partida, não uma tabela universal de preços. Servem de exemplo de como contextualizar custo; a economia do nosso jogo deve usar sua própria renda por onda.

### 14.3 Direção de arte que vale reproduzir como princípio

O salão tem paredes ornamentadas envelhecidas, assentos gastos, tábuas em ângulos diferentes, móveis empilhados, cabos, sangue e entulho. A composição alterna massas escuras com luz entrando por janelas altas e pequenos pontos de luz junto a áreas de interesse.

Para a nossa arena urbana, a tradução mais útil é montar um kit modular coerente: paredes e rodapés gastos, portas e janelas, barricadas de poucas peças, móveis bloqueadores, cabos e objetos de referência. Usar um conjunto de materiais de desgaste e variações de objetos pode criar riqueza sem um modelo exclusivo para cada canto.

O cenário deve separar **detalhes visuais** de **geometria que bloqueia**. Entulho pequeno pode ser só decoração; móveis grandes precisam combinar volume visual, colisão, bloqueio de tiro e navegação. Isso evita que a fidelidade visual crie obstáculos invisíveis ou inimigos presos.

### 14.4 Resultado da inspeção técnica

O DOM apresentou um canvas `game` com dimensões internas de 1368 × 600 no momento da consulta. A interface de combate aparece nas capturas, enquanto a árvore de acessibilidade da partida expõe principalmente o canvas e a identificação de single player. Assim, não se deve tratar o HUD desenhado como um conjunto de elementos HTML disponíveis para leitura direta.

O inventário registrou 36 recursos: 27 scripts, dois estilos, uma imagem, um vídeo e cinco itens classificados como outros. Entre os recursos observados:

| Recursos | O que se pode afirmar |
|---|---|
| `KisakBlack-web.mjs` e `KisakBlack-web.wasm` | A página carregou um módulo JavaScript e um binário WebAssembly com esses nomes |
| `engine.js`, `play.js`, `canvas.js` e `input.js` | Existem módulos distintos com esses nomes; suas responsabilidades completas não foram lidas |
| `guns.js`, `maps.js`, `assets.js` e `pack-selection.js` | Há separação nominal de recursos relacionados a armas, mapas e carregamento |
| `gamepad.js` | Há um módulo carregado com nome relacionado a gamepad |
| `engine-download-worker.js?map=zombie_theater` e `capability-worker.js` | Foram carregados scripts identificados como workers; isso não prova quais tarefas internas de gameplay eles executam |
| `coop.js`, `net.js`, `horde.js` e metadados/configurações | A página single player também carrega módulos com nomes relativos a outros sistemas; isso não comprova funcionalidades de multiplayer ou IA específicas |
| `zombie_theater_load.av1.webm` | Há um recurso de vídeo de carregamento, além da imagem de loading |

O console disponibilizou mensagens `KISAK_BROWSER`, `WEB_GL_DRAWS`, `WEB_GL_PACKETS` e informações de sincronização. Isso confirma a presença de instrumentação e registros de renderização; os números isolados não constituem benchmark comparável ao nosso projeto e não foram usados para declarar FPS.

O acesso aos textos dos scripts pelo leitor web falhou. **Não foi lido o código interno da IA, nem extraídos modelos, animações ou sons dos pacotes.** A presença de WebAssembly explica por que inspecionar apenas o HTML não revela toda a lógica; não há evidência suficiente para afirmar qual algoritmo de navegação os zumbis usam ou que algum módulo seja diretamente reutilizável em Three.js.

### 14.5 Mudanças de prioridade após ver a partida

1. **Braços, ADS e recarga por tipo de arma:** o corpo em primeira pessoa dá uma diferença visual imediata que a geometria isolada da arma não resolve.
2. **Barricadas com entrada de zumbi:** integrar cenário, spawn, animação e economia em uma única mecânica observável.
3. **Interação contextual:** mostrar ação, preço e impedimento; exigir olhar para o alvo, verificar distância e desobstrução, e diferenciar toque de segurar.
4. **Golpe legível:** aproximar, levantar o braço, tentar contato e recuperar. Vincular dano à janela de contato, com chance de o jogador sair do alcance.
5. **Salão ou quarteirão com rotas e marcos:** preservar uma área para circulação, criar gargalos nas bordas e usar iluminação para indicar objetivos.
6. **HUD compacto:** reduzir painéis grandes e reservar o centro para mirar e ler os inimigos.

Os sistemas da primeira versão continuam sendo propostas originais para a base local, agora apoiadas por evidências visuais da partida do usuário. O HTML de gameplay não foi alterado por este complemento.

## 15. Pesquisa de imagens e direção visual

O painel em [REFERENCIAS_VISUAIS_ZOMBIES.md](C:/Users/numbe/.codex/worktrees/baba/game/REFERENCIAS_VISUAIS_ZOMBIES.md) reúne imagens da web com fontes, capturas da partida e comentários sobre como adaptar cada ponto ao nosso jogo. O material distingue o Black Ops original de uma referência complementar identificada como remaster de Black Ops III.

Prioridades visuais: cenário modular com identidade; zumbis de silhueta clara; braços, ADS e recargas; barricadas e compras integradas ao mundo; máquinas reconhecíveis; mapa conectado por portas e energia; HUD compacto.
