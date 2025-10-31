# DOCUMENTACIÓN COMPLETA: Getso CRM

## 1. Visión General del Proyecto

Este proyecto es una aplicación de panel de control y CRM (Customer Relationship Management) diseñada para operar sobre una o varias instancias de la plataforma de comunicación con clientes **Chatwoot**. Es una **Single Page Application (SPA)** moderna que centraliza la monitorización, el análisis y la gestión de interacciones con clientes.

### Propósito Principal

-   **Monitorización Multi-Tenant:** Permite a los administradores supervisar KPIs, estado de salud y anomalías de múltiples marcas (instancias de Chatwoot) desde una única interfaz.
-   **Análisis Avanzado:** Ofrece visualizaciones de datos, análisis de sentimiento y resúmenes generados por IA para obtener insights profundos de las conversaciones.
-   **Capacidades de CRM:** Extiende Chatwoot con funcionalidades de gestión de ventas y tareas, como un pipeline de ventas visual (Kanban) y un sistema de gestión de tareas por agente.

### Stack Tecnológico y Filosofía

-   **Framework:** React 18+
-   **Lenguaje:** TypeScript
-   **Estilos:** TailwindCSS
-   **Gráficos:** Recharts
-   **Gestión de Estado:** React Hooks (`useState`, `useEffect`) y Context API (`AuthContext`).
-   **Entorno de Ejecución:** Navegador web moderno.

Una característica clave de este proyecto es su **enfoque "sin compilación" (build-less)** para el desarrollo. Utiliza **`import maps`** definidos en `index.html` para cargar dependencias como React y Recharts directamente desde una CDN en el navegador. Esto simplifica el entorno de desarrollo al eliminar la necesidad de herramientas como Webpack o Vite.

---

## 2. Arquitectura y Estructura de Carpetas

La arquitectura es modular y está orientada a funcionalidades (`feature-based`), promoviendo una clara separación de conceptos.

```
src
├── components/       # Componentes de UI genéricos y reutilizables (Botones, Modales, Iconos).
├── context/          # Gestión de estado global (Autenticación de usuario).
├── features/         # Módulos de funcionalidades principales del CRM.
│   ├── agents/
│   ├── ai/
│   ├── conversations/
│   ├── pipeline/
│   ├── summary/
│   └── tasks/
├── pages/            # Orquestadores de vistas principales (Dashboard, Login).
├── services/         # Lógica de comunicación con APIs.
└── types.ts          # Definiciones de tipos y interfaces globales de TypeScript.
```

### Desglose de Directorios

-   **`src/components`**: Contiene elementos de UI puros y reutilizables, agnósticos a la lógica de negocio. Ejemplos: `Modal.tsx`, `KpiCard.tsx`, `icons.tsx`.
-   **`src/context`**: Gestiona el estado global. `AuthContext.tsx` maneja la sesión del usuario, el login y el logout, haciendo que la información del usuario esté disponible en toda la aplicación.
-   **`src/features`**: **El núcleo de la aplicación.** Cada subdirectorio encapsula una funcionalidad completa (vista, lógica y sub-componentes). Por ejemplo, `src/features/pipeline` contiene todo lo relacionado con el tablero Kanban.
-   **`src/pages`**: Ensambla las vistas principales. `DashboardPage.tsx` es el componente principal que renderiza el `Sidebar` y el contenido de la `feature` seleccionada.
-   **`src/services`**: Abstrae toda la comunicación de datos.
    -   **`mockApiService.ts`**: Simula una API con datos falsos (`faker-js`), ideal para el desarrollo y las pruebas sin un backend real.
    -   **`apiService.ts`**: Contiene la lógica para realizar llamadas a una API real. En el estado actual, está preparado para ser implementado.
    -   El `DashboardPage` puede cambiar entre estos dos servicios, facilitando el desarrollo.

---

## 3. Desglose Funcional por Feature

Cada pestaña del dashboard corresponde a un módulo dentro del directorio `features`.

### a. `features/summary` (Resumen)

-   **Propósito:** Vista general del rendimiento de una instancia.
-   **Componente Principal:** `SummaryView.tsx`.
-   **Funcionalidades:**
    -   Muestra **KPIs** clave (`KpiCard.tsx`) como CSAT, Tiempos de Respuesta/Resolución, y Volumen de Conversaciones.
    -   Visualiza el **volumen de conversaciones** en el tiempo (`TimeSeriesChart.tsx`).
    -   Presenta el **CSAT** en un gráfico de tipo medidor (`CsatGaugeChart.tsx`).
    -   Lista **anomalías detectadas** (`AnomaliesTable.tsx`).
    -   Muestra el **estado de salud** de los servicios (`HealthStatus.tsx`).
    -   Proporciona un **análisis de sentimiento** (`SentimentChart.tsx`).

### b. `features/pipeline` (Pipeline de Ventas)

-   **Propósito:** Gestionar oportunidades de venta en un tablero Kanban.
-   **Componente Principal:** `KanbanBoard.tsx`.
-   **Funcionalidades:**
    -   Renderiza columnas (`KanbanColumn.tsx`) basadas en las etapas del pipeline definidas en la configuración.
    -   Muestra conversaciones como tarjetas arrastrables (`KanbanCard.tsx`).
    -   Permite **arrastrar y soltar** tarjetas entre columnas para actualizar la etapa de una conversación.
    -   Calcula y muestra el **valor total** y el **valor ponderado** (pronóstico) por cada etapa.
    -   Filtra las conversaciones por agente asignado.

