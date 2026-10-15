# Referências visuais — Kino der Toten

Pesquisa de imagens realizada em 15 de outubro de 2026 para orientar a evolução de `game_9.html`. As decisões abaixo são propostas de design, a partir de imagens encontradas na web e das capturas da partida do usuário.

## 1. Área inicial, materiais e iluminação — Black Ops original

![Área inicial de Kino der Toten](https://images.steamusercontent.com/ugc/19805246642782160/21DDE3B5CA71AA8BF9035CC5B7C071A9198C9A75/)

[Fonte: guia da comunidade Steam para Call of Duty: Black Ops](https://steamcommunity.com/sharedfiles/filedetails/?id=3425142008).

**O que estudar:** arquitetura antiga, superfícies gastas, barricadas, entulho e relação de tamanho entre arma e ambiente. A composição da área inicial é uma boa referência para concentrar várias funções em uma sala reconhecível.

**Aplicação sugerida:** um salão ou quarteirão inicial compacto, com três ou quatro entradas de inimigos, uma compra de arma e um marco visual. Usar concreto cinza, madeira escura, metal envelhecido e luzes localizadas. Manter chão e silhuetas legíveis.

## 2. Planta do mapa — conexões e objetivos

![Planta de Kino der Toten](https://img.atwiki.jp/cod_blackops/attach/58/573/kino_der_toten_map.png)

[Fonte: página de Kino der Toten no wiki de Black Ops](https://w.atwiki.jp/cod_blackops/pages/58.html).

**O que estudar:** como salas, caminhos, compras e objetivos se relacionam. O desenho mostra que planejar o percurso é tão importante quanto decorar cada sala.

**Aplicação sugerida:** um circuito principal com dois caminhos para um setor de energia, portas que exigem gasto e um atalho que devolve à área inicial. Misturar trechos largos para circular com passagens estreitas que tornam a fuga arriscada. Preços e regras do nosso mapa devem ser balanceados separadamente.

## 3. Arma especial e interface — Black Ops original

![Partida de Kino der Toten em Black Ops](https://images.steamusercontent.com/ugc/713029704255958712/BACF47B1ACA4BFE3B0B465AEDF16D1AEA67B59F5/?ima=fit&imcolor=%23000000&imh=576&impolicy=Letterbox&imw=1024&letterbox=true)

[Fonte: captura publicada na comunidade de Call of Duty: Black Ops em 2015](https://steamcommunity.com/sharedfiles/filedetails/?id=394061245).

**O que estudar:** peso visual da arma em primeira pessoa e distribuição dos indicadores nas bordas. O contexto da página confirma o jogo original; a imagem de uma partida isolada não comprova que toda aparência de arma seja padrão ou que não existam modificações.

**Aplicação sugerida:** arma especial com silhueta distinta, sinais de energia localizados e munição escassa. Manter pontos, munição e perks compactos, com o centro reservado à mira e aos inimigos.

## 4. Zumbi em combate — captura da sua partida

![Zumbi em combate próximo](C:/Users/numbe/.codex/visualizations/2026/10/15/01a140c2-1286-7720-b329-97533b4fe303/kino-observacao-2.jpg)

**O que estudar:** olhos emissivos, roupa danificada, postura e leitura do rosto no combate próximo.

**Aplicação sugerida:** um rig humanoide com três variações de roupa e cabeça, silhueta reconhecível e olhos discretamente emissivos. Variar poses e fases da passada. Criar clips próprios de preparação, contato, recuperação, impacto e morte; uma imagem não permite medir o tempo desses clips.

## 5. Barricada e arma de parede — captura da sua partida

![Barricada e compra de arma na parede](C:/Users/numbe/.codex/visualizations/2026/10/15/01a140c2-1286-7720-b329-97533b4fe303/kino-observacao-5.jpg)

**O que estudar:** o contraste das tábuas contra a abertura escura e a silhueta clara de uma arma no cenário.

**Aplicação sugerida:** janela modular com quatro a seis tábuas independentes, espaço de espera externo para inimigos e animação de travessia. Para compras, combinar decal de arma, modelo opcional e prompt contextual. Distância, direção do olhar e obstáculos devem participar da seleção do alvo.

## 6. Energia e percurso — captura da sua partida

![Interação condicionada à energia no salão](C:/Users/numbe/.codex/visualizations/2026/10/15/01a140c2-1286-7720-b329-97533b4fe303/kino-observacao-4.jpg)

**O que estudar:** camadas de circulação, passagem sob escada e mensagem curta explicando uma interação indisponível.

**Aplicação sugerida:** energia como objetivo acessível pela exploração, ativando máquinas e armadilhas. Usar luz, cabos e marcos próprios para indicar relações entre os aparelhos. Construir primeiro a navegação e colisão das escadas, depois acrescentar detalhes.

## 7. Palco e detalhe arquitetônico — referência complementar do remaster

![Teatro na versão Zombies Chronicles de Black Ops III](https://i0.wp.com/gameranx.com/wp-content/uploads/2017/05/kino-der-toten-solo-guide-theater.jpg?resize=800%2C450&ssl=1)

[Fonte: Gameranx, guia de Black Ops III: Zombies Chronicles](https://gameranx.com/features/id/106909/article/call-of-duty-black-ops-3-zombie-chronicles-kino-der-toten-map-walkthrough-map-guide/).

**Versão identificada:** esta imagem é do remaster de Black Ops III. Serve apenas como estudo complementar de composição, iluminação e detalhamento; não é evidência da aparência original de Black Ops 1.

**Aplicação sugerida:** um espaço de combate com ponto focal forte, silhuetas de arquitetura claras e contraste entre área central e bordas. Aplicar detalhe visual depois de validar o percurso com blocos simples.

## Principais pontos para a nossa direção de arte

| Pilar | O que produzir primeiro | Como avaliar |
|---|---|---|
| Cenário reconhecível | Sala inicial, janela, escada, porta e corredor | O jogador consegue se orientar sem consultar um mapa? |
| Materiais coerentes | Concreto, reboco, madeira e metal gastos | Todos os objetos parecem pertencer ao mesmo lugar? |
| Zumbi legível | Um rig com variações e olhos emissivos | O inimigo se destaca sem precisar de contorno forte? |
| Arma com presença | Braços, pistola e shotgun com ADS e recarga | As mãos e a arma explicam visualmente o estado do combate? |
| Interação no mundo | Barricada, compra de parede e máquina com identidade de cor | É possível reconhecer a função antes de ler o prompt? |
| Progressão espacial | Portas, energia, rota circular e atalho | Gastar pontos muda as opções de sobrevivência? |
| Interface discreta | Pontos, munição, onda, perks e prompts | O centro permanece livre e o estado do jogador é claro? |

**Lista inicial de assets:** um zumbi com rig; três variações visuais; braços em primeira pessoa; três armas; kit modular de paredes, pisos, teto, portas e escadas; janela com tábuas separadas; móveis bloqueadores; caixa de arma aleatória; máquina de melhoria; três máquinas de bônus; interruptor de energia; decals; HUD e efeitos de impacto.

As imagens pesquisadas são referências visuais. Não foram baixadas nem incorporadas ao jogo como texturas ou modelos. Não foi definido pela pesquisa que seus assets estejam disponíveis para redistribuição.
