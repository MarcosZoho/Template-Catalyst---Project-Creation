# Zoho Catalyst Master Template (Agnostic & Modular)

Plantilla profesional y agnóstica para el desarrollo de aplicaciones sobre **Zoho Catalyst**. Diseñada para ser escalable, segura y compatible con flujos de trabajo asistidos por agentes de IA, con gobernanza explícita en `AGENTS.md` y un sistema de **Memory Bank** para la gestión de arquitectura.

## Arquitectura del Proyecto

El repositorio sigue una estructura modular que separa la lógica de negocio, las habilidades extendidas y la documentación de recursos no automatizables por CLI.

```text
/
├── AGENTS.md                # Gobernanza para agentes de IA (Inmutable)
├── catalyst.json.example    # Plantilla del formato real (el real lo genera `catalyst init`)
├── .gitignore               # Protección de secretos y dependencias
├── /functions               # Microservicios (Node.js 20, Python 3.9, Java 17)
│   └── /[function_name]
│       ├── index.js/main.py # Esqueleto advancedio con patrón strictScope
│       ├── package.json
│       └── catalyst-config.json.example  # Plantilla de variables de entorno
├── /shared                  # Shims y utilidades (wrap-handler, ds-shim, date/streams/email)
├── /scripts                 # copy-shared.sh — copia /shared a cada función pre-deploy
├── /migrations              # Documentación del esquema del Data Store (*.sql)
├── /client                  # Frontend — reglas de hosting en client/README.md
├── /skills                  # Módulos y habilidades inyectables (independientes)
├── /architecture            # Memory Bank & Blueprints
│   ├── productContext.md    # Propósito y objetivos del proyecto (Agnóstico)
│   ├── activeContext.md     # Estado actual del runtime y entorno
│   ├── progress.md          # Checklist de despliegue (CLI vs Manual)
│   └── manual_config.md     # Guía para recursos No-CLI (Circuits, QuickML)
├── /docs
│   └── CATALYST_LESSONS_LEARNED.md  # Limitaciones y workarounds de plataforma (lectura obligatoria)
└── README.md                # Guía de inicio rápido (este archivo)
```

## Gestión de Seguridad y Secretos

Para evitar la exposición de credenciales y llaves de API en el control de versiones, esta plantilla implementa un sistema de **Shadow Config**:

1. **`.gitignore` global:** Bloquea automáticamente archivos críticos que nunca deben subir al repositorio:
   - `functions/**/catalyst-config.json` (configuración de funciones y llaves de entorno).
   - `.env` / `.env.local` (nota: Catalyst **ignora** archivos `.env` — las variables viven en `catalyst-config.json` local y en la Consola en producción).
   - `.catalyst/` (IDs de organización/proyecto generados por `catalyst init`).
   - `.catalystrc` (identificadores locales de organización).
   - `functions/*/shared/` (copias generadas por `scripts/copy-shared.sh`).
2. **Archivos `.example`:** Cada función incluye un `catalyst-config.json.example`. Copiarlo y renombrarlo a `catalyst-config.json` para colocar las credenciales reales localmente.
3. **Validación de agente:** El agente de IA tiene prohibido sugerir comandos `git add` que incluyan archivos de configuración real.

### Autenticación en Runtime

- **Autenticación nativa:** El uso de **Native Catalyst Authentication** es obligatorio para acceder a los módulos de gestión y visualización de datos.
- **Security Rules:** Configurar reglas de seguridad para restringir el acceso a los endpoints de Zia y la escritura en tablas críticas únicamente a usuarios autenticados.

## Gobernanza para Agentes de IA

Esta plantilla define reglas estrictas en `AGENTS.md` para el trabajo de agentes de IA sobre el proyecto:

1. **Lectura de AGENTS.md:** El agente asimila las reglas de inmutabilidad y los estándares de código. No puede modificar este archivo tras la inicialización.
2. **Fase de planificación:** Antes de escribir código, el agente debe completar los archivos en `/architecture/` para definir el dominio, objetivos y el stack tecnológico.
3. **Uso de Skills:** Las habilidades en `/skills/` son módulos aislados. El agente consume sus interfaces pero no altera su lógica interna, permitiendo que el humano inyecte componentes de frontend o utilidades sin interferencias.
4. **Manual Blueprints:** Para servicios que no se crean por CLI (como la configuración visual de **Circuits** o modelos de **QuickML**), el agente genera la especificación técnica exacta en `manual_config.md`.

