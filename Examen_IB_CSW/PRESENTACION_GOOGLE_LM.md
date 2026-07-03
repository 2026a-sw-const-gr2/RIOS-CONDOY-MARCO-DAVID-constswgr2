# Guion para presentación generada con Google LM

## Datos generales
- **Asignatura:** Construcción y Evolución de Software
- **Grupo:** Rueben Cuenca, Jeremy Jimenez y Marco Rios
- **Tema:** Correlación técnica entre Gestión de Configuración de Software, normas de calidad y mantenimiento aplicado al proyecto EPN Event Manager / Gestor de Suscripciones
- **Objetivo de la presentación:** Explicar de forma clara cómo los cambios realizados en el proyecto se relacionan con conceptos de SCM, mantenimiento de software, guías de calidad y buenas prácticas de la industria, y mostrar qué se puede mejorar en el siguiente ciclo.

## Instrucción para Google LM
Genera una presentación clara, visual y académica en español. Cada diapositiva debe tener un título breve, texto muy legible y pocas ideas por slide. El contenido debe ser suficiente para exponer un taller universitario y debe seguir la lógica: diagnóstico, conceptos, normas, correlación con el proyecto, estado actual y mejoras.

## Estructura sugerida de la presentación
### Slide-by-slide: instrucciones exactas (lo que deben mostrar)

**Slide 1 — Portada**
- Mostrar solo: nombres y asignatura. No abrir código ni explicar técnicamente.
- Texto a mostrar: "Rueben Cuenca, Jeremy Jimenez, Marco Rios — Construcción y Evolución de Software".

**Slide 2 — Objetivo**
- Frase de 30 segundos a decir sin leer bullets: "Vamos a mapear lo que hicimos en el EPN Event Manager con SCM y normas.".

**Slide 3 — SCM y normas (teoría mínima)**
- Definición de SCM en 2 líneas y mostrar la tabla de correlación (breve). No profundizar.
- Texto sugerido (2 líneas): "SCM identifica, organiza y controla cambios en el software para mantener la integridad del producto y la trazabilidad de sus elementos (CIs).".

**Slide 4 — El aplicativo (tu caso)**
Mostrar en pantalla (abrir los siguientes elementos):
- Estructura de carpetas del repo: abra o muestre `src/modules/events/`, `src/modules/suscripciones/`, `src/common/`.
- Abra el archivo `epn-event-manager/.env.example` y destaque `DB_PATH` como evidencia de CI controlado.
- Mostrar el frontend corriendo en el browser (abrir `index.html` en Live Server o navegador).

Comandos útiles (ejemplo):
```bash
cd epn-event-manager
npm install
npm run start:dev
```
Abrir en navegador `index.html` desde la carpeta raíz del proyecto para el frontend.

**Slide 5 — Correlación técnica (código real)**
Mostrar código en vivo mientras hablan. Abrir cada archivo por tipo:
- Correctivo: `src/modules/events/events.service.ts` → punto donde se persisten eventos (`createRepo.save` / `updateRepo.save` / `deleteRepo.save`).
- Adaptativo: mostrar `toISOString()` en `app.js` y el `DB_PATH` en `epn-event-manager/.env.example`.
- Preventivo: abrir un DTO en `src/modules/suscripciones/dto/create-suscripcion.dto.ts` y la excepción en `src/modules/events/events.service.ts` (whitelist/BadRequestException añadido).
- Perfectivo: abrir la colección Postman `epn-event-manager/postman/suscripciones.postman_collection.json` o ejecutar `epn-event-manager/demo.http` para evidenciar la documentación y pruebas.

Consejo: muestre fragmentos de 6–12 líneas, no archivos enteros.

**Slide 6 — Estado actual (demo 2 minutos)**
Demo en vivo de 2 minutos:
- Crear una suscripción desde el frontend (`index.html`).
- Ver en el backend que el evento quedó registrado (consulte `GET /events` o vea la consola del servidor con logs estructurados).
- Mostrar en consola del servidor un log con timestamp ISO 8601.

Comandos/acciones rápidas:
```bash
# Iniciar backend
cd epn-event-manager
npm run start:dev

# Abrir frontend: doble clic en index.html o usar Live Server en VS Code
```

**Slide 7 — Análisis: deuda técnica**
- Mencionar las 4 deudas ya documentadas en el examen práctico (use el contenido del informe ya existente). No leer todo, resuma en 4 bullets.

**Slide 8 — Mejoras propuestas**
- Listar sin desarrollar: Swagger, pruebas e2e, migrar JSON a BD real.

**Slide 9 — Entregables**
- Mostrar brevemente: PDF del informe, colección Postman (`epn-event-manager/postman/suscripciones.postman_collection.json`), y `demo.http`.

