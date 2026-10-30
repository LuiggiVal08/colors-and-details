---
target: Dashboard principal
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\erick\\Projects\\colores-y-detalles\\mobile\\app\\(app)\\(tabs)\\index.tsx"
target_fingerprint: "sha256:a7474a3fa8cdcf0829e313701dbc07a04d046828f3b1ac9a0faf36479fec7205"
target_path: "C:\\Users\\erick\\Projects\\colores-y-detalles\\mobile\\app\\(app)\\(tabs)\\index.tsx"
timestamp: 2026-10-29T19-46-42Z
slug: app-app-tabs-index-tsx
closed: true
---
# Crítica de diseño: Dashboard de inicio

Method: design review only (detector not applicable, native platform)

## Design Health Score

| # | Heurística | Puntaje | Hallazgo principal |
|---|---|---:|---|
| 1 | Visibilidad del estado | 2/4 | Hay esqueletos y estados vacíos, pero no se distingue un error de una ausencia real de datos. |
| 2 | Correspondencia con el mundo real | 2/4 | Interfaz mayormente en español, pero “Dashboard” y el símbolo `$` no aclaran el significado financiero. |
| 3 | Control y libertad | 2/4 | No hay selector de periodo ni acceso directo desde las gráficas a los registros. |
| 4 | Consistencia y estándares | 2/4 | Los colores y fondos de gráficas parecen ignorar el tema oscuro. |
| 5 | Prevención de errores | 2/4 | Unidad monetaria y periodo de los totales no quedan claros antes de interpretarlos. |
| 6 | Reconocimiento frente a recuerdo | 3/4 | KPI y pestañas tienen etiquetas, pero falta contexto temporal en las métricas. |
| 7 | Flexibilidad y eficiencia | 2/4 | El usuario no puede cambiar el intervalo ni profundizar desde la gráfica. |
| 8 | Diseño estético y minimalista | 2/4 | Hay una columna larga de métricas y gráficas, sin una prioridad analítica clara. |
| 9 | Reconocer, diagnosticar y recuperarse de errores | 1/4 | Los errores de consulta pueden terminar presentándose como “no hay datos”. |
| 10 | Ayuda y documentación | 2/4 | Existe “Ayuda” en “Más”, pero no orientación contextual en el dashboard. |
| **Total** | | **20/40** | **Aceptable (50 %)** |

## Design Specificity Verdict

La paleta y las áreas operativas dan a la app identidad propia, pero el dashboard se parece a una plantilla genérica de analítica: cuatro KPI y cuatro gráficas en una columna, con poco contexto sobre periodo y unidad monetaria. La oportunidad más importante es hacer que esas métricas sean fiables e interpretables antes de ampliar su tratamiento visual.

**Deterministic scan:** not applicable (native platform).

## Overall Impression

El dashboard presenta una vista general útil, pero hay ambigüedad sobre la unidad monetaria y el periodo de las cifras. Además, los fallos de consulta pueden confundirse con datos vacíos y el tema oscuro no parece estar aplicado consistentemente en los textos y gráficas.

## What's Working

- Las cinco pestañas llevan texto, así que los iconos no son la única forma de reconocer cada sección.
- Los esqueletos y los mensajes vacíos evitan dejar completamente en blanco varias partes de la pantalla.
- Ventas y pedidos tienen agregaciones temporales; el problema es que el periodo no se comunica junto con cada KPI.

## Priority Issues

1. **[P1] La venta se etiqueta en dólares sin conversión visible.** El KPI antepone `$` al total que suma directamente importes recibidos del servidor y la gráfica también usa `$`. Dado que el proyecto documenta importes en Bs del servidor, esto puede hacer que el equipo interprete mal cifras de ventas. **Fix:** mostrar Bs o convertir explícitamente a USD con la tasa actual y nombrar la unidad en KPI y gráfica. **Suggested command:** `$impeccable clarify`.
2. **[P1] Un fallo de red puede parecer “sin datos”.** El hook expone errores, pero el dashboard usa indicadores de carga y datos sin consumir esos errores ni ofrecer reintento; la gráfica de ventas presenta el mismo mensaje cuando no tiene datos. Esto puede ocultar un fallo del servicio y dejar al usuario sin recuperación desde esa sección. **Fix:** distinguir error de lista vacía, dar contexto y habilitar reintento por bloque. **Suggested command:** `$impeccable harden`.
3. **[P2] El tema oscuro puede reducir la legibilidad.** El título y descripción usan colores de texto sin variantes dark y las gráficas conservan títulos oscuros y gradientes blancos sobre contenedores que sí cambian al fondo oscuro. **Fix:** aplicar colores de texto, cuadrícula y fondo según el tema. **Suggested command:** `$impeccable polish`.
4. **[P2] Los KPI y las gráficas no comparten un periodo explícito.** Los KPI suman todos los registros disponibles, mientras que ventas y pedidos se limitan a un año. Sin una etiqueta temporal, el usuario puede comparar cifras que no cubren el mismo intervalo. **Fix:** mostrar “acumulado”/periodo en cada KPI o permitir elegir un rango compartido. **Suggested command:** `$impeccable clarify`.

## Persona Red Flags

- **Alex, usuario frecuente:** no puede cambiar el rango ni abrir el detalle desde las gráficas; para comparar periodos debe salir del dashboard.
- **Jordan, usuario nuevo:** “Dashboard” no sigue el idioma de la descripción y `$` no aclara si la cifra es Bs o USD; puede desconfiar o leerla mal.
- **Sam, usuario con necesidades de accesibilidad:** el código de las gráficas no muestra un resumen textual equivalente a las visualizaciones; habría que comprobar su lectura con VoiceOver/TalkBack y ofrecer cifras o resúmenes accesibles si no se anuncian.

## Minor Observations

- La gráfica de stock bajo recorta nombres de productos de más de diez caracteres y no muestra el nombre completo en el componente.
- Los KPI no tienen un control visible para actualizar los datos manualmente, aunque el hook dispone de `refetch`.

## Questions to Consider

- ¿Qué debería mostrarse en ventas: Bs tal como llegan del servidor o USD convertido con la tasa actual?
- ¿Y si el dashboard permitiera elegir un solo periodo y lo aplicara de forma coherente a KPI y gráficas?
