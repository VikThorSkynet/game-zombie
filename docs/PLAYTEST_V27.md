# Feedback de partidas — v27

24/09/2026 · branch `codex/playtest-progressao-visuais`, base P1 `3a0fe0b`.

## Observações humanas e mudanças

1. **Três geradores na onda 1 mantendo um rastejante:** agora a defesa exige
   terminar a onda inteira. Há limite de um gerador por onda, e cada defesa tem
   duração/orçamento próprios: 30 s/8, 40 s/10, 50 s/12. Cada quarto reforço é cão;
   parte dos demais são corredores. Vida, velocidade e dano usam pelo menos as
   ondas 3, 5 e 7, respectivamente. É preciso matar todos, além de carregar o
   gerador. Recompensa continua 300 pontos, uma vez. Sair do círculo congela carga
   e novos reforços; os já presentes continuam perigosos.
2. **Arquivos, rádio e entrada:** o estado de coleta já avançava para componentes
   após três registros; a viagem exigia intervalo sem inimigos e usava uma mensagem
   genérica para inimigo vivo/ação em andamento. Não foi observada perda dos dados.
   Agora o terminal mantém “COLETADO”, rádio confirma N/3 e orienta a entrada na
   instalação. A porta explica inimigos/rastejantes restantes ou onda em andamento.
   Durante intervalo livre, aproximar-se da porta, rádio ou núcleo mantém a próxima
   onda suspensa; afastar-se libera o cronômetro. Isso evita perder a janela enquanto
   se lê/interage. Registros não viram uma etapa de entrega obrigatória ao rádio.
3. **Cães fáceis e simples:** vida normalizada de 0,65 para 0,95; dano de 1,1 para
   1,45; velocidade adicional 1,7 → 2,45; bote 12 → 13,5 unidades/s. Aviso 0,65 s,
   recuperação 0,8 s, trajetória fixa e um acerto por bote. Cães da campanha têm
   180 de vida. Modelo com quadril/ombros, focinho/nariz/mandíbula, pernas em dois
   segmentos, patas/garras, cauda e pelo. A cabeça leva os elementos da face durante
   a animação. Ferir pernas, desviar e usar obstáculos continuam válidos.
4. **Mais textura e modelagem:** seis pares de mapas procedurais compartilhados
   (cor/relevo) para metal, ferrugem, concreto, tecido, borracha e pelo. Aplicados
   em armas, roupas, cães, veículos, estruturas e equipamentos. Instalação recebe
   tubulações, divisões de painéis e marcações de segurança. UVs de caixas usam
   escala local para evitar esticar a textura em uma parede inteira. Mapas ficam
   em cache limitado, sem geração por inimigo e sem novos downloads.
5. **Ray Gun muito luminosa:** emissividade do modelo 0,65 → 0,25; PaP começa em
   0,28 e pulsa entre 0,15–0,29. Feixe/halo e flash menores; luz de impacto 3 → 1,1,
   alcance 10 → 5, duração 0,25 → 0,15 s. O fade mantém a redução. Dano e precisão
   do disparo não foram alterados.

## Validação funcional

- 22 testes unitários: regras e telemetria.
- Regressão completa de gameplay em Desempenho e Alta, com métricas ligadas:
  compras, munição, raridades/PaP, mira/luneta, navegação, LOD, danos, pausa,
  geradores, cães/névoa, diário, chefe, extração e sobrevivência infinita.
- Novo `tests/playtest-feedback.cjs`: reproduz a tentativa com rastejante na
  onda 1, bloqueio de segundo gerador na mesma onda, defesa mista, coleta por E,
  rádio 3/3, motivo de bloqueio, entrada por E após limpar inimigos, suspensão e
  liberação do intervalo, reset das marcas e brilho inicial/fade/pulso PaP.
- `tests/areas.cjs`: seis idas/voltas mantiveram constantes os recursos GPU
  observados: 45 geometrias/39 texturas em Desempenho; 120/54 em Alta, no cenário
  controlado dessa suíte. Estado da partida, falha de carregamento e cancelamento
  também passaram.
- `tests/boot.cjs`: HTML sem hooks por file:// (auto/low/high), HTTP auto,
  exportação local por file low/HTTP high e apresentação do erro de CDN indisponível.
- Capturas inspecionadas de cães, geradores e instalação, nos modos suportados.

## Medição controlada da versão final

Arquivos completos: [Desempenho](measurements/v27-feedback-low.json) e
[Alta](measurements/v27-feedback-high.json). Chrome headless, 1920×1080, Ryzen 7
5700U/Radeon integrada, três repetições por cenário/modo, aquecimento de 3 s e
coleta de 5 s. Câmera e atores parados; GPU medida com consultas assíncronas.
É uma checagem curta de regressão, não certificação de FPS durante combate.

| Cenário | Modo | Mediana (ms) | p95 entre repetições (ms) |
| --- | --- | --- | --- |
| 24 inimigos na cidade | Desempenho | 16,7–16,8 | 17,1–40,2 |
| 32 inimigos na cidade | Alta | 16,7 | 17,9–38,6 |
| 4 cães | Desempenho | 16,6–16,7 | 17,3–37,5 |
| 4 cães | Alta | 16,7 | 17,0–35,6 |
| Guardião na instalação | Desempenho | 16,7 | 17,1–17,2 |
| Guardião na instalação | Alta | 16,7 | 17,1 |

As primeiras repetições na cidade/caçada tiveram oscilações, registradas em vez
de descartadas. Maior quadro observado: 45,9 ms. Nenhum acima de 50 ms nessas
janelas curtas. A mediana próxima de 60 FPS não garante fluidez constante.
As janelas são menores que as da P1, portanto não declarar ganho percentual.
A referência P1 original não foi substituída.

A contagem de texturas ficou constante nas três repetições de cada cenário:
79/81/27 em Desempenho e 93/95/40 em Alta (cidade/cães/guardião). O mapa de madeira
das armas agora é compartilhado; a suíte adicional confirmou quatro reinícios
sem crescimento de texturas. Detalhes geométricos decorativos aleatórios ainda
podem variar contagens de geometrias entre partidas.

## Limites e próxima comparação humana

O relato humano é qualitativo, sem tempos ou contagens medidos. As regressões usam
teleporte, avanço de tempo e eliminações programadas; não são partidas completas.
O limite impede três geradores na onda 1, mas não prova a meta do portão nas ondas
5–8. Repetir a rota econômica com `?metrics=1&quality=low&route=economia&run=1`
e exportar o JSON, anotando onda/tempo do portão, gasto de munição, mortes por cães
e eventual bloqueio da entrada. Testar também esquiva sem armadura e extração.

Esta é uma primeira revisão visual, ainda procedural e estilizada. Não equivale
a arte AAA final nem remodelagem completa de todos os objetos. Materiais, iluminação,
modelos/animações e a tela inicial continuam nas etapas previstas do plano.
