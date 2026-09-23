# Protocolo Sobreviva — v21

FPS de zumbis em HTML com Three.js, regras em `game-systems.mjs`, modelos procedurais e MP3 locais.

## Versão atual

[game_version21_23-09-2026_12-47-58.html](game_version21_23-09-2026_12-47-58.html)

Atualização: **23/09/2026 às 12:47:58**, America/Sao_Paulo (UTC−03:00).
Versão: **v21 — Protocolo de Contenção, etapa 4/7**.
Branch: `codex/protocolo-contencao`.

Etapa 1: regras centrais de balanceamento, eventos de combate e controlador de ondas.
Intervalo de dez segundos entre ondas; **N** antecipa a próxima. Pausar congela o intervalo.
Até 24 inimigos simultâneos em Desempenho/automática baixa e 32 nos demais modos,
preservando o total de inimigos de cada onda.
Etapa 2: armadura, economia de pontos/sucata e raridades; veja as regras abaixo.
Etapa 3: três geradores, defesas finitas e acesso norte energizado.
Etapa 4: cães com bote anunciado, rodadas especiais e névoa variável.
O [plano de execução](docs/PLANO_PROTOCOLO_CONTENCAO.md) registra a sequência e o progresso.

v17 mantém a lanterna na posição original com intensidade reduzida ao mirar; cinco bônus
com formas próprias, dourado e halo verde; facada com **V** e depósitos de munição
com **E**. Novas barreiras de quarentena, placas, detritos e iluminação de apoio.

Mantém as configurações persistentes de volume, sensibilidade e movimento reduzido;
sensibilidade específica ao mirar, indicação de acerto crítico, barra de recarga
e estatísticas da partida. Corrige iluminação da arma na mira, saldo inicial e
ataques através de obstáculos. Reutiliza efeitos de impacto e reduz a frequência
das animações distantes. Os modelos continuam procedurais estilizados.

Cidade ampliada para 300×300 unidades, com 34 prédios, 16 carros refeitos,
fachadas danificadas e entulho. Red dot ao segurar botão direito, caixas de
munição revisadas e zumbis com pele, roupas e animação melhoradas.
Inclui as máquinas, os perks e as opções de desempenho das versões anteriores.

## Revisão de mira e renderização

