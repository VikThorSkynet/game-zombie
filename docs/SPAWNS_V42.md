# V42 — prédios de spawn e barricadas

Base: `origin/main`, commit `d94516e`. Branch: `codex/building-spawns-v42`.
HTML: `game_version42_15-10-2026_18-44-03.html`.

## Comportamento

- Os 34 prédios da cidade atual receberam entradas com cinco tábuas e um espaço interno para surgimento dos inimigos. A disposição da v41 é preservada.
- Cada onda na cidade seleciona quatro entradas distintas. Prioriza até 45 unidades de distância horizontal da saída, com mínimo de 12; completa com entradas mais distantes se necessário e verifica caminho até o jogador.
- A seleção fica fixa até o fim da onda. Nenhum spawn acompanha a posição do jogador durante a rodada.
- Um inimigo por porta quebra as tábuas, com 1,2 segundo por peça. Só atravessa após remover todas. O seguinte aguarda a passagem e mais 0,8 segundo.
- Tábuas persistem entre rounds, inclusive em prédios que deixam de estar ativos. Reiniciar restaura todas.
- Segurar E olhando para a entrada, a até 3,6 unidades, repara uma tábua por 0,8 segundo. Não concede pontos. Atacantes ou ocupação da passagem bloqueiam o reparo.
- Tábuas e paredes bloqueiam tiros. Vãos permitem atingir os modelos animados dentro do prédio, com as hitboxes existentes.
- Luz âmbar discreta e os MP3 de vozes locais sinalizam atividade. Não há novo som sintetizado; impactos na madeira ficam silenciosos porque não existe MP3 dedicado.
- O jogador continua bloqueado pelo volume do prédio. A saída dos inimigos tem permissão própria. Drops de mortes internas são colocados na saída acessível.

As regras ficam em `game-systems.mjs`; a apresentação e os estados de entrada ficam em `building-entrances.mjs`. O build incorpora as duas fontes no HTML para suportar HTTP e file://.

## Integração com a versão atual

O `WaveDirector` continua sendo a autoridade de população, intervalos, limites simultâneos, tentativas e fim de onda. Um pedido de spawn só é confirmado após o inimigo entrar em uma porta disponível. A seleção de prédio é equilibrada pelo número já liberado por cada entrada.

Normais, corredores, brutos e atiradores usam as portas. O Detonador e as caçadas com cães já existentes também foram integrados, preservando seus atributos, modelos e regras após a saída. Cães permanecem sem vozes humanas substitutas. Atiradores e detonadores só começam seu comportamento externo após concluir a travessia.

Reforços específicos de geradores e campanha mantêm seus próprios encontros. A instalação mantém seus pontos internos de spawn, pois não tem os prédios da cidade. A navegação externa existente é reutilizada, assim como a progressão, o diário, os desafios, as opções e a economia da main.

O intervalo padrão já era de dez segundos e foi preservado, incluindo N para antecipar e as pausas de interação com terminais/campanha. Pausa e morte congelam as novas ações. Trocas de área mantêm as barricadas da cidade.

## Avisos e intervalo

Após a prévia, o usuário apontou sobreposição entre a contagem e o desafio. Os avisos centrais agora compartilham um fluxo vertical: gerador, painel de preparação e mensagens temporárias. A preparação agrupa o número da próxima onda, os segundos e a tecla N; o desafio aparece abaixo de um divisor, com título e meta separados. O estado de espera substitui a contagem quando uma interação impede o avanço.

A posição e os espaçamentos se adaptam a telas menores. O desafio desaparece junto com o painel ao começar o combate, e o menu oculta os avisos. Não há mudança nas regras de recompensa, prioridade de alertas ou antecipação por N. `tests/announcements.cjs` verifica a geometria real dos avisos, transições e ausência de corte/sobreposição.

## Estrutura e desempenho

As fachadas têm abertura real e paredes para bloquear tiros. A colisão sólida do prédio continua válida para o jogador e a navegação externa. O LOD simplificado usa o mesmo recorte de entrada. Decoração que encobriria o vão é removida antes do agrupamento das malhas.

Quatro luzes fixas são reutilizadas entre as entradas ativas; não é criada uma luz por inimigo ou por golpe. Alterar tábuas invalida as sombras estáticas. O número total de inimigos e os limites de qualidade continuam controlados pelas regras atuais.

## Verificação

Com Node:

```sh
node scripts/build-game.mjs
node scripts/build-game.mjs --check
node --test tests/building-spawns.test.mjs tests/systems.test.mjs tests/telemetry.test.mjs tests/weapons.test.mjs tests/pacing.test.mjs
```

Com Playwright disponível, usando as mesmas variáveis opcionais do README:

```sh
node tests/building-spawns.cjs
node tests/announcements.cjs
node tests/boot.cjs
node tests/smoke.cjs
```

O teste de barricadas serve uma resposta instrumentada apenas para a automação. O HTML distribuído não expõe hooks. Ele verifica entradas reais, alcance, caminhos, seleção fixa, tiros/tábuas, reparo bloqueado, drops, saída dos tipos, pausa, persistência, reset e ciclo completo de ondas. Salva capturas em `docs/captures/v42`.

Resultado desta entrega: 35 testes unitários, integração de barricadas em baixa/alta e boot por arquivo/HTTP aprovados. A regressão completa em baixa/alta passou na implementação dos spawns. Após a organização dos avisos, regras, boot e barricadas foram revalidados, além de sete viewports do novo layout nas duas qualidades. Build sincronizado e diff sem erros de whitespace.

Os testes são controlados; não representam partida humana, ritmo balanceado ou benchmark de FPS. Valores de proximidade, quebra e reparo continuam sujeitos a playtest.
