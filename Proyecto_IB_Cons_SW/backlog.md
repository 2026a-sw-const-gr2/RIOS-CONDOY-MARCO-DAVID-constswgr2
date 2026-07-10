# Backlog — EPN Event Manager

Tablero: **Kanban** (GitHub Projects + GitHub Issues)
Repositorios cubiertos: `backend` (epn-event-manager) y `frontend` (subscription-manager)

## Tickets iniciales

| ID | Tipo | Repositorio | Título | Prioridad | Estado |
|---|---|---|---|---|---|
| EEM-1 | Technical Debt | backend | Eliminar cascada if/else de `EventsService.registerEvent` (God Method) | Alta | ✅ Hecho |
| EEM-2 | Technical Debt | backend | Unificar 4 entidades create/update/delete/query en una sola tabla de eventos | Alta | Backlog |
| EEM-3 | Bug | backend | `findAll` ordena eventos por comparación de strings heterogéneos de fecha | Alta | ✅ Hecho |
| EEM-4 | Task | backend | Sanitizar y validar parámetro `entity` en `findByEntity` | Media | ✅ Hecho |
| EEM-5 | Feature | backend | Reactivar documentación Swagger/OpenAPI en runtime | Media | Backlog |
| EEM-6 | Task | ambos | Configurar pipeline de CI (lint → build → test → coverage) | Alta | ✅ Hecho |
| EEM-7 | Task | backend | Elevar cobertura de pruebas unitarias al 80% en módulo eventos/suscripciones | Alta | ✅ Hecho (events: 95.7%) |
| SUB-1 | Technical Debt | frontend | Separar `app.js` en módulos: render, estado, API, utilidades | Alta | Backlog |
| SUB-2 | Feature | frontend | Manejar errores de red al enviar eventos al hub (feedback visual) | Media | Backlog |

## Tipos de ticket

- **Feature** — nuevas funcionalidades.
- **Bug** — corrección de errores.
- **Technical Debt** — refactorización y deuda técnica.
- **Task** — documentación, investigación o configuración.

## Cómo se añade un ticket nuevo

1. `Issues` → `New issue` → elegir el formulario según el tipo (`feature.yml`, `bug.yml`, `technical_debt.yml`, `task.yml`).
2. Llenar descripción, criterios de aceptación y repositorio afectado (cumple el DoR, ver `DoR.md`).
3. Agregarlo al Project, columna `Backlog` (o `Listo` si ya cumple el DoR).

## Notas

- El backlog se revisa y prioriza como flujo continuo (Kanban), no por sprints cerrados.
- EEM-2 y SUB-1 quedan pendientes como próximos candidatos a tomar del backlog.
