# Memória persistente — P4, v31

27/09/2026 · America/Sao_Paulo. Branch codex/p4-ritmo-campanha.
Base v30 26b1805; atual game_version31_27-09-2026_08-49-16.html.

Usuário pediu executar a P4. Lidos AGENTS, README, memória P3 e plano.
Versões anteriores preservadas; regras editadas na fonte e incorporadas pelo build.

## Alterações

- getSpawnPosition valida distância após clamp, caminho e colisão em cidade,
  fallback e instalação. Sem posição segura retorna null, preservando retry
  e orçamento do WaveDirector.
- BOSS_PHASES e bossAttackHits em game-systems.mjs definem Impacto, Anel com
  centro seguro e Ruptura. Formas/preenchimento/cores/textos e danos coincidem.
  Avisos 1,55/1,8/1,6 s, recuperação 2,4/2,8/2,2 s. Linha de visão obrigatória.
  Escudo impede início de aviso; vida permanece fixa 2400 (800 por fase).
- Reforços da transição procuram posições a >=10 m com caminho e sem colisão.
  Chefia e extração usam campaignThreatRound (onda limitada a 5–10), HP 180,
  pernas 72 e arrivalGrace de 1,2 s, congelada na pausa.
- Névoa especial 0,05 → 0,04. Cães, ondas e geradores revisados e mantidos
  nos demais parâmetros, sem travas por onda acrescentadas.

## Validação e limites

29 testes Node passaram; smoke completo low/high passou, incluindo P4 nova,
P3, campanha/finais, cães/névoa, áreas, geradores, compras e reinício.
Boot sem hooks file/HTTP, exportação e falha CDN passaram.
Nova suíte tests/pacing.cjs roda com QA_P4_ONLY=1; P4_WRITE_REPORT=1 grava
docs/measurements/p4-low.json e p4-high.json. Capturas dos padrões revisadas.

Testes amostram 60 surgimentos por modo, limites da ameaça em ondas 1/5/20/100,
período de chegada, pausa e região segura/perigosa do anel.
Três pares de armas, alternados na fase 2, usam rays reais e munição finita.
Tempos nominais 17/8,16/7,8 s **não são tempos de partidas**: equipamento inicial,
raro PaP e fuzil épico/Ray PaP, respectivamente. Mira perfeita, shotgun sem
dispersão, sem pressão de reforços/esquiva. Objetivos/travel avançados por hooks;
extração limpa alvos com dano fixo. Sequência completa é testada separadamente.

Relatório P4_RITMO_CAMPANHA.md documenta antes/depois e pendências:
metas humanas de portão 5–8 e chefe 90–180 s não validadas. Dano puro sugere
chefe curto; não inflar vida especulativamente para forçar meta. Pedir partidas
medidas quando for recalibrar. Não anunciar balanceamento completo.
Não foram regravados dados P1/P3, nem medido ganho de FPS.

Próxima etapa de implementação: P5 — orçamento gráfico e otimização.
P6/P7 modelagem/arte e validação humana continuam pendentes.
Repo real segue em Documents/Codex/2026-09-21/https-github-com-vikthorskynet-game-zombie/work/game-zombie.