**Slide 10 — Cierre**
- Frase de cierre: "El mantenimiento bien hecho también es ingeniería de calidad.".

---

He actualizado el guion para que cada slide tenga exactamente lo que se debe mostrar en pantalla y qué archivos abrir. Puedo ahora (elige una):

1. Generar un `pptx` con estas 10 slides listo para descargar. 
2. Crear un prompt corto listo para pegar en Google LM para que genere las diapositivas visuales.
3. Preparar un script de demostración (pasos y comandos) que el equipo seguirá en la demo.

## Texto breve de apoyo para la exposición
El proyecto analizado demuestra cómo un sistema de software puede evolucionar de forma controlada cuando se aplican prácticas de Gestión de Configuración, validación de entradas, control de errores, trazabilidad y documentación. Las acciones técnicas implementadas se pueden clasificar en mantenimiento correctivo, adaptativo, preventivo y perfectivo, y además se relacionan con normas como IEEE 828, ISO/IEC 12207, CMMI e ISO 9001:2015.

## Recomendación visual para la presentación
- Usar colores institucionales sobrios.
- Mantener poco texto por diapositiva.
- Incluir una matriz o tabla simple para la correlación técnica.
- Resaltar con negrita los conceptos clave: SCM, mantenimiento, trazabilidad, calidad y normas.
- Cerrar con una diapositiva limpia y contundente.

## Relación detallada: conceptos ↔ artefactos del proyecto
Esta sección mapea conceptos clave (SCM, tipos de mantenimiento, normas) con archivos y prácticas concretas en el repositorio. Usar estas filas para generar diapositivas técnicas y capturas para el informe.

| Concepto / Norma | Qué significa | Dónde se aplica en el proyecto | Evidencia / Cómo defenderlo |
|---|---|---|---|
| SCM (Gestión de Configuración) | Control, identificación y trazabilidad de elementos de software | `epn-event-manager` (módulos, entidades, `.env.example`) y `app.js` (frontend) | Mostrar `DB_PATH` en `.env.example`, la colección Postman y la separación frontend/backend. |
| IEEE 828 (configuración) | Identificación y control de CIs y auditoría | Eventos registrados en tablas (`src/modules/events/*`) y logs con timestamps | Apuntar a `src/modules/events/events.service.ts` y ejemplos de logs en `bootstrap.ts` / `nest-winston`. |
| ISO/IEC 12207 (procesos) | Procesos del ciclo de vida: requisitos, desarrollo, pruebas, mantenimiento | Validación DTOs (`src/modules/suscripciones/dto/*.ts`), `ValidationPipe` en `bootstrap.ts` | Mostrar una petición inválida que devuelve 400 y la ruta del DTO usada para validación. |
| ISO 9001:2015 (calidad) | Control de no conformidades, acciones correctivas y mejora continua | Registro de errores y filtro global `AllExceptionsFilter` | Señalar `src/common/filters/all-exceptions.filter.ts` y ejemplos de respuestas estructuradas con timestamp. |
| CMMI (madurez) | Procesos y control organizacional | Uso de `ConfigModule`, `ApiKeyGuard` y modularidad (`SuscripcionesModule`) | Mostrar `src/app.module.ts`, `src/common/guards/api-key.guard.ts`, y explicar cómo estos aumentan la capacidad de control. |
| Correctivo (mantenimiento) | Resolver fallos detectados | `events.service.ts` y `suscripciones.service.ts` cambios de persistencia y guardado | Mostrar commit/`git diff` donde se corrigió el `save()` o la persistencia; usar `demo.http` para reproducir el fallo antes/después. |
| Adaptativo (mantenimiento) | Cambios por entorno o requisitos externos | `.env.example`, `DB_PATH`, uso de `toISOString()` en `app.js` y `events.service.ts` | Demostrar `toISOString()` en logs y `.env.example` como evidencia de adaptación a entornos. |
| Preventivo (mantenimiento) | Evitar fallos futuros | Validaciones en frontend (`app.js`) y DTOs backend; whitelists añadidos en `events.service.ts` | Mostrar validaciones (frontend) y `BadRequestException` por origen/entidad no permitida (backend). |
| Perfectivo (mantenimiento) | Mejoras de calidad y documentación | Colección Postman (`epn-event-manager/postman/...`), `demo.http`, y logs estructurados | Mostrar la colección Postman, ejemplos de ejecución y el informe de cobertura (`coverage/`). |

Instrucciones rápidas para la diapositiva técnica:
- Incluya una fila por cada norma/concepto con la columna "Evidencia" mostrando el archivo y un breve comando o captura (por ejemplo, `curl` de prueba, salida de logs o fragmento de `git diff`).

--

Fin de la sección de correlación detallada.
