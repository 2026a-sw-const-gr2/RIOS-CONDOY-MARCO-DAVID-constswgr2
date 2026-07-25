# Proyecto_IIB_Cons_SW

Trabajo del **II Bimestre** de Construcción y Evolución de Software.
Reutiliza la base del I Bimestre (DoR, DoD, branch strategy, plantillas de issue y pipeline CI).

## 📁 Estructura

```
Proyecto_IIB_Cons_SW/
├── epn-event-manager/      ← Backend REST NestJS (punto de partida del IIB)
├── subscription-manager/   ← Frontend CRUD de Suscripciones
└── docs/                   ← Toda la documentación del IIB
    ├── IIB_PLAN.md                ← Distribución 3×3 de tickets
    ├── IIB_KANBAN.md              ← Reglas del tablero y transiciones
    ├── IIB_TICKETS_MARCO.md       ← Detalle de los 3 Features
    ├── IIB_RELEASE_TEMPLATE.md    ← Plantilla de Release v1.2.0
    └── subscription-manager.README.md
```

## 🎯 Objetivo del bimestre

9 tickets (3 por integrante) con tipificación estricta:
- **Marco (yo):** 3 Feature
- **Rubén Cuenca:** 3 Bug
- **Jeremy Jiménez:** 3 Technical Debt

> Detallado en [`docs/IIB_PLAN.md`](docs/IIB_PLAN.md).

## 🔀 Ramas

- `main` — protegida; recibe el PR final del macro-release.
- `develop` — protegida; rama de integración.
- **Ramas efímeras:** `feature/<id>-<slug>`, `fix/<id>-<slug>`, `refactor/<id>-<slug>` — una por ticket.

## 🚦 Pipeline

Un solo job `IIB — Lint → Build → Test → Coverage` apuntando a `epn-event-manager/`.
Cobertura mínima 80% en `**/modules/events/*.service.ts` (validado por `coverageThreshold` en `package.json`).

## 🏷️ Versionamiento

- Cada merge a `develop` → tag `v1.1.x` (1-3 Marco, 4-6 Rubén, 7-9 Jeremy).
- Tras los 9 merges → tag final `v1.2.0` + Release con notas.

## 📂 Evidencias externas

Carpeta de evidencias en `C:\Users\MRilt\Downloads\Evidencias_IIB\` con archivos espejo y borradores de issues por integrante.

## 🔗 Referencias

| Tema | Archivo |
|---|---|
| Plan 9 tickets | [`docs/IIB_PLAN.md`](docs/IIB_PLAN.md) |
| Reglas del Kanban | [`docs/IIB_KANBAN.md`](docs/IIB_KANBAN.md) |
| Definition of Ready | [`docs/DOR.md`](docs/DOR.md) |
| Definition of Done | [`docs/DOD.md`](docs/DOD.md) |
| Features de Marco (detalle) | [`docs/IIB_TICKETS_MARCO.md`](docs/IIB_TICKETS_MARCO.md) |
| Plantilla de Release v1.2.0 | [`docs/IIB_RELEASE_TEMPLATE.md`](docs/IIB_RELEASE_TEMPLATE.md) |
| README del CRUD frontend | [`docs/subscription-manager.README.md`](docs/subscription-manager.README.md) |
