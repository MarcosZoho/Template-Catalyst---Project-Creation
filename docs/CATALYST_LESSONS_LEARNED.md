# CATALYST_LESSONS_LEARNED.md

> **Fuente de verdad:** `MEMORY.md` de este workspace (proyecto Zoholics 1on1 App).
> **Alcance:** Exclusivamente limitaciones, comportamientos no documentados y workarounds de la plataforma **Zoho Catalyst** (CLI v1.25.x · `zcatalyst-sdk-node` v3.4.0 · Web SDK 4.5.0 · stack `node20`). No incluye lógica de negocio.
> **Propósito:** Evitar repetir en futuros proyectos los errores que aquí costaron días de debugging.

---

## 1. Undocumented Permissions & Authentication

### 1.1 El SDK sobreescribe `switchUser('admin')` en cada request — flag `strictScope` obligatorio

El hallazgo más costoso del proyecto. `AuthorizedHttpClient.send()` en `zcatalyst-sdk-node` llama internamente `this.app.credential.switchUser(request.user)` **en cada request HTTP**, y todas las operaciones de Data Store, ZCQL, File Store y Stratus tienen hardcodeado `user: CREDENTIAL_USER.user = 'user'`. Resultado: cualquier llamada manual a `app.credential.switchUser('admin')` es **silenciosamente revertida** en el momento en que el SDK envía el request real. Los síntomas eran errores `"No privileges"` en endpoints públicos (usuarios sin acceso de escritura al Data Store) y uploads de audio.

La solución está en una propiedad no documentada de la clase `CatalystCredential`: el flag `strictScope`. Cuando es `true`, `switchUser()` se convierte en no-op y la credencial queda bloqueada:

```js
// zcatalyst-sdk-node/lib/credential.js (comportamiento interno)
switchUser(givenUser) {
    if (this.strictScope) { return this.currentUser; }  // SDK override blocked
    ...
}
```

**Patrón obligatorio** para cualquier Cloud Function que necesite credenciales admin (extraído de `functions/user-registration/index.js`):

```javascript
// Public users lack DataStore write privileges — use admin credentials for all DS ops.
// strictScope=true prevents the SDK's per-request switchUser('user') override.
app.credential.switchUser('admin');
app.credential.strictScope = true;
const ds = dsShim(app);
```

**Regla:** una línea sola no sirve. Siempre `switchUser('admin')` **+** `strictScope = true`.

### 1.2 Stratus RAP rechaza writes con credenciales de usuario — pre-signed URLs como único camino

`bucket.putObject()` también hardcodea `CREDENTIAL_USER.user`, y la Resource Access Policy (RAP) de Stratus rechaza writes de credenciales no-admin con `403 access_forbidden`. El patrón `strictScope` no aplica aquí. El único camino que no requiere cambios en Catalyst Console es generar una pre-signed URL con credenciales admin y hacer el PUT/GET raw contra esa URL (la firma viaja en la URL, sin header de autorización). De `functions/file-service/index.js`:

```javascript
// putObject() hardcodes CREDENTIAL_USER.user — Stratus RAP blocks user-level writes.
// generatePreSignedUrl uses CREDENTIAL_USER.admin (admin creds) to sign the URL;
// the actual PUT to that signed URL requires no auth header.
const putResult = await bucket.generatePreSignedUrl(objectKey, 'PUT', { expiryIn: 300 });
const putUrl    = putResult?.signature;
await putToSignedUrl(putUrl, audioBuffer, 'audio/webm');

// Download: 302 redirect — the browser <audio> streams directly from Stratus
const result    = await bucket.generatePreSignedUrl(objectKey, 'GET', { expiryIn: 3600 });
const signedUrl = result?.signature;
```

Esta limitación fue el motivo final de migrar el audio de File Store a Stratus.

### 1.3 File Store tiene su propio Access Control, separado del Data Store

Los permisos de folder de File Store deben habilitarse en **Catalyst Console → FileStore → Access Control**. El ACL del Data Store no aplica. Uploads que funcionaban localmente fallaban en producción hasta habilitar esto.

### 1.4 Autenticación web→función es por cookies de sesión — `getUserToken()` no existe

