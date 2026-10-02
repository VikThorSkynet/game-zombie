# Contexto persistente do projeto

Antes de alterar este projeto, leia o README.md e a memória apontada na seção
"Memória persistente". Ela registra o estado atual, decisões aprovadas,
limites de escopo e verificações realizadas.

O arquivo HTML atual também está indicado no README.md. Não escolha a versão
mais antiga apenas por aparecer primeiro na listagem.

Ao encerrar uma alteração, atualize a memória com os fatos verificados, arquivos
afetados, testes realizados e pendências reais. Se o arquivo for renomeado,
atualize os links do README.md. Instruções explícitas do usuário têm precedência.

O jogo deve abrir por dois cliques (file://) e HTTP. Não importe módulos locais
diretamente do HTML: navegadores bloqueiam isso por CORS em file://. As regras
têm fonte única em game-systems.mjs; após alterá-la ou renomear a versão, rode
node scripts/build-game.mjs e confira com --check. Teste a abertura sem hooks com
node tests/boot.cjs, além das regressões de gameplay. Não edite o bloco gerado.

Medições locais têm fonte em telemetry.mjs, também incorporada pelo build.
Não edite o bloco TELEMETRY gerado. P1_ROTEIRO_PLAYTEST.md e P1_RESULTADOS.md
distinguem benchmarks automatizados de partidas humanas; preserve essa distinção.

# Regras do projeto

## Antes de executar qualquer pedido

1. Consulte o estado do Git e as alterações locais. Preserve sempre o trabalho existente.
2. Busque a versão mais recente no GitHub com `git fetch origin --prune`. Use o repositório remoto configurado em `origin` (atualmente `https://github.com/VikThorSkynet/game-zombie.git`). Identifique a branch padrão remota; em tarefas que indiquem uma branch específica, use essa branch.
3. Atualize a base de trabalho com a versão mais recente da branch remota antes de implementar o pedido. Se houver alterações locais, preserve-as e reaplique-as sobre a base atualizada ou use um checkout separado. Nunca descarte alterações nem use `reset --hard` para sincronizar. Não sobrescreva trabalho local ao resolver conflitos.
4. Leia o projeto atualizado antes de implementar: estrutura dos arquivos, instruções aplicáveis, código relacionado ao pedido e configuração de execução e validação. Não se baseie apenas em uma versão antiga disponível no checkout ou no histórico da conversa.
5. Somente depois da atualização e da leitura, execute o pedido do usuário e faça as verificações pertinentes.

Se o GitHub estiver inacessível ou a atualização não puder ser concluída com segurança, informe a limitação antes de implementar. Não apresente o checkout local como a versão mais recente sem confirmar isso no remoto.

Esta regra não autoriza publicar, enviar commits ou descartar alterações do usuário.


## Prévia, ajustes e envio ao GitHub

Ao concluir uma alteração, sempre mostre uma prévia concreta do resultado ao
usuário antes de enviar ao GitHub. Para mudanças visuais, exiba uma captura
ou abra a prévia funcional; para mudanças sem interface, mostre o diff ou
um exemplo verificável do comportamento. Informe as verificações realizadas.

Pergunte se o resultado precisa de ajustes e se pode fazer o commit e enviá-lo
ao GitHub. Aguarde a resposta antes de publicar. Se houver ajustes solicitados,
aplique-os, valide e mostre uma nova prévia antes de pedir autorização de envio.

Uma autorização explícita já dada pelo usuário para o resultado apresentado
vale para o envio correspondente; não solicite a mesma autorização novamente.
Novas alterações fora do escopo aprovado exigem uma nova prévia e autorização.
