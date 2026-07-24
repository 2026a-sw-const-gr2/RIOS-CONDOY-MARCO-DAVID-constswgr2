# Subscription Manager (CRUD Frontend)

CRUD de gestión de suscripciones. Trabaja en `localStorage` y publica eventos hacia el EPN Event Manager.

## 🚀 Cómo abrir

Doble clic en `index.html` o usar la extensión **Live Server** de VS Code (`http://127.0.0.1:5500`).

## 🔗 Integración con el Hub

Envía eventos a `POST http://localhost:3000/events` con `action: CREATE | UPDATE | DELETE`.

Si el hub no está corriendo, los datos quedan guardados en `localStorage` y el log muestra "sin conexión".

## 📦 Estructura

```
subscription-manager/
├── index.html   ← UI principal
├── style.css    ← Estilos
├── app.js       ← Lógica CRUD + integración con hub
├── package.json ← Dependencias (sin scripts)
└── README.md    ← Este archivo
```

## ✅ Mejoras candidatas para los tickets del II Bimestre

- Feature: import/export JSON/CSV
- Feature: configuración persistente del `X-FIS-EPN-KEY`
- Feature: ordenar/filtrar por categoría o por día de pago
- Bug: día de pago `31` en meses de 30 días puede fallar
- Bug: `parseFloat` con coma decimal europea rompe
- TechDebt: separar `app.js` en módulos (estado, render, api, utils)
- TechDebt: tipar mensajes de error del catch
- TechDebt: extraer `daysUntil()` a helper testeable
