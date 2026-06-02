# Gestor de Suscripciones — EPN Event Manager
**Taller Construcción de Software | Vicente Adrián Eguez Sarzosa**

---

## 📁 Archivos del proyecto

```
subscription-manager/
├── index.html   ← Estructura HTML principal
├── style.css    ← Estilos visuales
├── app.js       ← Lógica CRUD + integración con hub
└── README.md    ← Este archivo
```

---

## 🚀 Cómo abrir en Visual Studio Code

1. Abre VS Code.
2. Instala la extensión **Live Server** (si no la tienes):
   - `Ctrl+Shift+X` → busca "Live Server" → Instalar
3. Abre la carpeta `subscription-manager` en VS Code:
   - `File > Open Folder...` → selecciona la carpeta
4. Haz clic derecho sobre `index.html` → **"Open with Live Server"**
5. Se abre en `http://127.0.0.1:5500`

> También puedes simplemente abrir `index.html` haciendo doble clic (sin Live Server).

---

## 🔗 Integración con el EPN Event Manager

El CRUD envía eventos automáticamente a:
```
POST http://localhost:3000/events
```

Para que funcione la integración:

```bash
# En la carpeta epn-event-manager
cd epn-event-manager
npm install
npm run start:dev
```

El hub debe correr en el **puerto 3000**.

### Eventos que se envían:
| Acción en el CRUD | action enviado |
|-------------------|---------------|
| Agregar suscripción | `CREATE` |
| Editar suscripción  | `UPDATE` |
| Eliminar suscripción | `DELETE` |

Si el hub no está corriendo, el CRUD guarda igual en `localStorage` y el log muestra "sin conexión".

---

## 🛠️ Tipos de mantenimiento aplicados

### 🐞 Correctivo
**Problema:** El bloque `DELETE` en `events.service.ts` construía el objeto pero nunca llamaba a `save()`.  
**Fix:** Se agregó `await this.deleteRepo.save(ev)` para persistir el evento.

### ⚙️ Adaptativo
**Problema:** Las fechas se guardaban con `new Date().toLocaleString()` — formato local variable.  
**Fix:** Se cambió a `new Date().toISOString()` para usar UTC estándar (ISO 8601).

### 📈 Perfectivo
**Problema:** `getStats()` no incluía `query_events` en el total.  
**Fix:** Se agregó `queryCount` al conteo y al total devuelto.

### 🛡️ Preventivo
**Problema:** El `CreateEventDto` no tenía ninguna validación.  
**Fix:** Se agregaron validaciones con `class-validator` + `ValidationPipe` global en `main.ts`.

---

## 📋 Campos de una suscripción

| Campo | Descripción |
|-------|------------|
| Nombre | Nombre del servicio (ej. Spotify) |
| Categoría | Streaming / Anime / Celular / Gaming / Otro |
| Plan | Descripción del plan (ej. Premium Individual) |
| Valor | Monto mensual en USD |
| Día de pago | Día del mes en que se cobra (1–31) |
| Método de pago | Tarjeta u otro medio (opcional) |

---

## 🧪 Examen — Cambios aplicados (resumen)

- **Logger**: Integración de Winston vía `nest-winston` y salida con timestamps ISO 8601; logs para operaciones CRUD.
- **Configuración externa**: `ConfigModule` y archivo de ejemplo `.env.example` creado en `epn-event-manager/.env.example`.
- **Autenticación sencilla**: Guardia global `ApiKeyGuard` que valida la cabecera `X-FIS-EPN-KEY` (ver `epn-event-manager/src/common/guards/api-key.guard.ts`).
- **Módulo `suscripciones`**: nuevo módulo con endpoints CRUD y persistencia simple en JSON (`DB_PATH`) en `epn-event-manager/src/modules/suscripciones/`.
- **Validación**: DTOs con `class-validator` y `ValidationPipe` global en `epn-event-manager/src/main.ts`.
- **Documentación**: La API está descrita en este `README`; Swagger quedó deshabilitado temporalmente en el arranque para evitar un conflicto de tipos entre dos instalaciones de Nest en el workspace.
- **Pruebas**: Suite Jest para `SuscripcionesService` añadida en `epn-event-manager/src/modules/suscripciones/suscripciones.service.spec.ts`.
- **Errores estructurados**: Filtro global `AllExceptionsFilter` en `epn-event-manager/src/common/filters/all-exceptions.filter.ts`.
- **Documento de API**: Colección Postman exportada en `epn-event-manager/postman/suscripciones.postman_collection.json`.

## 🔧 Archivos clave (ubicaciones)

