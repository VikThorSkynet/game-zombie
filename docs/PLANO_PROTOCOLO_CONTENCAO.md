# Protocolo de Contenção — execução por etapas

Pedido aprovado: implementar os itens 1, 2, 4, 6, 7, 8 e 10 do plano discutido,
um por vez, testar e criar um commit por etapa. Destino confirmado pelo usuário:
https://github.com/VikThorSkynet/game-zombie.git. Branch: `codex/protocolo-contencao`.

O mapa atual permanece a área principal. Valores econômicos são propostas para
playtest; não considerar o conjunto inteiro entregue por existir infraestrutura.

| Etapa | Entrega | Estado |
|---|---|---|
| 1 | Balanceamento central, eventos de combate, controlador de ondas | Concluída e testada na v18 |
| 2 | Armadura, revisão econômica e raridades | Concluída e testada na v19; balanceamento inicial |
| 3 | Três geradores, primeira porta e navegação dinâmica | Pendente |
| 4 | Cão, rodadas especiais e névoa variável | Pendente |
| 5 | Instalação separada, carregamento e preservação de estado | Pendente |
| 6 | Objetivos, desafios e diário | Pendente |
| 7 | Easter egg, chefe e extração | Pendente |

## Decisões de jogo aprovadas

- Três geradores acessíveis desde a cidade inicial; uma defesa por vez, de 25/35/45 s
  conforme ordem de ativação. Sair pausa o progresso. Sem custo inicial, sem vida
  própria do gerador nesta primeira implementação, recompensa única de 300 pontos.
- Todos concluídos energizam a primeira porta, aberta com E sem custo adicional.
  Meta de acesso entre ondas 5 e 8. Eventos têm orçamento finito, sem farm por repetição.
- Armadura: capacidade inicial de uma placa vazia, 50 de proteção por placa,
  absorção inicial de 60%, reposição 150 pontos; capacidade 2/3 por 1500/3000.
  Reposição tem animação e bloqueia disparos; movimento permitido.
- Sucata para raridade: comum ×1, incomum ×1,25, rara ×1,55, épica ×1,9 e lendária
  ×2,3; custos incrementais 100/200/350/550. Pack-a-Punch separado; Ray Gun especial.
  Rever cadência da SMG, dano total da shotgun, recompensas e interação dos upgrades.
- Proposta econômica: 100 por morte, 125 no total por cabeça OU faca, 300–600 em
  objetivos; impedir recompensa duplicada. Não transformar ajustes em números finais
  sem medir disponibilidade de pontos, gasto de munição e tempo para abrir áreas.
- Primeiro turno de cães na onda 5; próximos a cada 5–6. Cães quadrúpedes próprios,
  bote anunciado, recuperação, vida ~65% do zumbi, limite simultâneo 4 a 8,
  somente nesses turnos inicialmente. Último cão garante Munição Máxima.
  MP3 de cães ainda não fornecido; não reintroduzir áudio sintetizado.
- Névoa variável a partir da onda 8: transição gradual, alcance visual alvo 25–35 m,
  menos inimigos simultâneos, sem Atiradores, sem eventos especiais consecutivos.
- Manter limite de velocidade na onda 15. Intervalo entre ondas de 10 s, tecla N
  para antecipar. Número total e limite simultâneo são conceitos separados.
- Cidade abre setores sem loading; interior pode carregar à parte entre ondas,
  fora de objetivos ativos. Preservar inventário, vida, onda, pontos e progresso;
  descarregar recursos não compartilhados; falha de carga recupera área anterior.
- Um objetivo secundário por vez. Desafios adequados ao equipamento/onda, recompensa
  limitada, falha opcional não trava história. Recordes locais sem bônus permanente de dano.
- Easter egg: geradores → três registros → componentes → painel de símbolos → núcleo
  → chefe em três fases → extração ou sobrevivência infinita. Sem arma obrigatória da caixa.

## Verificação por etapa

Regras determinísticas em Node e integração Chrome nas qualidades baixa e alta.
Verificar pausa, reinício, recompensas únicas e regressões dos sistemas anteriores.
Nas etapas próprias, testar bloqueio/abertura de portas e caminhos, dano/placas,
conclusão de turnos especiais, retornos entre áreas e ausência de crescimento de
memória após várias trocas. Medir tempo de progressão e consumo de munição antes
de afirmar que a campanha está balanceada.
