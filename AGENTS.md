# 🏛️ Project Memory Bank: Catalyst Multi-Purpose Framework

## 🎯 Contexto y Propósito

Este proyecto es un entorno de desarrollo profesional sobre **Zoho Catalyst**. Está diseñado para ser agnóstico a la industria, permitiendo la creación de soluciones escalables (E-commerce, Fintech, IoT, etc.) mediante una arquitectura de microservicios, lógica distribuida y servicios de inteligencia.

## 🛠️ Restricciones de Runtime (Catalyst CLI v1)

El agente debe operar y sugerir soluciones basadas estrictamente en los entornos soportados:

- **Node.js 20** (Entorno principal recomendado).
- **Python 3.9**.
- **Java 17**.

## 🏗️ Reglas de Arquitectura e Inmutabilidad

1. **Inmutabilidad de CLAUDE.md:** El agente tiene **PROHIBIDO** modificar este archivo una vez finalizada la fase de inicialización. Sirve como la fuente de verdad de las reglas de negocio y limitaciones. **CLAUDE.md no es un archivo de memoria comprimible — queda explícitamente excluido como target de `caveman-compress` o cualquier herramienta de reescritura automática.**
2. **CLI Compliance:** El agente solo gestiona recursos mediante comandos `catalyst` (Functions, Client, Mobile, AppLogic).
3. **Manual Blueprints:** Para recursos no gestionables vía CLI (QuickML, Circuits, Authentication, API Gateway rules), el agente **DEBE** generar una especificación técnica en `/architecture/manual_config.md` para su implementación manual en la consola web.
4. **Skills System:** Ubicadas en `/skills/`. Son módulos independientes (ej. frontend, validadores, integraciones de terceros). El agente consume sus interfaces pero no altera su lógica interna a menos que sea explícitamente requerido.
5. **Zero Inference:** No asumir el dominio del proyecto (industria o cliente) hasta que el humano lo defina en la fase de planificación.
6. **Prohibición de Edición en Consola:** Queda prohibida la edición manual de código en la consola web de Catalyst para mantener la integridad con el repositorio de GitHub. Toda modificación debe originarse en el repositorio local.

## 🛡️ Seguridad y Secretos

1. **Configuración de Funciones:** El agente debe buscar siempre archivos `catalyst-config.json.example` para entender la estructura de configuración requerida sin leer secretos reales.
2. **Prohibición de Commits:** El agente tiene estrictamente prohibido sugerir comandos `git add` que incluyan archivos `catalyst-config.json`, `.env` o `.catalystrc`.
3. **Inyección de Variables:** Al detectar una nueva función, el agente debe generar automáticamente un archivo `.example` con las llaves necesarias para que el humano las complete.

## 📋 Protocolo de Inicialización (Memory Bank)

Antes de escribir código, el agente debe validar/crear los siguientes archivos de estado en `/architecture/`:

- `productContext.md`: Define el "qué" y "por qué" del proyecto actual.
- `progress.md`: Checklist de recursos desplegados y pendientes (CLI vs Manual).
- `activeContext.md`: Estado del runtime seleccionado, entorno (Dev/Prod) y configuración de `catalyst.json`.

## 🗄️ Infraestructura y Preconfiguración (Data Store)

Antes del despliegue, garantizar la existencia de las siguientes tablas en el Data Store (configuración manual en consola web):

| Tabla                   | Propósito                                                                                     |
| :---------------------- | :-------------------------------------------------------------------------------------------- |
| **`AppData`**           | Almacena registros generados por el Seeder. Columnas: `reference_code`, `status`, `metadata`. |
| **`SystemLogs`**        | Auditoría y seguimiento de eventos. Columnas: `event_type`, `payload`.                        |
| **`PushSubscriptions`** | Registro de tokens para notificaciones push. Columnas: `user_id`, `device_token`, `platform`. |

- **Autenticación:** Uso obligatorio de **Native Catalyst Authentication** para todos los módulos que requieran identidad de usuario.
- **Seguridad:** Configurar `security-rules.json` para proteger funciones y servicios Zia de accesos no autenticados.

## ⚙️ Lógica de Módulos Core

Comportamientos predefinidos que el agente debe respetar al implementar o modificar estos módulos:

- **Zia OCR:** Invocación desde el cliente mediante funciones de integración. No implementar lógica OCR directamente en funciones `advancedio`.
- **ConvoKraft Bot:** Toda la lógica de intents y handlers se gestiona exclusivamente vía CLI desde el repositorio. **No modificar el script en la consola web de Catalyst.**
- **Servicios Asíncronos:** Usar SmartBrowz para generación de PDFs y capturas de pantalla. Usar Job Scheduling para tareas de larga duración que bloquearían funciones básicas.

