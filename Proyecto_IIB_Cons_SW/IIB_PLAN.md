# Plan — II Bimestre (Proyecto 02 SCM)

## 🎯 Objetivo

Ejecutar los **9 tickets** del II Bimestre con el ciclo:
```
[BACKLOG] →(DoR)→ [IN PROGRESS] →(Dev+Commits)→ [QA/PIPELINE] →(DoD+PR)→ [MERGE & RELEASE]
```

## 👥 Equipo

| Estudiante | Categoría | 3 tickets |
|---|---|---|
| Marco | Feature | marco-F1, marco-F2, marco-F3 |
| Rubén | Bug | ruben-B1, ruben-B2, ruben-B3 |
| Jeremy | Technical Debt | jeremy-T1, jeremy-T2, jeremy-T3 |

## 🔀 Ramas permitidas

- `main` — protegida, solo recibe el PR final del ciclo.
- `develop` — protegida, rama de integración.
- **Ramas efímeras** `feature/<id>-<slug>`, `fix/<id>-<slug>`, `refactor/<id>-<slug>` — una por ticket, vive hasta el merge.

> Cualquier otra rama long-lived está prohibida. El setup del IIB se hizo directo a `develop`.

## 📦 Repos

- `Proyecto_IIB_Cons_SW/epn-event-manager` — backend NestJS.
- `Proyecto_IIB_Cons_SW/subscription-manager` — CRUD frontend.

## 🏷️ Versionamiento

- Por cada merge a `develop`: tag `v1.1.x` (secuencial por cada cierre individual).
- Tras los 9 merges: PR `develop` → `main` + tag final `v1.2.0` con Release Notes.

## 🧪 DoD / DoR

- DoR: descripción + criterios de aceptación + tipo + repo afectado + responsable.
- DoD: PR aprobado, CI verde (lint + build + cov ≥ 80%), sin code smells, documentado.

## 🚦 Continuous pipeline

`.github/workflows/ci-backend.yml` corre solo sobre `Proyecto_IIB_Cons_SW/epn-event-manager` (un único job `build-test`). No se ejecuta sobre lo del I Bimestre.
