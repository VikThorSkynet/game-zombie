# Plano de polimento, balanceamento e melhorias gráficas

Data: **24/09/2026, 08:49:46 — America/Sao_Paulo**.
Revisão: **24/09/2026, 08:58:45 — America/Sao_Paulo**.
Base: v25, commit e290f81, branch codex/protocolo-contencao.
Status: P1 implementada na v26. v27, branch `codex/playtest-progressao-visuais`,
aplica o feedback humano abaixo; P4–P8 permanecem pendentes.
P2.1 implementada na v28, branch `codex/p2-polimento-jogabilidade`.
P2.2 implementada na v29, branch `codex/p2-tela-inicial`: tela inicial com câmera
independente, fundo estático, opções agrupadas, instruções, créditos e teclado.
P3 implementada na v30, branch `codex/p3-armas-e-economia`; comparação analítica
e limites em [Armas e economia](P3_ARMAS_E_ECONOMIA.md).
Próxima entrega: **P4 — ritmo, inimigos, campanha e chefe**.
Referência automatizada e limitações: [resultados P1](P1_RESULTADOS.md).
Partidas humanas de balanceamento seguem o [roteiro P1](P1_ROTEIRO_PLAYTEST.md).

## Feedback humano aplicado na v27 — 24/09/2026

O usuário relatou três geradores na onda 1 com rastejante, dúvida/bloqueio no rádio
e na porta após coletar registros, cães fáceis, falta de texturas/modelagem e luz
excessiva da Ray Gun. O pedido autoriza antecipar os ajustes correspondentes:

- P2.1: confirmação persistente de coleta, rádio com contagem e instrução da
  instalação, motivo específico de bloqueio e intervalo mantido perto da entrada.
- P4: defesa só após limpar a onda, um gerador por onda, 30/40/50 s e 8/10/12
  reforços mistos; cães mais resistentes, rápidos e perigosos, mantendo aviso/esquiva.
- P6/P7: primeira biblioteca de superfícies de metal, ferrugem, concreto, tecido,
  borracha e pelo; detalhe industrial e revisão da anatomia/face/patas dos cães.
- Brilho da Ray Gun reduzido no modelo, PaP, pulso, feixe, flash e luz de impacto.

Evidências, limites e próximos playtests: [validação v27](PLAYTEST_V27.md).
A v25 e a referência P1/v26 ficam preservadas. Esta entrega não conclui a direção
AAA nem a remodelagem integral. A nova tela inicial foi entregue na P2.2/v29.

## Objetivo e limites

Melhorar clareza do combate, ritmo de progressão, identidade visual e estabilidade.
Pedido adicional: reformular a tela inicial e buscar o melhor acabamento possível,
usando jogos AAA como referência de qualidade de apresentação e experiência.
Essa ambição orienta todo o ciclo, não apenas a quantidade de efeitos gráficos.
Não equivale a prometer escala de produção, conteúdo ou fidelidade de um grande
estúdio no motor e formato atuais. Os resultados serão avaliados por evidências.
Manter a cidade como área principal, instalação separada, abertura file:// e HTTP,
somente MP3, preferências de acessibilidade e as sete etapas de campanha existentes.
Cada entrega implementada terá testes, versão datada, memória atualizada e commit
enviado ao GitHub. Este plano não muda a versão executável nem inicia a implementação.

A direção artística proposta é uma cidade em quarentena à noite: exterior frio,
luzes de emergência quentes e instalação industrial. Guardião, cães e objetos
interativos devem ser reconhecíveis pela forma e movimento, além da cor.
Evitar brilho estourado, escuridão que esconda ameaças e efeitos sobre a mira.

## Direção de qualidade inspirada em AAA

- Identidade consistente: título, tipografia, paleta, menus, HUD, cenário,
  criaturas, armas e efeitos devem parecer partes do mesmo jogo.
- Apresentação cinematográfica com controle: composição, iluminação dirigida,
  transições discretas e ambientação, preservando resposta imediata aos comandos.
