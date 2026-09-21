# Memória persistente — modelos de armas, zumbis e cidade

Atualização: **21/09/2026, 14:16:02 — America/Sao_Paulo (UTC−03:00)**.

Branch: `codex/melhorias-modelos-armas-zumbis-mapa`. Base: `8d4288219268ac619ee0f9ecb13d30c0a4e69b1c`.

## Escopo aprovado

O trabalho foi limitado aos modelos visuais de armas, zumbis e cidade. As referências orientaram armas de metal escuro com detalhes mecânicos e madeira, e uma cidade noturna com fachadas de vidro, janelas iluminadas e tons verdes e cinza. Foram preservados combate, navegação, traçado do mapa, colisões e posições dos objetos.

## Arquivo atual

A versão atual é `game_version11_21-09-2026_14-16-02.html`. A versão anterior é `game_version11_07-09-2026_05-34-36.html`. O README aponta para a versão atual.

## Implementação

### Armas

`buildDetailedWeapon(kind, muzzleZ, accentColor)` constrói pistola, shotgun, SMG, sniper, fuzil e Ray Gun. Foram incluídos metal escuro, bordas chanfradas, miras, mecanismos, bocas de cano e carregador curvo. Shotgun e fuzil usam textura procedural de madeira; a Ray Gun mantém seus detalhes de energia.

Os pontos `gun.userData.muzzleLocal` foram preservados: pistola -1.17, shotgun -1.32, SMG -1.02, sniper -1.8, fuzil -1.2 e Ray Gun -1.04 no eixo z; todos usam x=0.28 e y=-0.2. `createPaPWeaponModel` continua gerando as variantes Pack-a-Punch, com três elementos de energia.

### Cidade

`createCityFacade` gera textura e emissão por canvas. `dressCityBuilding` inclui esquadrias, entradas, faixas verdes e contraventamentos. `detailVehicle` inclui vidros, grade, maçanetas e rodas. `baseMapLayout`, dimensões e posições dos bloqueadores de tiros e a navegação foram preservados; detalhes novos não entram como obstáculos.

### Zumbis

`detailZombieModel` inclui roupas, calçados, mangas, detalhes faciais e acessórios aos tipos Normal, Corredor, Bruto, Atirador e Detonador. As sete malhas de acerto — torso, pelvis, cabeça, duas pernas e dois braços — mantêm geometria, posição, escala, raio e referências do sistema de dano. Detalhes dos membros acompanham animação e destruição; rosto acompanha a cabeça; núcleos de Atirador e Detonador continuam disponíveis aos efeitos.

## Verificação

- JavaScript validado com `node --check`.
- Abertura sem interface em `?preview&quality=low` e `?preview&quality=high`, sem erros de JavaScript.
- Seis modelos e seis variantes Pack-a-Punch construídos; pontos de saída idênticos à base e três elementos de energia por variante.
- Geometrias e posições das malhas de acerto de cada zumbi iguais à base.
- `baseMapLayout` e bloqueadores de tiros comparados com aleatoriedade controlada: iguais à base.
- 122 funções fora dos construtores de modelo e configurações iniciais permaneceram intactas.
- `git diff --check` sem problemas.

A instrumentação de inspeção, galerias e câmeras temporárias não pertence ao HTML entregue.

## Desempenho e continuidade

Na cena de comparação com cinco zumbis em qualidade baixa, chamadas de desenho passaram de 418 para 476 e triângulos de 16.655 para 19.143: aproximadamente +13,9% e +14,9%. Isso mede complexidade gráfica, não FPS. Não houve benchmark prolongado com hordas grandes nem validação em celulares.

Use sempre o HTML indicado no README. Preserve `muzzleLocal`, a integração Pack-a-Punch e as referências de membros e núcleos ao modificar os modelos. Ajustes de dano, navegação, layout ou colisões exigem nova decisão de escopo. Atualize esta memória com resultados verificáveis em trabalhos futuros.
