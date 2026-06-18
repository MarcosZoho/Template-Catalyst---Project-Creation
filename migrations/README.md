# 🗄️ /migrations — Documentación del Esquema del Data Store

**Catalyst no tiene migraciones ejecutables desde código.** Toda tabla y columna nueva debe crearse manualmente en **Catalyst Console → Data Store → Table Manager** antes del deploy. Un `insertRow`/`updateRow` con un campo inexistente falla con `"Invalid input value for column name"`.

Este directorio NO se ejecuta: es la **fuente de verdad documental** del esquema esperado.

## Reglas

1. Un archivo `NNNN_descripcion.sql` por cada cambio de esquema (CREATE TABLE / ALTER TABLE como documentación, sintaxis SQL estándar).
2. Cada archivo lista tabla, columnas, tipos de Catalyst (VarChar, Text, Int, Decimal, Boolean, DATETIME, JSON) y propósito.
3. Tras crear/modificar en Console, marcar el archivo como aplicado en `architecture/progress.md`.
4. **Tras migrar de cuenta/organización Catalyst, verificar columna por columna contra Console.** En proyectos anteriores una migración manual dejó 8 columnas faltantes detectables solo en runtime — el esquema real solo existe en Console, el código no es fuente de verdad verificable.

## Recordatorios de tipos

- No existe tipo **TIME** — usar DATETIME y extraer `HH:MM` con `shared/utils/date.js → toHM()`.
- DATETIME exige formato `"YYYY-MM-DD HH:MM:SS"` (rechaza ISO 8601).
- ROWIDs exceden `Number.MAX_SAFE_INTEGER` — tratarlos siempre como string.
