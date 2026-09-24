# Memória persistente — Protocolo Sobreviva v22, correção de abertura

Versão: **23/09/2026 às 13:15:17 — America/Sao_Paulo (UTC−03:00)**.
HTML: `game_version22_23-09-2026_13-15-17.html`.
Branch: `codex/protocolo-contencao`. Base: `5578917` (v21/etapa 4).
Histórico: [v21](MEMORIA_PERSISTENTE_23-09-2026_12-47-58.md).

## Relato e causa reproduzida

Usuário informou carregamento infinito e confirmou que abre por dois cliques.
A captura mostrava o HTML local da v21. No Chrome sem instrumentação, reproduzido:
import de `file:///.../game-systems.mjs` bloqueado por CORS/origem null, antes do
init. O aviso antigo sugeria conexão lenta, embora a falha fosse no módulo local.
Os testes anteriores cobriam HTTP e não detectavam esse caminho de abertura.

## Correção

- Removido import local de regras do HTML. `scripts/build-game.mjs` incorpora o
  conteúdo de `game-systems.mjs` no mesmo módulo inline do jogo, retirando somente
  os modificadores export. Mantém fonte única e comportamento das regras.
- Bloco delimitado gerado; `--check` falha se estiver desatualizado. A suíte smoke
  executa essa verificação antes de abrir o navegador. AGENTS registra o fluxo.
- HTML pode abrir diretamente com MP3 na mesma pasta. Fallback de áudio nativo
  para file:// já existia e foi preservado. HTTP continua usando Web Audio.
- Mensagem de falha e botão TENTAR NOVAMENTE substituem carregamento indefinido
  em erro de inicialização/dependências ou timeout de 20 s. Listeners de boot são
  removidos após init/render bem-sucedidos, sem interferir nos erros de gameplay.
- Título/menu/README apontam v22. O Three.js continua vindo de CDN: internet ainda
  necessária. Esta correção não é uma distribuição completamente offline.

## Verificação

- Antes da correção, `tests/boot.cjs` falhou e registrou explicitamente o bloqueio
  CORS de game-systems.mjs. Teste usa o HTML original, sem exportar hooks QA.
- Depois: file:// em auto/low/high abriu menu, iniciou operação, criou canvas e
  reproduziu MP3 local nativo; HTTP/auto abriu e iniciou. Sem erros de página.
- Bloqueio simulado da CDN exibiu botão de nova tentativa e removeu a animação
  de carregamento. Não foi necessário desabilitar segurança do navegador.
- Build sincronizado, sintaxe e diff aprovados. Todos os 13 testes Node e a suíte
  Chrome baixa/alta passaram: ondas, cães/névoa, geradores/porta, combate, armadura,
  raridades, munição, bônus e ADS/LOD. Sem novos erros JavaScript.

## Continuidade

Etapas 1–4 permanecem entregues; não começou a etapa 5. Próxima entrega: interior
separado, carregamento e preservação de estado. Preservar suporte a dois cliques
nas próximas versões e orientar uso do HTML atual apontado no README.
