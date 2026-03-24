# Migracao do Frontend para Angular 21

## Contexto
- O frontend atual esta em HTML, CSS e JavaScript puro na pasta `html/`.
- O backend Quarkus em `code-with-quarkus` permanece em `main` e nao deve sofrer alteracoes nesta iniciativa.
- A migracao sera incremental, mantendo o legado ativo durante a fase publica.
- O objetivo e preservar Bootstrap como base visual e estrutural do sistema.

## Objetivo Geral
- Criar um novo app Angular 21 em paralelo ao frontend legado.
- Migrar primeiro apenas a experiencia publica:
  - home com listagem de eventos
  - detalhe do evento
- Pausar obrigatoriamente ao final da fase publica para validacao manual do usuario.
- Migrar a area administrativa apenas apos autorizacao explicita.
- Implementar guards, JWT e demais protecoes por ultimo.

## Regras de Execucao
- Trabalhar somente neste repositorio.
- Nao alterar o backend nem seus contratos nesta fase.
- Nao iniciar a parte administrativa antes do aceite da fase publica.
- Quebrar o trabalho em tarefas pequenas e verificaveis para evitar loops e retrabalho.
- Nao espalhar `fetch`, `localStorage` e URLs hardcoded no novo app Angular.
- Centralizar configuracoes de API em `environment` e `proxy`.
- Preferir mapeamentos explicitos entre contrato da API e modelos de tela.

## Fases
### Fase 1 - Bootstrap Angular
- Criar `angular-app/` em paralelo ao legado.
- Configurar Angular 21 com standalone components.
- Instalar e integrar Bootstrap e Bootstrap Icons.
- Configurar `environment`, proxy local e base de estilos globais.

### Fase 2 - Integracao Publica
- Criar modelos `ApiEvento` e view models da interface.
- Implementar servico HTTP para:
  - listar eventos
  - buscar evento por id
  - resolver URL de imagens/arquivos
- Remover fallback publico em `localStorage`; a API passa a ser a fonte de verdade.

### Fase 3 - Interfaces Publicas
- Implementar rota `/` para a home publica.
- Implementar rota `/eventos/:id` para a pagina de detalhe.
- Reproduzir estados de loading, vazio e erro.
- Manter paridade visual com o layout atual baseado em Bootstrap.

### Fase 4 - Build e Validacao
- Executar build do Angular.
- Validar navegacao publica e consumo da API real.
- Parar o trabalho e aguardar o usuario validar manualmente.

### Fase 5 - Area Administrativa
- Migrar `cadastro-admin` e `painel-admin` para Angular.
- Reorganizar servicos e fluxos de CRUD e upload.
- So iniciar esta fase com autorizacao explicita do usuario.

### Fase 6 - Autenticacao e Protecao
- Implementar `AuthService`.
- Tratar `POST /auth` como resposta `text/plain`.
- Adicionar persistencia do token.
- Adicionar `HttpInterceptor` e guards administrativos.
- Deixar esta fase por ultimo.

## Estrutura de Tasks
1. Criar branch dedicada e documentacao da migracao.
2. Bootstrapar o app Angular 21.
3. Configurar Bootstrap, icons, styles e proxy.
4. Criar modelos, mappers e servicos publicos.
5. Implementar home publica.
6. Implementar detalhe do evento.
7. Rodar build e checks da fase publica.
8. Pausar para validacao manual.
9. Migrar a area administrativa.
10. Implementar JWT, interceptor e guards.

## Critrios de Aceite
- O app Angular deve compilar sem erros.
- A home deve listar eventos reais consumidos da API.
- O detalhe deve carregar por rota Angular e refletir os dados reais.
- O layout publico deve manter identidade visual equivalente ao legado.
- O legado deve permanecer disponivel ate o aceite da nova fase publica.
- A migracao administrativa so comeca apos autorizacao do usuario.

## Observacoes Importantes
- A branch desta iniciativa e `codex/migration-angular`.
- O backend continua sendo consumido diretamente da `main`.
- Se houver necessidade de ajustes no backend, isso deve ser tratado como uma etapa separada e nao faz parte desta entrega.
