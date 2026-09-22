# Memória persistente — Protocolo Sobreviva v15

Atualização: **22/09/2026 às 07:23:52 — America/Sao_Paulo (UTC−03:00)**.
Branch: `codex/polimento-combate-performance-v15`.
Base local: `9da5353`, v14, com a correção de iluminação ainda não publicada.
HTML atual: `game_version15_22-09-2026_07-23-52.html`.

## Solicitação e escopo

Revisar e melhorar o jogo com referência na experiência de sobrevivência por
ondas, atualizar documentação e publicar um commit no GitHub. Esta versão é uma
iteração de combate, interface e desempenho; não representa qualidade AAA.
Não adiciona assets extraídos de Call of Duty. Mantém mapa e modelos da v14.

## Mudanças

- Saldo inicial corrigido de 10 milhões para zero, igual ao reinício da partida.
- Lanterna emitida à frente do cano para evitar sobre-exposição ao mirar.
  A geometria nos primeiros dois metros depende das demais luzes do cenário.
- Sensibilidade (0,25–2×), volume (0–100%) e movimento reduzido configuráveis
  no menu inicial/pausa/fim de partida. Preferências validadas e persistidas em
  `sobreviva.settings.v1`; armazenamento bloqueado ou JSON inválido usa defaults.
  Sem dados pessoais e sem salvamento da partida. Volume aplicado ao ganho mestre.
- ADS reduz gradualmente a sensibilidade para 65% da configuração; soltar/pausar
  restaura a resposta. Movimento reduzido elimina bob, tremor e FOV de sprint.
- Feedback de acerto crítico/eliminação; barra de progresso acessível da recarga;
  pausa mostra eliminações e críticos; fim de partida inclui tiros e duração.
  Críticos contam impactos na cabeça, incluindo pellets; não são uma taxa de precisão.
- Efeitos de impacto reutilizam geometria, material e vetores: no máximo 20
  conjuntos na qualidade baixa ou 40 na alta/automática. Efeitos mais antigos são
  reciclados quando o limite é atingido; dano e acertos continuam sendo processados.
  O pool livre permanece alocado para reutilização, com tamanho limitado.
- Animação de membros a mais de 35 unidades atualizada a 10 Hz; movimento,
  navegação e ataque mantêm a frequência anterior. Barras ocultas além de 45 unidades.
- Ataques corpo a corpo e disparos de zumbis exigem linha livre no mapa de colisão.
- Trocar uma arma na Mystery Box agora libera os recursos do modelo substituído
  e do modelo de exibição. Recursos de textura compartilhados não são descartados.
- Menu com acabamento visual revisado e vinheta leve sem novos passes WebGL.

## Validação

- Suíte de regressão anterior `verify-v14.cjs` passou antes da renomeação:
  mapa, navegação, munição, contratos de hitboxes, armas/Pack-a-Punch, ADS,
  recarga, troca e pausa. Módulo extraído aprovado por `node --check`.
- Nova suíte versionada `tests/smoke.cjs`, Chrome headless, baixa e alta:
  preferências persistidas, fallback de JSON inválido, saldo inicial zero,
  ADS, barra de recarga, acerto crítico, pausa, reinício e bloqueio de disparos
  por prédio com controle positivo em rua livre. Sem erros de JavaScript.
- Estresse de 200 impactos: limites 20/40 respeitados, todos os buffers da segunda
  sequência reutilizados, zero efeitos ativos ao expirar. Não é benchmark de FPS.
- Capturas do menu e ADS inspecionadas; suíte passou novamente no HTML final
  renomeado, gerando capturas em `docs/previews/v15-*.png`.
  `node --check` do módulo final e `git diff --check` aprovados.

## Arquivos e continuidade

HTML renomeado, README e esta memória atualizados, histórico v14 preservado,
`tests/smoke.cjs` adicionado. A solicitação autoriza commit e push; não autoriza
merge automático. O resultado da publicação deve ser informado ao usuário.

Limites: assets procedurais, iluminação simplificada e dependência da CDN;
sem animações esqueléticas ou assets PBR produzidos por artistas. Não há benchmark
prolongado em hardware real com hordas. Verificações automatizadas não substituem
playtest humano de balanceamento, áudio e conforto. Próximas melhorias de grande
porte: pipeline de assets, animação de personagens e profiling com hordas reais.