### c. `features/tasks` (Tareas)

-   **Propósito:** Gestión de actividades y seguimientos para los agentes.
-   **Componente Principal:** `TasksPage.tsx`.
-   **Funcionalidades:**
    -   Muestra un resumen de tareas (pendientes, vencidas, completadas hoy).
    -   Permite **filtrar tareas** por agente, prioridad, estado y tipo.
    -   Cada tarea (`TaskItem.tsx`) puede ser marcada como completada o eliminada.
    -   Soporta **tareas recurrentes**: al completar una, se crea automáticamente la siguiente.

### d. `features/conversations` (Conversaciones)

-   **Propósito:** Explorar y detallar las conversaciones.
-   **Componente Principal:** `ConversationList.tsx`, `ConversationDetail.tsx`.
-   **Funcionalidades:**
    -   `ConversationList.tsx` muestra una lista paginada del historial de chats.
    -   Al hacer clic en una conversación, se abre un `Modal` con `ConversationDetail.tsx`.
    -   El detalle de la conversación tiene pestañas para ver:
        -   **Mensajes:** El historial del chat.
        -   **Tareas:** Tareas asociadas a esa conversación y un formulario para crear nuevas.
        -   **Etiquetas:** Permite añadir o quitar etiquetas a la conversación.

### e. `features/agents` (Agentes)

-   **Propósito:** Gestionar el personal.
-   **Componente Principal:** `AgentList.tsx`.
-   **Funcionalidades:**
    -   Muestra una lista de todos los agentes de la instancia.
    -   Permite cambiar el estado de un agente entre **"Activo" e "Inactivo"** con un interruptor.

### f. `features/ai` (Análisis con IA)

-   **Propósito:** Obtener insights automáticos de las conversaciones.
-   **Componente Principal:** `AiAnalysisPage.tsx`.
-   **Funcionalidades:**
    -   Muestra un **resumen en lenguaje natural** generado por IA.
    -   Visualiza los **temas principales** discutidos en un gráfico de pastel.
    -   Lista las **preguntas más frecuentes** identificadas por el modelo de IA.
    -   Esta funcionalidad depende de que la instancia tenga un proveedor de IA (ej: Gemini) y una API Key configurada.

---

## 4. Gestión de Estado y Flujo de Datos

-   **Estado Global:** La información del usuario autenticado se gestiona a través de `AuthContext.tsx`. Este contexto provee el objeto `user` y las funciones `login`/`logout` a toda la aplicación.
-   **Estado Local:** La mayoría de los componentes gestionan su propio estado (datos, carga, errores) usando los hooks `useState` y `useEffect`. Por ejemplo, `TasksPage.tsx` obtiene y almacena la lista de tareas internamente.
-   **Flujo de Datos:** El flujo es unidireccional (top-down). `DashboardPage.tsx` determina qué instancia está seleccionada y pasa esa información a los componentes de `feature`. Estos componentes son responsables de llamar a los servicios (`apiService` o `mockApiService`) para obtener sus propios datos.

---

## 5. Guía para Desarrolladores

### Instalación y Ejecución Local

1.  **Clonar el repositorio.**
2.  **No hay `npm install` para dependencias de frontend.**
3.  **Servidor de desarrollo:** La forma más sencilla es usar una extensión de VSCode como **"Live Server"** o ejecutar un servidor estático desde la terminal en la raíz del proyecto.
    ```bash
    # Instalar 'serve' globalmente (solo una vez)
    npm install -g serve

    # Desde la raíz del proyecto, ejecutar:
    serve .
    ```
4.  Abre la URL proporcionada (ej: `http://localhost:3000`) en tu navegador.

### Cómo Añadir una Nueva Funcionalidad (Ej: "Reportes")

1.  **Crear el Directorio de la Feature:**
    -   Crea una nueva carpeta: `src/features/reports`.

2.  **Desarrollar el Componente Principal:**
    -   Dentro de la nueva carpeta, crea `ReportsPage.tsx`. Este componente será responsable de obtener y renderizar los datos de los reportes.
    ```tsx
    // src/features/reports/ReportsPage.tsx
    import React from 'react';
    // ...otros imports

    const ReportsPage = ({ instance, apiService }) => {
      // Lógica para obtener y mostrar datos de reportes...
      return <div>Página de Reportes para {instance.name}</div>;
    };

    export default ReportsPage;
    ```

3.  **Añadir Funciones de API:**
    -   Abre `src/services/mockApiService.ts` y `src/services/apiService.ts` para añadir las funciones que obtendrán los datos necesarios (ej: `getSalesByAgentReport`).

4.  **Integrar en el Dashboard Principal:**
    -   Abre `src/pages/DashboardPage.tsx`.
    -   Añade `'Reportes'` al tipo `Tab`.
    -   Importa tu nuevo componente: `import ReportsPage from '../features/reports/ReportsPage';`.
    -   Añade un botón para la nueva pestaña en el componente `DashboardContent`.
    -   Añade un `case 'Reportes'` en el `switch` de `renderTabContent` para renderizar tu `ReportsPage`.

Este proceso asegura que la nueva funcionalidad esté encapsulada y sea coherente con la arquitectura existente.
