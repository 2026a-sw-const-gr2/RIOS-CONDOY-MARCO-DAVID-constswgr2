# Proyecto II Bimestre — EPN Event Manager + Subscription Manager

Carpeta de trabajo del II Bimestre (Construcción y Evolución de Software).
Reutiliza la **infraestructura del I Bimestre** (DoR, DoD, branch strategy, plantillas de issue) y replica los **dos repos** del equipo como punto de partida.

## 📁 Contenido

| Carpeta/Archivo | Descripción |
|---|---|
| `epn-event-manager/` | API REST NestJS (réplica del I Bimestre). Backend del IIB. |
| `subscription-manager/` | CRUD frontend de Suscripciones (copia del I Bimestre). Frontend del IIB. |
| `IIB_PLAN.md` | Plan de trabajo, ramas, versionamiento. |
| `IIB_KANBAN.md` | Columnas del tablero y reglas de transición. |
| `IIB_TICKETS_MARCO.md` | Las 3 Features asignadas a Marco, formato issue. |
| `IIB_RELEASE_TEMPLATE.md` | Plantilla para el Release oficial `v1.2.0`. |

## 🔗 Reutilización de la base del I Bimestre

- **DoR / DoD / branch strategy:** `../Proyecto_IB_Cons_SW/{DoR,DoD,branch-strategy}.md`.
- **Backlog existente:** `../Proyecto_IB_Cons_SW/backlog.md`.
- **CI del II Bimestre:** `.github/workflows/ci-backend.yml` (un solo job apuntando a `epn-event-manager` de esta carpeta).
- **Plantillas de issues:** `.github/ISSUE_TEMPLATE/{feature,bug,technical_debt,task}.yml`.

## 🎯 Distribución de tickets (9 totales)

| Estudiante | Categoría | Cantidad |
|---|---|---|
| Marco (yo) | Feature | 3 |
| Rubén | Bug | 3 |
| Jeremy | Technical Debt | 3 |

## 🔀 Ramas

- `main` — protegida; recibe el PR final del macro-release.
- `develop` — protegida; rama de integración.
- **Ramas efímeras** `feature/*`, `fix/*`, `refactor/*` — una por ticket.

> El setup de esta carpeta se hizo directo a `develop`, sin crear ramas artificiales (no es un ticket).

## 🏷️ Versionamiento

- Cada merge a `develop` → tag `v1.1.x` en orden.
- Tras los 9 merges → PR `develop` → `main` + tag `v1.2.0` + Release con notas.
