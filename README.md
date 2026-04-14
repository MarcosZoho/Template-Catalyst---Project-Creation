# 🚀 Zoho Catalyst Master Template (Agnostic & Modular)

Esta es una plantilla profesional y agnóstica para el desarrollo de aplicaciones sobre **Zoho Catalyst**. Diseñada para ser escalable, segura y optimizada para flujos de trabajo asistidos por IA (como Claude/Gemini), utilizando un sistema de **Memory Bank** para la gestión de arquitectura e inmutabilidad de reglas.

## 🏗️ Arquitectura del Proyecto

El repositorio sigue una estructura modular que separa la lógica de negocio, las habilidades extendidas y la documentación de recursos no automatizables por CLI.

```text
/
├── CLAUDE.md                # 🏛️ La "Constitución" del proyecto (Inmutable)
├── catalyst.json            # ⚙️ Configuración global de recursos de Catalyst
├── .gitignore               # 🛡️ Protección de secretos y dependencias
├── /functions               # ⚡ Microservicios (Node.js 20, Python 3.9, Java 17)
│   └── /[function_name]
│       ├── index.js/main.py
│       ├── package.json
│       └── catalyst-config.json.example  # 💡 Plantilla de variables de entorno
├── /skills                  # 🧩 Módulos y Habilidades inyectables (Independientes)
├── /architecture            # 🧠 Memory Bank & Blueprints
│   ├── productContext.md    # Propósito y objetivos del proyecto (Agnóstico)
│   ├── activeContext.md     # Estado actual del runtime y entorno
│   ├── progress.md          # Checklist de despliegue (CLI vs Manual)
│   └── manual_config.md     # Guía para recursos No-CLI (Circuits, QuickML)
└── README.md                # 📖 Guía de inicio rápido
```

## 🛡️ Gestión de Seguridad y Secretos

Para evitar la exposición de credenciales y llaves de API en el control de versiones, esta plantilla implementa un sistema de **Shadow Config**:

1. **`.gitignore` Global:** Bloquea automáticamente archivos críticos que nunca deben subir al repositorio:
   - `**/catalyst-config.json` (Configuración de funciones y llaves de entorno).
   - `.env` / `.env.local`
   - `**/vectors.json` (Índices de bases de datos vectoriales).
   - `Estructura en Catalyst/` (Exportaciones de infraestructura/IaC).
   - `.catalystrc` (Identificadores locales de organización).
2. **Archivos `.example`:** Cada función incluye un `catalyst-config.json.example`. **Debes copiarlo y renombrarlo a `catalyst-config.json`** para colocar tus credenciales reales localmente.
3. **Validación de Agente:** El agente de IA tiene prohibido sugerir comandos `git add` que incluyan archivos de configuración real.

## 🤖 Protocolo para Agentes de IA (Memory Bank)

Esta plantilla está optimizada para ser gestionada por un agente de IA bajo reglas estrictas de persistencia:

1. **Lectura de CLAUDE.md:** El agente asimila las reglas de inmutabilidad y los estándares de código. No puede modificar este archivo tras la inicialización.
2. **Fase de Planificación:** Antes de escribir código, el agente debe completar los archivos en `/architecture/` para definir el dominio, objetivos y el stack tecnológico.
3. **Uso de Skills:** Las habilidades en `/skills/` son módulos aislados. El agente consume sus interfaces pero no altera su lógica interna, permitiendo que el humano inyecte componentes de frontend o utilidades sin interferencias.
4. **Manual Blueprints:** Para servicios que no se crean por CLI (como la configuración visual de **Circuits** o modelos de **QuickML**), el agente debe generar la especificación técnica exacta en `manual_config.md`.

## 🚀 Inicio Rápido

### 1. Preparación

```bash
# Clonar la plantilla
git clone <tu-repo-url>
cd <nombre-del-proyecto>

# Login en Catalyst
catalyst login
```

### 2. Inicialización de Proyecto