En el Web SDK 4.5.0, `catalyst.auth.getUserToken()` **no existe** (`getUserToken is not a function`). La autenticación entre el cliente hosteado y las Functions funciona por **cookies de sesión automáticas**, no por Bearer token. Hubo que eliminar todo el bloque de `Authorization: Bearer {token}` del `api.js`.

### 1.5 Endpoints de auth hosteada: rutas y comportamientos no documentados

- `/__catalyst/auth/signout` **no existe** — retorna `{"error_code":"INVALID_URL_PATTERN"}`. El logout correcto es `catalyst.auth.signOut(loginUrl)` vía SDK, pasando el `loginUrl` explícito (si no, el SDK lanza `TypeError: Cannot read properties of undefined (reading 'startsWith')`).
- `/__catalyst/sdk/init.js` **auto-redirige** usuarios no autenticados a Zoho OAuth. Cargarlo en la página de login produce un redirect loop. Fix: verificar `catalyst.auth.isUserAuthenticated()` antes de llamar `signIn()`, y cargar el SDK solo en páginas de contenido.
- Catalyst **ignora el parámetro `service_url`** pasado a `/__catalyst/auth/login` y usa la URL configurada en Console. La página de login debe ser un "smart router": llamar un endpoint propio (`GET /api/agents/me`) — si 200 ruta al panel, si 401 redirige al hosted login.
- `service_url` en `catalyst.auth.signIn()` requiere URL absoluta: `location.origin + base + '/admin/login/callback.html'`. Un path relativo se resuelve contra root, no contra `/app/`.

### 1.6 Catalyst Mail exige doble verificación del remitente

Error real: `You need to verify the email domain :: <domain> before accessing this API`. Catalyst Mail requiere **dos** niveles de verificación del FROM address:

1. Confirmación individual del correo (link en Console → Mail → From Address)
2. **Verificación DNS (registros SPF + DKIM)** del dominio FROM — esta es la que no está documentada con claridad

La confirmación individual sola **no** habilita el envío vía API. Si el correo falla con cualquier error de dominio, revisar DNS primero.

### 1.7 El usuario de Auth debe existir también en la tabla de dominio

Un agente creado solo en Catalyst Auth no puede operar: el middleware (`resolveRole`) exige una fila en la tabla `Agente` del Data Store con el mismo correo. Si solo existe en Auth → 401 silencioso y panel en blanco. Flujo correcto: registrar primero en Data Store, luego asignar, luego login (el `catalystUserId` se puebla en el primer login).

---

## 2. Platform Limitations & Constraints

### 2.1 ZCQL devuelve TODOS los campos numéricos como strings

`reg.numeroDeSesion` llega como `"1"`, no `1`. Toda comparación estricta (`=== 1`) falla sistemáticamente. Esto causó dos bugs críticos (prioridades P1–P3 clasificadas como P6; razones de prioridad vacías). **Regla global:** cualquier comparación numérica de un campo proveniente de ZCQL debe coercionar con `Number()` primero:

```javascript
const numeroDeSesion = Number(reg.numeroDeSesion);  // ZCQL returns "1", not 1
```

### 2.2 ZCQL inserta una fila de metadata como primer elemento del resultado

La primera fila de toda respuesta ZCQL es una fila header donde cada valor es igual a su clave: `{ estado: "estado", nombre: "nombre", ... }`. Rompe todo filtrado si no se descarta. Filtro aplicado en `shared/utils/ds-shim.js`:

```javascript
// Catalyst ZCQL returns the first element as a column-metadata row
// where every key equals its value (e.g. { estado: "estado" }).
const isHeaderRow = (r) => r && typeof r === 'object' && Object.keys(r).length > 0
  && Object.entries(r).every(([k, v]) => k === v);
```

Efecto colateral real: un registro llegó a persistirse con `estado = "estado"` por este bug.

### 2.3 ROWIDs exceden `Number.MAX_SAFE_INTEGER`