- Combate com peso: mãos/arma, animação, impacto, reação do alvo e áudio MP3
  sincronizados. Mais partículas não substituem uma reação bem animada.
- Mundo convincente: escala coerente, materiais distintos, marcas de uso,
  objetos apoiados no chão e ambientes que contem visualmente o ocorrido.
- Som com intenção: níveis consistentes, prioridade para perigos, transições
  entre menu e jogo e variação usando arquivos disponíveis. Novas gravações
  MP3 só entram com origem/licença verificáveis; ausência fica documentada.
- Usabilidade e estabilidade: carregamento compreensível, opções acessíveis,
  partida responsiva, sem travamentos ou efeitos escondendo informações.

Antes de expandir a arte por todo o mapa, produzir em P5 uma amostra representativa:
uma rua, uma arma, um zumbi e um trecho da instalação, com a proposta do menu.
Comparar composição, materiais, animação, legibilidade e custo em baixa/alta.
Registrar decisão e ajustes em capturas/vídeo e relatório; então expandir em P6/P7.
Validar o fluxo de assets na versão atual do motor e na abertura por dois cliques.
Recursos procedurais podem ser aprimorados ou substituídos seletivamente por
modelos/texturas originais ou licenciados, com orçamento de memória e carregamento.
Não adquirir pacotes nem migrar motor automaticamente para perseguir o rótulo AAA.

## Evidências da base

- Já existem LOD para prédios/carros, qualidade automática, renderização sem
  pós-processamento no modo baixo, pool de impactos e animação distante reduzida.
- Já existem névoa comum/especial, três fases do guardião e extração finita.
  Esses sistemas serão revisados, não tratados como funcionalidades ausentes.
- Há 17 testes de regras e integração em baixa/alta. Isso comprova cenários
  controlados, não diversão, dificuldade justa ou fluidez em todo computador.
- O relatório econômico atual modela hipóteses fixas e não inclui todos os
  bônus, reforços, precisão real e munição aprimorada. Seu saldo não é uma
  medição de partida. Atualizar a análise antes de mudar vários preços.
- FPS em capturas automatizadas não é benchmark do computador do jogador.

## Ordem de execução

### P1 — Medições e roteiro de playtest

Implementação entregue: coleta opcional local, exportação JSON, janela de desempenho
reiniciável, testes de métricas e de integração, cenário reproduzível com três
repetições por qualidade e computador de referência identificado. A v25 foi preservada.
Esta entrega não certifica economia/dificuldade: tempos reais de campanha, precisão
e sensação por jogadores ainda exigem as partidas humanas descritas no roteiro.

Entregas:
- Capturar tempo por onda, mortes/causa, precisão, tiros por eliminação,
  gasto/ganho de pontos e sucata, placas usadas e compras.
- Registrar chegada ao portão, instalação, núcleo, chefe e extração.
- Medir tempo de quadro mediano e percentil 95, travadas acima de 50 ms,
  draw calls, triângulos, resolução interna e contagens de recursos.
- Usar relatório local exportável, sem enviar telemetria a serviços.
- Fixar resolução, qualidade, computador/GPU/navegador e rota. Separar CPU,
  GPU e carregamento quando houver suporte de medição; declarar limitações.

Validação: três repetições por cenário (cidade tranquila, limite de inimigos,
caçada/névoa e chefe), após aquecimento. Comparar no mesmo hardware e qualidade.
Testes automatizados de regras complementam partidas reais; não substituem
avaliação humana de dificuldade e sensação. Registrar dúvidas para playtest.

### P2 — Correções, tela inicial e experiência de uso

P2.1 entregue na v28: corrige as armas iniciais sobrepostas após reiniciar,
retira temporizadores de troca/avisos que sobreviviam à pausa ou à partida,
preserva ocultação da arma durante PaP, mostra atividade atual e última ameaça,
explica bloqueios de interação, reduz distância das placas de registros e exige
confirmação explícita antes da sobrevivência infinita. Recuperação de inimigo
preso valida caminho até o jogador. Casos e testes na
[memória da entrega](MEMORIA_PERSISTENTE_24-09-2026_22-24-29.md).

