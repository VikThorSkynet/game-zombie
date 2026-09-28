# Memória persistente — P6, v33

28/09/2026 · America/Sao_Paulo · branch `codex/p6-iluminacao-materiais`.
Base v32, commit 860196f. HTML atual: `game_version33_28-09-2026_09-36-10.html`.
Usuário pediu executar P6. AGENTS, README, memória P5 e plano foram consultados.

## Alterações

- Iluminação externa fria, preenchimento ambiente maior, exposição 1,08, bloom
  0,32 com limiar 0,88. Lanterna normal 60, na mira 0,45, mesma posição.
- `surfaceMaps`: mapas separados para cor sRGB e altura/rugosidade lineares.
  Novos tipos asphalt e panel; cache limitado aos oito tipos usados. Mapas 256²,
  geração por semente, materiais compartilhando mapas. Painéis com juntas,
  fixações e manchas; asfalto/concreto com grãos, sujeira e fissuras.
- Fachadas existentes levam paletas e rótulos oeste/quarentena, leste/evacuação,
  norte/logística. Sem geometria adicional de letreiros. Instalação distingue
  luminárias/faixas âmbar das superfícies frias e usa tubulações existentes.
- Contato de carros: quatro grupos de instâncias por setor, textura radial 128².
  Poeira estática: 18 pontos por área com textura compartilhada 128², sem luz nova
  ou trabalho de animação por quadro. Névoa especial e gameplay não foram editados.
- Novos testes/capturas em `tests/environment.cjs`, `docs/captures/p6` e
  `docs/measurements/p6-*`. `tests/smoke.cjs` aceita `QA_GAME_FILE` e `QA_P6_ONLY`.
  `tests/graphics-report.cjs` aceita prefixos para comparar versões sem substituir
  relatórios antigos. Teste da lanterna e cache atualizado para os novos valores.

## Validação visual e limites

Capturas pareadas em baixa/alta: rua, ampliação a 40 m e instalação. Teste compara
todas as colisões, bloqueadores de tiro, hit meshes, luzes e sombras com a v32;
passou nos dois modos. Texturas ambientais novas ficam em 256² ou menos.
Capturas de ampliação fixam FOV/máscara/lanterna; não simulam uma partida.
Veja `docs/P6_ILUMINACAO_MATERIAIS_CENARIO.md` para evidências e custo medido.

29 testes Node, build --check, boot file/HTTP (incluindo exportação e falha CDN)
e smoke completo baixa/alta passaram. Campanha/ambos os finais, reinício, luneta,
P3/P4/P5 e feedback humano continuam passando. Dez ciclos de área e de reinício
mantiveram recursos estáveis. Registros P5 anteriores preservados.

Benchmark P6 concluído em baixa/alta: quatro cenários, três repetições, 1080p,
2 s de aquecimento + 5 s de coleta. Medianas 16,7–16,9 ms, sem quadros >50 ms;
p95 máximo 33,2 ms em baixa e 34,5 ms em alta. Metas de p95 não atendidas em todas
as primeiras amostras; não prometer 60 FPS em partidas prolongadas. Auditoria
com semente fixa mede +4 chamadas na rua e +1 na instalação, sem novas luzes.
Resultados em `p6-after-low/high.json` e agregado `p6-comparison.json`, comparados
com `p5-after-low/high.json` da v32. Capturas em `docs/captures/p6`.

Modelos seguem procedurais estilizados. Próxima implementação: P7 — modelos,
animações e resposta do combate. P8 concentra validação humana prolongada e finais.
Versões anteriores preservadas, inclusive v25 e v32. Nenhum asset externo novo.
