# Memória persistente — planejamento de polimento da v25

Data: **24/09/2026, 08:49:46 — America/Sao_Paulo**.
Versão executável permanece v25: game_version25_24-09-2026_08-20-03.html.
Base: e290f81; branch codex/protocolo-contencao.

Usuário pediu explicitamente um plano de polimento, balanceamento e melhorias
gráficas após concluir as sete etapas anteriores. Foi criado
[o plano P1–P8](PLANO_POLIMENTO_BALANCEAMENTO_GRAFICOS.md), ainda sem implementação.
Um próximo pedido de execução deve começar por P1, medições e roteiro de playtest.

Sequência: medições → correções/clareza → armas/economia → ritmo/campanha →
otimização → luz/materiais/cenário → modelos/animações → consolidação.
Cada etapa futura deverá ter testes, documentação, versão datada e commit/push.
Metas numéricas são propostas condicionadas às medições, não resultados obtidos.

Foram consultados README, memória v25, código de renderização, testes e relatório
econômico existente; node tests/economy-report.mjs executou sem erros. Sua saída
é uma projeção com hipóteses restritas, não um playtest. Referências oficiais
Three.js de LOD, instâncias e sombras constam no plano, com ressalva de versão.

Nenhum código, asset ou valor de gameplay foi alterado neste pedido. Não houve
nova versão HTML nem necessidade de repetir testes de jogo por mudança documental.
Estado técnico da implementação permanece descrito na
[memória v25](MEMORIA_PERSISTENTE_24-09-2026_08-20-03.md).
