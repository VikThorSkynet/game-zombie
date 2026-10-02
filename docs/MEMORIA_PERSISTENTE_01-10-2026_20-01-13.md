# Memória persistente — v40

Pedido: aumentar o asset da AK47, que parecia pequeno na mão do jogador.
Branch `codex/ak47-tamanho`, base v39 / `0a1d363`.
HTML atual: `game_version40_01-10-2026_20-01-13.html`; v39 preservada.
[Contexto anterior](MEMORIA_PERSISTENTE_01-10-2026_19-31-28.md).

## Implementação

- Escala uniforme 1,35 apenas no modelo importado da AK47.
- Posição [.28, -.33, -.87], altura da mira -.11. Mão e punho abaixados
  para acompanhar a empunhadura maior. Socket do cano acompanha a escala.
- Configuração em `weaponAssetPlacements`; criação multiplica a escala do
  template, preservando os GLBs originais. Configuração também vale para PaP.
- HTML v40 e README atualizados; build regenerado e conferido.

## Verificação

`tests/weapon-assets.cjs` aprovado em baixa e alta: três armas importadas,
versões normal/PaP, tiro, recarga, mira, texturas, posição do cano e estabilidade
após reinícios. Capturas da AK47 sem mira e mirando inspecionadas em
`docs/captures/ak47-v40`. `scripts/build-game.mjs --check` aprovado.
Boot sem hooks por file:// e HTTP verificado com qualidades e métricas.

## Pendência real

Ajuste subjetivo de enquadramento pode ser refinado após o usuário jogar.
Capturas e verificações automatizadas não representam uma partida humana.


## HUD compacto — 02/10/2026

Base confirmada por fetch: origin/main, c58b494 (v40). Alterações anteriores
em game_9.html preservadas no stash "HUD antigo e regra AGENTS preservados
antes de atualizar main". A regra de sincronização foi incorporada ao AGENTS.md
atual, preservando suas instruções anteriores.

HTML v40 ajustado: painéis transparentes sem bordas; vida, fôlego e placas
no canto inferior esquerdo; telemetria compacta com SVGs no superior direito;
munição e nome discreto da arma no inferior direito. Rótulos permanentes,
controles repetidos, função/raridade da arma e detalhes longos da missão não
ocupam a tela. Diário segue acessível por J, com indicador de desafio e progresso;
geradores e reserva de placas mantêm contadores. Alertas situacionais de cão,
última ameaça, interação e recarga foram preservados. Regras de gameplay intactas.

Verificações: build --check; 20 testes de regras e armas aprovados; boot sem
hooks por file:// e HTTP aprovado em auto/low/high, inclusive métricas e falha
de CDN; captura desktop inspecionada e captura 640x360 gerada em
`docs/captures/hud-clean`. Navegação de captura sem erros JavaScript.
Não houve partida humana. Prévia apresentada e envio ao GitHub autorizado pelo usuário em 02/10/2026.

AGENTS.md também exige prévia, consulta sobre ajustes e autorização antes de
commit/envio, respeitando autorizações explícitas já dadas para o resultado.


## AK47: enquadramento da referência — 02/10/2026

Base remota confirmada por fetch: origin/main 9e5d319, igual ao HEAD local.
Pedido: aproximar a AK47 da pose em primeira pessoa da imagem fornecida.
No HTML v40, posição do asset agora [.18,-.24,-.95], escala 1,35 preservada,
altura da mira -.02. Duas mãos com luvas, punhos e mangas oliva foram adicionadas
apenas à AK47, com apoio sob o guarda-mão e mão de disparo junto à empunhadura.
A coronha foi afastada da câmera após inspeção da primeira captura.
A mira usa sightX da arma, corrigindo a centralização após o reposicionamento;
a verificação de assets também usa esse deslocamento em vez de valor fixo.
O asset GLB/texturas existentes continuam sendo a fonte da AK47: trata-se de
aproximação da pose e enquadramento, não de reprodução exata do modelo da imagem.
Capturas em docs/captures/ak47-reference; mudanças ainda locais, aguardando
avaliação da prévia e autorização de commit/envio do usuário.

Validação final: tests/weapon-assets.cjs aprovado em low/high, nas versões normal
e PaP das três armas, incluindo tiro, recarga, mira, texturas, socket do cano e
estabilidade após oito reinícios; tests/boot.cjs aprovado por file:// e HTTP,
com métricas e cenário de falha de CDN; build --check e diff --check aprovados.
Capturas da AK47 sem mira e mirando inspecionadas.


## Refinamento após avaliação da prévia — 02/10/2026

Usuário pediu coronha fora da tela, arma um pouco maior e trazida para trás,
e segunda mão segurando a arma. Fetch confirmou origin/main ainda em 9e5d319;
as alterações locais anteriores foram preservadas.
AK47: escala 1,50 (11,1% acima da prévia 1,35), posição [.24,-.26,-.55],
mais próxima da câmera, retirando a coronha do enquadramento de tiro sem mira.
Altura da mira -.015; deslocamento horizontal acompanha .24. Mão de apoio
reposicionada em [.24,-.21,-1.03], dedos envolvendo a parte inferior do guarda-mão;
punho e manga acompanham a pegada. Mão de disparo acompanha a empunhadura.
Mantidos GLB e atributos de gameplay. Primeira captura de refinamento inspecionada:
coronha não aparece; prévia definitiva será a captura de teste sem mira/high.
Alterações continuam locais, aguardando avaliação e autorização de envio.

Refinamento validado: assets normal/PaP em low/high, tiro, recarga, mira,
texturas, posição do cano e reinícios estáveis; boot file/HTTP, métricas e falha
de CDN aprovados. Capturas finais sem mira e mirando inspecionadas.


## Remoção da mão de apoio — 02/10/2026

A pedido do usuário, removidos mão de apoio, punho, manga e costura desse braço
na AK47. Mão de disparo, escala 1,50, posição [.24,-.26,-.55] e alinhamento da
mira mantidos. Fetch confirmou origin/main 9e5d319; alterações locais preservadas.
README atualizado para descrever apenas a mão de disparo. Prévia final no arquivo
v36-assault_rifle-hip-high.png dentro de docs/captures/ak47-reference (nome legado
do teste). Trabalho local ainda aguarda avaliação e autorização de publicação.

Verificações após remoção: build --check, diff --check, weapon-assets low/high
e normal/PaP, incluindo tiro/recarga/mira e reinícios estáveis, e boot file/HTTP
com métricas/falha de CDN aprovados. Captura sem mão de apoio inspecionada.

Envio da versão sem mão de apoio autorizado pelo usuário em 02/10/2026.
Link de teste local fornecido por HTTP em 127.0.0.1:8765, usando o HTML v40.