## 📂 Estructura de Archivos Estándar

```text
/project-root
├── CLAUDE.md                # Reglas y Gobernanza (Inmutable)
├── catalyst.json.example    # Plantilla del formato real (el real lo genera `catalyst init` y SÍ se commitea)
├── .gitignore               # Protección de secretos (Global)
├── /functions               # Lógica de backend (Node/Python/Java)
│   └── /func_name           # Esqueleto advancedio con patrón strictScope
│       ├── index.js
│       ├── package.json
│       └── catalyst-config.json.example
├── /shared                  # Shims y utilidades comunes (copiar a cada función pre-deploy)
├── /scripts                 # Automatización (copy-shared.sh)
├── /migrations              # Documentación del esquema del Data Store (*.sql, no ejecutables)
├── /client                  # Capa de presentación (si aplica) — ver client/README.md
├── /skills                  # Módulos y Habilidades inyectables
├── /architecture            # Blueprints para configuración manual
└── /docs                    # Documentación técnica
    └── CATALYST_LESSONS_LEARNED.md  # Limitaciones y workarounds de plataforma (LECTURA OBLIGATORIA)
```

## 📝 Estándares de Desarrollo

- Commits: Uso estricto de Conventional Commits:
  feat:, fix:, chore:, docs:, refactor:. Queda estrictamente prohibido incluir firmas de atribución o co-autoría de IA (ej. `Co-Authored-By:` o `Signed-off-by:`) en los mensajes de commit.
- Nomenclatura: Variables, funciones y fragmentos de código SIEMPRE en Inglés.
- Comunicación: Explicaciones, sugerencias y resolución de dudas SIEMPRE en Español.
- Agnosticismo: No inferir el dominio, industria o cliente destino del proyecto hasta que el humano lo defina en la fase de planificación.

## 🚦 Flujo de Trabajo del Agente

- Planificación: Preguntar por Dominio, Runtime y Recursos necesarios.
- Aprobación: Esperar validación humana de la arquitectura propuesta.
- Ejecución: Generar código en /functions y archivos locales.
- Documentación de Consola: Entregar guías paso a paso para lo que no se puede hacer por CLI. **Nunca editar código directamente en la consola web de Catalyst** — toda modificación debe originarse en el repositorio.

## 📂 Estructura Interna de una Función

Toda función del tipo `advancedio` debe seguir esta estructura interna:

```text
/functions/[nombre_funcion]
├── index.js                      ← Express app, punto de entrada
├── package.json                  ← Dependencias propias
├── catalyst-config.json.example  ← Plantilla de secretos (committed)
├── catalyst-config.json          ← Secretos reales (git-ignored)
├── /lib                          ← Inicialización de clientes (SDK, Gemini, APIs)
├── /services                     ← Lógica de negocio pura
├── /routes                       ← Handlers de rutas Express
└── /prompts                      ← Plantillas de prompts (solo si aplica IA)
```

> **Nota:** cada función contiene además una copia generada de `/shared` (git-ignored, regenerada con `scripts/copy-shared.sh`). **No usar `.env`:** Catalyst ignora archivos `.env` por completo — las variables viven en `catalyst-config.json` (local) y en la Consola (producción).

## 📋 Estructura Correcta de catalyst-config.json

El archivo de configuración de cada función usa esta estructura (basada en Catalyst CLI v1):

```json
{
  "_comment": "Copiar a catalyst-config.json y completar valores reales. NUNCA hacer commit.",
  "deployment": {
    "name": "nombre_funcion",
    "stack": "node20",
    "type": "advancedio",
    "env_variables": {
      "API_KEY": "YOUR_API_KEY_HERE",
      "EXTERNAL_SERVICE_URL": "https://api.example.com"
    }
  },
  "execution": {
    "main": "index.js"
  }
}
```

**Reglas:**

- `stack`: valores válidos exactos: `node20`, `python39`, `java17`
- `type`: usar siempre `advancedio` para funciones con Express.js; para tareas programadas usar `"type": "cron"` dedicado (ver Reglas Críticas)
- `env_variables`: agregar TODAS las claves necesarias con valores placeholder
- El agente DEBE generar el `.example` antes de escribir código que consuma secretos
- **`catalyst-config.json` es la fuente de verdad del tipo de función** (no `catalyst-app.json`). Cambiar el tipo de una función existente requiere: eliminarla en Console → actualizar config → redeploy. Un simple redeploy no cambia el tipo.