Entregas:
- Revisar pausa, reinício, retorno de área e mensagens atrasadas de outra partida.
- Revisar colisões, tiros/ataques através de paredes, inimigos presos e
  feedback quando falta um inimigo para terminar uma defesa.
- Separar no HUD onda comum, defesa, chefe e extração; dar prioridade a avisos
  de perigo sobre notificações secundárias.
- Melhorar prompts de E, indicar por que uma ação está bloqueada e manter
  próximos passos claros no diário. Reduzir placas sobrepostas no cenário.
- Tornar a escolha irreversível por sobrevivência infinita explícita antes
  da confirmação no jogo. Restaurar corretamente foco e captura do mouse.

Tela inicial (entrega própria P2.2, após correções P2.1):
- Redesenhar composição, título e identidade de Protocolo Sobreviva com um
  fundo da cidade em quarentena: enquadramento cuidado, luzes de emergência
  e névoa discreta. Animação lenta opcional; versão estática ou simplificada
  em Desempenho, movimento reduzido ou quando o orçamento exigir.
- Hierarquia clara: JOGAR em destaque; OPÇÕES, COMO JOGAR, DIÁRIO/RECORDES
  e CRÉDITOS em segundo plano. Mostrar versão de forma discreta.
- Não oferecer CONTINUAR PARTIDA como se existisse save em disco. Retomar
  permanece restrito à partida ativa pausada. Explicar reinício quando necessário.
- Organizar opções em gráficos, áudio, controles e acessibilidade; manter
  volume, sensibilidade, sensibilidade de mira quando implementada e movimento
  reduzido, com descrições úteis. Informar quando uma opção exige recarregar.
- Melhorar apresentação do carregamento com etapas reais e progresso quando
  mensurável; sem percentuais fictícios. Falhas devem indicar causa conhecida
  e permitir nova tentativa. Menu deve responder antes de todos os extras visuais.
- Fazer a entrada na partida com transição curta e dispensável, sem atrasar
  controles. Áudio começa após gesto do usuário e respeita volume/mudo.
- Aplicar a mesma linguagem visual à pausa, diário, derrota e extração.
  Feedback de seleção, hover e foco consistente; mouse e teclado funcionais.
- O fundo do menu não avança ondas, objetivos ou estatísticas. Evitar simular
  uma partida inteira escondida só para produzir o fundo.

Aceite específico do menu: primeira ação evidente, textos legíveis em 720p e
1080p, opções alcançáveis por teclado, ausência de cortes/sobreposição, mudo
respeitado, modo reduzido sem câmera em movimento, início/reinício sem dupla
ativação e boot file:// preservado. Medir também o custo do menu em P1/P5.

Validação: morte e reset em cada estado; ações repetidas; troca de qualidade;
resoluções 1280×720 e 1920×1080; teclado; movimento reduzido; file:// e HTTP.
Aceite: nenhuma falha bloqueadora conhecida nos cenários documentados.

### P3 — Armas, armadura e economia

Entregue na v30: seis armas (inclui o fuzil existente), atributos com fonte única,
queda de dano por distância, abastecimento específico, matriz antes/depois e
projeções de rotas. Preços de placas/coletes/raridades/PaP e recompensas foram
revisados e mantidos. Validação humana das metas provisórias permanece pendente;
a rota otimista de objetivos ainda projeta PaP na onda 5.

Entregas:
- Comparar pistola, SMG, shotgun, sniper e Ray Gun nas ondas 1/5/10/15/20,
  incluindo corpo/cabeça, raridades e PaP.
- Medir cenários de precisão de 35%, 60% e 85% como hipóteses de análise,
  sem rotulá-los como habilidade medida de jogadores.
- Dar função clara a cada arma: economia inicial, cadência, proximidade,
  precisão e poder especial; evitar uma opção superior em todas as situações.
