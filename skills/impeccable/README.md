# 🎨 Impeccable Design Skills

Este módulo contiene la lógica de diseño y experiencia de usuario adaptada del proyecto [Impeccable](https://github.com/pbakaus/impeccable). Su uso está restringido exclusivamente al desarrollo y estilizado del **Client** (Frontend) de Zoho Catalyst.

---

## 📍 Información de Origen

- **Fuente Original:** `pbakaus/impeccable`
- **Especialidad:** Diseño de interfaces interactivas, componentes web y principios de UX.
- **Ámbito de aplicación:** `/client` folder (HTML, CSS, JS).

---

## 📖 Propósito en este Proyecto

Estas habilidades asisten en la creación de una interfaz moderna y funcional para la plantilla, asegurando que:

1.  **Consistencia Visual:** Los componentes del cliente sigan un lenguaje de diseño cohesivo.
2.  **UX Optimizada:** El flujo de navegación (especialmente en los módulos de OCR y visualización de datos) sea intuitivo.
3.  **Diseño Responsivo:** Las vistas se adapten correctamente a diferentes dispositivos.

---

## 📂 Estructura de Diseño

- **`.skills/`**: Definiciones de capacidades de diseño (ej. estructuración de layouts, selección de paletas de colores, refinamiento de CSS).
- **`agents/`**: Perfiles de agentes especializados en diseño web (UX Designers, UI Developers).

---

## 🚦 Instrucciones para el Agente (Claude/Gemini)

- **Ámbito Limitado:** Utiliza estas habilidades **únicamente** cuando trabajes en archivos dentro de la carpeta `/client`.
- **Integración con Catalyst:** El diseño debe ser compatible con la estructura de Single Page Application (SPA) o Multi-Page que permite Catalyst Client.
- **No Lógica de Servidor:** Estas habilidades no deben utilizarse para tomar decisiones sobre el Data Store o las Functions (Node.js), a menos que afecten directamente la visualización de los datos.
- **Prioridad:** El estilo definido aquí debe complementar las **Security Rules** de Catalyst; nunca sugieras diseños que comprometan la visibilidad de elementos protegidos.

---

## 📝 Nota Técnica

Se utiliza la metodología de Impeccable para iterar rápidamente sobre el diseño del frontend sin afectar la lógica de negocio serverless del proyecto.
