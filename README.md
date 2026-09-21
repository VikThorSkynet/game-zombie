# FPS de Zumbis

Jogo de tiro em primeira pessoa construído em um único HTML com Three.js,
modelos procedurais e arquivos MP3 locais.

## Versão atual nesta branch

[game_version11_21-09-2026_14-16-02.html](game_version11_21-09-2026_14-16-02.html)

Atualização: **21/09/2026 às 14:16:02**, America/Sao_Paulo (UTC−03:00).
Branch: `codex/melhorias-modelos-armas-zumbis-mapa`.

Nesta atualização, os modelos das seis armas, cinco tipos de zumbi e elementos
da cidade receberam detalhes visuais. As regras de combate, navegação, layout
e volumes de colisão foram preservados.

## Executar

Mantenha o HTML e os MP3 na mesma pasta. Sirva a raiz do repositório por HTTP.
Por exemplo, com Python instalado:

```sh
python -m http.server 8000
```

Abra [o jogo no servidor local](http://localhost:8000/game_version11_21-09-2026_14-16-02.html).
O Three.js 0.160.0 é carregado por CDN e requer internet.

O parâmetro `?preview&quality=high` abre a prévia existente com os cinco tipos
de zumbi. Para verificar a qualidade baixa, use `?preview&quality=low`.

## Memória persistente

[Memória de 21/09/2026 às 14:16:02](docs/MEMORIA_PERSISTENTE_21-09-2026_14-16-02.md)

Esse documento é a referência de continuidade: contém decisões, pontos de
integração, resultados de validação e limitações conhecidas.
