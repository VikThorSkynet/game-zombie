# Memória persistente — Protocolo Sobreviva v25, etapa 7/7

Versão: **24/09/2026 às 08:20:03 — America/Sao_Paulo (UTC−03:00)**.
HTML: `game_version25_24-09-2026_08-20-03.html`.
Branch: `codex/protocolo-contencao`. Base: `d549bf3` (v24).
Histórico: [v24](MEMORIA_PERSISTENTE_23-09-2026_23-17-24.md).
Plano: [Protocolo de Contenção](PLANO_PROTOCOLO_CONTENCAO.md).

## Pedido e entrega

Usuário pediu a próxima etapa. Implementada a etapa 7 aprovada: cadeia de
investigação, chefe em três fases, extração ou sobrevivência infinita.
Commit e envio ao GitHub permanecem autorizados. Nenhuma etapa nova inferida.

- `ContainmentCampaign` centraliza progressão sem referências Three.js:
  registros → componentes → símbolos → núcleo pronto → chefe → escolha
  → infinita ou extração → vitória. Reset limpa toda a cadeia.
- Três registros junto aos geradores, acessíveis após abrir o portão. Locais
  escolhidos entre offsets livres. Coleta com E e validação de proximidade.
  Descobertas únicas aparecem no diário, incluindo a sequência TRIÂNGULO,
  CÍRCULO, QUADRADO. Não dependem de sorteio de arma.
- Instalação contém três componentes (bobina, fusível, regulador), três terminais
  de símbolo e núcleo. Erro de sequência zera somente a entrada. Componentes
  não são consumidos novamente. Coletas não concedem pontos repetíveis.
- Objetos interativos entram na lista de estado por área, enquanto a campanha
  persiste globalmente. Itens coletados ficam ocultos; reinício os restaura.
  HUD/diário indicam o próximo objetivo.
- Núcleo só inicia entre ondas, sem inimigos, defesa ou desafio ativo. Interação
  normal também bloqueia recarga, placa, facada e troca de arma. Ondas suspensas
  por hold 'campaign'; portal bloqueia viagem enquanto chefe/extração ativos.
- Guardião imóvel, modelo humano procedural com placas, núcleo e halo próprios.
  Placas possuem hitboxes de corpo, removidas junto aos demais hitboxes na morte.
  2.400 HP, três fases de 800, escudo inicial/transições de dois segundos.
  Dano não atravessa o limite de fase. Pernas não derrubam o chefe.
- Ataque marca o chão na posição atual do jogador e resolve depois do aviso.
  Raio 3/4/5, aviso 1,55/1,30/1,05 s, dano 20/26/32 antes da armadura. Raio
  contra bulletBlockers verifica paredes na marcação e no impacto. A primeira
  verificação por amostragem de navegação falhou contra parede fina e foi
  substituída; teste da parede agora passa em baixa e alta.
- Fase 2 traz quatro zumbis, fase 3 quatro cães. Reforços finitos, HP 180/120,
  dano e velocidade da onda atual. Não repõe mortos. Munição completa no começo
  e em cada transição. Nuke elimina reforços sem matar chefe; Morte Instantânea
  usa dano normal contra ele. Recompensa fixa de 600 uma vez e uma eliminação
  nas estatísticas. Ainda é necessário limpar reforços para liberar as ondas.
- Depois da vitória, E no núcleo escolhe infinita e dispensa extração.
  Alternativamente, rádio no pátio norte (4,141) inicia extração em intervalo
  livre. Repõe munição, cria quatro zumbis e dois cães ao sul do portão aberto.
  Permanecer a menos de 5 m por 15 s e eliminar todos conclui com tela de vitória.
  Sair pausa o timer sem reset; pausa e morte congelam tudo. Sem helicóptero
  ou nova área externa nesta implementação; o rádio representa o resgate.
- Reinício durante/depois da campanha restaura cidade, campanha, inimigos,
  holds e efeitos. Estado de recordes locais continua conforme a v24.
- Nenhuma dependência ou áudio novo. HTML gerado mantém file:// e HTTP.

## Verificações

- 17 testes Node passaram; classe nova cobre ordem, duplicações, erro recuperável,
  escudo/pausa, limites das fases, extração condicionada e escolha exclusiva.
- Chrome baixa/alta: interação com registros/componentes/painel, transição real,
  bloqueio de início em combate, dano por disparo, imunidade a Nuke/instakill,
  três fases, reforços finitos, recompensa única, pausa, aviso/esquiva/dano,
  paredes finas, viagem bloqueada, limpeza final, extração, morte e reinício.
- Caminhos dos registros e dos reforços de extração verificados. Campanha
  testada via suíte completa; testes adicionais de parede/morte passaram após
  ajuste localizado de linha de visão.
- Suítes anteriores de armas, bônus, colete, economia, diário, geradores, cães,
  névoa, navegação e áreas passaram em baixa/alta. Seis retornos mantiveram
  contagens GPU estáveis: 45 geometrias/28 texturas em baixa, 120/42 em alta
  no ponto de captura dos testes. Não são medidas de heap ou garantia de FPS.
- Boot sem hooks: file:// auto/low/high, HTTP auto e fallback de CDN aprovados.
- Capturas v25 em docs/previews, incluindo chefe nas duas qualidades. Modelo
  revisado para diferenciar as placas sem excesso de brilho da lanterna.

## Limites e continuidade

Sete etapas entregues; dificuldade, economia, tempo para completar a cadeia e
consumo real de munição ainda precisam de playtest prolongado por jogadores.
Boss permanece uma sentinela com ataques de área, com variação de ritmo e
reforços por fase. Não há save em disco da campanha, multiplayer ou assets
externos novos. Próximas alterações devem partir de feedback, sem inventar
uma oitava etapa. Preservar compatibilidade file:// e fonte única de regras.