```bash
# Vincular con un proyecto de Catalyst existente o nuevo
catalyst init
```

### 3. Configuración de Secretos

Navega a la carpeta de tu función y prepara el entorno antes de programar:

```bash
cp functions/mi_funcion/catalyst-config.json.example functions/mi_funcion/catalyst-config.json
# Edita el archivo con tus llaves reales (Gemini, Zoho, etc.)
```

### 4. Despliegue

```bash
# Desplegar solo las funciones (lógica de backend)
catalyst deploy --only functions

# Desplegar todo el proyecto (Client, Functions, AppLogic, Cron)
catalyst deploy
```

## 📏 Estándares de Desarrollo

- **Mensajes de Commit:** Uso estricto de **Conventional Commits**:
  - `feat:` Nuevas funcionalidades.
  - `fix:` Corrección de errores.
  - `chore:` Tareas rutinarias, dependencias o configuración.
  - `docs:` Cambios en documentación o Memory Bank.
  - `refactor:` Mejoras de código que no afectan el funcionamiento.
- **Nomenclatura:** Variables, nombres de funciones, tablas y lógica de código **SIEMPRE en Inglés**.
- **Comunicación:** Documentación técnica, comentarios en el código y explicaciones al usuario **SIEMPRE en Español**.
- **Runtimes:** El agente debe proponer el mejor runtime (**Node.js 20**, **Python 3.9** o **Java 17**) basándose en los requerimientos técnicos definidos en la fase de planificación.

---

## 🌍 Configuración del Entorno (Primera vez)

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
# Copiar el project_id generado → pegar en catalyst.json
```

---

## 🗺️ Flujo de Trabajo de Desarrollo

```
1. Inicio de Sesión
   ├── Leer architecture/activeContext.md  (foco actual, blockers)
   ├── Leer architecture/progress.md       (qué está desplegado)
   └── Verificar entorno: catalyst env list

2. Desarrollo Local
   ├── catalyst serve                       (servidor local con hot-reload)
   ├── Escribir tests en functions/[name]/tests/
   └── Actualizar architecture/ al tomar decisiones importantes

3. Commit Seguro
   ├── git check-ignore -v functions/*/catalyst-config.json  (verificar que no hay secretos)
   ├── git add -p                           (modo patch — revisar cada cambio)
   └── git commit -m "feat: descripción en inglés"

4. Deploy
   ├── catalyst deploy --only functions     (solo backend)
   ├── catalyst logs --tail                 (verificar que no hay errores)
   └── Actualizar progress.md con fecha y URL del endpoint
```

---

## 🔧 Troubleshooting

### `catalyst serve` falla con "Project not found"
Correr `catalyst init` primero para generar `.catalyst/project.json`. Verificar que estás logueado: `catalyst login`.

### La función retorna `401 Unauthorized` en local
Verificar que `.catalystrc` existe en tu directorio home (lo crea `catalyst login`). El SDK lo usa para autenticar localmente. Nunca hacer commit de este archivo.

### `catalyst deploy` falla con "Runtime not supported"
Revisar `catalyst.json` — los valores exactos aceptados son: `node20`, `python39`, `java17`. No usar `node18`, `nodejs20`, etc.

### Secretos aparecen en `git status`
Correr: `git check-ignore -v functions/*/catalyst-config.json`
Si no hay output, el patrón en `.gitignore` no está haciendo match. Verificar que el archivo contiene `**/catalyst-config.json`.

### La función funciona local pero falla en producción
Las funciones en producción **no leen** el archivo `catalyst-config.json` local. Las variables de entorno deben estar configuradas en la **Consola de Catalyst** → Functions → [nombre] → Environment Variables, con los mismos nombres de clave que están en `env_variables` del `catalyst-config.json.example`.

---

_Desarrollado para estandarizar la creación de proyectos robustos, profesionales y asistidos por IA en el ecosistema de Zoho Catalyst._