`Number("48165000000050342")` → `48165000000050344` (valor incorrecto). Síntomas en cadena: el form público fallaba con `Number 35798000000060230 is greater than Number.MAX_SAFE_INTEGER. Use BigInt`, y los `onclick` con IDs truncados no encontraban sus elementos DOM. **Reglas:**

- Los IDs se mantienen como **string** en todo el pipeline (se eliminaron `Number()` de 33 ubicaciones en 9 archivos).
- Todo endpoint que devuelva ROWIDs al frontend debe serializar `String(ROWID)` en el JSON.

### 2.4 ZCQL `"Not a number type"` en comparaciones de strings sobre ciertas tablas

`SELECT … WHERE nombre = 'PartnerInformation'` sobre `UnidadNegocio` lanza `"Not a number type"` **en producción** (el error nace en el servidor Catalyst, no en Node). Reproducible solo en algunas tablas/columnas. Workaround adoptado: eliminar el lookup por nombre del backend y resolver el ROWID desde el cache de categorías del frontend, o usar `getTableRow(ROWID)`. **Regla:** nunca confiar en `WHERE <text_column> = '<string>'` como única vía de lookup.

### 2.5 DATETIME estricto y ausencia de tipo TIME

- Catalyst Data Store **rechaza ISO 8601** en columnas DATETIME (`"datetime value expected"`). El formato obligatorio es `"YYYY-MM-DD HH:MM:SS"`. Se centralizó en `nowDatetime()` (`shared/utils/date.js`) y se eliminaron todos los `toISOString()` en paths de inserción.
- **No existe tipo TIME nativo.** Los horarios de slots se guardan como DATETIME; al no prefijar la fecha del evento quedaron persistidos como `"1970-01-01 09:00:00"` y así se mostraban en correos y vistas públicas. Workaround permanente: helper `toHM(v)` que extrae `"HH:MM"` de cualquier formato (datetime completo, `HH:MM:SS`, `HH:MM`, epoch).

### 2.6 `"Invalid input value for column name"` = columna inexistente en el esquema real

Catalyst rechaza cualquier `insertRow`/`updateRow` con campos que no existen en el Data Store. No hay migraciones ejecutables desde código: **toda columna nueva debe crearse manualmente en Catalyst Console (Table Manager) antes del deploy**. Este error apareció múltiples veces (`esExcedente`, `motivoExcedente`, 8 columnas tras migrar de cuenta). Mantener `migrations/*.sql` como documentación del esquema esperado y verificar contra Console.

### 2.7 `getRow` devuelve objeto envuelto y no garantiza `ROWID`

- `table.getRow(id)` retorna `{ TableName: {...} }`, no el objeto plano. El shim hace `return row[tableName] || row`.
- El objeto retornado **no garantiza** incluir `ROWID` (es la clave de lookup, no un campo de datos). Esto rompió el auto-assign completo (`eventoId = undefined` en queries derivadas). Fix defensivo:

```javascript
if (!evento.ROWID) evento.ROWID = eventoId;  // getRow does not guarantee ROWID presence
```

### 2.8 Timeout de Functions — `408 EXECUTION_TIME_EXCEEDED`

El handler `handleAutoAssign` con ~29 registros en cola excedía el límite de ejecución haciendo lecturas de DB dentro del loop de asignación. Fix: rediseño con **batch pre-load** — todas las lecturas (slots, agentes, sesiones, actividades) se cargan antes del loop; cero lecturas de DB dentro del loop. Regla de diseño para Catalyst: nunca hacer N+1 queries en un handler con datasets crecientes.

### 2.9 SDK v3.4.0 — breaking changes sin aviso

Dos APIs desaparecieron al instalar el SDK v3.4.0:

1. **Advanced IO cambió de `(context, basicIO)` a `(req, res)` nativo** (`TypeError: basicIO.getRequestMethod is not a function`).
2. **Data Store perdió `getTableRows` / `getTableRow`** (`buTable.getTableRows is not a function`) — reemplazados por ZCQL y `getRow(id)`.

Ambos se resolvieron con shims de compatibilidad (ver §3.1 y §3.2).

### 2.10 Job Functions: pool fijo de 128MB y sin API para crear pools

