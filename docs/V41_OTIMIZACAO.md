# Versão 41 — combate, diário e geradores

Base: v40, `7cf866a`. Branch: `codex/versao-41`.

## Custos encontrados

O nascimento de cada zumbi importado também construía um corpo procedural que
ficava invisível. Havia clonagem de materiais por personagem e cálculos dos
limites do esqueleto no primeiro uso. Os disparos criavam e descartavam efeitos
e luzes pontuais; cada triângulo recalculava vértices animados compartilhados
com triângulos vizinhos. Esses custos podem causar picos durante o combate.

A v41 remove o corpo invisível, compartilha materiais por variante, prepara
recursos no carregamento da cidade e da instalação e reutiliza efeitos com
duas luzes fixas. Os vértices são calculados uma vez por consulta de tiro,
preservando os triângulos reais e as regiões de dano. A câmera é sincronizada
sem atualizar as matrizes da cidade inteira a cada disparo.

## Medição local controlada

`tests/v41-performance.cjs`, Chrome headless, qualidade baixa, oito modelos
criados e trinta consultas contra as mesmas 34 malhas. As duas versões foram
medidas sequencialmente, sem outras suítes de navegador rodando.

| Custo de CPU | V40 | V41 |
| --- | ---: | ---: |
| Criação de zumbi, mediana | 2,8 ms | 2,1 ms |
| Criação de zumbi, p95 | 11,5 ms | 7,3 ms |
| Consulta de tiro, mediana | 4,5 ms | 1,8 ms |
| Consulta de tiro, p95 | 9,6 ms | 5,3 ms |

Nesta amostra, a mediana da criação caiu 25% e a da consulta de tiro caiu 60%.
Resultados brutos: [antes](v41-performance-before.json) e
[depois](v41-performance-after.json). Os tempos variam entre execuções.
O teste não mede FPS, latência de GPU, duração completa de um disparo ou uma
partida humana. Para avaliar travadas no computador do jogador, use também
a opção MEDIÇÕES do menu durante uma partida e exporte os resultados.

## Mudanças visíveis

- Carga do gerador no topo central, com brilho e arco elétrico, percentual e
  orientação curta. Animação respeita movimento reduzido.
- Diário com duas páginas, objetivos em etapas, descobertas e recordes.
  J abre e pausa; J/Esc fecha; CONTINUAR retoma a partida.
- Desafio anunciado durante o intervalo e ativado na próxima onda sem aceite.
  Recompensa única de 300 pontos; não completar não tira recursos.
- Barricadas com pintura e pequenas placas físicas com setas, sem textos
  flutuantes. Nomes de terminais ficam nas próprias superfícies.
- Geradores 20% maiores, com identificação na carcaça. Arquivos são folhas
  espalhadas no chão e desaparecem ao recolher.

## Capturas

[Gerador e carga](captures/v41/generator-high.png),
[diário](captures/v41/journal-high.png),
[desafio entre ondas](captures/v41/challenge-high.png) e
[barricada sem texto flutuante](captures/v41/signage-high.png),
[diário em tela pequena](captures/v41/journal-compact-high.png).

Os testes injetam ferramentas de inspeção apenas na resposta de teste.
O HTML distribuído não contém essas ferramentas.
