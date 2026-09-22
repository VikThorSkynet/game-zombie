# Protocolo Sobreviva — v12

FPS de zumbis em um único HTML com Three.js, modelos procedurais e MP3 locais.

## Versão atual

[game_version12_21-09-2026_20-54-31.html](game_version12_21-09-2026_20-54-31.html)

Atualização: **21/09/2026 às 20:54:31**, America/Sao_Paulo (UTC−03:00).
Branch: `codex/hud-inicio-performance`.

Tela inicial com controles e seleção de qualidade; carregamento inicial visível;
HUD com aviso de pouca munição e FPS; otimizações de renderização e atualização do HUD.

## Executar

Mantenha o HTML e os MP3 na mesma pasta. Sirva a raiz por HTTP:

```sh
python -m http.server 8000
```

Abra [o jogo](http://localhost:8000/game_version12_21-09-2026_20-54-31.html).
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

[Memória atual](docs/MEMORIA_PERSISTENTE_21-09-2026_20-54-31.md)

[Histórico dos modelos](docs/MEMORIA_PERSISTENTE_21-09-2026_14-16-02.md).
