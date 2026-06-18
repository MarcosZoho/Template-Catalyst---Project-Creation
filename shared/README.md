# 📦 /shared — Shims y Utilidades Comunes

Código compartido entre todas las funciones. Extraído de workarounds probados en producción (ver [docs/CATALYST_LESSONS_LEARNED.md](../docs/CATALYST_LESSONS_LEARNED.md)).

## ⚠️ Regla crítica de despliegue

**Catalyst CLI empaqueta SOLO el contenido de cada función.** No incluye directorios padre y **no sigue symlinks** al zippear. Si una función hace `require('../../shared/...')` fallará en runtime con `Cannot find module`.

**Workaround obligatorio:** copiar `shared/` físicamente dentro de cada función antes de cada deploy:

```bash
./scripts/copy-shared.sh
```

Los `require` dentro de las funciones siempre apuntan a la copia local: `require('./shared/...')` — nunca `'../../shared/...'`.

> Costo asumido: toda modificación a `/shared` debe re-copiarse a todas las funciones antes del siguiente deploy.

## Contenido

| Archivo | Propósito |
|---|---|
| `wrap-handler.js` | Shim Advanced IO: adapta `(req, res)` nativo del SDK v3 al contrato `(context, basicIO)`. Body parseado en binario (no corrompe multipart). |
| `ds-shim.js` | Restaura `getTableRows`/`getTableRow` (eliminados en SDK v3), filtra la fila de metadata de ZCQL y desenvuelve `{ TableName: {...} }`. |
| `utils/date.js` | `nowDatetime()` — formato DATETIME obligatorio `"YYYY-MM-DD HH:MM:SS"`. `toHM()` — extrae `"HH:MM"` (no existe tipo TIME). |
| `utils/streams.js` | `bufferToNamedStream()` / `streamToBuffer()` — requisitos no documentados de File Store. |
| `utils/email.js` | `sendEmail()` — usa `app.email()` (no `app.mail()`, que no existe y falla en silencio). |

## Patrón de uso en una función

```js
const catalyst = require('zcatalyst-sdk-node');
const { dsShim } = require('./shared/ds-shim');

const app = catalyst.initialize(req);

// Usuarios públicos no tienen privilegios de escritura en Data Store.
// strictScope=true bloquea el switchUser('user') que el SDK ejecuta en cada request.
app.credential.switchUser('admin');
app.credential.strictScope = true;

const ds = dsShim(app);
const rows = await ds.table('AppData').getTableRows({ criteria: "status = 'Active'" });
```
