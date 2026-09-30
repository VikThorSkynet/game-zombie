# Beretta M9 e Thompson II — v34

Base: **v33** de `origin/main`, commit `c46ffa1`, baixado do GitHub em 30/09/2026.
HTML atual: `game_version34_30-09-2026_16-53-32.html`.

Beretta M9 substitui a pistola inicial. Thompson II substitui a SMG sorteada pelas
caixas normais e de Liquidação. Ambas preservam o sistema atual de raridade,
Pack-a-Punch, dano, munição, recarga, sons, sprint, movimento reduzido e mira.
A Thompson segue o balanceamento P3: carregador de 40, intervalo de 80 ms e dano
corporal de 40. A campanha e o cenário P6 não foram alterados.

## Distribuição e fontes

Fontes fornecidas pelo usuário:

- `41-pistol-beretta/Pistol Beretta/Beretta Pistol.fbx` e texturas PNG.
- `95-thompson-ii/Thompson II/M1A1 Thompson II.blend`, com texturas embutidas.

Os GLBs de desenvolvimento ficam em `assets/weapons`. O build incorpora seus
bytes em base64 no HTML. A abertura por dois cliques usa `GLTFLoader.parseAsync`
e texturas em URLs blob; não faz requisições de arquivos locais por CORS.
O Three.js continua exigindo internet, como na v33.

Reexportação com Blender 4.5 ou posterior:

```powershell
blender --background --factory-startup --python tools/convert_weapon_assets.py -- --beretta-dir "C:\Users\numbe\Downloads\41-pistol-beretta\Pistol Beretta" --thompson-dir "C:\Users\numbe\Downloads\95-thompson-ii\Thompson II"
node scripts/build-game.mjs
node scripts/build-game.mjs --check
```

Não edite o bloco `EMBEDDED WEAPON ASSETS` diretamente. As fontes originais ficam
intactas. A conversão remove o cenário de apresentação e o carregador extra da
Thompson, limita subdivisões, simplifica malhas densas e agrupa partes estáticas
por material. Texturas ficam em até 1024 pixels.

| Modelo | Triângulos do GLB | Tamanho | Primitivas por material |
|---|---:|---:|---:|
| Beretta | 9.646 | 2.499.712 bytes | 1 |
| Thompson | 69.117 | 5.784.816 bytes | 8 |

O HTML distribuído tem aproximadamente 11,5 MB por incorporar os dois modelos.
Cada instância possui suas próprias geometrias e materiais; as texturas ficam
compartilhadas com o cache. Descartar uma arma, reiniciar ou melhorar no PaP
preserva o cache. Mapas normal/metallic/roughness são mantidos no PaP.

## Enquadramento e validação

`weaponAssetPlacements` define posição e altura da mira. O grupo externo conserva
as animações atuais. O nó `MuzzleSocket` marca a saída real do cano; o red dot usa
o mesmo contrato `optic`/`sightY` das armas procedurais.

Prévias pelo servidor:

- Beretta: `?preview&quality=high`.
- Thompson: `?preview&weapon=smg&quality=high`.

Verificação específica:

```powershell
node tests/weapon-assets.cjs
```

Aceita `PLAYWRIGHT_MODULE`, `CHROME_PATH` e `QA_SCREENSHOTS`, como os testes existentes.
Confere carregamento dos dois assets, instâncias independentes, tiro, recarga,
mapas PBR no PaP, alinhamento da mira, posição do cano e recursos estáveis após
oito reinícios, em Desempenho e Alta. As capturas de ambas as armas com/sem mira
ficam em `docs/captures/weapons`.

Build `--check`, 29 testes Node, boot sem hooks em file/HTTP e smoke completo
passaram. O smoke cobre ambas as caixas, raridade, PaP, campanha, finais,
trocas de área, luneta, pausa, reset e cache de recursos. Capturas e regressões
automatizadas não representam um playtest humano prolongado nem garantem FPS.
