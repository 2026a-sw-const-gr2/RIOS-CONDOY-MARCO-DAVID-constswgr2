# Definition of Ready (DoR)

Un ticket solo puede pasar de la columna **Backlog** a **Listo** si cumple **todos** los siguientes criterios:

- [ ] Tiene una **descripción clara** del problema u objetivo.
- [ ] Tiene **criterios de aceptación verificables**, redactados como checklist.
- [ ] Está **clasificado con un tipo válido**: `Feature`, `Bug`, `Technical Debt` o `Task`.
- [ ] Tiene asignado el **repositorio afectado** (`backend`, `frontend` o `ambos`) y, si aplica, los archivos involucrados.

## Dónde se aplica

Los formularios de Issue en `.github/ISSUE_TEMPLATE/` (`feature.yml`, `bug.yml`, `technical_debt.yml`, `task.yml`) ya obligan a llenar descripción, criterios de aceptación y repositorio afectado — así que un ticket creado con esos formularios cumple el DoR por diseño.

## Ejemplo (ticket EEM-1)

- **Descripción:** `EventsService.registerEvent` concentra 4 bloques `if` casi idénticos (uno por acción CREATE/UPDATE/DELETE/QUERY), violando el Principio de Responsabilidad Única.
- **Criterios de aceptación:**
  - [ ] Cada acción tiene su propio método privado.
  - [ ] El comportamiento externo no cambia.
  - [ ] Las pruebas existentes siguen pasando.
- **Tipo:** Technical Debt
- **Repositorio:** backend
