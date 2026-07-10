# Definition of Done (DoD)

Un ticket solo puede cerrarse (pasar a la columna **Hecho**) si cumple **todos** los siguientes criterios:

- [ ] El código fue **revisado y aprobado** por al menos un compañero mediante Pull Request.
- [ ] El **pipeline de CI pasó completo**: lint, build, tests y validación de cobertura (`ci-backend.yml`).
- [ ] **No introduce code smells nuevos** (God Objects, funciones largas, duplicación evidente).
- [ ] Está **documentado** (comentarios donde aporten valor, README actualizado si el comportamiento cambió).

## Dónde se aplica

El checklist de `.github/pull_request_template.md` repite estos mismos puntos, así que cada Pull Request obliga a confirmarlos antes de poder mergear. Además:

- **Branch protection** en `main`/`develop` bloquea el merge si el pipeline falla o si no hay al menos 1 aprobación.
- El **umbral de cobertura** (`coverageThreshold` en `package.json`) exige mínimo 80% en `**/*.service.ts`.

## Ejemplo (ticket EEM-1, ya cerrado)

- [x] PR revisado y aprobado por un compañero.
- [x] Pipeline en verde (lint, build, 17 tests, coverage 95.7% en `events.service.ts`).
- [x] Sin code smells nuevos — se eliminó el God Method existente.
- [x] Documentado con comentarios explicando el porqué del refactor.
