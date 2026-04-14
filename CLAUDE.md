# 🏛️ Project Memory Bank: Catalyst Multi-Purpose Framework

## 🎯 Contexto y Propósito

Este proyecto es un entorno de desarrollo profesional sobre **Zoho Catalyst**. Está diseñado para ser agnóstico a la industria, permitiendo la creación de soluciones escalables (E-commerce, Fintech, IoT, etc.) mediante una arquitectura de microservicios, lógica distribuida y servicios de inteligencia.

## 🛠️ Restricciones de Runtime (Catalyst CLI v1)

El agente debe operar y sugerir soluciones basadas estrictamente en los entornos soportados:

- **Node.js 20** (Entorno principal recomendado).
- **Python 3.9**.
- **Java 17**.

## 🏗️ Reglas de Arquitectura e Inmutabilidad

1. **Inmutabilidad de CLAUDE.md:** El agente tiene **PROHIBIDO** modificar este archivo una vez finalizada la fase de inicialización. Sirve como la fuente de verdad de las reglas de negocio y limitaciones.
2. **CLI Compliance:** El agente solo gestiona recursos mediante comandos `catalyst` (Functions, Client, Mobile, AppLogic).
3. **Manual Blueprints:** Para recursos no gestionables vía CLI (QuickML, Circuits, Authentication, API Gateway rules), el agente **DEBE** generar una especificación técnica en `/architecture/manual_config.md` para su implementación manual en la consola web.
4. **Skills System:** Ubicadas en `/skills/`. Son módulos independientes (ej. frontend, validadores, integraciones de terceros). El agente consume sus interfaces pero no altera su lógica interna a menos que sea explícitamente requerido.
5. **Zero Inference:** No asumir el dominio del proyecto (industria o cliente) hasta que el humano lo defina en la fase de planificación.

## 🛡️ Seguridad y Secretos

1. **Configuración de Funciones:** El agente debe buscar siempre archivos `catalyst-config.json.example` para entender la estructura de configuración requerida sin leer secretos reales.
2. **Prohibición de Commits:** El agente tiene estrictamente prohibido sugerir comandos `git add` que incluyan archivos `catalyst-config.json`, `.env` o `.catalystrc`.
3. **Inyección de Variables:** Al detectar una nueva función, el agente debe generar automáticamente un archivo `.example` con las llaves necesarias para que el humano las complete.

## 📋 Protocolo de Inicialización (Memory Bank)

Antes de escribir código, el agente debe validar/crear los siguientes archivos de estado en `/architecture/`:

- `productContext.md`: Define el "qué" y "por qué" del proyecto actual.
- `progress.md`: Checklist de recursos desplegados y pendientes (CLI vs Manual).
- `activeContext.md`: Estado del runtime seleccionado, entorno (Dev/Prod) y configuración de `catalyst.json`.

## 📂 Estructura de Archivos Estándar

```text
/project-root
├── CLAUDE.md                # Reglas y Gobernanza (Inmutable)
├── catalyst.json            # Configuración de recursos de Catalyst
├── .gitignore               # Protección de secretos (Global)
├── /functions               # Lógica de backend (Node/Python/Java)
│   └── /func_name
│       ├── catalyst-config.json.example
├── /client                  # Capa de presentación (si aplica)
├── /skills                  # Módulos y Habilidades inyectables
├── /architecture            # Blueprints para configuración manual
└── /docs                    # Documentación técnica del proyecto
```

## 📝 Estándares de Desarrollo

- Commits: Uso estricto de Conventional Commits:
  feat:, fix:, chore:, docs:, refactor:.
- Nomenclatura: Variables, funciones y fragmentos de código SIEMPRE en Inglés.
- Comunicación: Explicaciones, sugerencias y resolución de dudas SIEMPRE en Español.

## 🚦 Flujo de Trabajo del Agente

- Planificación: Preguntar por Dominio, Runtime y Recursos necesarios.
- Aprobación: Esperar validación humana de la arquitectura propuesta.
- Ejecución: Generar código en /functions y archivos locales.
- Documentación de Consola: Entregar guías paso a paso para lo que no se puede hacer por CLI.

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