**⚠️ Crítico — `env_variables` SOLO aplican en local (`catalyst serve`). NO se despliegan a producción.** En producción cada variable se configura manualmente en **Catalyst Console → Functions → Environment Variables**, función por función. Checklist al agregar una variable: (1) `catalyst-config.json` de cada función que la usa, (2) Console por cada función, en cada entorno. Catalyst tampoco lee archivos `.env` (dotenv no aplica: el CLI no los carga ni los empaqueta).

## 🗂️ Estructura Correcta de catalyst.json (CLI v1.25.x)

El archivo real lo genera `catalyst init` y **SÍ se commitea** (no contiene secretos; los IDs de proyecto viven en `.catalyst/`, que está git-ignored). Único formato soportado:

```json
{
  "functions": {
    "source": "functions",
    "targets": ["nombre_funcion"]
  },
  "client": {
    "source": "client"
  }
}
```

**Reglas:**

- `client` DEBE ser un **objeto, nunca un array** — un array es silenciosamente ignorado y el CLI busca un directorio inexistente. Múltiples frontends = subdirectorios dentro de `client/` (ej. `client/admin/`, `client/forms/`).
- Eliminar el bloque `client` si el proyecto no tiene frontend.
- **JSON estricto:** una trailing comma rompe TODO el deploy (`socket hang up / Invalid functions`) y el error se manifiesta en cualquier función, no en la última — extremadamente engañoso.

## 📦 Zcatalyst SDK — Inicialización Estándar

En funciones `advancedio` (Express.js), el SDK se inicializa con el objeto `req` de Express, **no** con `context`:

```js
// lib/catalystClient.js
const catalyst = require("zcatalyst-sdk-node");

function initCatalyst(req) {
  return catalyst.initialize(req);
}

module.exports = { initCatalyst };
```

```js
// routes/myRoute.js
const { initCatalyst } = require("../lib/catalystClient");

router.post("/data", async (req, res) => {
  const app = initCatalyst(req);

  // Data Store (ZCQL)
  const zcql = app.zcql();
  const rows = await zcql.executeZCQLQuery("SELECT * FROM MyTable LIMIT 10");

  // File Store
  const filestore = app.filestore();
  const folder = filestore.folder("my-folder");

  // Cache
  const cache = app.cache();
  await cache.segment("my-segment").put("key", "value", 600000); // TTL en ms

  res.status(200).json({ data: rows });
});
```

**Reglas críticas:**

- NUNCA inicializar sin `req` — causará errores de autenticación en producción
- En local (`catalyst serve`), el SDK usa `.catalystrc` para autenticar automáticamente
- Todos los métodos del SDK son async — usar siempre `try/catch`
- Para operaciones de Data Store usar `dsShim(app)` de `./shared/ds-shim` en lugar de `app.datastore()` directo (restaura APIs eliminadas en SDK v3 y filtra quirks de ZCQL)

### Elevación de privilegios (patrón obligatorio)

El SDK llama internamente `switchUser('user')` **en cada request HTTP** — cualquier `switchUser('admin')` manual es silenciosamente revertido (síntoma: `"No privileges"` en endpoints públicos). Patrón obligatorio para cualquier función que escriba en Data Store con usuarios públicos:

```js
// Una línea sola NO sirve — siempre ambas:
app.credential.switchUser("admin");
app.credential.strictScope = true; // bloquea el override per-request del SDK
```

Elevar **una sola vez** tras verificar la autorización propia y mantener hasta el final del handler — revertir a `'user'` a mitad de handler reintroduce el `"No privileges"`.

**Stratus:** `putObject()` hardcodea credenciales de usuario y la RAP rechaza writes con `403 access_forbidden` — `strictScope` NO aplica ahí. Único camino: pre-signed URLs con credenciales admin:

```js
const { signature } = await bucket.generatePreSignedUrl(objectKey, "PUT", {
  expiryIn: 300,
});
// PUT/GET raw contra esa URL — la firma viaja en la URL, sin header de auth
```

## ⚠️ Reglas Críticas de Plataforma (Lecciones Aprendidas)

Resumen operativo de [docs/CATALYST_LESSONS_LEARNED.md](docs/CATALYST_LESSONS_LEARNED.md) — **lectura obligatoria antes de escribir código**. Estas reglas prevalecen sobre la documentación oficial de Catalyst cuando entren en conflicto.

### ZCQL y Data Store

