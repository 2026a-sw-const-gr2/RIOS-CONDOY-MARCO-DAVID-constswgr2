# Estrategia de ramas

Se implementa **Feature Branches** de forma estricta. Queda **prohibido el push directo** a `main` o `develop`; toda la integración de código pasa por Pull Request.

## Convención de nombres

| Tipo de rama | Convención | Ejemplo |
|---|---|---|
| Funcionalidad nueva | `feature/<id-ticket>-<slug>` | `feature/eem-5-swagger-runtime` |
| Corrección de bug | `fix/<id-ticket>-<slug>` | `fix/eem-3-orden-eventos` |
| Deuda técnica | `refactor/<id-ticket>-<slug>` | `refactor/eem-1-god-method-events` |
| Tarea de soporte | `chore/<id-ticket>-<slug>` | `chore/eem-6-pipeline-ci` |

El `<id-ticket>` es el ID del backlog (ver `backlog.md`) y el `<slug>` es una descripción corta en minúsculas separada por guiones.

## Reglas de protección de rama (`main` y `develop`)

- Exigir **Pull Request** antes de mergear (push directo bloqueado).
- Exigir que el **pipeline de CI pase** (lint → build → test → coverage).
- Exigir **al menos 1 aprobación** de un integrante distinto al autor del PR.

## Flujo típico

1. Tomar un ticket en `Listo` (cumple DoR) y moverlo a `En progreso`.
2. Crear la rama desde `develop` (o `main`, según el flujo del equipo) con la convención de arriba.
3. Hacer commits normales en la rama.
4. Abrir el Pull Request usando la plantilla (`.github/pull_request_template.md`) y referenciar el ticket con `Closes #<número>`.
5. Esperar a que el pipeline corra y a la aprobación de un compañero.
6. Mergear — el ticket cumple el DoD (ver `DoD.md`) y se mueve a `Hecho`.