## Preconfiguración del Data Store

Crear las siguientes tablas en el **Data Store** de Catalyst antes de ejecutar cualquier función. La plantilla no puede operar correctamente sin ellas.

| Tabla                 | Columna          | Tipo de Dato  | Descripción                                          |
| :-------------------- | :--------------- | :------------ | :--------------------------------------------------- |
| **AppData**           | `reference_code` | VarChar (100) | Identificador único del registro.                    |
|                       | `status`         | VarChar (50)  | Estado del registro (Active, Processed).             |
|                       | `metadata`       | JSON          | Almacenamiento flexible de metadatos.                |
| **SystemLogs**        | `event_type`     | VarChar (50)  | Categoría del evento (CRON, OCR, AUTH).              |
|                       | `payload`        | Text          | Detalle técnico o traza de error.                    |
| **PushSubscriptions** | `user_id`        | VarChar (100) | Relación con el usuario autenticado.                 |
|                       | `device_token`   | Text          | Token de registro para notificaciones push.          |
|                       | `platform`       | VarChar (20)  | Plataforma del dispositivo: Web / iOS / Android.     |

> Estas tablas se crean manualmente en la Consola de Catalyst → Data Store → Add Table. Ver `architecture/manual_config.md` para la guía detallada.

## Lógica de Automatización y Servicios

### 1. Data Seeder (Cron Job)

- **Frecuencia:** Ejecución diaria.
- **Comportamiento:** Genera entre **3 y 8 registros aleatorios** por día en la tabla `AppData`.
- **Límite:** Al alcanzar **200 registros**, la función se detiene permanentemente.
- **Notificación:** Envía una **Push Notification** al administrador al detectar que se alcanzó el límite.
- **Optimización:** Implementar una bandera en **Cache** para validación de corto circuito y evitar el costo de conteo en cada ejecución.

### 2. Optical Character Recognition (Zia OCR)

- **Implementación:** Módulo integrado en el cliente (Frontend).
- **Flujo:** Carga de imagen → Llamada a `Basic Function` → Procesamiento con Zia → Retorno de JSON estructurado.

### 3. ConvoKraft Bot

- **Nombre preconfigurado:** `MasterAssistantBot`
- **Gestión:** Configuración de _intents_ y handlers gestionada íntegramente desde el repositorio en `/functions`.
- **Regla:** Queda prohibida la edición directa del código en la consola web de Catalyst para evitar desincronización con el control de versiones.

### 4. SmartBrowz & Job Scheduling

- **SmartBrowz:** Generación de PDFs y capturas de pantalla de los datos procesados.
- **Job Scheduling:** Gestión de tareas asíncronas de larga duración para evitar bloqueos en las funciones básicas.

## Inicio Rápido

### 1. Preparación

```bash
git clone <tu-repo-url>
cd <nombre-del-proyecto>
catalyst login
```

### 2. Inicialización de Proyecto

```bash
catalyst init
```

### 3. Configuración de Secretos

```bash
cp functions/mi_funcion/catalyst-config.json.example functions/mi_funcion/catalyst-config.json
# Edita el archivo con tus llaves reales
```

### 4. Despliegue

```bash
# Siempre primero: copiar /shared dentro de cada función
# (el CLI no empaqueta directorios padre ni sigue symlinks)
./scripts/copy-shared.sh

# Desplegar solo las funciones (lógica de backend)
catalyst deploy --only functions

# Desplegar funciones y cliente web
catalyst deploy --only functions,client

# Desplegar todo el proyecto (Client, Functions, AppLogic, Cron)
catalyst deploy
```

## Estándares de Desarrollo

- **Mensajes de Commit:** Uso estricto de **Conventional Commits**:
  - `feat:` Nuevas funcionalidades.
  - `fix:` Corrección de errores.
  - `chore:` Tareas rutinarias, dependencias o configuración.
  - `docs:` Cambios en documentación o Memory Bank.
  - `refactor:` Mejoras de código que no afectan el funcionamiento.
- **Nomenclatura:** Variables, nombres de funciones, tablas y lógica de código **siempre en Inglés**.
- **Comunicación:** Documentación técnica, comentarios en el código y explicaciones al usuario **siempre en Español**.
- **Runtimes:** Proponer el runtime adecuado (**Node.js 20**, **Python 3.9** o **Java 17**) basándose en los requerimientos técnicos definidos en la fase de planificación.

