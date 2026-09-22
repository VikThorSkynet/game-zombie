# Protocolo Sobreviva — v15

FPS de zumbis em um único HTML com Three.js, modelos procedurais e MP3 locais.

## Versão atual

[game_version15_22-09-2026_07-23-52.html](game_version15_22-09-2026_07-23-52.html)

Atualização: **22/09/2026 às 07:23:52**, America/Sao_Paulo (UTC−03:00).
Branch: `codex/polimento-combate-performance-v15`.

v15: configurações persistentes de volume, sensibilidade e movimento reduzido;
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

Abra [o jogo](http://localhost:8000/game_version15_22-09-2026_07-23-52.html).
O Three.js 0.160.0 é carregado por CDN e requer internet.

- Automática: ajusta a resolução durante a partida.
- Desempenho: renderização direta, sem bloom e sem buffers de pós-processamento.
- Alta: mantém o pós-processamento e maior resolução.

Trocar a qualidade recarrega a página. O seletor aparece antes de iniciar a partida.
WASD: mover; mouse esquerdo: atirar; segurar botão direito: red dot;
Ctrl ou Shift: correr; R: recarregar;
E: interagir; 1/2: trocar arma; Esc: pausar.
A interface se adapta a telas menores; o jogo continua exigindo teclado e mouse.

Para inspeção visual, use `?preview&quality=low` ou `?preview&quality=high`.

Volume, sensibilidade e movimento reduzido podem ser ajustados no menu inicial
e na pausa. As preferências ficam no armazenamento local do navegador; a partida
não é salva. Movimento reduzido desativa balanço da arma, tremor de dano e
variação de FOV ao correr, mantendo o zoom da mira.

## Verificação

Com Node.js, Playwright e seu Chromium instalados, execute `node tests/smoke.cjs`.
O teste serve o HTML em uma porta local temporária e requer internet para o Three.js.
`PLAYWRIGHT_MODULE` permite indicar uma instalação existente do Playwright;
`CHROME_PATH` permite usar um Chrome instalado. `QA_SCREENSHOTS` define uma pasta
opcional para capturas. A instrumentação existe apenas na resposta HTTP do teste.

## Memória persistente

[Memória atual](docs/MEMORIA_PERSISTENTE_22-09-2026_07-23-52.md)

[Histórico v14](docs/MEMORIA_PERSISTENTE_21-09-2026_22-32-22.md)

[Histórico dos modelos](docs/MEMORIA_PERSISTENTE_21-09-2026_14-16-02.md).