1. **ZCQL devuelve TODOS los campos numéricos como strings** (`"1"`, no `1`). Coercionar con `Number()` antes de cualquier comparación numérica.
2. **La primera fila de toda respuesta ZCQL es metadata** (cada valor igual a su clave). `ds-shim.js` la filtra — nunca consumir ZCQL crudo.
3. **ROWIDs exceden `Number.MAX_SAFE_INTEGER`** — tratarlos como **string** en todo el pipeline; serializar `String(ROWID)` en todo JSON al frontend. Nunca `Number(rowid)`.
4. **DATETIME rechaza ISO 8601** — formato obligatorio `"YYYY-MM-DD HH:MM:SS"` (`shared/utils/date.js → nowDatetime()`). No existe tipo TIME — extraer horas con `toHM()`.
5. **`getRow(id)` retorna `{ TableName: {...} }` envuelto y no garantiza `ROWID`** — usar `ds-shim.js`.
6. **No confiar en `WHERE <columna_texto> = '<string>'` como única vía de lookup** — en algunas tablas lanza `"Not a number type"` solo en producción. Preferir `getTableRow(ROWID)` o resolver IDs en el frontend.
7. **`"Invalid input value for column name"` = columna inexistente.** No hay migraciones por código: toda columna se crea manualmente en Console (Table Manager) ANTES del deploy. Documentar en `/migrations/*.sql`.
8. **Sin N+1 queries:** funciones con datasets crecientes deben hacer batch pre-load (todas las lecturas antes del loop, cero dentro) o exceden el timeout (`408 EXECUTION_TIME_EXCEEDED`).

### Funciones y despliegue

9. **`/shared` no se despliega:** el CLI solo empaqueta el contenido de cada función y no sigue symlinks. Ejecutar `scripts/copy-shared.sh` antes de cada deploy; los `require` siempre apuntan a `'./shared/...'`.
10. **SDK v3+: Advanced IO es `(req, res)` nativo** y Data Store perdió `getTableRows`/`getTableRow` — usar `shared/wrap-handler.js` y `shared/ds-shim.js`.
11. **Tareas programadas = `"type": "cron"` dedicado** (handler `async (context) => { ... context.close(); }`). NO usar tipo Job (pool fijo de 128MB, sin API para crear pools) ni advancedio (Console no lo permite en Cron scheduling). El deploy correcto confirma con `==> CRON` en el output del CLI.
12. **`cron_name` no admite guiones** — usar underscores (`scheduler_n4` para la función `scheduler-n4`).
13. **Email: `app.email().sendMail()`** — `app.mail()` NO existe y en llamadas fire-and-forget falla en silencio. Catalyst Mail exige doble verificación del FROM: confirmación individual + DNS (SPF/DKIM) del dominio.
14. **File Store:** `uploadFile` requiere `Readable` nombrado (con `.path`); `downloadFile` retorna stream, no Buffer — usar `shared/utils/streams.js`. Su Access Control es independiente del Data Store (habilitar en Console → FileStore → Access Control). El código referencia folders por **nombre exacto**, no por ID.
15. **Migración entre cuentas Catalyst pierde todo lo manual** (tablas, columnas, folders, crons, OAuth). Verificar columna por columna contra `/migrations/*.sql` tras cualquier recreación.

### Cliente y autenticación

16. **Auth web→función es por cookies de sesión** — `getUserToken()` no existe en Web SDK 4.5.0; no usar `Authorization: Bearer`.
17. **Hosting:** un solo `client-package.json`, `homepage` apuntando a archivo real, `index.html` explícito en toda URL (no resuelve directory index), `public` es nombre reservado, Functions siempre vía `/server/<function-name>/...`. Detalle completo en `client/README.md`.
18. **El usuario de Catalyst Auth debe existir también en la tabla de dominio correspondiente** — si solo existe en Auth: 401 silencioso. Flujo: registrar en Data Store → asignar → login.

## 🚨 Estándar de Manejo de Errores

```js
// routes/myRoute.js
router.post("/endpoint", async (req, res) => {
  try {
    const result = await myService.process(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(
      "[nombre_funcion][/endpoint] Error:",
      JSON.stringify({
        message: err.message,
        timestamp: new Date().toISOString(),
        body: req.body,
      }),
    );
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
```

**Regla:** NUNCA exponer `err.stack` o detalles internos en la respuesta al cliente. Solo registrar en logs.

## 🧪 Estándares de Testing

- **Node.js:** Jest. Archivos en `/functions/[nombre]/tests/`
- **Python:** pytest. Archivos en `/functions/[nombre]/tests/`
- **Mock del SDK:**
  ```js
  jest.mock("zcatalyst-sdk-node", () => ({
    initialize: jest.fn(() => ({
      zcql: jest.fn(() => ({ executeZCQLQuery: jest.fn() })),
      filestore: jest.fn(),
      cache: jest.fn(),
    })),
  }));
  ```
- No hacer llamadas reales al DataStore ni a APIs externas en tests unitarios
- Para variables de entorno en tests, crear `catalyst-config.test.json` con valores ficticios y agregarlo al `.gitignore`
