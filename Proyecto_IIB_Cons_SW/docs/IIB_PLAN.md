# Plan — II Bimestre (Proyecto 02 SCM)

## 🎯 Objetivo

Ejecutar los **9 tickets** del II Bimestre con el ciclo:
```
[BACKLOG] →(DoR)→ [IN PROGRESS] →(Dev+Commits)→ [QA/PIPELINE] →(DoD+PR)→ [MERGE & RELEASE]
```

## 👥 Equipo y distribución

| Estudiante | Categoría | 3 tickets |
|---|---|---|
| Marco (yo) | Feature | marco-F1, marco-F2, marco-F3 |
| Rubén Cuenca | Bug | ruben-B1, ruben-B2, ruben-B3 |
| Jeremy Jiménez | Technical Debt | jeremy-T1, jerem-T2, jeremy-T3 |

---

## 📋 Los 9 tickets supuestos (a discutir en refinamiento grupal)

### 🎯 Marco — 3 Features

| ID | Tipo | Repo | Título | Tag | Estado |
|---|---|---|---|---|---|
| F1 | Feature | `epn-event-manager` | Paginación + filtros en `GET /events` | `v1.1.1` | Pendiente |
| F2 | Feature | `epn-event-manager` | Endpoint `GET /events/search?q=` (full-text) | `v1.1.2` | Pendiente |
| F3 | Feature | `subscription-manager` | Importar/Exportar suscripciones (JSON/CSV) | `v1.1.3` | Pendiente |

### 🐛 Rubén — 3 Bugs (supuestos, pendiente confirmación)

| ID | Tipo | Repo | Título | Tag | Estado |
|---|---|---|---|---|---|
| B1 | Bug | `epn-event-manager` | Validar payload vacío en POST /events | `v1.1.4` | Pendiente |
| B2 | Bug | `subscription-manager` | Día 31 rompe cálculo de próximo pago en feb/abr | `v1.1.5` | Pendiente |
| B3 | Bug | `epn-event-manager` | `/stats` no ignora eventos CANCELLED | `v1.1.6` | Pendiente |

### 🧹 Jeremy — 3 Refactors / Technical Debt (supuestos, pendiente confirmación)

| ID | Tipo | Repo | Título | Tag | Estado |
|---|---|---|---|---|---|
| T1 | TechDebt | `epn-event-manager` | Dividir `EventsService` por responsabilidad (Handler pattern) | `v1.1.7` | Pendiente |
| T2 | TechDebt | `subscription-manager` | Extraer `SubscriptionRepository` en `app.js` (frontend) | `v1.1.8` | Pendiente |
| T3 | TechDebt | `epn-event-manager` | Externalizar configuración de Winston en `bootstrap.ts` | `v1.1.9` | Pendiente |

> ⚠️ Los 6 tickets de Rubén y Jeremy son **propuestos por Marco** para arrancar el backlog. Cada integrante **debe validarlos, refinar criterios de aceptación y reemplazarlos/ajustarlos** antes de pasar a "Listo".

---

## 🔀 Ramas permitidas

- `main` — protegida; recibe el PR final del macro-release.
- `develop` — protegida; rama de integración.
- **Ramas efímeras** `feature/<id>-<slug>`, `fix/<id>-<slug>`, `refactor/<id>-<slug>` — una por ticket.

> El setup de esta carpeta se hizo directo a `develop`, sin crear ramas artificiales (no es un ticket).

## 🏷️ Versionamiento

- Cada merge a `develop` → tag `v1.1.x` en orden (1-3 Marco, 4-6 Rubén, 7-9 Jeremy).
- Tras los 9 merges → PR `develop` → `main` + tag `v1.2.0` + Release con notas.

## 📦 Repos

- `Proyecto_IIB_Cons_SW/epn-event-manager` — API REST NestJS.
- `Proyecto_IIB_Cons_SW/subscription-manager` — CRUD frontend.

## 📂 Evidencias físicas (carpeta externa — fuera del repo)

Cada ticket tiene una carpeta espejo en una ruta **fuera** del repositorio
(para no contaminar la rama). Estructura esperada:

```
~/Downloads/Evidencias_IIB/
├── _issues_para_crear_en_github/   ← borradores de issues por integrante
├── marco/<id-ticket>/              ← 3 features de Marco
├── ruben/<id-ticket>/              ← 3 bugs de Rubén
└── jeremy/<id-ticket>/             ← 3 technical debts de Jeremy
```

Cada `id-ticket/` contiene un `README.md` con los criterios de aceptación
y copias de los archivos del proyecto que se van a modificar (en su ruta
relativa original) — para comparar antes/después en el video final.

## 🚦 Pipeline

- **CI:** `.github/workflows/ci-backend.yml` (único job apuntando al IIB).
- **Branch protection:** 1 aprobación + status check verde.
- **Coverage threshold:** `**/modules/events/*.service.ts` ≥ 80%.
