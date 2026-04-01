# Estado Atual do Frontend

## Contexto
- O frontend oficial do projeto está em `angular-app/`.
- O legado em HTML, CSS e JavaScript puro foi removido do build e do repositório.
- O inventário da migração e a equivalência funcional estão documentados em `docs/migracao-angular.md`.
- O backend continua sendo consumido via `/api`.

## Direção atual
- Evoluir somente o app Angular.
- Manter Bootstrap e Bootstrap Icons como base visual.
- Centralizar autenticação, guards, serviços e configuração de ambiente dentro da estrutura Angular.
- Preservar mapeamentos explícitos entre contratos da API e modelos de tela.

## Validação mínima esperada
- `npm run format:check`
- `npm run build`
- `npm run test:ci`

## Observações
- O frontend público e administrativo já está coberto por rotas Angular.
- O cadastro de administrador permanece dentro da área autenticada, em `Configuracoes`.
- Se houver necessidade de ajustes no backend, isso deve ser tratado como etapa separada.
