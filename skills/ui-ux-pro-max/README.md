# 📈 UI-UX Pro Max Skill

Este directorio contiene la lógica avanzada de estrategia visual y optimización de experiencia de usuario. A diferencia de otras skills puramente estéticas, este módulo dicta la **función y jerarquía** de la interfaz.

## 📂 Contenido del Módulo

- **`/data`**: Contiene los frameworks de referencia y patrones de diseño.
- **`/scripts`**: Automatizaciones para la validación de layouts y estructuras.
- **`SKILL.md`**: El núcleo de reglas operativas para el agente (System Prompt).

---

## 📖 Propósito Estratégico

El objetivo de integrar **UI-UX Pro Max** es asegurar que cada elemento en el `client` de Zoho Catalyst tenga una razón de ser basada en:

1.  **Jerarquía de Información:** El usuario debe identificar la acción principal (ej. Escaneo OCR) en menos de 2 segundos.
2.  **Reducción de Fricción:** Optimización de flujos para que la gestión de los 200 registros de `AppData` sea intuitiva.
3.  **Arquitectura de Conversión:** Uso de patrones de diseño que guíen al usuario hacia el éxito de la tarea.

---

## 🚦 Protocolo de Aplicación

Esta skill es la **primera capa** en el proceso de diseño (Estrategia).

1. **Consulta Obligatoria:** Antes de generar cualquier HTML/CSS en `/client`, el agente debe leer el archivo `SKILL.md` de esta carpeta.
2. **Prioridad Funcional:** Si existe un conflicto entre un diseño minimalista y la claridad de la jerarquía visual, las directrices de esta carpeta tienen prioridad absoluta.
3. **Uso de Data:** Los patrones almacenados en `/data` deben servir como base para los componentes modulares de Catalyst.

---

## ⚖️ Relación con el Stack de Diseño

- **Base (Esta Carpeta):** Define el "Qué" y el "Dónde" (Estrategia).
- **Capa 2 (Impeccable):** Define la estructura de los componentes.
- **Capa 3 (Taste):** Define el refinamiento estético.
- **Capa 4 (Emil):** Define la ingeniería de las interacciones.

---

## 📝 Notas de Mantenimiento

Toda modificación en los scripts o data de este directorio debe ser validada contra los límites de créditos de Zia y los tiempos de carga del cliente para no comprometer el rendimiento.
