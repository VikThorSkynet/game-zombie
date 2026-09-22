# Memória persistente — Protocolo Sobreviva v12

Atualização: **21/09/2026 às 20:54:31 — America/Sao_Paulo (UTC−03:00)**.
Branch: `codex/hud-inicio-performance`.
Origem: commit `32d1b06`, branch local `codex/melhorias-modelos-armas-zumbis-mapa`.

## Solicitação e escopo

O usuário autorizou uma nova branch com melhorias de HUD, tela inicial,
carregamento quando necessário e principalmente desempenho, além da atualização
do nome, data, hora e memória do projeto. Esta autorização amplia o escopo da
sessão anterior, que era restrita aos modelos.

Nome atual: **Protocolo Sobreviva — v12**.
HTML atual: `game_version12_21-09-2026_20-54-31.html`.
Substitui `game_version11_21-09-2026_14-16-02.html`, preservado no histórico Git.
A versão10 e os MP3 foram mantidos. O README aponta para o novo HTML.

## Implementação

- Menu inicial com hierarquia visual, grade de comandos e escolha entre
  Automática, Desempenho e Alta. A seleção altera quality na URL e recarrega.
- Tela estática de carregamento visível antes dos módulos; a construção da cena
  cede um quadro ao navegador. Aviso após 20 segundos caso a inicialização não
  termine. Não há porcentagem fictícia nem espera obrigatória pelos MP3.
- HUD oculto no menu; dicas de recarga e troca, alerta quando o carregador tem
  no máximo 20% da capacidade base, indicador de FPS/qualidade e fontes numéricas
  estáveis. Menu adaptável e respeito a prefers-reduced-motion.
- Sem backdrop-filter nos painéis do HUD.
- Qualidade baixa usa renderer.render diretamente e não instancia EffectComposer
  nem os buffers de bloom. Alta/automática em dispositivos adequados mantêm o composer.
- Menu/pausa renderiza apenas quando a cena fica inválida; resize invalida a cena.
  A animação continua agendada, mas não redesenha continuamente a cena parada.
- Medição de FPS usa tempo real do quadro, separado do delta limitado da simulação.
  Isso evita superestimar FPS quando um quadro demora mais de 50 ms.
- HUD tem atualização periódica de até 10 Hz e cache de estado; eventos de combate
  mantêm atualizações imediatas. Contadores de recarga e bônus continuam visíveis.
- Geometrias, dano, colisões, navegação e configurações de armas não foram alterados.

## Validação

- Módulo extraído validado com node --check.
- Chrome headless: início com pointer lock, seletor de qualidade e preview com
  cinco tipos de zumbi; nenhum erro de JavaScript no primeiro passe.
- Medição em menu parado por 1 segundo: versão anterior 22 chamadas a
  renderer.render; nova versão 0. A versão anterior executa mais de um passe
  por quadro, portanto esses valores não equivalem a FPS.
- Capturas inspecionadas em 1440×900 e menu em 390×844, sem overflow horizontal.
- Testes usam instrumentação temporária fora do HTML entregue.

## Limites e continuidade

A redução de trabalho em pausa foi medida; não foi comprovado um percentual de
melhoria de FPS em hordas ou em dispositivos físicos de baixa potência.
A qualidade Desempenho perde bloom intencionalmente. O primeiro quadro ainda
compila shaders; a tela de loading não torna essa etapa paralela.
O jogo ainda depende do CDN e de teclado/mouse. O teste responsivo não representa
suporte a controles de toque. A memória de 14:16:02 permanece como histórico das
integrações de modelos, hitboxes e muzzleLocal, que devem ser preservadas.

Este documento não implica publicação ou merge no GitHub. Consultar os remotos.

## Verificação final

Novo passe no Chrome após a remoção dos buffers: baixa sem composer, alta com
composer; automática inicializa; início captura o mouse e fecha o menu; seletor
recarrega com a qualidade escolhida. Menu parado continua em zero chamadas de
renderização. Nenhum erro JavaScript e sem overflow horizontal em 390×844.
Um carregamento de MP3 foi cancelado durante navegação entre páginas de teste
(ERR_ABORTED), sem falha de JavaScript. node --check e git diff --check passaram.
