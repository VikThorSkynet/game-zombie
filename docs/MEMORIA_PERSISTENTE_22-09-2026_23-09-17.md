# Memória persistente — Protocolo Sobreviva v18, etapa 1/7

Versão: **22/09/2026 às 23:09:17 — America/Sao_Paulo (UTC−03:00)**.
HTML: `game_version18_22-09-2026_23-09-17.html`.
Branch: `codex/protocolo-contencao`. Base: `53b6260` (v17).
Histórico: [v17](MEMORIA_PERSISTENTE_22-09-2026_22-34-52.md).
Plano: [Protocolo de Contenção](PLANO_PROTOCOLO_CONTENCAO.md).

## Pedido e autorização

Executar o plano por etapas, testar e criar um commit de cada etapa. O usuário
confirmou GitHub `VikThorSkynet/game-zombie` após a menção ambígua a Slack.
Usar uma branch nova para implementação. Não confundir infraestrutura entregue
com geradores, cães, armadura ou campanha prontos; estes são etapas posteriores.

## Etapa 1 implementada

- Regras imutáveis em `game-systems.mjs`: ondas, atributos de inimigos, custos
  de caixa/PaP/munição, multiplicadores de PaP, facada e bônus. Os atributos,
  recompensas e preços da v17 foram preservados para a revisão econômica da etapa 2.
- `WaveDirector` centraliza início, spawn confirmado, orçamento, conclusão e intervalo.
  Total por onda continua 4 + 3×onda; máximo simultâneo 24 (qualidade baixa) ou 32.
  Spawn inválido aguarda e tenta novamente sem consumir orçamento. Adaptador recusa
  posições bloqueadas e a menos de 20 unidades do jogador.
- Intervalo de dez segundos com HUD e N para antecipar; pausa congela cronômetros.
  Conclusão e avanço únicos. Holds separados para suspensão total e bloqueio de
  avanço estão disponíveis para geradores e carregamento nas próximas etapas.
- Eventos escalares e imutáveis de início/fim de onda, disparo, dano a inimigo,
  eliminação (causa/cabeça/recompensa), dano ao jogador, fim e reinício de partida.
  Subscribers são registrados uma vez e têm função de remoção. Sem histórico ilimitado.
- Guard de eliminação impede pontos, drops e eventos duplicados. Dano publicado
  registra a vida efetivamente retirada, limitando overkill. Nuke/explosão têm causas próprias.
- HTML renomeado e título corrigido; README aponta ao módulo obrigatório e versão atual.
  Documentação anterior preservada para consulta.

## Verificação

`node --test tests/systems.test.mjs`: cinco testes aprovados, incluindo simulação
de 100 ondas, spawn recusado, limite simultâneo, última morte, transição única,
holds sobrepostos, pausa, antecipação, reset e eventos removíveis/imutáveis.

`tests/smoke.cjs`: Chrome headless baixa/alta aprovados, sem erros de JavaScript.
Integração confirma limites 24/32, dano e morte únicos por facada, intervalo de
dez segundos, pausa, N bloqueado no menu e avanço para onda 2 por teclado.
Regressões anteriores de ADS/luneta, LOD, munição, bônus, obstáculos, tiros inimigos,
áudio MP3 e pool de efeitos aprovadas. Sintaxe do módulo/HTML/teste e `git diff --check`
aprovados. Acesso ao CDN do Three.js autorizado para a suíte de navegador.

Limites: não há benchmark prolongado, nova economia calibrada ou persistência de partida.

## Próxima etapa

Armadura, economia e raridades. Seguir a ordem do plano, com testes e commit próprios.
