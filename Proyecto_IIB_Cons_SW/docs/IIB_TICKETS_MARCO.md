# 3 Features — Marco (II Bimestre)

Borradores listos para crear como **Issues** en GitHub con la plantilla `feature.yml`.

---

## F1 — Paginación + filtros en `GET /events`

**Tipo:** Feature
**Repositorio afectado:** `Proyecto_IIB_Cons_SW/epn-event-manager`
**Componentes:** `events.controller.ts`, `events.service.ts`, DTO nuevo `query-events.dto.ts`

### Descripción

Hoy `GET /events` y `GET /events/by-entity/:entity` devuelven todos los registros sin paginar, sin filtros ni orden. Con el crecimiento del catálogo esto se vuelve inviable.

### Criterios de aceptación

- [ ] Aceptar query params: `page` (≥1, default 1), `limit` (1–100, default 20), `action` (opcional, enum), `source` (opcional).
- [ ] Respuesta con shape `{ data, total, page, lastPage }`.
- [ ] Validación con `class-validator` (DTO nuevo).
- [ ] Service calcula `skip` + `take` con TypeORM.
- [ ] Tests unitarios en `events.service.spec.ts` (≥ 3 casos: paginación, filtro por action, filtro por source).
- [ ] Cobertura del service sigue ≥ 80%.
- [ ] Sin code smells nuevos (sin métodos > 30 líneas).

---

## F2 — Endpoint de búsqueda full-text `GET /events/search`

**Tipo:** Feature
**Repositorio afectado:** `Proyecto_IIB_Cons_SW/epn-event-manager`
**Componentes:** nuevo método en `events.service.ts` + ruta en `events.controller.ts`

### Descripción

Permite buscar entre todos los eventos por coincidencia en `title` y/o `description`. La búsqueda debe ser insensible a mayúsculas y tolerar `LIKE '%q%'`.

### Criterios de aceptación

- [ ] Nueva ruta `GET /events/search?q=...` (query requerida, mínimo 2 caracteres).
- [ ] Devuelve array de eventos ordenados por fecha descendente.
- [ ] Limita a 50 resultados como máximo (`max 50`).
- [ ] Test unitario: búsqueda con match, sin match, paginación por defecto.
- [ ] CI sigue verde con cobertura ≥ 80% en `events.service.ts`.

---

## F3 — Importar/Exportar suscripciones (JSON / CSV) en el CRUD

**Tipo:** Feature
**Repositorio afectado:** `Proyecto_IIB_Cons_SW/subscription-manager`
**Componentes:** `app.js` (nuevos handlers), `index.html` (botones), validación adicional.

### Descripción

El CRUD de Suscripciones solo persiste en `localStorage`. Para evitar pérdida de datos y permitir portabilidad, se añaden funciones de **importar / exportar** en formato JSON y CSV.

### Criterios de aceptación

- [ ] Botón **Exportar JSON** descarga `suscripciones-YYYY-MM-DD.json` con el array completo.
- [ ] Botón **Exportar CSV** descarga el mismo contenido en formato CSV (RFC 4180) escapando comillas/comas.
- [ ] Botón **Importar** permite cargar archivo `.json` o `.csv` y reemplaza (previa confirmación) el estado.
- [ ] Validación: si el archivo no cumple el esquema, mostrar error y NO modificar `localStorage`.
- [ ] Log visual indica éxito/error usando el patrón `addLog` existente.
- [ ] Sin regresiones en CRUD básico (crear/editar/eliminar sigue funcionando).

---

## 🚀 Flujo de trabajo por ticket (aplicar a cada F1/F2/F3)

```powershell
git checkout develop
git pull
git checkout -b feature/eem-F1-pagination
# commits con Conventional Commits: feat(events): add pagination
git push -u origin feature/eem-F1-pagination
# abrir PR hacia develop con "Closes #<n>"
```

Tras merge, **el equipo genera el tag** `v1.1.x` siguiendo `IIB_RELEASE_TEMPLATE.md`.