- Rever custos de munição, placas, colete, raridades e PaP em conjunto.
- Verificar se contratos e geradores aceleram demais compras ou se munição
  absorve toda a renda. Preservar recompensas únicas e limites de sucata.
- Alterar uma família de parâmetros por comparação, registrando antes/depois.

Metas provisórias para playtest: primeira raridade entre ondas 3–5,
primeiro PaP entre 7–10 num percurso focado em economia. Não são desbloqueios
por onda nem garantias; ajustar após P1. O jogador deve ter escolhas de compra
e meios viáveis de progredir com equipamento comum.

### P4 — Ritmo, inimigos, campanha e chefe

Entregas:
- Rever duração de ondas e intervalo; manter antecipação voluntária.
- Preservar limite de velocidade e distinguir total de inimigos do limite
  simultâneo. Corrigir dificuldade criada por surgimentos injustos.
- Rever aviso, alcance e recuperação do cão; névoa deve limitar visão sem
  ocultar ataques próximos ou avisos essenciais.
- Revisar acesso ao portão com alvo inicial de ondas 5–8, sem bloqueio artificial.
- Dar leitura distinta às fases do guardião: preparação visual do ataque,
  transição de escudo e reforços. Evitar resolver dificuldade apenas com HP.
- Comparar chefe com equipamento comum e aprimorado; testar alvo provisório
  de 90–180 s de confronto total. Se necessário, ajustar vida uma vez no início,
  com limites explícitos, sem aumentar a vida durante a luta ou anular upgrades.
- Rever extração nas ondas baixas e altas; seus reforços hoje herdam dano e
  velocidade da onda. Garantir desafio finito e possibilidade clara de esquiva.

Validação: percurso inteiro com equipamento inicial e ao menos duas combinações
aprimoradas; nenhum item obrigatório de caixa; mortes justificáveis; zero farm
infinito de objetivos. Metas de tempo ficam sujeitas ao playtest.

### P5 — Orçamento gráfico e otimização

Entregas:
- Partir dos maiores custos medidos em P1; evitar otimizações sem evidência.
- Expandir LOD onde houver ganho e reduzir trocas visíveis de detalhe.
  Respeitar luneta: a imagem ampliada precisa manter alvos legíveis.
- Agrupar ou usar instâncias em objetos repetidos compatíveis, separando
  por setor para não desenhar um mapa inteiro quando só parte está visível.
- Reaproveitar geometrias, materiais e efeitos. Reduzir sombras distantes e
  limitar luzes dinâmicas; atualizar sombras conforme os objetos que mudam.
- Preservar colisões, navegação e hitboxes ao simplificar só a representação.
- Auditar liberação de recursos em morte, reset e troca de área.
- Definir limites de tamanho de modelos/texturas, luzes, partículas e sombras
  para a amostra de qualidade antes da expansão. Medir ganho visual e custo.

Metas provisórias no PC de referência a identificar em P1: modo Desempenho
com mediana próxima de 60 FPS e p95 de quadro até 25 ms; Alta com mediana
próxima de 45 FPS e p95 até 33 ms, em 1080p de saída. Não são promessas para
qualquer hardware. Registrar também resolução interna para evitar mascarar
perda de nitidez. Dez idas/voltas e reinícios sem crescimento contínuo de recursos.

### P6 — Iluminação, materiais e cenário

Entregas:
- Rever exposição, contraste, bloom e lanterna para preservar detalhes das
  armas, rostos e metal; melhorar contato visual dos objetos com o chão.
- Criar variações leves e repetíveis de asfalto, concreto, metal, ferrugem
  e sujeira. Preferir recursos procedurais incorporáveis ao HTML inicialmente.
- Onde trouxer ganho visível, avaliar texturas de superfície, relevo aparente
  e rugosidade adequadas à iluminação; manter escala e densidade de detalhe
  coerentes. Validar carregamento local e memória antes de adotá-las no mapa.
- Dar identidade a quarteirões com fachadas, sinalização, carros e pequenos
  conjuntos de destroços. Preservar rotas, largura de corredores e marcos.
