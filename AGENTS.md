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
