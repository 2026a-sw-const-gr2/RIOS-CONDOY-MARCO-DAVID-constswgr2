# Kanban — II Bimestre

**Tablero:** GitHub Project del equipo.

## 🪧 Columnas

1. **Backlog** — issues sin DoR completado.
2. **Listo (cumple DoR)** — refinados, pueden entrar a trabajo.
3. **En progreso** — máximo 1 por persona.
4. **QA / Pipeline** — PR abierto esperando CI verde + code review.
5. **Hecho** — merged a `develop`, DoD cumplido, tag creado.

## 🔄 Reglas de transición

- `Backlog → Listo`: solo cuando cumple DoR (descripción, criterios, tipo, repo, responsable).
- `Listo → En progreso`: la persona asignada mueve el issue y crea su rama efímera.
- `En progreso → QA`: PR abierto (a `develop`) con `Closes #N`.
- `QA → Hecho`: CI en verde + 1 aprobación + merge + tag `v1.1.x`.

## 🏷️ Etiquetas

- `feature`, `bug`, `technical-debt`, `task`
- `priority/{high,medium,low}`
- `epn-event-manager`, `subscription-manager`

> El enunciado dice que cada ticket debe estar **tipificado** (Feature / Bug / Technical Debt). No se permiten tipos fuera de esos tres. `Task` solo para setup/admin (no puntúa como ticket de los 9).
