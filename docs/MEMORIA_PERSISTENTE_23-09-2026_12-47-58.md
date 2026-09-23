# Memória persistente — Protocolo Sobreviva v21, etapa 4/7

Versão: **23/09/2026 às 12:47:58 — America/Sao_Paulo (UTC−03:00)**.
HTML: `game_version21_23-09-2026_12-47-58.html`; regras em `game-systems.mjs`.
Branch: `codex/protocolo-contencao`. Base: `0426fca` (v20/etapa 3).
Histórico: [v20](MEMORIA_PERSISTENTE_23-09-2026_12-32-09.md).
Plano: [Protocolo de Contenção](PLANO_PROTOCOLO_CONTENCAO.md).

## Pedido e escopo

Usuário pediu a próxima etapa. Implementar cães, caçadas e névoa, verificar,
documentar e enviar commit ao GitHub autorizado VikThorSkynet/game-zombie.
Não iniciar o interior separado nesta etapa.

## Implementação

- `waveProfile` define agenda determinística: cães em 5,10,16,21,27,32…,
  alternando intervalos de cinco e seis. Névoa em múltiplos de quatro a partir
  de 8, excluindo coincidência/vizinhança com caçadas. Nunca especiais consecutivas.
- Caçada: 6+2 por índice de caçada, máximo 24 total; simultâneos 4+índice, máximo 8.
  Névoa mantém total 4+3×onda e reduz cap simultâneo a floor(65% do cap normal):
  15 em baixa, 20 em alta. Sem Atiradores. Normal restaura 24/32.
- `WaveDirector.start` aceita perfil opcional, mantendo uso anterior nas regras
  de ondas comuns; reset limpa perfil e restaura limite original. O jogo sempre
  usa perfil. Falha de spawn preserva orçamento, conclusão continua única.
- Cão próprio procedural: tronco horizontal, peito, cabeça/focinho, orelhas,
  cauda, quatro pernas articuladas, olhos e ferimentos. Não reutiliza malha humana.
  Hitboxes registradas nos raycasters existentes; cabeça crítica, corpo e pernas.
  Vida 65% da vida normal da onda; bônus de velocidade 1,7 sobre a base, teto de
  crescimento na onda 15; dano 1,1× dano normal. Ataque passa pela armadura.
- `DogAttack`: perseguição, preparo 0,7 s até 5 m com linha livre, bote 0,35 s,
  recuperação 0,95 s. Direção fixada no começo do preparo permite esquiva lateral.
  Bote a 12 unidades/s, reduzido pela lesão de pernas, subpassos de até 0,12
  para impedir atravessar paredes. Um dano por bote até 1,25 m com linha livre.
  Colisão interrompe bote. Facada interrompe com stagger/recuperação.
- Preparo comunicado por postura abaixada, olhos, anel no chão e aviso no HUD.
  Modelo abaixa/salta sem deslocar o anel sob o chão. Pausa congela IA e timers.
  Lesões reduzem velocidade mas não usam a deformação/posição de rastejante humano.
  Tiros baixos no torso do cão não são classificados automaticamente como pernas.
- Cães aparecem naturalmente só nas caçadas. Sem MP3 próprio, nenhuma voz humana
  ou som sintetizado é usado para eles. Demais efeitos MP3 existentes preservados.
- Último cão originado na caçada garante um drop `max_ammo`, depois de esgotar
  orçamento e eliminar os demais. Guarda de recompensa impede duplicação.
  Funciona com bala/faca/Nuke; cães não sorteiam outros bônus. Drop dura 25 s como
  bônus comum e exige coleta. Evento `dogRoundReward` identifica entrega.
- Névoa Exp2 varia entre 0,006 e 0,05 a 0,008/s (~5,5 s); densidade densa resulta
  em ~89% de mistura com névoa a 30 m. Alvo visual 25–35 m, não um corte rígido.
  Sai no intervalo ou onda normal; pausa/morte congelam; reset volta imediatamente.
  Barras de vida distantes escondidas além de 25 m durante névoa forte.
- Geradores não iniciam defesa durante combate especial, com motivo no prompt.
  Pode iniciar no intervalo; holds existentes impedem próxima onda até a conclusão.
- Menu/título/README na v21. Relatório econômico inclui nova população; não modela
  economia de munição pelo bônus garantido nem recompensas/reforços de geradores.
  Exemplo analítico na onda 8: 127 mortes/12.700 pontos brutos/381 sucatas, sem
  críticos, Nuke, Pontos Duplos ou objetivos. Valores anteriores continuam históricos.

## Verificação e limites

- 13 testes Node aprovados, incluindo agenda/perfis por 100 ondas, caps, conclusão
  única, transição da névoa, pausa, telegraph, dano único e recuperação do cão.
- Chrome baixa/alta aprovado: perfil/cap/vida/modelo, bloqueio de geradores,
  ausência de recompensa precoce, Nuke e recompensa única, conclusão da caçada,
  reposição de munição, cap de névoa e 500 sorteios sem Atiradores, entrada/saída,
  pausa, aviso de bote, dano único, esquiva, paredes, armadura, raycasts reais de
  bala/laser, torso sem dano indevido de perna, stagger, lesão, facada, morte/reset.
- Suítes anteriores de combate, ADS/LOD, bônus, ondas, progressão e geradores
  passaram nas duas qualidades, sem erros JavaScript. O teste de retomada aceita
  novas tentativas de spawn, pois uma posição sorteada pode falhar na validação.
- Capturas `docs/previews/v21-*`; cão em alta e névoa em baixa inspecionados.
  Sintaxe e diff verificados; relatório econômico executado com perfis atuais.
- Balanceamento inicial; não houve partida longa nem benchmark de FPS. Frequências,
  dano e custos podem precisar de ajuste conforme playtest. Nenhum novo MP3.

## Próxima etapa

Etapa 5: instalação separada, carregamento entre áreas e preservação do estado.
Manter cidade como área principal, descarregar recursos não compartilhados,
permitir transição entre ondas sem objetivo ativo e recuperar falhas de carga.
