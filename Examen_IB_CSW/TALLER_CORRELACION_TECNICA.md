# Taller de Correlación Técnica

Este documento resume el taller pedido por el docente: relacionar conceptos de Gestión de Configuración de Software, guías de calidad y mejores prácticas de la industria con los aplicativos en los que se aplicó mantenimiento, y cerrar con una visión del estado actual y de las mejoras posibles.

## 1. Qué pide el taller

El enunciado del material plantea cuatro ideas centrales:

- explicar qué es SCM y cómo se conecta con el ciclo de vida;
- correlacionar acciones técnicas reales con normas como IEEE 828, ISO/IEC 12207, CMMI e ISO 9001:2015;
- analizar un caso práctico sobre un aplicativo existente (el caul corresponde a este crud de manejo de suscripciones);
- proponer mejoras preventivas para el siguiente ciclo.

## 2. Estado actual del proyecto

El repositorio ya tiene una base funcional para demostrar el taller:

- un frontend de gestión de suscripciones con persistencia en `localStorage`;
- envío de eventos al `EPN Event Manager` cuando se crea, edita o elimina una suscripción;
- un backend NestJS con módulo de eventos, módulo de suscripciones, guard de API key, filtro global de excepciones, validación de DTOs y logs estructurados;
- una colección Postman y un archivo `demo.http` para la prueba en vivo.

En otras palabras, el proyecto ya sirve como evidencia de mantenimiento correctivo, adaptativo, perfectivo y preventivo.

## 3. Matriz de correlación

| Acción técnica | Tipo de mantenimiento | Concepto SCM asociado | Relación con el ciclo de vida | Norma o guía |
|---|---|---|---|---|
| Corregir el guardado de eventos y registrar acciones CRUD | Correctivo | Change Item / defect fix | Verificación y validación | ISO 9001: control de no conformidad y acción correctiva |
| Usar `toISOString()` para fechas consistentes | Adaptativo | Baseline y trazabilidad | Operación y mantenimiento | ISO/IEC 12207 y buenas prácticas de configuración |
| Agregar validaciones de entrada y límites de negocio | Preventivo | Change Request controlado | Requisitos y pruebas | ISO 9001: prevención de errores y control de calidad |
| Registrar logs estructurados con timestamp ISO 8601 | Perfectivo | Configuration Item con trazabilidad | Mantenimiento y operación | IEEE 828: identificación, estado y auditoría |
| Incorporar `DB_PATH` y configuración externa | Adaptativo | Baseline controlada por entorno | Despliegue | CMMI / IEEE 828 |
| Crear una colección Postman y una guía de demo | Perfectivo | Documentación de configuración | Soporte a pruebas | ISO/IEC 12207: documentación y verificación |

## 4. Correlación con el código

Los puntos más útiles para explicar en la presentación son estos:

- [epn-event-manager/src/modules/suscripciones/suscripciones.service.ts](epn-event-manager/src/modules/suscripciones/suscripciones.service.ts) muestra validación de negocio, persistencia simple y trazabilidad.
- [epn-event-manager/src/common/guards/api-key.guard.ts](epn-event-manager/src/common/guards/api-key.guard.ts) protege el acceso con una clave externa.
- [epn-event-manager/src/common/filters/all-exceptions.filter.ts](epn-event-manager/src/common/filters/all-exceptions.filter.ts) centraliza el manejo de errores.
- [epn-event-manager/src/main.ts](epn-event-manager/src/main.ts) activa validación global y el arranque de la aplicación.
- [epn-event-manager/src/modules/events/events.service.ts](epn-event-manager/src/modules/events/events.service.ts) conserva el historial de eventos con fechas normalizadas.
- [app.js](app.js) integra el frontend con el hub, muestra logs de auditoría y mantiene el sistema usable aunque el backend no responda.

## 5. Análisis del estado actual

### Lo que ya está bien

- Hay trazabilidad entre la acción del usuario y el evento enviado al hub.
- El backend no depende de una única ejecución feliz: valida, captura errores y responde con mensajes claros.
- La demo puede hacerse sin datos iniciales, porque el sistema se autoalimenta con las acciones del CRUD.
- La documentación ya incluye comandos de ejecución y una colección para reproducir la prueba.

### Lo que todavía se puede mejorar

- activar Swagger/OpenAPI en runtime para que la API quede visible en navegación web;
- añadir pruebas e2e para el módulo de suscripciones;
- migrar la persistencia JSON a una base de datos real si el alcance del curso lo permite;
- centralizar aún más la auditoría entre frontend y backend;
- fortalecer sanitización de campos de texto y registrar usuario/rol en los eventos.

## 6. Guion recomendado para la presentación

1. Presentar el problema: mantenimiento, calidad y trazabilidad no son temas separados.
2. Mostrar el taller y el objetivo: correlacionar normas con acciones reales del proyecto.
3. Explicar el estado actual del sistema y las piezas técnicas implementadas.
4. Recorrer la matriz de correlación con dos o tres ejemplos concretos.
5. Hacer la demo en vivo: crear, editar, eliminar y forzar una validación incorrecta.
6. Cerrar con mejoras propuestas y conclusiones.

## 7. Mensaje de cierre para el informe

La idea principal del taller es demostrar que el mantenimiento no es solo corregir bugs. También implica controlar cambios, preservar la configuración base, documentar el sistema, asegurar calidad y dejar evidencia verificable para futuras iteraciones.
