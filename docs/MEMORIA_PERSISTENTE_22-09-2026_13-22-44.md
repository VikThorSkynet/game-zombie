# Memória persistente — Protocolo Sobreviva v16

Atualização: **22/09/2026 às 13:22:44 — America/Sao_Paulo (UTC−03:00)**.
Branch: `codex/bonus-facada-iluminacao-v16`. Base: `0b3fe4f` (v15).
HTML: `game_version16_22-09-2026_13-22-44.html`.

## Solicitação e decisões

Restaurar posição da lanterna, diminuir intensidade apenas durante ADS; melhorar
detalhes/iluminação do mapa; pesquisar e implementar formatos de bônus inspirados
em Zombies, adicionar facada e compra de munição.

Referências consultadas: guias oficiais de Zombies BO6 (agosto/2024) e BO7
(setembro/2025), links no README. Formas: bomba com aletas, caixa com cartuchos,
caveira, ×2 extrudado e placa de liquidação. Modelos próprios em Three.js, sem
download/importação de assets de terceiros. Não foram adicionadas granadas.

## Implementação

- Lanterna em `(0,-0.2,0)`, alvo `(0,0,-1)`, intensidade 80 fora da mira e
  transição até 0,45 em ADS usando `aimBlend`. Pausa/reset restauram 80.
- Cinco bônus com modelos dourados, halo verde, anel de chão e rótulos.
  Vida 25 s; piscam nos últimos 5 s. No máximo 12 no mapa, sem PointLight por
  bônus. Texturas dos rótulos são compartilhadas e mantidas em cache limitado
  ao vocabulário fixo do jogo; materiais/geometrias dos drops são liberados.
- Coleta horizontal até 2,1 unidades com verificação de obstáculos, somente
  durante partida ativa. Timers de bônus pausam com a partida.
- Nuke não gera drops em cascata e não soma recompensas individuais: 400 pontos
  fixos, dobrados se Pontos Duplos estiver ativo. Eliminações contam nas estatísticas.
- Max Ammo completa todas as armas, preservando reservas que já excedam quatro
  carregadores; encerra recarga em curso. Pack-a-Punch entra no cálculo.
- Insta-Kill e Pontos Duplos duram 30 s. Recoletar renova para 30 s.
- Fire Sale dura 30 s: quatro caixas temporárias em pontos não ocupados pelas
  máquinas, todas ativas simultaneamente, e caixa principal custam 10 pontos.
  Cada caixa temporária tem sorteio independente de 3 s e retirada por 10 s.
  Expiração não cancela tentativas pagas nem remove armas aguardando retirada.
  Caixa principal volta ao custo 950. Reinício limpa todos os sorteios.
- Cinco posições candidatas para depósitos de munição, filtradas por colisão.
  Compra por E abastece apenas a arma ativa; preços 250/1000 para normal/PaP,
  1500/3000 para Ray Gun. Cheio ou saldo insuficiente não cobra. Interação bloqueada
  durante recarga, troca, facada e upgrade. Depósitos sólidos entram na navegação.
- Facada em V: modelo de lâmina e animação de 0,55 s, dano 150, alcance 2,5,
  cone frontal (dot > 0,72) e linha desobstruída. Um alvo por golpe; cooldown impede
  repetição, não gasta munição, respeita Insta-Kill. Bloqueia tiros/recarga/troca
  durante animação e não pode ser iniciada durante essas ações.
- Mapa: 120 fragmentos instanciados, oito barreiras laterais de quarentena com
  colisão, placas, fragmentos agrupados e iluminação nos depósitos (sem sombras).
  As caixas temporárias são objetos visuais interativos sem colisão dinâmica.
- Teclas de gameplay não executam ações enquanto o menu está aberto.

## Verificação e limites

Suíte `tests/smoke.cjs` ampliada para lanterna, compra cheia/sem saldo/upgrade,
Max Ammo, Fire Sale, retirada após expiração, facada por tecla, alcance/cooldown,
Insta-Kill com facada, bloqueio por parede, Nuke e coleta/expiração de drops.
Testes aprovados em Chrome headless nas qualidades baixa e alta, sem erros de
JavaScript. Mantidas verificações de configurações, ADS, pool de efeitos e disparos
dos zumbis. `node --check` do módulo e do teste e `git diff --check` aprovados.
Capturas em `docs/previews/v16-*`: menu, ADS, prancha dos modelos e drops no mapa.
Prancha, drops e ADS inspecionados visualmente. O ajuste final de intensidade
0,45 foi validado depois de uma primeira tentativa de 3 ainda produzir reflexos fortes.

Custos são adaptações para esta economia, não reprodução exata de um título COD.
Não há benchmark prolongado de FPS ou multiplayer. As fontes não substituem
playtest de balanceamento. Histórico: memória da v15 preservada em docs.

## Revisão — 22/09/2026 às 14:27:28

Solicitação: remover munição aleatória, manter três depósitos distantes, aplicar
o MP3 de facada fornecido e ajustar progressão de velocidade e rastejantes.

- Removidos timer, rotina e chamada do spawner automático de caixas comuns.
  O bônus Max Ammo dos zumbis foi preservado, conforme distinção entre os sistemas.
- Depósitos somente em `(-86,0)`, `(86,0)`, `(0,130)`. Teste confirma exatamente
  três, distância mínima 155,87 unidades e caminhos da origem às áreas de acesso.
  A descrição anterior de cinco posições é substituída por esta revisão.
- `facada.mp3` copiado do Downloads informado pelo usuário, SHA-256
  `B11E956FFC12B3A8ED274CF22994AD80848C07CEFCB5B74C945026D001673C1A`.
  Registrado no sistema de preload/áudio e tocado em cada golpe válido com volume
  0,8, respeitando o volume geral. Substitui o som de recarga usado como provisório.
- `getZombieBaseSpeed` limita somente o fator da onda a 15. Variação aleatória,
  diferenças de tipos e progressão de vida/quantidade continuam existentes.
- Lógica das pernas unificada em `applyLegDamage`, usada por bala e laser.
  Ferimentos desaceleram gradualmente; pernas destruídas usam 45% da velocidade
  original em vez de 25%. Dano subsequente não restaura velocidade/postura.
- Arquivos: HTML atual, README, esta memória, `tests/smoke.cjs`, novo MP3.
- Chrome headless baixa/alta aprovados: limite de velocidade em todos os tipos
  (14 < 15 = 100 com mesma variação), três depósitos e rotas, ferimento/rastejar,
  som MP3 decodificado e regressões de bônus, compras, facada, ADS e efeitos.
  Nenhum erro JavaScript. Teste estático garante ausência do spawner automático.
