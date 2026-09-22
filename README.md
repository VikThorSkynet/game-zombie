# Protocolo Sobreviva — v14

FPS de zumbis em um único HTML com Three.js, modelos procedurais e MP3 locais.

## Versão atual

[game_version14_21-09-2026_22-32-22.html](game_version14_21-09-2026_22-32-22.html)

Atualização: **21/09/2026 às 22:32:22**, America/Sao_Paulo (UTC−03:00).
Branch: `codex/maquinas-perks-armas-v14`.

Cidade ampliada para 300×300 unidades, com 34 prédios, 16 carros refeitos,
fachadas danificadas e entulho. Red dot ao segurar botão direito, caixas de
munição revisadas e zumbis com pele, roupas e animação melhoradas.
Inclui as máquinas, os perks e as opções de desempenho das versões anteriores.

## Executar

Mantenha o HTML e os MP3 na mesma pasta. Sirva a raiz por HTTP:

```sh
python -m http.server 8000
```

Abra [o jogo](http://localhost:8000/game_version14_21-09-2026_22-32-22.html).
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

## Memória persistente

[Memória atual](docs/MEMORIA_PERSISTENTE_21-09-2026_22-32-22.md)

[Histórico dos modelos](docs/MEMORIA_PERSISTENTE_21-09-2026_14-16-02.md).
