# 🖥️ /client — Reglas de Hosting de Catalyst

Reglas duramente aprendidas del hosting de Catalyst (detalle completo en [docs/CATALYST_LESSONS_LEARNED.md §4.5](../docs/CATALYST_LESSONS_LEARNED.md)). Violarlas produce deploys silenciosamente rotos.

| Regla | Detalle |
|---|---|
| **Un solo `client-package.json`** en la raíz de `client/` | Copias en subdirectorios hacen que Catalyst los trate como clientes separados y los **excluya** del deploy principal |
| **`homepage` = archivo de entrada real** | `"/"` muestra placeholder; `"index.html"` crea redirect loop. Correcto: `"homepage": "admin/login/index.html"` |
| **`index.html` explícito en toda URL** | El hosting **no resuelve directory index**: `/app/forms/x/` devuelve la página de bienvenida de Catalyst; `/app/forms/x/index.html` funciona. Aplica a todos los `window.location.href` y links |
| **`public` es nombre reservado** | `client/public/` nunca se sirve en development hosting. Usar otro nombre (ej. `client/forms/`) |
| **Functions vía `/server/<function-name>/...`** | Igual en local y producción. El mapeo `/api/x` → `/server/<function>/api/x` aplica siempre, no solo en localhost |

## Autenticación web (Web SDK 4.5.0)

- `catalyst.auth.getUserToken()` **no existe** — la auth cliente→función es por **cookies de sesión automáticas**, no Bearer token.
- `/__catalyst/sdk/init.js` auto-redirige usuarios no autenticados a Zoho OAuth — **no cargarlo en la página de login** (redirect loop). Verificar `isUserAuthenticated()` antes de `signIn()`.
- Logout: `catalyst.auth.signOut(loginUrl)` con `loginUrl` explícito y absoluto (`/__catalyst/auth/signout` no existe).
- Catalyst ignora `service_url` en `/__catalyst/auth/login` — la página de login debe ser un "smart router": llamar un endpoint propio; si 200 ruta al panel, si 401 redirige al hosted login.
- `service_url` en `signIn()` requiere URL **absoluta**: `location.origin + base + '/callback.html'`.

## Errores de deploy conocidos

| Error | Causa |
|---|---|
| `Invalid input value for /homepage` | `homepage` ausente en `client-package.json` |
| `Hello! Your Catalyst app will be available...` | `client-package.json` duplicado en subdirectorios |
| Redirect loop en login | `init.js` auto-redirige + `homepage` sirviendo login en todos los paths |
| CSS con MIME `application/json` | Ruta estática no encontrada en producción responde JSON |