El único job pool existente tiene 128MB — insuficiente para funciones con default 256MB — y el SDK **no permite crear pools** (`jobScheduling.CRON.createCron` falló por esto). Además, Catalyst Console no permite seleccionar funciones Advanced IO en Cron scheduling. El tipo correcto para tareas programadas es el dedicado: `"type": "cron"` con handler `async (context) => { ... context.close(); }`.

### 2.11 File Store: requisitos de stream no documentados

- `folder.uploadFile({ code })` requiere un **`Readable` stream nombrado** (con `.path` seteado). Pasar un `Buffer` directo omite `filename` en el Content-Disposition → error "wrong format". Helper: `bufferToNamedStream(buf, filename)`.
- `folder.downloadFile(fileId)` retorna un **`ReadableStream`**, no un `Buffer`. Llamar `.length` sobre el stream rompe la descarga. Helper: `streamToBuffer(stream)`.

---

## 3. Workarounds & Hotfixes

### 3.1 `wrap-handler.js` — shim Advanced IO `(req, res)` → `(context, basicIO)`

Convierte la API nueva del SDK v3 al contrato anterior usado por las 17 funciones. Fragmento real de `shared/utils/wrap-handler.js`:

```javascript
function wrapHandler(handler) {
  return async (req, res) => {
    const body = await parseBody(req);
    let statusCode = 200;

    const basicIO = {
      getRequestMethod: ()     => req.method,
      getRequestPath:   ()     => {
        const raw = (req.url || '').split('?')[0];
        // Strip /server/<function-name> prefix injected by Catalyst local dev routing
        return raw.replace(/^\/server\/[^/]+/, '') || '/';
      },
      getRequestHeader: (name) => (req.headers || {})[name.toLowerCase()] || null,
      getRequestBody:   ()     => body,
      setResponseCode:  (code) => { statusCode = code; },
      sendResponse:     (data) => { /* writeHead + end */ },
    };

    await handler(req, basicIO);  // req nativo es compatible con catalyst.initialize(req)
  };
}
```

Detalles importantes: el `context` que recibe el handler es el `IncomingMessage` nativo (válido para `catalyst.initialize(context)`), y el parser de body tuvo que reescribirse en modo **binario** (raw `Buffer`) porque el parsing como string UTF-8 corrompía los audios multipart.

### 3.2 `ds-shim.js` — compatibilidad Data Store pre-v3

Restaura `getTableRows({select, criteria})` (vía ZCQL) y `getTableRow(id)` (vía `getRow` + unwrap), incluyendo el filtro de metadata row (§2.2). Uso: `dsShim(app)` en lugar de `app.datastore()` en las 17 funciones y en `auth.js`.

```javascript
async getTableRow(id) {
  const row = await table.getRow(id);
  if (!row) return null;
  // Unwrap tableName wrapper if Catalyst returns { TableName: {...} }
  return row[tableName] || row;
},
```

### 3.3 `shared/` no se despliega con las funciones — copias físicas obligatorias

Catalyst CLI empaqueta **solo** el contenido de cada función; no incluye directorios padre y **no sigue symlinks** al zippear. Todas las funciones fallaban en runtime con `Cannot find module '../../shared/...'`. Workaround permanente — copiar `shared/` dentro de cada función antes de cada deploy:

```bash
for dir in functions/*/; do rm -rf "$dir/shared"; cp -r shared "$dir/shared"; done
```

Los `require` cambian de `'../../shared/...'` a `'./shared/...'`. Costo: toda modificación a `shared/` debe recopiarse a las 17 funciones (mismo patrón aplica a `roles.js`).

### 3.4 Credenciales admin + Stratus pre-signed URLs

Ver §1.1 y §1.2 — son los dos workarounds de mayor impacto del proyecto. Resumen operativo:

```javascript
// Pattern 1: elevate DataStore/ZCQL ops (and keep them elevated)
app.credential.switchUser('admin');
app.credential.strictScope = true;

// Pattern 2: Stratus writes — never putObject(); always pre-signed PUT
const { signature } = await bucket.generatePreSignedUrl(objectKey, 'PUT', { expiryIn: 300 });
```

