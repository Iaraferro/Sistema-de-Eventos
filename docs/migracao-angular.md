# Migração Angular

## Objetivo

Registrar o inventário do frontend legado removido e sua equivalência funcional no app Angular.

## Resultado

- O build Angular não publica mais `html/` em `dist/`.
- Nenhuma rota HTML antiga continua empacotada.
- Não havia assets locais reutilizáveis em `html/`; apenas HTML, CSS e JavaScript legados.

## Mapeamento de equivalência

| Legado removido | Papel no sistema antigo | Equivalência no Angular | Status |
| --- | --- | --- | --- |
| `html/index.html` | Página inicial pública | `src/app/features/home/*` + `src/app/layout/public-layout.component.*` | Coberto |
| `html/script.js` | Listagem pública e navegação para detalhes | `src/app/features/home/*` + `src/app/shared/components/event-card.component.*` | Coberto |
| `html/evento.html` | Detalhe do evento | `src/app/features/event-detail/*` | Coberto |
| `html/evento.js` | Carregamento da página de detalhe | `src/app/features/event-detail/*` + `src/app/core/services/eventos-api.service.ts` | Coberto |
| `html/cadastro-admin.html` | Cadastro de administrador sem sessão | `src/app/features/admin-access/*` orienta o acesso e `src/app/features/admin-settings/*` executa o cadastro autenticado | Coberto com melhoria de segurança |
| `html/painel-admin.html` | Painel administrativo único | `src/app/features/admin-shell/*` + dashboard, eventos, participantes, relatórios e configurações | Coberto e modularizado |
| `html/admin.js` | CRUD administrativo, participantes, relatórios e configurações | `src/app/features/admin-dashboard/*`, `admin-events/*`, `admin-participants/*`, `admin-reports/*`, `admin-settings/*` | Coberto |
| `html/api-service.js` | Cliente HTTP e token JWT | `src/app/core/services/api-client.service.ts` | Coberto |
| `html/auth-service.js` | Login, logout e perfil | `src/app/core/services/auth.service.ts` | Coberto |
| `html/evento-service.js` | Operações de eventos | `src/app/core/services/eventos-api.service.ts` + `src/app/core/services/eventos-admin.service.ts` | Coberto |
| `html/arquivo-service.js` | Upload e download de arquivos | `src/app/core/services/arquivos-admin.service.ts` | Coberto |
| `html/style.css` | Estilos globais do legado | `src/styles.css` + estilos por feature e layout | Coberto |

## Observações de paridade

- Home pública: coberta.
- Detalhe do evento: coberto.
- Login administrativo: coberto.
- Dashboard administrativo: coberto.
- Gestão de eventos: coberta.
- Participantes: coberto com a mesma estratégia atual baseada em `GET /usuarios`.
- Relatórios: cobertos com exportação TXT e JSON.
- Cadastro de administrador: coberto em `Configurações`, agora restrito à sessão autenticada.

## Observações de arquitetura

- A migração removeu o acoplamento com páginas HTML avulsas.
- A navegação administrativa passou de uma página monolítica para rotas dedicadas no Angular.
- A autenticação administrativa agora é guardada por guards e serviço próprios do app Angular.
