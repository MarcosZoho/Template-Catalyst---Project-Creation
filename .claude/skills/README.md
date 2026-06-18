# .claude/skills — Skills Locales de Claude Code

Ubicación alternativa reconocida por Claude Code para skills de proyecto.

**Estado actual:** Vacío intencionalmente. Las skills de este proyecto viven en `/.agents/skills/` (convención principal).

## Cuándo usar esta carpeta

Usar `.claude/skills/` para skills que sobreescriban o complementen skills globales del usuario (`~/.claude/skills/`) con comportamiento específico de este proyecto. Por ejemplo: un skill `caveman` local con reglas adicionales para este proyecto.

## Diferencia con `.agents/skills/`

Ambas carpetas son leídas por Claude Code. Mantener las skills en una sola ubicación — preferir `.agents/skills/` para consistencia con el `skills-lock.json` de la raíz.
