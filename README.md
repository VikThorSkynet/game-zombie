# Protocolo Sobreviva — v18

FPS de zumbis em HTML com Three.js, regras em `game-systems.mjs`, modelos procedurais e MP3 locais.

## Versão atual

[game_version18_22-09-2026_23-09-17.html](game_version18_22-09-2026_23-09-17.html)

Atualização: **22/09/2026 às 23:09:17**, America/Sao_Paulo (UTC−03:00).
Versão: **v18 — Protocolo de Contenção, etapa 1/7**.
Branch: `codex/protocolo-contencao`.

Etapa 1: regras centrais de balanceamento, eventos de combate e controlador de ondas.
Intervalo de dez segundos entre ondas; **N** antecipa a próxima. Pausar congela o intervalo.
Até 24 inimigos simultâneos em Desempenho/automática baixa e 32 nos demais modos,
preservando o total de inimigos de cada onda. Economia e atributos mantêm os valores
da v17 nesta etapa; armadura e raridade pertencem à próxima entrega.
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

Abra [o jogo](http://localhost:8000/game_version18_22-09-2026_23-09-17.html).
O Three.js 0.160.0 é carregado por CDN e requer internet.

- Automática: ajusta a resolução durante a partida.
- Desempenho: renderização direta, sem bloom e sem buffers de pós-processamento.
- Alta: mantém o pós-processamento e maior resolução.

Trocar a qualidade recarrega a página. O seletor aparece antes de iniciar a partida.
WASD: mover; mouse esquerdo: atirar; segurar botão direito: red dot ou luneta na sniper;
Ctrl ou Shift: correr; R: recarregar; V: facada;
E: interagir; 1/2: trocar arma; N: antecipar a próxima onda durante o intervalo; Esc: pausar.
A interface se adapta a telas menores; o jogo continua exigindo teclado e mouse.

Para inspeção visual, use `?preview&quality=low` ou `?preview&quality=high`.

Volume, sensibilidade e movimento reduzido podem ser ajustados no menu inicial
e na pausa. As preferências ficam no armazenamento local do navegador; a partida
não é salva. Movimento reduzido desativa balanço da arma, tremor de dano e
variação de FOV ao correr, mantendo o zoom da mira.

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

A velocidade de cada tipo de zumbi aumenta somente até a onda 15; vida e quantidade
continuam seguindo a progressão existente. Ferir as pernas reduz gradualmente
a velocidade até 60%; destruí-las reduz para 45% da velocidade original
(antes 25%). Os rastejantes ficam mais rápidos, mas ainda são 55% mais lentos
que os zumbis intactos equivalentes. Vale para projéteis comuns e Ray Gun.

Referências de desenho e mecânicas: [guia oficial Zombies BO6](https://www.callofduty.com/blog/2024/08/call-of-duty-black-ops-6-zombies-deep-dive-terminus-map-intel)
e [ilustrações e depósitos em BO7](https://www.callofduty.com/ca/en/blog/2025/09/call-of-duty-black-ops-7-zombies-deep-dive).
Os modelos são procedurais próprios; nenhum asset do jogo de referência foi importado.

## Verificação

Com Node.js, execute `node --test tests/systems.test.mjs` para regras e ciclos de ondas.
Com Playwright e seu Chromium instalados, execute também `node tests/smoke.cjs`.
O teste serve o HTML em uma porta local temporária e requer internet para o Three.js.
`PLAYWRIGHT_MODULE` permite indicar uma instalação existente do Playwright;
`CHROME_PATH` permite usar um Chrome instalado. `QA_SCREENSHOTS` define uma pasta
opcional para capturas. A instrumentação existe apenas na resposta HTTP do teste.

## Memória persistente

[Memória atual](docs/MEMORIA_PERSISTENTE_22-09-2026_23-09-17.md)

[Histórico v17](docs/MEMORIA_PERSISTENTE_22-09-2026_22-34-52.md)

[Histórico v14](docs/MEMORIA_PERSISTENTE_21-09-2026_22-32-22.md)

[Histórico dos modelos](docs/MEMORIA_PERSISTENTE_21-09-2026_14-16-02.md).
