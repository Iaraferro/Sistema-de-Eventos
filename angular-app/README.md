# EcoEventos Palmas - Angular

Frontend Angular oficial do sistema EcoEventos Palmas.

## Stack

- Angular CLI 21.2.1
- Angular standalone components
- Angular Router
- Angular Forms
- Bootstrap 5
- Bootstrap Icons
- Vitest

## Estrutura do projeto

```text
angular-app/
|-- public/
|   `-- favicon.ico
|-- src/
|   |-- app/
|   |   |-- core/
|   |   |   |-- constants/
|   |   |   |-- guards/
|   |   |   |-- mappers/
|   |   |   |-- models/
|   |   |   |-- services/
|   |   |   `-- utils/
|   |   |-- features/
|   |   |   |-- admin-access/
|   |   |   |-- admin-dashboard/
|   |   |   |-- admin-events/
|   |   |   |-- admin-participants/
|   |   |   |-- admin-reports/
|   |   |   |-- admin-settings/
|   |   |   |-- admin-shell/
|   |   |   |-- event-detail/
|   |   |   `-- home/
|   |   |-- layout/
|   |   |   `-- public-layout.component.*
|   |   |-- shared/
|   |   |   `-- components/
|   |   |-- app.config.ts
|   |   |-- app.routes.ts
|   |   |-- app.ts
|   |   |-- app.html
|   |   `-- app.css
|   |-- environments/
|   |   |-- environment.model.ts
|   |   |-- environment.ts
|   |   `-- environment.development.ts
|   |-- index.html
|   |-- main.ts
|   `-- styles.css
|-- angular.json
|-- package.json
|-- proxy.conf.json
|-- tsconfig.json
`-- README.md
```

## Responsabilidade das pastas

- `src/app/core`: regras compartilhadas, integração com API, autenticação, guards, contratos e utilitários.
- `src/app/features`: telas e fluxos organizados por domínio.
- `src/app/layout`: layouts base usados pelas rotas públicas e administrativas.
- `src/app/shared`: componentes reutilizáveis entre features.
- `src/environments`: configuração de ambiente e URL base da API.
- `public`: arquivos estáticos publicados pelo build.

## Rotas principais

- `/`: página inicial pública.
- `/eventos/:id`: detalhe de evento.
- `/admin/acesso`: login administrativo.
- `/admin/dashboard`: resumo administrativo.
- `/admin/eventos`: gestão de eventos.
- `/admin/participantes`: usuários e participantes.
- `/admin/relatorios`: consolidação e exportação.
- `/admin/configuracoes`: configurações e cadastro administrativo.

## Scripts

```bash
npm run start
npm run build
npm run test
npm run test:ci
npm run format:check
npm run verify
```

## Status da migração

O build publica apenas os arquivos do Angular.

- a base da API usa `apiBaseUrl: '/api'` em todos os ambientes;
- a autenticação administrativa usa uma única chave local de sessão;
- a equivalência funcional com o legado removido está documentada em `../docs/migracao-angular.md`;
- a pasta `html/` não é mais necessária para o frontend atual.

## Observações

- Nenhum asset local do legado precisou ser migrado para `public/`: a pasta `html/` continha apenas HTML, CSS e JavaScript antigos.
- Para desenvolvimento local, `ng serve` usa `proxy.conf.json` para encaminhar `/api` ao backend em `http://localhost:8080`.
