# Memória persistente — Protocolo Sobreviva v19, etapa 2/7

Versão: **23/09/2026 às 10:29:08 — America/Sao_Paulo (UTC−03:00)**.
HTML: `game_version19_23-09-2026_10-29-08.html`; regras em `game-systems.mjs`.
Branch: `codex/protocolo-contencao`. Base: `2eab814` (v18/etapa 1).
Histórico: [v18](MEMORIA_PERSISTENTE_22-09-2026_23-09-17.md).
Plano: [Protocolo de Contenção](PLANO_PROTOCOLO_CONTENCAO.md).

## Pedido e escopo

Usuário pediu a próxima etapa. Executar armadura, economia e raridades, testar,
documentar e enviar um commit à branch já aprovada no GitHub VikThorSkynet/game-zombie.
Geradores, porta, cães, interior e campanha continuam nas etapas seguintes.

## Implementação

- `ArmorState`: capacidade inicial 1, proteção 0, reserva 0; 50 de proteção/placa,
  absorção de 60% limitada à proteção restante, excesso integral vai para vida.
  Colete II custa 1500 e III mais 3000; não preenchem proteção. Placa de reserva
  custa 150, limite 5. F leva 1,4 s para aplicar até 50, limitado pela capacidade.
  Reposição parcial consome uma placa; nenhuma é cobrada/consumida ao tentar cheio.
- Enquanto aplica placa pode mover e sofrer dano; tiro, ADS, facada, recarga,
  troca de arma, compras e PaP são bloqueados. Pausa congela; fim/reset cancelam.
  Consumo ocorre somente na conclusão. Modelo de placa/luvas em primeira pessoa,
  progresso, segmentos de proteção, reserva e aviso de quebra no HUD.
- `resetAim` corrigido: restaurava visibilidade de todas as armas. Agora restaura
  apenas o slot ativo quando a ação permite; inserir placa oculta ambos os slots.
- Estações COLETE e ARSENAL na cidade, próximas ao centro em posições livres de
  colisão e distantes das outras máquinas; ambas registradas na navegação e colisão.
  Materiais básicos controlados evitam saturação pela lanterna no modo com bloom.
  E compra placa/raridade; G amplia colete só na estação. Preço/ação exibidos ao aproximar.
- Eliminações pagas: 100 pontos comuns ou 125 por cabeça OU facada, sem acúmulo.
  Pontos Duplos dobra pontos. `ScrapWallet` entrega 3 sucatas por morte paga, máximo
  90/onda; repetir beginRound da mesma onda não renova orçamento. Nuke e explosões
  não pagas não concedem sucata; kill duplicado continua sem qualquer recompensa.
- Raridades na arma individual: comum ×1, incomum ×1,25, rara ×1,55, épica ×1,9,
  lendária ×2,3; custos incrementais 100/200/350/550 (total 1200). Moeda: sucata.
  Melhorar raridade preserva PaP; PaP preserva raridade. Multiplicador comum às balas
  e laser. Ray Gun Especial sem raridade extra, multiplicador de PaP ×2,5 preservado.
- Caixa normal e ON SALE armazenam a raridade sorteada até a retirada. Substituir
  arma substitui a raridade e zera PaP. Probabilidades por onda para comum/incomum/
  rara/épica/lendária: 1–4=75/25/0/0/0%; 5–9=35/45/20/0/0%; 10–14=10/30/50/10/0%;
  15+=5/15/35/35/10%. Nome da raridade no prompt e cor/nome/multiplicador no HUD.
- SMG: 90 ms, 40 balas, dano corporal 32/crítico 56. Shotgun: 8 pellets de 18/36
  (144/288 máximos por disparo antes dos upgrades). Double Tap: intervalo ×0,75.
- Vida base mantém 100+12×onda até a 5; depois 160×1,12^(onda−5) até a 20,
  depois ×1,06^(onda−20). Multiplicador do tipo aplicado antes do arredondamento.
  Velocidade continua limitada na onda 15. Demais preços e Nuke 400/800 preservados.
- Eventos `purchase` (moeda/custo/item) e `plateEquipped`; `playerDamaged` inclui
  proteção absorvida e perda de vida real. Estoque, raridades e sucata zeram no reset.

## Verificação e limites

- Dez testes Node aprovados: regras anteriores, armadura parcial/vazia/cheia,
  reserva máxima, aplicação/pausa/reset, compras sem saldo/no máximo, raridade/PaP,
  Ray Gun, probabilidades por onda, pontos sem empilhar bônus, limite de sucata.
- Chrome baixa/alta: compras por teclas/contexto, locais alcançáveis, bloqueio de
  ações durante placa, absorção e quebra, capacidade sem proteção grátis, estoque,
  gastos de sucata, upgrades PaP+raridade, dano real de bala/laser por raycast,
  pontos/sucata sem duplicação, Nuke, caixas normal/sale, morte/reset. Regressões
  de ondas, sniper/ADS, LOD, facada, munição, bônus e projéteis também aprovadas.
- Capturas `docs/previews/v19-*`: HUD, estações, placa, ADS/luneta, menu e modelos.
  Capturas não sobrescrevem v17: o teste agora deriva o prefixo da versão no README.
- Relatório analítico `node tests/economy-report.mjs`: se todas as mortes pagarem,
  sem Nuke, sucata acumulada permite incomum na onda 4, rara na 7, épica na 11,
  lendária na 17. Na onda 8 são 140 mortes/14000 pontos brutos. Um cenário com
  1 placa/onda, 1 recarga comum a cada 2 ondas, caixa, colete II e PaP deixa 4350.
  Esse cenário não modela recargas caras após PaP, precisão, movimentação ou tempo.
- Valores de combate são iniciais para playtest; não afirmar equilíbrio definitivo
  ou ganho de FPS. Não há novos arquivos de áudio nem sintetizadores.

## Próxima etapa

Etapa 3: geradores acessíveis na cidade, defesa com orçamento finito, primeira
porta energizada e navegação atualizada. Continuar com testes e commit próprios.
