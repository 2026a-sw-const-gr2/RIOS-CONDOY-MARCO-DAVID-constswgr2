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