- `epn-event-manager/src/main.ts` — Inicialización, Swagger, ValidationPipe y logger.
- `epn-event-manager/src/app.module.ts` — `ConfigModule` y registro de `ApiKeyGuard` global.
- `epn-event-manager/.env.example` — Variables esperadas (`PORT`, `DB_PATH`, `FIS_EPN_KEY`).
- `epn-event-manager/src/modules/suscripciones/` — Controller, Service, DTOs y entidad.

## 🚀 Cómo ejecutar el back-end (`epn-event-manager`)

1. Copia `.env.example` a `.env` y rellena `FIS_EPN_KEY` y `DB_PATH` si quieres ubicación específica.

```bash
cd epn-event-manager
npm install
npm run start:dev
```

2. Accede a Swagger en `http://localhost:3000/api` (o el `PORT` que señales en `.env`).

3. Consideraciones importantes:
- Todas las peticiones deben incluir la cabecera `X-FIS-EPN-KEY: <valor>` definida en `.env`.

## ✅ Ejecutar pruebas unitarias

```bash
cd epn-event-manager
npm test
```

## 🧾 Checklist final del examen

- [x] CRUD completo con los 4 endpoints funcionando
- [x] Logger instalado y registrando con timestamps ISO 8601
- [x] Middleware/guard de `X-FIS-EPN-KEY` activo
- [x] Variables de entorno externas en `.env.example`
- [x] Al menos 5 pruebas unitarias cubriendo reglas de negocio clave
- [x] Try-catch por operación y filtro global de excepciones
- [x] Validación y sanitización de entradas
- [ ] Documentación Swagger/OpenAPI activa en runtime
- [x] Cambios clasificados por tipo de mantenimiento en el README
- [x] Demo en vivo: el servidor responde a peticiones y no cae ante entradas erráticas

## 📌 Estado de documentación

La documentación de apoyo para el examen está en este `README`, en la colección Postman exportada y en el código del proyecto `epn-event-manager`. Swagger fue dejado fuera del arranque para evitar el choque de tipos del workspace, pero la API queda documentada de forma operativa en las rutas, ejemplos y colección exportable del repositorio.

## 🔎 Endpoints `suscripciones`

- `POST /suscripciones` — Crear (body: `nombre`, `precio`, `fechaInicio?`).
- `GET /suscripciones/:id` — Obtener por id.
- `PUT /suscripciones/:id` — Actualizar campos (validación aplicada).
- `DELETE /suscripciones/:id` — Eliminar.

Cada endpoint requiere `X-FIS-EPN-KEY` y devuelve códigos HTTP apropiados (400/404/200).

## 📄 Documento de API formal

Importa esta colección en Postman o en el cliente REST de VS Code:

- `epn-event-manager/postman/suscripciones.postman_collection.json`

Incluye los 4 endpoints requeridos, variables de entorno (`baseUrl`, `apiKey`, `suscripcionId`) y ejemplos listos para demo.

## 🎬 Guía de demo rápida

1. Levanta el back-end:

```bash
cd epn-event-manager
npm run start:dev
```

2. Crea una suscripción válida usando el archivo [epn-event-manager/demo.http](epn-event-manager/demo.http) o estas llamadas `curl`:

```bash
curl -X POST http://localhost:3000/suscripciones ^
   -H "Content-Type: application/json" ^
   -H "X-FIS-EPN-KEY: your-institutional-key" ^
   -d "{\"nombre\":\"Plan Basic\",\"precio\":9.99,\"fechaInicio\":\"2026-06-01\"}"
```

3. Obtén el `id` devuelto y úsalo para `GET`, `PUT` y `DELETE`:

```bash
curl http://localhost:3000/suscripciones/<id> -H "X-FIS-EPN-KEY: your-institutional-key"
curl -X PUT http://localhost:3000/suscripciones/<id> ^
   -H "Content-Type: application/json" ^
   -H "X-FIS-EPN-KEY: your-institutional-key" ^
   -d "{\"nombre\":\"Plan Pro\",\"precio\":15.5}"
curl -X DELETE http://localhost:3000/suscripciones/<id> -H "X-FIS-EPN-KEY: your-institutional-key"
```

4. Para mostrar validación y robustez, manda un precio negativo y evidencia la respuesta 400:

```bash
curl -X POST http://localhost:3000/suscripciones ^
   -H "Content-Type: application/json" ^
   -H "X-FIS-EPN-KEY: your-institutional-key" ^
   -d "{\"nombre\":\"Plan Incorrecto\",\"precio\":-1}"
```

5. Si quieres observar los logs, deja la terminal del servidor visible durante la demo.

---

Si quieres, puedo:
- Añadir una colección Postman y ejemplos `curl` para la demo.
- Preparar pruebas e2e y un pequeño `README` de demo con pasos de demostración.
