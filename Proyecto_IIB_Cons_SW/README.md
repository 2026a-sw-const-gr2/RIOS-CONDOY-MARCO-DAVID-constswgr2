# Proyecto II Bimestre — EPN Event Manager + Subscription Manager

Carpeta de trabajo del II Bimestre (Construcción y Evolución de Software).
Reutiliza la **infraestructura del I Bimestre** (CI, DoR, DoD, branch strategy, plantillas de issue).

## 📁 Contenido

| Carpeta/Archivo | Descripción |
|---|---|
| `epn-event-manager/` | API REST NestJS (replicada del I Bimestre). Punto de partida del II Bimestre. |
| `IIB_KANBAN.md` | Enlace y configuración del tablero Kanban para los 9 tickets del II Bimestre. |
| `IIB_CONVENTIONS.md` | Convenciones de branching, commits y versionamiento para el II Bimestre. |
| `IIB_PLAN.md` | Plan de trabajo, distribución de tickets y cronograma. |
| `IIB_TICKETS_MARCO.md` | Las 3 Features asignadas a Marco (con DoR aplicado). |

## 🔗 Reutilización de la base del I Bimestre

- DoR, DoD, branch strategy: ver [`../Proyecto_IB_Cons_SW/DoR.md`](../Proyecto_IB_Cons_SW/DoR.md), [`../Proyecto_IB_Cons_SW/DoD.md`](../Proyecto_IB_Cons_SW/DoD.md), [`../Proyecto_IB_Cons_SW/branch-strategy.md`](../Proyecto_IB_Cons_SW/branch-strategy.md).
- Backlog existente: [`../Proyecto_IB_Cons_SW/backlog.md`](../Proyecto_IB_Cons_SW/backlog.md) (incluye tickets pendientes EEM-2, EEM-5, SUB-1, SUB-2).
- CI: `.github/workflows/ci-backend.yml` (con umbral `coverageThreshold` ≥ 80% ya configurado).
- Plantillas de issues: `.github/ISSUE_TEMPLATE/{feature,bug,technical_debt,task}.yml`.

## 🎯 Distribución de tickets del II Bimestre (9 totales)

| Estudiante | Categoría | Cantidad |
|---|---|---|
| Marco (yo) | Feature | 3 |
| Rubén | Bug | 3 |
| Jeremy | Technical Debt | 3 |

> El backlog existente del I Bimestre aporta candidatos; los 9 definitivos se eligen en la sesión de refinamiento inicial.

## 🚀 Cómo empezar

1. Crear la rama base del equipo (después de la protección): `git checkout -b develop`, `git push -u origin develop`
2. Asignar tickets por integrante (DoR aplicado).
3. Cada uno crea su rama por ticket (`feature/...`, `fix/...`, `refactor/...`) desde `develop`.
4. PR → CI verde + 1 aprobación → merge a `develop`.
5. Tras los 9 merges, PR `develop` → `main` y Release oficial.
