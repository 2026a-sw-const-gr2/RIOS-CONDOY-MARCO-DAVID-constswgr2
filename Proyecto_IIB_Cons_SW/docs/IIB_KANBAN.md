# Kanban — II Bimestre

**Tablero:** GitHub Project del equipo.

## 🪧 Columnas

1. **Backlog** — issues sin DoR completado.
2. **En progreso** — máximo 1 por persona.
3. **QA / Pipeline** — PR abierto esperando CI verde + code review.
4. **Hecho** — merged a `develop`, DoD cumplido, tag creado.

> 📘 Las reglas precisas de cuándo se mueve entre columnas están en [`DOR.md`](DOR.md) (qué requiere un ticket para entrar a "En progreso") y [`DOD.md`](DOD.md) (qué requiere para salir de "QA Pipeline").

## 🔄 Reglas de transición

- `Backlog → En progreso`: solo cuando cumple DoR (descripción, criterios, tipo, repo, responsable).
- `En progreso → QA`: PR abierto (a `develop`) con `Closes #N`.
- `QA → Hecho`: CI en verde + 1 aprobación + merge + tag `v1.1.x`.

## 🏷️ Etiquetas

- `feature`, `bug`, `technical-debt`, `task`
- `priority/{high,medium,low}`
- `epn-event-manager`, `subscription-manager`

> El enunciado dice que cada ticket debe estar **tipificado** (Feature / Bug / Technical Debt). No se permiten tipos fuera de esos tres. `Task` solo para setup/admin (no puntúa como ticket de los 9).
