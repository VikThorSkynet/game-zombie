# Memória persistente — Protocolo Sobreviva v14

Atualização: **21/09/2026 às 22:32:22 — America/Sao_Paulo (UTC−03:00)**.
Branch local: `codex/cidade-destruida-red-dot-v14`.
Origem: `6811418` (v13, `codex/maquinas-perks-armas-v13`).
HTML atual: `game_version14_21-09-2026_22-32-22.html`.

## Solicitação

Criar uma nova branch para corrigir os carros, expandir mapa/cidade, acrescentar
aspecto de destruição, implementar red dot com botão direito, corrigir a munição
no mapa e melhorar os zumbis. Essa autorização permite alterar o layout e a
navegação, ampliando o escopo das versões anteriores.

## Implementação

- Limites externos de 200×200 para 300×300 unidades (2,25 vezes a área nominal).
  Chão, paredes, limite de movimento, área de spawn e grade de navegação acompanham
  a expansão. São 34 prédios (antes 16) e 16 carros (antes 8).
- Novas avenidas laterais e transversais conectam os quarteirões externos.
  `expandCityLayout` roda uma única vez; reiniciar não duplica prédios.
- Fachadas com vidros quebrados, fuligem e fissuras, portas com tábuas, marquises
  inclinadas, ferragens expostas e 180 fragmentos instanciados. Pequenos fragmentos
  são decorativos; quatro pilhas maiores têm colisão e bloqueiam disparos.
- Carros refeitos a partir de perfis extrudados, com para-brisa inclinado, teto,
  colunas, portas, retrovisores, pneus, cubos, grade e ferrugem. Removidas as antigas
  janelas sobrepostas. Mantido o volume de colisão 2,5×2×4,5 por veículo.
  Apenas um terço dos carros usa um farol SpotLight; os demais têm lentes opacas.
- Red dot: segurar botão direito aproxima a visão de 75° para 55°, alinha o modelo
  com a ótica e exibe um ponto vermelho central. Reduz oscilação e dispersão a
  35% da original ao concluir a transição. Dano e cadência permanecem intactos.
- Mira bloqueia sprint e é suspensa na recarga/troca/upgrade; volta se o botão
  continua pressionado. Soltar o botão, perder foco, ocultar a aba, pausar ou
  reiniciar limpa o estado. Esc também solicita explicitamente sair do pointer lock.
- Ótica tem vidro transparente preservado no Pack-a-Punch; materiais marcados
  `keepOptic` não recebem a conversão de camuflagem nem pulsação emissiva.
- Munição: caixa militar, ferragens, cartuchos, rótulo legível, rotação lenta e
  oscilação de 2,5 cm. Surge entre 12 e 42 unidades do jogador, em ponto livre e
  com caminho na grade. Fallback raro usa o local atual do jogador.
- Coleta por distância horizontal de até 2,2 unidades e linha desobstruída;
  concede dois carregadores à reserva de cada arma equipada. Sem coleta em game over.
- Zumbis: pele manchada, olhos menores, face/orelhas/mãos mais detalhadas, roupas
  rasgadas, alcance de braços e oscilação limitada da cabeça (corrige deriva
  cumulativa). Detalhes agrupados por material em cada membro preservam animação
  e destruição dos membros. Os cinco tipos e as sete malhas de acerto permanecem.

## Validação

Teste em Chrome headless, qualidades baixa e alta, sem erro de JavaScript:

- 34 prédios, 16 carros e limite interno 149 confirmados.
- Rotas calculadas do centro até oito pontos nos extremos/quarteirões novos.
- Doze amostras de spawn de munição livres e com caminho; coleta adiciona a
  quantidade esperada; uma caixa atrás de parede não é coletada.
- Botão direito real no navegador ativa o red dot e zoom; desvio medido da ótica
  em relação ao centro inferior a 1 pixel em 1440×960.
- Soltar botão e pressionar Esc restauram mira/FOV. Testes adicionais cobrem
  suspensão durante recarga e troca de arma e retomada com o botão segurado.
- Comparação com v13: atributos de vida/raio e geometrias/posições/escalas das
  sete hitboxes dos cinco tipos de zumbi preservados. MuzzleLocal e três peças de
  energia das seis armas Pack-a-Punch preservados; vidro da ótica transparente.
- Capturas de cidade, modelos e mira revisadas. Instrumentação e iluminação de
  inspeção são temporárias; não fazem parte do jogo.
- `node --check` no módulo extraído e `git diff --check`.

## Limitações e continuidade

O mapa maior acrescenta geometria e aumenta a grade. Fragmentos instanciados e
agrupamento estático reduzem chamadas, mas não há afirmação de aumento de FPS:
não foi realizado benchmark prolongado com hordas. Os modelos continuam
procedurais estilizados. O jogo requer teclado/mouse e Three.js via CDN.

Esta atualização foi solicitada para uma branch nova. Este documento não implica
push, PR ou merge. As versões anteriores permanecem no histórico Git.
