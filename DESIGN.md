---
name: 'Colores y Detalles'
description: 'Sistema visual adaptativo para las operaciones comerciales y administrativas.'
colors:
  primary: '#4DB6AC'
  secondary: '#FF9800'
  status-coral: '#FF5C93'
  danger-rose: '#F43F5E'
  surface-light: '#FFFFFF'
  surface-light-muted: '#F5F5F5'
  surface-dark: '#121212'
  surface-dark-raised: '#1E1E1E'
  ink-dark: '#1B1B1B'
rounded:
  field: '12px'
  control: '16px'
  card: '24px'
  pill: '9999px'
spacing:
  space-1: '4px'
  space-2: '8px'
  space-3: '12px'
  space-4: '16px'
  space-6: '24px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '#FFFFFF'
    rounded: '{rounded.pill}'
    height: '44px'
  button-secondary:
    backgroundColor: '{colors.surface-light}'
    textColor: '#475569'
    rounded: '{rounded.pill}'
    height: '44px'
  button-danger:
    backgroundColor: '{colors.danger-rose}'
    textColor: '#FFFFFF'
    rounded: '{rounded.pill}'
    height: '44px'
  button-text:
    backgroundColor: 'transparent'
    textColor: '{colors.primary}'
    rounded: '{rounded.pill}'
    height: '44px'
  card-default:
    backgroundColor: '{colors.surface-light}'
    rounded: '{rounded.card}'
    padding: '24px'
  date-field:
    backgroundColor: '{colors.surface-light}'
    rounded: '{rounded.control}'
    padding: '12px'
  tab-navigation:
    backgroundColor: '{colors.surface-light}'
    textColor: '{colors.primary}'
---

# Design System: Colores y Detalles

## Overview

**Creative North Star: "Operación clara, color con propósito"**

La interfaz combina superficies claras y neutrales con un acento turquesa para las acciones principales. Los colores de estado y los acentos pastel ayudan a diferenciar avisos y métricas sin desplazar la información operativa. El tema oscuro usa fondos carbón y superficies elevadas más claras.

La aplicación comparte componentes de React Native Paper y una navegación de pestañas entre plataformas; la apariencia responde al tema del sistema y los controles nativos, como el selector de fecha, conservan su comportamiento por plataforma. El logo de la marca combina turquesa y magenta. El fondo geométrico en tonos rosados y azules, con una capa oscura superpuesta, forma parte del `ScreenLayout` actual.

**Key Characteristics:**

- Base clara con blanco y grises suaves; el modo oscuro dispone de superficies propias.
- Turquesa para acciones y selección; coral y rosa para estados y acciones destructivas.
- Componentes reutilizables con esquinas redondeadas, tarjetas con profundidad y controles nativos.
- Métricas con acentos pastel y fondo geométrico suministrado como recurso de marca.

## Colors

La paleta de interfaz se organiza por función: turquesa como acento principal, naranja como acento secundario, coral para estados y rosa para el botón destructivo. Las superficies se adaptan al tema del sistema; el dashboard también emplea tonos pastel para distinguir tipos de métricas.

### Primary

- **Turquesa de acción** (`primary`): acento principal del tema Paper y de acciones, iconos seleccionados y navegación activa.

### Secondary

- **Naranja de apoyo** (`secondary`): color secundario definido en el tema Paper; mantenerlo como acento de apoyo.

### Tertiary

- **Coral de estado** (`status-coral`): tokens `warning` y `error` de Tailwind.
- **Rosa destructivo** (`danger-rose`): variante destructiva del botón compartido; no es el mismo token coral.

### Neutral

- **Blanco de superficie** (`surface-light`): fondo de controles y tarjetas en tema claro.
- **Superficie clara tenue** (`surface-light-muted`): superficie secundaria de tema claro.
- **Fondo carbón** (`surface-dark`): fondo del tema oscuro.
- **Superficie carbón elevada** (`surface-dark-raised`): tarjetas y barras oscuras.
- **Tinta oscura** (`ink-dark`): fondo oscuro de tarjetas NativeWind.

**The Color-Follows-Role Rule.** Conserva la distinción existente entre el turquesa de acción, los colores de estado y el rosa del botón destructivo; no los fusiones bajo un único token.

## Typography

**Display Font:** tipografía de sistema de cada plataforma.  
**Body Font:** tipografía de sistema de cada plataforma.  
**Label/Mono Font:** no se define una familia distinta.

**Character:** La tipografía se apoya en los valores predeterminados del sistema; no hay una familia de marca ni una escala tipográfica global configurada. Los tamaños y pesos se aplican localmente con utilidades y estilos de Material 3.

### Hierarchy

