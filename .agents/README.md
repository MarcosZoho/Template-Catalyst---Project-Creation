# Agent Skills — Reducción de Tokens

Skills auto-cargadas por Claude Code en cada sesión de este proyecto (o de proyectos creados con esta plantilla).

**Regla:** Agregar skills aquí SOLO si deben estar activas en CADA sesión. Cada skill añade tokens al contexto permanentemente.

## Skills Actuales

| Skill | Propósito | Activación |
|-------|-----------|------------|
| `caveman` | Modo de comunicación ultra-comprimido (~75% menos tokens) | `/caveman` o "less tokens" |
| `caveman-commit` | Mensajes de commit concisos en Conventional Commits | `/caveman-commit` |
| `caveman-compress` | Comprime archivos de memoria (CLAUDE.md, todos) | `/caveman:compress <file>` |
| `caveman-help` | Referencia rápida de todos los comandos caveman | `/caveman-help` |
| `caveman-review` | Comentarios de code review comprimidos | `/caveman-review` |

## NO agregar aquí

- Skills de diseño UI/UX → pertenecen a `/skills/` (referencia manual)
- Skills específicas de un módulo → mantener dentro del módulo
- Skills de un solo uso → invocar directamente sin instalar

## Flujo de instalación (plantilla → nuevo proyecto)

Al crear un nuevo proyecto desde esta plantilla, copiar esta carpeta completa. El `skills-lock.json` en la raíz registra los hashes de cada skill para verificar integridad.
