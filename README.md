# EcoEventos Palmas

Sistema web para divulgação e gestão de eventos ambientais em Palmas-TO, com frontend oficial em Angular.

## Stack oficial

- Frontend: Angular 21
- UI: Bootstrap 5 + Bootstrap Icons
- Testes de frontend: Vitest
- Backend consumido pelo frontend: API HTTP em `/api`

## Estrutura do repositório

```text
Sistema-de-Eventos/
|-- angular-app/
|-- docs/
|   `-- migracao-angular.md
|-- Agente.md
`-- README.md
```

## Funcionalidades atuais

- Página inicial pública com eventos futuros e realizados.
- Página de detalhe do evento.
- Login administrativo com JWT.
- Dashboard administrativo.
- Gestão de eventos com upload e download de arquivos.
- Gestão operacional de participantes baseada em `GET /usuarios`.
- Relatórios com exportação TXT e JSON.
- Cadastro de administrador dentro da área autenticada.

## Desenvolvimento local

No frontend Angular:

```bash
cd angular-app
npm run start
```

O app usa `proxy.conf.json` para encaminhar `/api` ao backend local em `http://localhost:8080`.

## Qualidade e validação

No frontend Angular:

```bash
npm run build
npm run test:ci
npm run format:check
npm run verify
```

## Status da migração

- O frontend legado em `html/` foi mapeado e removido do build.
- A equivalência funcional foi registrada em [docs/migracao-angular.md](docs/migracao-angular.md).
- O app Angular é a fonte oficial das rotas públicas e administrativas.
- Nenhuma página HTML antiga deve continuar publicada após o build atual.
