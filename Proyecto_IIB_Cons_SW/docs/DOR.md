# Definition of Ready (DoR)

Un ticket **solo puede moverse de `Backlog` a `En progreso`** si cumple los 4 criterios:

- [ ] **Descripción** clara del problema, objetivo o cambio propuesto.
- [ ] **Criterios de aceptación** redactados en formato checklist (`- [ ] ...`).
- [ ] **Repositorio afectado** asignado (backend, frontend, ambos).
- [ ] **Responsable** asignado (la persona que lo implementa).

> Tip: las plantillas de GitHub (`feature.yml`, `bug.yml`, `technical_debt.yml`) ya cubren los 3 primeros campos por diseño. El 4 (responsable) lo agregas con el campo **Assignees**.

## 📋 Plantilla de validación rápida

Antes de iniciar trabajo, revisa:

- [ ] ¿Está en columna `Backlog` y tiene label correcto (feature / bug / technical-debt)?
- [ ] ¿El título empieza con `[Feature]:` / `[Bug]:` / `[Technical Debt]:`?
- [ ] ¿La descripción es de 2-5 párrafos y responde "qué y para qué"?
- [ ] ¿Los criterios son "verificables" (reproducibles, medibles, sin ambigüedad)?
- [ ] ¿El repo afectado y el assignees están definidos?
- [ ] (Opcional) ¿Está en una iteración/sprint?

Si todo está ✅, mueve la tarjeta a **En progreso**.

Referencia visual: `messages/feature.yml`, `messages/bug.yml`, `messages/technical_debt.yml`.
