# ✨ Taste Skill

Este módulo integra la capacidad de **Taste Skill**, diseñada para refinar el criterio estético y la calidad visual de las interfaces desarrolladas en este proyecto. Se utiliza como un complemento de pulido para el **Client** de Zoho Catalyst.

---

## 📍 Información de Origen

- **Fuente Original:** [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)
- **Propósito:** Proporcionar un marco de referencia para el "buen gusto" en el diseño, enfocándose en la simplicidad, la tipografía y el balance visual.

---

## 📖 Aplicación en el Proyecto

Mientras que las habilidades de _Impeccable_ se encargan de la estructura y la arquitectura del diseño, **Taste Skill** actúa como el filtro de calidad final para:

1.  **Refinamiento Estético:** Ajustar espaciados (whitespace), jerarquías tipográficas y sutilezas visuales.
2.  **Criterio de Diseño:** Evaluar si una interfaz es funcional pero también visualmente atractiva y moderna.
3.  **Minimalismo:** Eliminar elementos innecesarios para mantener una interfaz limpia en los módulos de OCR y dashboards de datos.

---

## 📂 Estructura

- Contiene definiciones de "Taste" que el agente debe emular al proponer cambios en el CSS y layouts del directorio `/client`.

---

## 🚦 Instrucciones para el Agente (Claude/Gemini)

- **Filtro de Salida:** Antes de entregar código de frontend, pasa la propuesta por el filtro de esta skill para asegurar que el diseño sea "de buen gusto" (clean, modern, minimalist).
- **Consistencia:** Asegurar que el "gusto" visual sea consistente entre los componentes de carga de archivos (Zia OCR) y las tablas de visualización de datos (`AppData`).
- **Prioridad:** En decisiones puramente estéticas, **Taste Skill** tiene prioridad sobre los estilos base. Sin embargo, nunca debe comprometer la usabilidad definida por la lógica de negocio.

---

## 📝 Nota Técnica

Esta skill es subjetiva por naturaleza. Su objetivo es evitar que el agente genere interfaces "genéricas" o saturadas, forzándolo a seguir principios de diseño de alto nivel.
