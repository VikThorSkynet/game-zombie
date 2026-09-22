# Protocolo Sobreviva — v16

FPS de zumbis em um único HTML com Three.js, modelos procedurais e MP3 locais.

## Versão atual

[game_version16_22-09-2026_13-22-44.html](game_version16_22-09-2026_13-22-44.html)

Atualização: **22/09/2026 às 13:22:44**, America/Sao_Paulo (UTC−03:00).
Revisão de balanceamento e áudio: **22/09/2026 às 14:27:28**.
Branch: `codex/bonus-facada-iluminacao-v16`.

v16: lanterna na posição original com intensidade reduzida ao mirar; cinco bônus
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

## Executar

Mantenha o HTML e os MP3 na mesma pasta. Sirva a raiz por HTTP:

```sh
python -m http.server 8000
```

Abra [o jogo](http://localhost:8000/game_version16_22-09-2026_13-22-44.html).
O Three.js 0.160.0 é carregado por CDN e requer internet.

- Automática: ajusta a resolução durante a partida.
- Desempenho: renderização direta, sem bloom e sem buffers de pós-processamento.
- Alta: mantém o pós-processamento e maior resolução.

Trocar a qualidade recarrega a página. O seletor aparece antes de iniciar a partida.
WASD: mover; mouse esquerdo: atirar; segurar botão direito: red dot;
Ctrl ou Shift: correr; R: recarregar; V: facada;
E: interagir; 1/2: trocar arma; Esc: pausar.
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

Com Node.js, Playwright e seu Chromium instalados, execute `node tests/smoke.cjs`.
O teste serve o HTML em uma porta local temporária e requer internet para o Three.js.
`PLAYWRIGHT_MODULE` permite indicar uma instalação existente do Playwright;
`CHROME_PATH` permite usar um Chrome instalado. `QA_SCREENSHOTS` define uma pasta
opcional para capturas. A instrumentação existe apenas na resposta HTTP do teste.

## Memória persistente

[Memória atual](docs/MEMORIA_PERSISTENTE_22-09-2026_13-22-44.md)

[Histórico v14](docs/MEMORIA_PERSISTENTE_21-09-2026_22-32-22.md)

[Histórico dos modelos](docs/MEMORIA_PERSISTENTE_21-09-2026_14-16-02.md).