Nota adicional descubierta en el camino: elevar a admin y luego revertir con `switchUser('user')` a mitad de handler reintroduce el `"No privileges"` en las operaciones siguientes. Una vez verificada la autorización propia (vía `resolveRole`), elevar **una vez** y mantener hasta el final del handler.

### 3.5 `app.email()`, no `app.mail()`

El SDK expone `app.email().sendMail()`. Durante semanas las 17 funciones llamaban `app.mail()` (función inexistente) y todos los envíos fire-and-forget fallaron **silenciosamente**. Patrón correcto:

```javascript
async function sendEmail(app, { to, subject, htmlBody, textBody }) {
  const email = app.email();
  await email.sendMail({
    from_email: process.env.SENDER_EMAIL,
    to_email:   [to],
    subject,
    content:    htmlBody || textBody,
    html_mode:  !!htmlBody,
  });
}
```

Lección adicional: los errores en llamadas fire-and-forget no aparecen en ningún lado — para debugging de email, usar `await` temporalmente.

### 3.6 Resolución de IDs en frontend cuando ZCQL falla server-side

Para el quirk de §2.4 (`"Not a number type"`), el ROWID de la BU especial se cachea en el frontend cuando las categorías cargan (`renderBuCards()` guarda `partnerInfoBuId` como variable de módulo) y se envía resuelto al backend. El backend nunca vuelve a hacer lookup por nombre.

---

## 4. Deployment & Environment Gotchas

### 4.1 Catalyst NO respeta `.env` — variables de entorno por función en `catalyst-config.json`

Las Functions de Catalyst ignoran archivos `.env` estándar (dotenv no aplica: el CLI no los carga ni los empaqueta). Las variables de entorno se declaran en el parámetro `env_variables` dentro del `catalyst-config.json` **de cada función**. Estructura real de `functions/user-registration/catalyst-config.json`:

```json
{
  "deployment": {
    "name": "user-registration",
    "stack": "node20",
    "type": "advancedio",
    "env_variables": { "SENDER_EMAIL": "<sender-email>" }
  },
  "execution": {
    "main": "index.js"
  }
}
```

Y de `functions/file-service/catalyst-config.json`:

```json
{
  "deployment": {
    "name": "file-service",
    "stack": "node20",
    "type": "advancedio",
    "env_variables": {
      "GEMINI_API_KEY": "<set in Catalyst Console for production>"
    }
  },
  "execution": { "main": "index.js" }
}
```

**Gotcha doble — y crítico:** estos `env_variables` aplican **solo a desarrollo local** (`catalyst serve`). **NO se despliegan a producción.** En producción cada variable debe configurarse manualmente en **Catalyst Console → Functions → Environment Variables**, función por función. Olvidar el lado de Console produjo el bug de `SENDER_EMAIL` vacío que dejó 6 schedulers sin enviar correos. Checklist al agregar una variable: (1) `catalyst-config.json` de cada función que la usa, (2) Console por cada función, en cada entorno.

### 4.2 `catalyst-config.json` es la fuente de verdad del tipo de función — no `catalyst-app.json`

El CLI usa `functions/*/catalyst-config.json` (`deployment.type`) para determinar el tipo real de la función. El `type` declarado en `catalyst-app.json` es ignorado a estos efectos (en este repo los schedulers figuran como `"Advanced IO"` en `catalyst-app.json` pero son `"type": "cron"` reales). Además, **cambiar el tipo de una función existente requiere**: (1) eliminar la función en Console, (2) actualizar `catalyst-config.json`, (3) redeploy. Un simple redeploy no cambia el tipo.

Iteraciones que costó descubrir el tipo correcto para schedulers: `"Job"` (falló — pool 128MB), `"advancedio"` (falló — Console no lo permite en Cron scheduling), `"cron"` (correcto — el deploy confirma con `==> CRON` en el output del CLI).

### 4.3 JSON estricto en `catalyst-app.json` — trailing commas rompen TODO el deploy

Una coma trailing tras el último elemento del array `functions` produjo `socket hang up / Invalid functions`. El error se manifiesta como falla de deploy en **cualquier** función, no en la última — extremadamente engañoso para diagnosticar.

