# Definition of Done (DoD)

Un ticket **solo puede moverse de `QA Pipeline` a `Completado`** si cumple los 5 criterios:

- [ ] El **código fue revisado y aprobado** por al menos 1 compañero mediante Pull Request.
- [ ] El **CI pasó completo**: lint, build, tests, cobertura ≥ 80% en `events.service.ts`.
- [ ] **No introduce code smells nuevos** (funciones > 40 líneas, duplicación, `any` innecesario, etc.).
- [ ] Está **documentado** (comentarios donde aporten valor, README actualizado si cambia comportamiento).
- [ ] El **PR referencia al ticket** (`Closes #N`) y está mergeado a `develop`.

## 📋 Plantilla de validación rápida por tipo

### Features (Marco)
- [ ] Tests unitarios que cubren nuevos endpoints
- [ ] Coverage de `events.service.ts` ≥ 80% (validado por CI)
- [ ] `npm run lint` sin errores

### Bugs (Rubén)
- [ ] Test que reproduce el bug (falla antes, pasa después)
- [ ] Validación de entrada robusta (no rompe edge cases)
- [ ] Cobertura no se reduce respecto a `main`

### Technical Debt (Jeremy)
- [ ] Comportamiento externo **idéntico** (smoke test)
- [ ] Tests existentes siguen pasando
- [ ] Reducción objetiva del code smell (líneas, complejidad, duplicación)

## 🏷️ Versionamiento

Tras mergear a `develop`:

```bash
git tag -a v1.1.{N} -m "Descripción del cierre"
git push origin v1.1.{N}
```

Asignación por estudiante:
- Marco → `v1.1.1`, `v1.1.2`, `v1.1.3`
- Rubén → `v1.1.4`, `v1.1.5`, `v1.1.6`
- Jeremy → `v1.1.7`, `v1.1.8`, `v1.1.9`

## 🎬 Al cerrar todo el sprint

1. PR `develop` → `main`
2. Crear **Release `v1.2.0`** en GitHub con `notes` detalladas (plantilla en `IIB_RELEASE_TEMPLATE.md`).
3. Grabar el video con todos los criterios cumplidos.
