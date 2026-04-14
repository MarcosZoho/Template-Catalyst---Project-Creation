# Zoho Catalyst Master Template

Esta plantilla proporciona una arquitectura base modular y agnóstica para proyectos en **Zoho Catalyst** utilizando **Node.js 20**. Está diseñada para estandarizar el despliegue de microservicios, automatización de datos y servicios de IA.

---

## 📊 Preconfiguración del Data Store

Para que la lógica de la plantilla sea funcional desde el primer despliegue, es obligatorio crear las siguientes tablas en el **Data Store**.

### Tablas y Esquema

| Tabla                 | Columna          | Tipo de Dato  | Descripción                              |
| :-------------------- | :--------------- | :------------ | :--------------------------------------- |
| **AppData**           | `reference_code` | VarChar (100) | Identificador único del registro.        |
|                       | `status`         | VarChar (50)  | Estado del registro (Active, Processed). |
|                       | `metadata`       | JSON          | Almacenamiento flexible de metadatos.    |
| **SystemLogs**        | `event_type`     | VarChar (50)  | Categoría del evento (CRON, OCR, AUTH).  |
|                       | `payload`        | Text          | Detalle técnico o traza de error.        |
| **PushSubscriptions** | `user_id`        | VarChar (100) | Relación con el usuario autenticado.     |
|                       | `device_token`   | Text          | Token de registro para notificaciones.   |
|                       | `platform`       | VarChar (20)  | Web / iOS / Android.                     |

---

## ⚙️ Lógica de Automatización y Servicios

### 1. Data Seeder (Cron Job)

- **Frecuencia:** Ejecución diaria.
- **Comportamiento:** Genera entre **3 y 8 registros aleatorios** por día en la tabla `AppData`.
- **Límite:** Al alcanzar **200 registros**, la función se detiene permanentemente.
- **Notificación:** Envía una **Push Notification** al administrador inmediatamente después de detectar que se ha alcanzado el límite de 200 registros.

### 2. Optical Character Recognition (Zia OCR)

- **Implementación:** Módulo integrado en el cliente (Frontend).
- **Flujo:** Carga de imagen -> Llamada a `Basic Function` -> Procesamiento con Zia -> Retorno de JSON estructurado.

### 3. ConvoKraft Bot

- **Nombre:** `MasterAssistantBot`
- **Gestión:** Configuración de _intents_ y handlers gestionada íntegramente desde el repositorio en el directorio `/functions`.
- **Regla:** Queda prohibida la edición directa del código en la consola web de Catalyst para evitar desincronización con el control de versiones.

### 4. SmartBrowz & Job Scheduling

- **SmartBrowz:** Configuración para generación de PDFs y capturas de pantalla de los datos procesados.
- **Job Scheduling:** Gestión de tareas asíncronas de larga duración para evitar bloqueos en las funciones básicas.

---

## 🔒 Seguridad y Autenticación

- **Auth:** Uso de **Native Catalyst Authentication**. El sistema requiere login obligatorio para acceder a los módulos de gestión y visualización de datos.
- **Security Rules:** Configuración de reglas en el servidor para restringir el acceso a los endpoints de Zia y la escritura en tablas críticas únicamente a usuarios autenticados.

---

## 🚦 Estándares de Desarrollo

- **Conventional Commits:** Uso obligatorio de prefijos `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- **Nomenclatura:** \* Variables y funciones: **Inglés** (ej. `generateDailyRecords`, `isLimitReached`).
  - Documentación y comentarios: **Español**.
- **Despliegue:** ```bash
  catalyst deploy --only functions,client

## 🧐 Análisis de Puntos Ciegos

- **Costo de Verificación del Cron:** Aunque el seeder se detenga al llegar a 200 registros, el Cron Job sigue ejecutándose diariamente para realizar el conteo. Se recomienda implementar una bandera en Cache para una validación de "corto circuito".

- **Expiración de Tokens Push:** La tabla PushSubscriptions debe manejar la actualización de tokens. Tokens inválidos generarán errores si no se implementa una lógica de purga tras fallos de envío.

- **Dependencia de Zia OCR:** El procesamiento depende de la disponibilidad de créditos. Se debe monitorear la cuota para evitar interrupciones en el servicio del cliente.