Y la estructura de archivos raíz debe incluir:

```text
/project-root
├── CLAUDE.md
├── catalyst.json
├── .gitignore
├── .env.example                  ← Variables de entorno para desarrollo local
├── /functions
│   └── /[nombre_funcion]         ← Ver estructura interna arriba
├── /client                       ← Frontend (si aplica)
├── /scripts                      ← Automatización de build y utilidades
├── /skills                       ← Módulos independientes reutilizables
├── /architecture                 ← Memory Bank (productContext, progress, activeContext, manual_config)
└── /docs                         ← Documentación técnica del proyecto
```

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
- `type`: usar siempre `advancedio` para funciones con Express.js
- `env_variables`: agregar TODAS las claves necesarias con valores placeholder
- El agente DEBE generar el `.example` antes de escribir código que consuma secretos

## 🗂️ Estructura Correcta de catalyst.json

```json
{
  "project_name": "NOMBRE_DEL_PROYECTO",
  "project_id": "ID_GENERADO_POR_CATALYST_INIT",
  "functions": [
    {
      "name": "nombre_funcion",
      "stack": "node20",
      "type": "advancedio",
      "memory": 256,
      "timeout": 30,
      "main_file": "index.js"
    }
  ],
  "client": {
    "public_folder": "client",
    "type": "vanilla"
  },
  "cron": [],
  "applogic": []
}
```

> Eliminar el bloque `client` si el proyecto no tiene frontend. El `project_id` se genera al correr `catalyst init`.

## 📦 Zcatalyst SDK — Inicialización Estándar

En funciones `advancedio` (Express.js), el SDK se inicializa con el objeto `req` de Express, **no** con `context`:

```js
// lib/catalystClient.js
const catalyst = require('zcatalyst-sdk-node');

function initCatalyst(req) {
  return catalyst.initialize(req);
}

module.exports = { initCatalyst };
```

```js
// routes/myRoute.js
const { initCatalyst } = require('../lib/catalystClient');

router.post('/data', async (req, res) => {
  const app = initCatalyst(req);

  // Data Store (ZCQL)
  const zcql = app.zcql();
  const rows = await zcql.executeZCQLQuery('SELECT * FROM MyTable LIMIT 10');

  // File Store
  const filestore = app.filestore();
  const folder = filestore.folder('my-folder');

  // Cache
  const cache = app.cache();
  await cache.segment('my-segment').put('key', 'value', 600000); // TTL en ms

  res.status(200).json({ data: rows });
});
```

**Reglas críticas:**
- NUNCA inicializar sin `req` — causará errores de autenticación en producción
- En local (`catalyst serve`), el SDK usa `.catalystrc` para autenticar automáticamente
- Todos los métodos del SDK son async — usar siempre `try/catch`

## 🚨 Estándar de Manejo de Errores

```js
// routes/myRoute.js
router.post('/endpoint', async (req, res) => {
  try {
    const result = await myService.process(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('[nombre_funcion][/endpoint] Error:', JSON.stringify({
      message: err.message,
      timestamp: new Date().toISOString(),
      body: req.body
    }));
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
```

**Regla:** NUNCA exponer `err.stack` o detalles internos en la respuesta al cliente. Solo registrar en logs.

## 🧪 Estándares de Testing

- **Node.js:** Jest. Archivos en `/functions/[nombre]/tests/`
- **Python:** pytest. Archivos en `/functions/[nombre]/tests/`
- **Mock del SDK:**
  ```js
  jest.mock('zcatalyst-sdk-node', () => ({
    initialize: jest.fn(() => ({
      zcql: jest.fn(() => ({ executeZCQLQuery: jest.fn() })),
      filestore: jest.fn(),
      cache: jest.fn()
    }))
  }));
  ```
- No hacer llamadas reales al DataStore ni a APIs externas en tests unitarios
- Para variables de entorno en tests, crear `catalyst-config.test.json` con valores ficticios y agregarlo al `.gitignore`