Sniper com luneta circular de aproximadamente 4× (botão direito); outras armas mantêm red dot.
Somente MP3: efeitos sem arquivo dedicado ficam silenciosos; sniper e Ray Gun reutilizam os disparos disponíveis.
Facada com indicação de dano, recuo e breve interrupção de movimento do alvo.
Caixas ON SALE agora têm o mesmo baú da normal, com placa e feixe dourados.
Névoa leve e [LOD — nível de detalhe](https://threejs.org/docs/pages/LOD.html) nos 34 prédios e 16 carros:
modelos simplificados à distância, detalhe restaurado de perto ou pela luneta.

## Executar

Mantenha o HTML, `game-systems.mjs` e os MP3 na mesma pasta. Sirva a raiz por HTTP:

```sh
python -m http.server 8000
```

Abra [o jogo](http://localhost:8000/game_version21_23-09-2026_12-47-58.html).
O Three.js 0.160.0 é carregado por CDN e requer internet.

- Automática: ajusta a resolução durante a partida.
- Desempenho: renderização direta, sem bloom e sem buffers de pós-processamento.
- Alta: mantém o pós-processamento e maior resolução.

Trocar a qualidade recarrega a página. O seletor aparece antes de iniciar a partida.
WASD: mover; mouse esquerdo: atirar; segurar botão direito: red dot ou luneta na sniper;
Ctrl ou Shift: correr; R: recarregar; V: facada;
E: interagir/comprar; F: equipar placa; G: ampliar colete junto à estação COLETE;
1/2: trocar arma; N: antecipar a próxima onda durante o intervalo; Esc: pausar.
A interface se adapta a telas menores; o jogo continua exigindo teclado e mouse.

Para inspeção visual, use `?preview&quality=low` ou `?preview&quality=high`.

Volume, sensibilidade e movimento reduzido podem ser ajustados no menu inicial
e na pausa. As preferências ficam no armazenamento local do navegador; a partida
não é salva. Movimento reduzido desativa balanço da arma, tremor de dano e
variação de FOV ao correr, mantendo o zoom da mira.

## Rodadas especiais — etapa 4

- **Caçada:** primeira na onda 5; próximas nas ondas 10, 16, 21, 27, 32…
  Intervalos alternam cinco e seis ondas. Apenas cães: seis na primeira caçada,
  mais dois a cada caçada até 24 no total, com quatro a oito simultâneos.
- Cão quadrúpede com vida de 65% do zumbi normal. Anuncia o bote por 0,7 s com
  postura, anel e aviso no HUD; avança na direção fixada por 0,35 s e recupera por
  0,95 s. Esquive lateralmente. Cada bote causa dano apenas uma vez e respeita
  paredes e armadura. Ferir pernas reduz velocidade sem usar a animação humana.
- O último cão da caçada deixa uma **Munição Máxima**, inclusive se morrer por
  Nuke. Colete antes dos 25 s de duração do bônus. Cães não sorteiam outros bônus.
  Não há som de cão porque nenhum MP3 específico foi fornecido.
- **Névoa densa:** elegível a partir da onda 8, a cada quatro ondas, exceto quando
  coincide com uma caçada ou fica imediatamente antes/depois dela. Assim, rodadas
  especiais nunca são consecutivas. Não surgem Atiradores e o limite simultâneo
  cai para 65% do normal; o total de inimigos da onda é preservado.
- A névoa entra e sai gradualmente em aproximadamente 5,5 s. O alvo de visibilidade
  é 25–35 m; não há mudança global de resolução. Pausa/morte congelam a transição.
  Geradores aguardam o fim da rodada especial para iniciar uma defesa.

Regras iniciais de balanceamento; o ritmo completo ainda depende de playtest.

## Geradores e acesso norte — etapa 3

Encontre os três geradores sinalizados nas ruas da cidade. O HUD mostra quantos estão
online e a distância do próximo. Use **E** junto ao gerador para iniciar gratuitamente
uma defesa. A ordem é livre; apenas uma defesa fica ativa por vez.

- Defenda dentro do círculo de 10 m por 25, 35 e 45 segundos, conforme a ordem.
  Sair pausa carga e novos reforços; os inimigos já presentes continuam atacando.
- Cada defesa recebe apenas 6, 8 ou 10 reforços normais. Elimine todos e termine
  a carga para concluir. Reentrar no círculo não reinicia o orçamento.
- Ondas comuns suspendem novos spawns e avanço durante a defesa; inimigos existentes
  continuam ativos. O limite simultâneo da qualidade também vale para os reforços.
- Cada conclusão concede 300 pontos uma única vez. Mortes dos reforços seguem
  as regras comuns de recompensa e o teto de sucata da onda.
- Os três geradores energizam a porta ao norte, depois do depósito de munição.
  **E** abre gratuitamente o pátio. Colisão, bloqueio de tiros e caminhos dos zumbis
  são atualizados juntos; reiniciar fecha a porta e zera os geradores.

O pátio pertence à cidade e abre sem carregamento. O interior separado é a etapa 5.
A meta de acesso entre ondas 5 e 8 ainda depende de playtest; não há bloqueio artificial
por onda. Pausa e morte congelam a defesa, reinício limpa toda a progressão.

## Armadura, economia e raridades — etapa 2

Duas estações próximas ao centro da cidade: **COLETE** (azul) e **ARSENAL** (dourado).
O HUD informa proteção, placas guardadas, sucata e raridade da arma equipada.

- Colete começa com capacidade para uma placa, vazio. Cada placa oferece 50 de proteção
  e absorve 60% do dano enquanto houver proteção; o restante atinge a vida.
- Em COLETE, E compra uma placa por 150 pontos, até cinco na reserva. F equipa uma
  placa em 1,4 s; é possível caminhar e receber dano durante a animação. Tiro, mira,
  recarga, facada, troca e compras ficam bloqueados. Pausa congela a animação.
  A placa só é consumida ao terminar; repor proteção parcial também consome uma placa.
- G junto à estação aumenta a capacidade: duas placas por 1.500 pontos e três por
  3.000 adicionais. Ampliar o colete não concede proteção gratuitamente.
- Eliminação rende 100 pontos; cabeça ou faca rende 125 no total, sem somar os bônus.
  Pontos Duplos dobra essa recompensa. Nuke mantém 400/800 e não concede sucata.
- Eliminação paga concede três sucatas automaticamente, até 90 por onda. Sucata não
  é duplicada por Pontos Duplos e é usada apenas no ARSENAL nesta etapa.

| Raridade | Dano | Custo para subir do nível anterior |
|---|---:|---:|
| Comum | ×1 | — |
| Incomum | ×1,25 | 100 sucatas |
| Rara | ×1,55 | 200 sucatas |
| Épica | ×1,90 | 350 sucatas |
| Lendária | ×2,30 | 550 sucatas |

E no ARSENAL melhora somente a arma equipada, preservando Pack-a-Punch. Os fatores
de raridade e PaP se multiplicam. Ray Gun tem categoria Especial: aceita PaP, sem
raridade adicional. As duas Mystery Boxes sorteiam raridade conforme a onda:
até incomum nas ondas 1–4, rara em 5–9, épica em 10–14 e lendária a partir da 15.
Trocar uma arma na caixa substitui sua raridade e remove o PaP da arma anterior.

Revisão inicial de combate: SMG com intervalo de 90 ms e carregador de 40; shotgun
com 18 de dano corporal/36 crítico por pellet (8 pellets); Double Tap reduz o intervalo
em 25%. Vida dos zumbis preservada até a onda 5, cresce 12% por onda até a 20 e 6%
depois. O limite de velocidade na onda 15 permanece. Esses valores ainda exigem playtest.

`node tests/economy-report.mjs` imprime uma projeção de pontos, sucata e tiros por alvo.
Ela não simula deslocamento, erros de mira ou duração das ondas.

## Bônus e abastecimento

Os bônus flutuam por 25 segundos e piscam nos últimos cinco. A coleta exige
proximidade e caminho desobstruído. Bônus temporários duram 30 segundos.

- **Bomba Nuclear:** elimina os zumbis atuais e dá 400 pontos (800 com Pontos Duplos).
- **Munição Máxima:** completa carregadores e reservas de todas as armas. Não há granadas nesta versão.
- **Pontos Duplos:** dobra as recompensas de pontos.
- **Morte Instantânea:** mata com um tiro ou facada.
- **Liquidação:** ativa quatro caixas temporárias e reduz todas as tentativas para 10 pontos.
  Uma tentativa iniciada continua após o fim do bônus; há dez segundos para retirar a arma.

Existem exatamente três depósitos fixos: oeste `(-86, 0)`, leste `(86, 0)` e
norte `(0, 130)`, separados por pelo menos 155 unidades. Caixas comuns de munição
não surgem mais aleatoriamente; o bônus Munição Máxima continua disponível.

Depósitos sinalizados **MUNIÇÃO · [E]** abastecem a arma equipada: 250 pontos
para armas comuns, 1.000 após Pack-a-Punch; Ray Gun custa 1.500/3.000.
Não cobram quando a munição já está completa. Esses preços são adaptações ao jogo.
Facada tem alcance de 2,5 unidades, dano 150 e intervalo de 0,55 segundo;
não atravessa obstáculos e não consome munição.
O som de cada golpe usa o arquivo fornecido `facada.mp3`.

A velocidade de cada tipo de inimigo aumenta somente até a onda 15; a quantidade
das ondas comuns/névoa continua em 4 + 3×onda e a vida segue a curva da etapa 2. Ferir as pernas reduz gradualmente
a velocidade até 60%; destruí-las reduz para 45% da velocidade original
(antes 25%). Os rastejantes ficam mais rápidos, mas ainda são 55% mais lentos
que os zumbis intactos equivalentes. Vale para projéteis comuns e Ray Gun.

Referências de desenho e mecânicas: [guia oficial Zombies BO6](https://www.callofduty.com/blog/2024/08/call-of-duty-black-ops-6-zombies-deep-dive-terminus-map-intel)
e [ilustrações e depósitos em BO7](https://www.callofduty.com/ca/en/blog/2025/09/call-of-duty-black-ops-7-zombies-deep-dive).
Os modelos são procedurais próprios; nenhum asset do jogo de referência foi importado.

## Verificação

Com Node.js, execute `node --test tests/systems.test.mjs` para ondas, armadura e progressão.
Com Playwright e seu Chromium instalados, execute também `node tests/smoke.cjs`.
O teste serve o HTML em uma porta local temporária e requer internet para o Three.js.
`PLAYWRIGHT_MODULE` permite indicar uma instalação existente do Playwright;
`CHROME_PATH` permite usar um Chrome instalado. `QA_SCREENSHOTS` define uma pasta
opcional para capturas. A suíte inclui `tests/progression.cjs`, com compras, placas,
dano real por bala/laser, raridade, PaP, ambas as caixas, pausa e reset.
`tests/containment.cjs` verifica geradores, orçamento finito, recompensa única,
porta fechada/aberta, caminhos invalidados, limite simultâneo, pausa, morte e reset.
`tests/special-rounds.cjs` verifica caçadas, bote, esquiva, colisões, armadura,
hitboxes, Munição Máxima, névoa, ausência de Atiradores e reinício.
A instrumentação existe apenas na resposta HTTP do teste.

## Memória persistente

[Memória atual](docs/MEMORIA_PERSISTENTE_23-09-2026_12-47-58.md)

[Histórico v20](docs/MEMORIA_PERSISTENTE_23-09-2026_12-32-09.md)

[Histórico v19](docs/MEMORIA_PERSISTENTE_23-09-2026_10-29-08.md)

[Histórico v18](docs/MEMORIA_PERSISTENTE_22-09-2026_23-09-17.md)

[Histórico v17](docs/MEMORIA_PERSISTENTE_22-09-2026_22-34-52.md)

[Histórico v14](docs/MEMORIA_PERSISTENTE_21-09-2026_22-32-22.md)

[Histórico dos modelos](docs/MEMORIA_PERSISTENTE_21-09-2026_14-16-02.md).