---

## Configuración del Entorno (Primera vez)

```bash
# 1. Instalar Node.js 20 (usar nvm para gestión de versiones)
nvm install 20
nvm use 20
node --version  # debe mostrar v20.x.x

# 2. Instalar Catalyst CLI
npm install -g zcatalyst-cli
catalyst --version  # debe mostrar 1.x.x

# 3. Python 3.9 (solo si el proyecto requiere funciones Python)
pyenv install 3.9.18
pyenv local 3.9.18
python --version  # debe mostrar 3.9.x

# 4. Clonar e inicializar
git clone <tu-repo-url>
cd <nombre-del-proyecto>
catalyst login
catalyst init
# `catalyst init` genera catalyst.json (formato de referencia en catalyst.json.example)
# y el directorio .catalyst/ (git-ignored) con los IDs del proyecto
```

---

## Flujo de Trabajo de Desarrollo

```
1. Inicio de sesión
   ├── Leer architecture/activeContext.md  (foco actual, blockers)
   ├── Leer architecture/progress.md       (qué está desplegado)
   └── Verificar entorno: catalyst env list

2. Desarrollo local
   ├── catalyst serve                       (servidor local con hot-reload)
   ├── Escribir tests en functions/[name]/tests/
   └── Actualizar architecture/ al tomar decisiones importantes

3. Commit seguro
   ├── git check-ignore -v functions/*/catalyst-config.json  (verificar que no hay secretos)
   ├── git add -p                           (modo patch — revisar cada cambio)
   └── git commit -m "feat: descripción en inglés"

4. Deploy
   ├── catalyst deploy --only functions     (solo backend)
   ├── catalyst logs --tail                 (verificar que no hay errores)
   └── Actualizar progress.md con fecha y URL del endpoint
```

---

## Troubleshooting

### `catalyst serve` falla con "Project not found"
Correr `catalyst init` primero para generar `.catalyst/project.json`. Verificar que estás logueado: `catalyst login`.

### La función retorna `401 Unauthorized` en local
Verificar que `.catalystrc` existe en el directorio home (lo crea `catalyst login`). El SDK lo usa para autenticar localmente. Nunca hacer commit de este archivo.

### `catalyst deploy` falla con "Runtime not supported"
Revisar `deployment.stack` en el `catalyst-config.json` de cada función — los valores exactos aceptados son: `node20`, `python39`, `java17`. No usar `node18`, `nodejs20`, etc.

### `catalyst deploy` falla con "socket hang up / Invalid functions"
Trailing comma en algún JSON de configuración. El error se manifiesta en cualquier función, no en la que tiene la coma — revisar todos los JSON con un linter.

### Función falla en runtime con `Cannot find module './shared/...'`
Falta correr `./scripts/copy-shared.sh` antes del deploy. El CLI no empaqueta directorios padre ni sigue symlinks.

### Secretos aparecen en `git status`
Correr: `git check-ignore -v functions/*/catalyst-config.json`. Si no hay output, el patrón en `.gitignore` no está haciendo match — verificar que el archivo contiene `**/catalyst-config.json`.

### La función funciona local pero falla en producción
Las funciones en producción **no leen** el archivo `catalyst-config.json` local. Las variables de entorno deben estar configuradas en la **Consola de Catalyst** → Functions → [nombre] → Environment Variables, con los mismos nombres de clave definidos en `env_variables` del `catalyst-config.json.example`.

---

## Puntos Ciegos Conocidos

Problemas recurrentes detectados en proyectos anteriores que deben considerarse desde el diseño:

- **Costo de verificación del Cron:** Aunque el seeder se detenga al llegar a 200 registros, el Cron Job sigue ejecutándose diariamente. Implementar una bandera en **Cache** para una validación de corto circuito que evite el query innecesario.
- **Expiración de tokens Push:** La tabla `PushSubscriptions` debe manejar la actualización de tokens. Los tokens inválidos generarán errores silenciosos si no se implementa una lógica de purga tras fallos consecutivos de envío.
- **Dependencia de créditos de Zia OCR:** El procesamiento de imágenes depende de la disponibilidad de créditos en la cuenta de Catalyst. Monitorear la cuota activamente para evitar interrupciones en el servicio.

---

_Plantilla para la creación de proyectos robustos y profesionales en el ecosistema de Zoho Catalyst._