### 4.4 `catalyst.json` — `client` como array no soportado (CLI v1.25.1)

`"client": [{"source":"public"},{"source":"admin"}]` es silenciosamente ignorado: `clientConfig?.source || fallback` sobre un array da `undefined` → cae al fallback `'client'` y el CLI busca un directorio inexistente. Único formato soportado:

```json
{
  "functions": { "source": "functions", "targets": [ "..." ] },
  "client": { "source": "client" }
}
```

Estructura resultante: un solo directorio `client/` con subdirectorios (`admin/`, `forms/`).

### 4.5 Client hosting — reglas duramente aprendidas

| Regla | Detalle |
|---|---|
| Un solo `client-package.json` | Copias en subdirectorios (`client/admin/`) hacen que Catalyst los trate como clientes separados y los **excluya** del deploy principal |
| `homepage` = archivo de entrada real | `"/"` muestra placeholder; `"index.html"` crea redirect loop (todo path sin archivo sirve el root). Correcto: `"homepage": "admin/login/index.html"` |
| `index.html` explícito en toda URL | El hosting **no resuelve directory index**: `/app/forms/registro/` devuelve la página de bienvenida de Catalyst; `/app/forms/registro/index.html` funciona. Aplica a todos los `window.location.href` y links |
| `public` es nombre reservado | `client/public/` nunca se sirvió en development hosting, incluso con `homepage` correcto. Hubo que renombrar a `client/forms/` |
| Routing de funciones | Las Functions siempre se acceden vía `/server/<function-name>/...`, igual en local y producción. El mapeo `/api/x` → `/server/<function>/api/x` debe aplicarse siempre, no solo en localhost |

| Error de deploy | Causa |
|---|---|
| `Invalid input value for /homepage` | `homepage` ausente en `client-package.json` |
| `Hello! Your Catalyst app will be available...` | `client-package.json` en subdirectorios excluyendo dirs del deploy |
| Redirect loop en login | `init.js` auto-redirige + `homepage` sirviendo login en todos los paths |

### 4.6 Crons — restricciones de Console

- `cron_name` **no admite guiones** — usar underscores (`scheduler_n4` para la función `scheduler-n4`).
- Los cron IDs son por cuenta/proyecto: al migrar de cuenta Catalyst cambian todos los IDs (en este proyecto el prefijo pasó de `48165...` a `35798...`) y deben reconfigurarse manualmente en Console.

### 4.7 Migración entre cuentas Catalyst — todo lo manual se pierde

Al migrar el proyecto a una nueva organización Catalyst hubo que rehacer a mano: recreación de tablas (con **8 columnas faltantes** detectadas solo vía endpoint de debug temporal — el error visible era ZCQL fallando), re-seed de catálogos, recreación del folder de File Store (el código referencia por **nombre exacto**, no por ID), reconfiguración de crons y de OAuth. **Regla:** mantener `migrations/*.sql` exhaustivos y verificar columna por columna contra Console después de cualquier recreación manual. El esquema real del Data Store solo existe en Console — el código no es fuente de verdad verificable.

### 4.8 Diferencias local (`catalyst serve`) vs producción

| Comportamiento | Local | Producción |
|---|---|---|
| `env_variables` de `catalyst-config.json` | Se cargan | **Ignoradas** — solo Console |
| Routing | Prefijo `/server/<function>` inyectado igual | Igual — el strip del prefijo en `wrap-handler.js` aplica en ambos |
| Auth | Permite bypass de desarrollo propio | Cookies de sesión de Catalyst Auth; el bypass debe eliminarse de cliente Y backend |
| ZCQL quirks (§2.4) | No siempre reproducibles | `"Not a number type"` solo se manifestó en producción |
| Errores estáticos | Archivos servidos directo | Rutas estáticas no encontradas pueden responder JSON (CSS con MIME `application/json` en login) |

---

*Documento generado a partir de MEMORY.md (entradas 2026-04-21 → 2026-06-08). Si una limitación de esta lista deja de reproducirse en versiones nuevas del SDK/CLI, actualizar la entrada en lugar de borrarla — indicar versión donde se corrigió.*
