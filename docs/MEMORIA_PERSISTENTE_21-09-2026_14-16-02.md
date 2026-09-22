# Memória persistente — modelos de armas, zumbis e cidade

Atualização: **21/09/2026, 14:16:02 — America/Sao_Paulo (UTC−03:00)**.
Repositório: https://github.com/VikThorSkynet/game-zombie
Branch de trabalho: `codex/melhorias-modelos-armas-zumbis-mapa`.
Revisão de origem: `8d4288219268ac619ee0f9ecb13d30c0a4e69b1c` (main no início deste trabalho).

## Estado e decisões aprovadas

O usuário solicitou uma branch dedicada a melhorar somente os modelos das
armas, zumbis e mapa. O plano foi aprovado explicitamente antes da implementação.
Foram fornecidas duas referências visuais: armas com metal escuro, detalhes
mecânicos e madeira; cidade noturna com fachadas envidraçadas, janelas iluminadas
e elementos em tons verdes e cinza.

O plano aprovado preserva tipos de arma e inimigo, posições do mapa, colisões,
navegação e configurações de combate. As referências orientam os modelos; a
cidade não é uma reprodução integral da imagem, pois mantém o traçado e os
volumes existentes. Não foi solicitado criar novos tipos de arma.

Na cópia inicial não havia README.md, AGENTS.md nem documento de memória
persistente versionado. A implementação foi orientada pelo código e histórico.
Esta documentação passa a registrar o contexto para as próximas sessões.

## Arquivo principal e versionamento

- Arquivo anterior: `game_version11_07-09-2026_05-34-36.html`.
- Arquivo atual: `game_version11_21-09-2026_14-16-02.html`.
- O número version11 foi mantido; a data e hora do nome foram atualizadas a
  pedido do usuário. O conteúdo visual validado não foi alterado pelo rename.
- `game_version10_01-06-26.html` e os dez MP3 originais permanecem preservados.
- README.md aponta para o HTML atual e para esta memória; AGENTS.md orienta a
  leitura desses documentos antes de novos trabalhos.

As alterações foram preparadas para publicação na branch acima. A presença
deste documento no GitHub não implica merge em main. Consulte as referências
remotas e o histórico do Git para saber o estado efetivo da publicação.

## Implementação dos modelos

### Armas

`buildDetailedWeapon(kind, muzzleZ, accentColor)` constrói os modelos, usando
geometria procedural. As seis funções públicas de criação continuam presentes:
`createWeapon`, `createSecondaryWeapon`, `createSMG`, `createSniper`,
`createAssaultRifle` e `createRayGun`.

Foram acrescentados metal escuro, bordas chanfradas, miras, pinos, mecanismos,
bocas de cano e carregador curvo. Shotgun e fuzil usam madeira com textura gerada
em canvas. A Ray Gun conserva detalhes de energia. Mãos e punho continuam
integrados ao modelo em primeira pessoa.

`gun.userData.muzzleLocal` conserva os pontos originais, todos com x=0.28 e y=-0.2:

| Arma | z |
| --- | ---: |
| Pistola | -1.17 |
| Shotgun | -1.32 |
| SMG | -1.02 |
| Sniper | -1.8 |
| Fuzil | -1.2 |
| Ray Gun | -1.04 |

`createPaPWeaponModel` continua funcionando com todas as seis fábricas e seus
três elementos de energia. Não foram alterados dano, munição, cadência, dispersão,
recarga, penetração ou regras de compra e melhoria.

### Cidade

`createCityFacade` produz texturas de superfície e emissão em canvas, com
janelas distribuídas por um gerador determinístico local. As fachadas cobrem
as quatro faces dos edifícios, substituindo as antigas janelas individuais.

`dressCityBuilding` adiciona esquadrias, entradas, faixas de cor verde e
contraventamentos em parte dos edifícios. `detailVehicle` acrescenta vidros,
grade, maçanetas e detalhes de rodas aos carros.

`baseMapLayout`, dimensões e posições dos bloqueadores de tiros e a navegação
foram preservados. Detalhes decorativos não são registrados como obstáculos.
A iluminação geral e os sistemas existentes de postes e faróis permanecem com
suas regras originais.

### Zumbis

`detailZombieModel` aplica roupas, calçados, mangas, detalhes faciais e
acessórios aos tipos Normal, Corredor, Bruto, Atirador e Detonador.

As sete malhas usadas pelos tiros — torso, pelvis, cabeça, duas pernas e dois
braços — preservam suas geometrias e posições. Nomes, escala, raio e referências
usadas pelo sistema de dano continuam os mesmos. A aparência de alguns desses
componentes muda por troca de material.

Os detalhes de braço e perna são filhos dos membros, acompanhando animação e
ocultação de membros destruídos. Mandíbula, olhos e boca são anexados à cabeça
com preservação da transformação inicial, para acompanharem sua animação.
Os núcleos do Atirador e do Detonador continuam acessíveis aos efeitos originais.

## Verificação realizada

As verificações abaixo foram realizadas antes do rename, sobre o mesmo conteúdo
HTML, comparando com a revisão de origem quando aplicável:

1. Extração do módulo JavaScript e validação com `node --check`.
2. Abertura no Chrome sem interface com `?preview&quality=low` e
   `?preview&quality=high`, sem erros de JavaScript.
3. Construção dos seis modelos e das seis variantes Pack-a-Punch; pontos de
   saída idênticos à base e três elementos de energia em cada variante.
4. Comparação das geometrias e posições das sete malhas de acerto de cada tipo
   de zumbi, além de escala e raio: iguais à base.
5. Comparação de `baseMapLayout` e dos bloqueadores de tiros do mundo, incluindo
   geometria, posição e rotação, com aleatoriedade controlada: iguais à base.
6. Comparação textual: 122 funções fora da construção dos modelos e todas as
   configurações iniciais permanecem intactas.
7. `git diff --check` sem problemas e revisão visual das capturas.

O teste de comparação foi executado com um servidor HTTP local e Playwright.
Uma instrumentação temporária expôs objetos do módulo apenas na página de teste.
Essa API, as galerias e as alterações temporárias de câmera/iluminação não fazem
parte do HTML entregue. Os scripts de inspeção ficaram no espaço de trabalho
temporário, fora do repositório; não existe uma suíte npm configurada neste projeto.

## Desempenho e limites da validação

No passe direto da cena de comparação com cinco zumbis, em qualidade baixa:

| Medida | Base | Modelos atualizados |
| --- | ---: | ---: |
| Chamadas de desenho | 418 | 476 |
| Triângulos | 16.655 | 19.143 |

O aumento foi de aproximadamente 13,9% nas chamadas e 14,9% nos triângulos.
Esses números representam complexidade de renderização, não FPS. Não houve
benchmark prolongado com grandes hordas, validação em celulares ou teste de
uma partida completa em todos os dispositivos.

Os MP3 e a dependência existente do Three.js 0.160.0 via CDN foram mantidos.
O jogo requer internet para carregar a biblioteca externa.

## Continuidade

- Usar o HTML indicado no README.md, evitando editar a versão10 por engano.
- Preservar `muzzleLocal`, a integração Pack-a-Punch e as referências de membros
  e núcleos ao alterar novamente os modelos.
- Tratar ajustes de dano, navegação, layout e colisões como mudança de escopo
  em relação ao trabalho visual aprovado nesta sessão.
- Se houver queixa de desempenho, medir primeiro em uma partida com mais
  zumbis e no dispositivo afetado; não inferir FPS a partir da contagem de triângulos.
- Atualizar esta memória com os resultados reais de próximos trabalhos e
  corrigir o link do README.md caso o documento seja renomeado.
