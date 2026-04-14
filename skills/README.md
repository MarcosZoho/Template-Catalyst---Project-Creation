# 🧠 Skills & Design System Hierarchy

Este directorio centraliza las capacidades de diseño y UX del proyecto. Para evitar conflictos entre los diferentes frameworks importados, el agente DEBE seguir estrictamente el **Protocolo de Cascada** definido a continuación.

## ⚖️ Jerarquía de Mando (Protocolo de Cascada)

Cuando se genere cualquier elemento de la carpeta `/client`, las skills deben aplicarse en este orden secuencial:

1.  **ESTRATEGIA (ui-ux-pro-max-skill):** - _Responsabilidad:_ Jerarquía de información y flujo de usuario.
    - _Mandato:_ Define qué elementos son críticos y dónde deben ir para cumplir el objetivo de negocio.

2.  **ARQUITECTURA (Impeccable):**
    - _Responsabilidad:_ Estructura modular y sistema de componentes.
    - _Mandato:_ Construye los contenedores y la grilla técnica siguiendo la estructura de Impeccable.

3.  **ESTÉTICA (taste-skill):**
    - _Responsabilidad:_ Refinamiento visual y minimalismo.
    - _Mandato:_ Aplica el "barniz" de estilo (tipografía, espacios, colores) sobre la arquitectura validada.

4.  **INGENIERÍA DE DETALLE (emil-design-eng):**
    - _Responsabilidad:_ Micro-interacciones y pulido técnico.
    - _Mandato:_ Añade animaciones, sombras complejas y estados de transición (skeletons, hover effects).

---

## 🚫 Reglas de Resolución de Conflictos

- **Función > Forma:** Si una mejora de `Taste` o `Emil` oculta o dificulta un flujo definido por `UI-UX Pro Max`, se descarta la mejora estética.
- **Simplicidad:** En caso de duda, priorizar el minimalismo de `Taste` para evitar sobrecargar el DOM de Catalyst.
- **Contexto Catalyst:** Todas las skills deben adaptarse para no romper el renderizado dinámico del SDK de Catalyst.
