# Protocolo Sobreviva — v13

FPS de zumbis em um único HTML com Three.js, modelos procedurais e MP3 locais.

## Versão atual

[game_version13_21-09-2026_21-22-04.html](game_version13_21-09-2026_21-22-04.html)

Atualização: **21/09/2026 às 21:22:04**, America/Sao_Paulo (UTC−03:00).
Branch: `codex/maquinas-perks-armas-v13`.

Máquinas de perks retrô, Mystery Box de madeira com tampa articulada e
Pack-a-Punch industrial. Pistola redesenhada com proporções mais realistas,
emblemas de perks no HUD e peças estáticas agrupadas para reduzir chamadas de desenho.
Inclui o menu, carregamento e opções de desempenho da v12.

## Executar

Mantenha o HTML e os MP3 na mesma pasta. Sirva a raiz por HTTP:

```sh
python -m http.server 8000
```

Abra [o jogo](http://localhost:8000/game_version13_21-09-2026_21-22-04.html).
O Three.js 0.160.0 é carregado por CDN e requer internet.

- Automática: ajusta a resolução durante a partida.
- Desempenho: renderização direta, sem bloom e sem buffers de pós-processamento.
- Alta: mantém o pós-processamento e maior resolução.

Trocar a qualidade recarrega a página. O seletor aparece antes de iniciar a partida.
WASD: mover; mouse: mirar/atirar; Ctrl ou Shift: correr; R: recarregar;
E: interagir; 1/2: trocar arma; Esc: pausar.
A interface se adapta a telas menores; o jogo continua exigindo teclado e mouse.

Para inspeção visual, use `?preview&quality=low` ou `?preview&quality=high`.

## Memória persistente

[Memória atual](docs/MEMORIA_PERSISTENTE_21-09-2026_21-22-04.md)

[Histórico dos modelos](docs/MEMORIA_PERSISTENTE_21-09-2026_14-16-02.md).