- Diferenciar instalação com painéis, tubulações e iluminação de emergência.
- Usar fumaça localizada e partículas discretas dentro do orçamento; manter
  separadas névoa atmosférica e névoa de rodada especial.

Validação: pares de capturas nas mesmas posições em baixa/alta e com luneta;
enxergar ameaças e objetos interativos; nenhuma alteração acidental de colisão.
Modo baixo deve preservar a direção artística mesmo com menos efeitos.

### P7 — Modelos, animações e resposta do combate

Entregas:
- Melhorar silhueta e proporções de zumbis/cães; variar roupas sem multiplicar
  materiais desnecessariamente.
- Dar ao guardião aparência própria de armadura industrial e núcleo de energia.
- Revisar especialmente mãos e armas próximas da câmera, rostos/silhuetas,
  articulações e ligação entre animações. Priorizar o que o jogador vê de perto.
- Melhorar caminhada, bote, reação ao acerto, morte e transição de fases.
- Revisar armas em primeira pessoa: recarga, recuo, facada, troca e ADS;
  preservar alinhamento da sniper e o comportamento de movimento reduzido.
- Harmonizar partículas, hitmarkers, impacto e MP3 disponíveis. Eventos
  sem gravação adequada continuam sem áudio sintetizado.
- Verificar que sons de menu não competem com disparos/perigos e que impactos,
  recargas e passos disponíveis correspondem ao momento visual da ação.

Validação: hitboxes acompanham o modelo em todas as poses; dano ocorre no
momento correto; efeitos não cobrem alvos; limites de efeitos e recursos
permanecem estáveis em combate prolongado.

### P8 — Consolidação e versão de polimento

Entregas:
- Repetir o roteiro P1 e comparar métricas, economia e capturas.
- Rodar sessões prolongadas de 30 minutos, campanha até extração e alternativa
  infinita, registrando resultados reais e eventuais limitações.
- Consolidar presets Automática/Desempenho/Alta e instruções de uso.
- Executar regressões de sistemas afetados e, na entrega final, toda a suíte,
  incluindo boot original, falha da CDN e sincronização das regras.
- Atualizar versão, README, memória, relatório antes/depois e pendências.
- Revisar a experiência inteira, da abertura à vitória, com a mesma direção
  artística. Registrar a diferença entre melhorias entregues e ambições futuras,
  sem apresentar a denominação AAA como certificação ou resultado automático.

Aceite: zero bloqueadores conhecidos; campanha concluível; recompensas únicas;
sem vazamento contínuo nos cenários medidos; visual legível nos dois presets.
Se orçamento de desempenho falhar, reduzir o custo do efeito responsável
antes de liberar. Não anunciar campanha balanceada sem dados de partida.

## Fluxo por entrega

P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8.
Métricas e controles de desempenho acompanham todas as etapas.
Uma etapa por vez: implementar, testar, documentar, commit e push. Mudanças
grandes dentro de uma etapa podem ser divididas em commits verificáveis.
Não estimar prazo fechado antes das medições e dos primeiros playtests.

## Fora deste ciclo

Novos mapas grandes, multiplayer, save da campanha, novas árvores de progressão,
reflexos em tempo real, névoa volumétrica pesada e migração do motor.
Podem ser avaliados depois, com custo e benefício próprios. Assets selecionados
podem entrar no ciclo após validação de licença, compatibilidade e desempenho;
compras de pacotes e expansão de escopo não estão implícitas no plano.

## Referências técnicas

- [Three.js LOD](https://threejs.org/docs/pages/LOD.html): níveis por distância
  e limiar de troca para evitar oscilação.
- [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html):
  instâncias compartilham geometria/material para reduzir draw calls.
- [Three.js LightShadow](https://threejs.org/docs/pages/LightShadow.html):
  custo da resolução das sombras e controle de atualização.

Documentação consultada como referência conceitual. A implementação deverá
validar APIs na versão 0.160.0 usada pelo jogo; não atualizar a biblioteca
implicitamente para corresponder à documentação atual.