- **Display:** no se identifica un estilo de display propio.
- **Headline:** títulos de pantalla y métricas con pesos semibold o bold y tamaños locales.
- **Title:** etiquetas de tarjetas, secciones y encabezados de navegación.
- **Body:** contenido de formularios, filas y descripciones con la fuente del sistema.
- **Label:** textos auxiliares y estados suelen ser más pequeños y de menor contraste que el cuerpo.

## Layout

La estructura es móvil y vertical, con pantallas desplazables y formularios que se adaptan al teclado. El espaciado observado usa una cadencia de múltiplos de cuatro, con respiración media para el contenido de pantalla y más amplia en tarjetas. Los formularios separan controles y ayudan a mantener legible la información densa. El dashboard limita su contenido a un ancho máximo aproximado de 48 rem; no se observa una navegación de tablet distinta. La configuración admite iPad, pero no define un diseño alternativo para pantallas expandidas.

El `ScreenLayout` actual cubre la pantalla con el recurso geométrico de fondo y una capa oscura semitransparente antes de mostrar el contenido. Mantén suficiente contraste en los elementos que se apoyen sobre ese fondo. La orientación de la aplicación está configurada como vertical.

## Elevation & Depth

La profundidad combina capas de superficie claras u oscuras con sombras en las tarjetas. El componente de tarjeta ofrece variantes predeterminada, elevada y delineada; la intensidad de sombra depende de cada variante y de las utilidades NativeWind usadas en la pantalla, no de una escala global única.

Las tarjetas animan su entrada y reducen su escala al presionarse; en Android las tarjetas interactivas también muestran ripple. No conviertas esos comportamientos en una animación global para elementos que no los usan.

## Shapes

Los controles combinan botones de silueta cápsula, campos con esquinas moderadamente redondeadas y tarjetas de esquinas amplias. Los campos delineados usan contorno y fondo; los elementos de solo lectura reciben un fondo distinto. Las tarjetas pueden aparecer sin borde, elevadas o con un borde sutil según su variante.

## Components

### Buttons

- **Shape:** cápsula; altura mínima definida por el componente compartido.
- **Primary:** fondo turquesa y texto blanco; variante predeterminada.
- **Secondary:** fondo blanco, borde claro y texto gris.
- **Danger:** fondo rosa y texto blanco.
- **Text:** fondo transparente y texto turquesa.
- **Disabled / Loading:** el botón desactivado se atenúa; durante la carga muestra un indicador y queda deshabilitado.
- **Interaction:** ofrece feedback táctil nativo de `TouchableOpacity`; los llamadores pueden aportar clases adicionales.

### Cards / Containers

- **Corner Style:** esquinas amplias, con padding interior generoso.
- **Background:** blanco en claro y carbón en oscuro para las variantes rellenadas; la variante outlined queda transparente en oscuro.
- **Shadow Strategy:** sigue las variantes de elevación de `Card`; las pantallas pueden modificar la clase de sombra.
- **Interaction:** las tarjetas interactivas se reducen mientras se presionan y usan ripple en Android.

### Inputs / Fields

- **Style:** los campos controlados usan `TextInput` outlined de React Native Paper, con fondo adaptado al tema. Los campos de solo lectura cambian su fondo y su borde.
- **Focus / Error:** Paper muestra el estado de error y un texto auxiliar; respeta el tema activo.
- **Date Field:** control táctil de fecha con borde tenue, icono turquesa y selector nativo según plataforma.

### Navigation

- **Style:** barra de pestañas inferior con cinco destinos principales: Casa, Ventas, Pedidos, Clientes y Más.
- **Active / Inactive:** el destino activo usa turquesa; los inactivos usan gris azulado. La barra usa una superficie clara u oscura según el tema.
- **Platform:** la estructura de pestañas es compartida; encabezados, pilas de navegación y selectores conservan los componentes de Expo Router y del sistema.

### Brand Background

El fondo geométrico de `assets/background.jpg` se coloca detrás del contenido por `ScreenLayout`, con una capa oscura superpuesta. `assets/logo.png` es el recurso de marca y combina turquesa con magenta; no extraigas de esos archivos tokens de interfaz adicionales.

## Do's and Don'ts

### Do:

- **Do** Usa los tokens del tema y de Tailwind para acciones, estados y superficies antes de añadir un color nuevo.
- **Do** Conserva el cambio entre temas claro y oscuro que responde al sistema.
- **Do** Reutiliza las variantes existentes de Button, Card y los campos Paper cuando el patrón corresponda.
- **Do** Deja que los selectores y controles específicos de plataforma mantengan su comportamiento nativo.

### Don't:

- **Don't** Mezcles el coral de estado y el rosa del botón destructivo: el código los define por separado.
- **Don't** Sustituyas el logo ni el fondo geométrico por recursos inventados.
- **Don't** Supongas una navegación o un sistema de componentes distinto por plataforma que la implementación actual no muestra.
- **Don't** Impongas una fuente de marca o una escala tipográfica global que el código no define.
