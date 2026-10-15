# HUD clássico — v42

Pedido: usar as seis referências visuais fornecidas pelo usuário para limpar a tela e retirar a caixa central. Continua na branch `codex/building-spawns-v42`, sobre o commit local `35ad323`; `origin/main` foi consultada e permanece em `d94516e`.

## Composição

- Rodada em vermelho no canto inferior esquerdo: riscos agrupados até dez, números a partir de onze. A arte vetorial é original.
- Perks em pequenos escudos coloridos acima da rodada. Vida, fôlego e colete ficam no canto superior direito, em barras compactas, conforme a correção posterior do usuário.
- Pontos, sucata, nome da arma e munição no canto inferior direito.
- Morte instantânea, pontos em dobro e liquidação aparecem como emblemas brancos na parte inferior, com os segundos restantes. Só existem enquanto o efeito está ativo.
- A introdução de rodada aparece por 2,5 segundos, com texto e marcas vermelhas; respeita a pausa e a prioridade dos alertas existentes.
- O intervalo aparece em texto simples perto da rodada, com N para antecipar. Ao aguardar uma interação, mostra “Em espera”. O desafio automático continua no diário, aberto por J; a caixa central foi removida.
- Carga do gerador e avisos temporários ficam em texto/barra discretos, sem fundo ou moldura. FPS só aparece com `?metrics=1`.

Os menus e o diário mantêm suas superfícies próprias. O objetivo é limpar o campo de visão durante o jogo. Efeitos, duração dos bônus, recompensas, armas, barricadas e progressão usam as regras já existentes.

## Arquivos

`hud-visuals.mjs` contém os SVGs de marcas e emblemas. `scripts/build-game.mjs` incorpora essa fonte no HTML atual, mantendo suporte a arquivo e HTTP. Não há imagens, fontes externas ou imports locais novos. A integração e os estilos ficam em `game_version42_15-10-2026_18-44-03.html`.

`tests/announcements.cjs` serve uma resposta instrumentada apenas para os testes. Valida sete viewports nas duas qualidades, quatro perks e três bônus simultâneos, ausência de sobreposição/corte, ausência de caixas, desafio no diário, espera por interação, introdução/expiração/pausa dos avisos e dos bônus, reinício e menu. Também verifica marcas/números nas rodadas 1, 5, 10, 11 e 100.

Capturas atuais em `docs/captures/v42/hud-classic`: `combat-*`, `interval-*`, `held-*` e `round-intro-*`. As capturas na pasta superior registram etapas anteriores da v42.

## Validação

35 testes unitários, HUD em baixa/alta e sete viewports, boot por arquivo/HTTP (incluindo métricas, MP3 e recuperação de CDN) e regressão completa `tests/smoke.cjs` em baixa/alta foram aprovados. Build sincronizado e diff sem erros de whitespace. A regressão específica `tests/v41.cjs` de diário, desafios, geradores, efeitos, reinício e menus também passou em baixa/alta. Depois da solicitação de vida em cima à direita, somente a posição/estilo do bloco vital e a distribuição responsiva dos avisos foram alterados; a verificação visual foi repetida e aprovada em baixa/alta para essa posição final, incluindo avisos de gerador/alerta em 427×360 sem sobrepor as barras. Estes são cenários controlados, sem partida humana ou benchmark comparativo de FPS.
