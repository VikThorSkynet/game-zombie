# Memória persistente — v36

Pedido: importar assets de `C:\Users\numbe\Downloads\Assets`; usar os dois dogs
como cães e mostrar cada zumbi antes de decidir seus tipos. O usuário confirmou
AK47 e caixa nesta entrega. Depois pediu concluir, fazer commit e desligar o PC.

Branch: `codex/assets-inimigos-galeria`, baseada em `3ef92b3` (v35).
HTML atual: `game_version36_30-09-2026_19-46-59.html`.
README e build atualizados. Versões anteriores preservadas.

## Entregue

- Dois cães alternados nas rodadas e reforços. D01 recebeu um rig simples;
  D02 usa as articulações do rig original. Instâncias e descarte independentes.
- AK47 no lugar do fuzil, com mira, PaP e atributos anteriores.
- Caixa importada, com tampa animada, incluindo Liquidação.
- Assets do jogo incorporados no HTML para file://, como as armas da v34.
- Galeria com Z01–Z08, D01–D02, P01, W01 e B01. Controles de órbita, zoom,
  animação e seleção de tipos, com persistência local e exportação JSON.
- `abrir-galeria.cmd` inicia servidor local e abre a galeria. Catálogo PNG
  disponível em `docs/asset-gallery/catalogo.png`.
- Conversão Blender reproduzível em `tools/convert_new_assets.py`.
- Créditos dos cães no jogo e fontes em `docs/ASSET_CREDITS_V36.md`.

## Verificação

Build `--check`, boot file:// e HTTP, smoke completo baixa/alta aprovados.
Testes de armas importadas verificaram as três armas e PaP. Testes de assets
verificaram movimento, esqueletos independentes, caixa e recursos estáveis
após seis reinícios, nas duas qualidades. Capturas de AK47, cães e caixa
inspecionadas. Detalhes em `docs/ASSETS_V36.md`.

## Próximo passo

O usuário ainda precisa escolher os tipos dos zumbis Z01–Z08. Não atribuir
papéis automaticamente nem tratar as seleções da galeria como integração
concluída. P01 está apenas na galeria. Alguns humanoides são estáticos e
precisarão de rig/animação depois da escolha. Playtest humano pendente.

O usuário autorizou commit, envio ao GitHub e desligamento ao terminar esta
entrega. Essa autorização de desligamento é específica desta execução.
