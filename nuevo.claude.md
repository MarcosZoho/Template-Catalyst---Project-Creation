# 🤖 CLAUDE.md - Guía de Desarrollo y Protocolos del Agente

Este archivo es la "fuente de verdad" para el desarrollo en este repositorio. Define los estándares técnicos, el flujo de trabajo y las limitaciones del agente para asegurar una arquitectura modular y agnóstica.

---

## 📝 Estándares de Desarrollo

- **Commits:** Uso estricto de **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
- **Nomenclatura:** - Variables, funciones, tablas y fragmentos de código: **Inglés** (ej. `isLimitReached`, `PushSubscriptions`).
  - Explicaciones, sugerencias y resolución de dudas: **Español**.
- **Agnosticismo:** El proyecto es modular y agnóstico. **No inferir** que el desarrollo es exclusivamente para ManageEngine u otro producto específico.

---

## 🚦 Flujo de Trabajo del Agente

1. **Planificación:** Antes de ejecutar, preguntar por Dominio, Runtime (Node.js 20, Python 3.9 o Java 17) y Recursos necesarios.
2. **Aprobación:** Esperar la validación humana de la arquitectura propuesta antes de generar archivos.
3. **Ejecución:** - Generar código en `/functions` y archivos locales.
   - Si se requieren **Skills**, el agente debe crear la carpeta correspondiente con nombres descriptivos.
   - Las skills de frontend son exclusivamente para la creación del frontend, no para apoyo lógico de la aplicación.
4. **Documentación de Consola:** Proporcionar guías paso a paso solo para aquello que no se puede realizar mediante el Catalyst CLI.

---

## 🏗️ Infraestructura y Preconfiguración (Data Store)

Antes del despliegue, se deben garantizar las siguientes tablas y servicios:

| Tabla                   | Propósito                                                                                |
| :---------------------- | :--------------------------------------------------------------------------------------- |
| **`AppData`**           | Almacena registros generados (Seeder). Columnas: `reference_code`, `status`, `metadata`. |
| **`SystemLogs`**        | Auditoría y seguimiento. Columnas: `event_type`, `payload`.                              |
| **`PushSubscriptions`** | Registro de tokens para notificaciones. Columnas: `user_id`, `device_token`, `platform`. |

- **Autenticación:** Uso obligatorio de **Native Catalyst Authentication** (Proyecto Interno).
- **Seguridad:** Configuración estricta en `security-rules.json` para proteger funciones y servicios Zia.

---

## ⚙️ Lógica de Módulos Core

- **Cron Seeder:** - Generación diaria aleatoria (3-8 registros).
  - Límite de 200 registros; al alcanzarse, detener permanentemente y enviar una **Notificación Push** al administrador.
- **Zia OCR:** Implementación desde el cliente invocando funciones de integración.
- **ConvoKraft Bot:** El nombre se preconfigura en el repo. Toda la lógica y actualización de funcionalidades se realiza mediante el CLI; **no modificar el script en la consola web**.
- **Servicios:** Uso de SmartBrowz (PDF/Screenshot) y Job Scheduling para tareas asíncronas.

---

## ⚠️ Limitaciones Importantes

- **Inmutabilidad:** El agente **no puede modificar este archivo (`CLAUDE.md`)** por cuenta propia para evitar reconfiguraciones accidentales de la arquitectura.
- **Consola de Catalyst:** Se prohíbe la edición manual de código en la consola web para mantener la integridad con el repositorio de GitHub.
