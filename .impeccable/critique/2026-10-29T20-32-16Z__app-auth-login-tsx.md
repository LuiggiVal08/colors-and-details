---
target: @login.tsx
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\erick\\Projects\\colores-y-detalles\\mobile\\app\\(auth)\\login.tsx"
target_fingerprint: "sha256:d003eb6da90a699f2b03712233a7dca610c309069b8825d34df6389082cabc1b"
target_path: "C:\\Users\\erick\\Projects\\colores-y-detalles\\mobile\\app\\(auth)\\login.tsx"
timestamp: 2026-10-29T20-32-16Z
slug: app-auth-login-tsx
---
Method: design review only (detector not applicable, native platform)

# Crítica de diseño: Inicio de sesión

## Design Health Score

| # | Heurística | Puntaje | Hallazgo principal |
|---|---|---:|---|
| 1 | Visibilidad del estado | 2/4 | Hay indicador durante el acceso y errores de formulario/API, pero el arranque queda reducido a un spinner sin contexto. |
| 2 | Correspondencia con el mundo real | 3/4 | Los textos principales son claros y están en español; algunas reglas de acceso no coinciden con lo que el campo permite escribir. |
| 3 | Control y libertad | 3/4 | Se puede alternar entre biometría y contraseña, recuperar la cuenta y cancelar el modal; desvincular no confirma antes de borrar las credenciales guardadas. |
| 4 | Consistencia y estándares | 2/4 | La vista biométrica no adapta sus superficies ni textos al tema oscuro y el formato de usuario diverge de su validación. |
| 5 | Prevención de errores | 2/4 | Hay validación junto a los campos, pero el usuario puede introducir puntos o guiones que luego son rechazados al enviar. |
| 6 | Reconocimiento frente a recuerdo | 3/4 | Los campos tienen etiquetas y hay acceso visible a ayuda y recuperación; el icono biométrico carece de nombre accesible explícito. |
| 7 | Flexibilidad y eficiencia | 2/4 | Biometría acelera el acceso y existe alternativa por contraseña, pero el formulario no optimiza el flujo con el teclado. |
| 8 | Diseño estético y minimalista | 3/4 | Logo, fondo de marca y formulario enfocado dan una composición clara; la pantalla de carga inicial pierde esa identidad. |
| 9 | Reconocer, diagnosticar y recuperarse de errores | 2/4 | Los errores de campo se muestran cerca de su origen, pero el fallo al leer almacenamiento no tiene recuperación y ciertos errores del servidor se reducen a un mensaje genérico. |
| 10 | Ayuda y documentación | 3/4 | La acción Ayuda y el enlace de recuperación son fáciles de encontrar; no hay guía contextual para problemas de biometría. |
| **Total** | | **25/40** | **Aceptable (62,5 %)** |

## Design Specificity Verdict

El logo y el fondo geométrico conectan el acceso con Colores y Detalles, y las opciones de biometría, recuperación y soporte responden a un inicio de sesión operativo real. La composición central en tarjeta sigue un patrón convencional, pero resulta apropiada para esta tarea. La principal oportunidad no es rediseñar: es hacer que las reglas de acceso sean coherentes y mantener el mismo cuidado visual y de recuperación en los estados de carga y biometría.

**Deterministic scan:** not applicable (native platform).

**Inspección visual:** no se pudo abrir la app en un dispositivo o emulador Android conectado; `adb devices` no mostró dispositivos. No se encontraron capturas nativas ni fixtures visuales del login, así que los hallazgos son de inspección estática del código y sistema visual, no de render comprobado.

## Overall Impression

El flujo ofrece alternativas útiles y una identidad visual reconocible, pero contiene una inconsistencia concreta que puede impedir el acceso a cuentas con ciertos nombres de usuario. Además, una falla de almacenamiento durante la carga puede dejar toda la pantalla bloqueada sin salida visible. El mayor beneficio vendría de alinear validación y recuperación antes de invertir en ajustes decorativos.

## What's Working

- La marca está presente sin competir con la tarea: logo y fondo identifican la app y la tarjeta concentra el formulario.
- Usuario y contraseña tienen etiquetas, validación próxima a los campos y opción para mostrar la contraseña.
- Ayuda, recuperación de cuenta y acceso biométrico con alternativa por contraseña están disponibles desde el flujo.

## Cognitive Load

**Bajo, con 1 de 8 comprobaciones fallida.** La tarea tiene un foco claro, los campos están agrupados y las opciones secundarias no saturan la pantalla. Falla la previsibilidad: el campo conserva puntos y guiones al escribir, pero la regla de envío los prohíbe, generando una corrección inesperada.

## Priority Issues

1. **[P1] El campo acepta nombres de usuario que el formulario rechaza.** `Format.username` conserva puntos y guiones, mientras que `loginSchema` solo permite letras, números y guion bajo. Quien tenga una cuenta con `.` o `-` puede escribir el usuario pero no iniciar sesión desde esta pantalla. **Fix:** acordar y compartir una sola regla con el formato válido del backend; no eliminar caracteres válidos mientras se escribe para después fallar al enviar. **Suggested command:** `$impeccable harden`.

2. **[P1] Un fallo al leer el usuario vinculado puede bloquear todo el inicio de sesión.** La lectura de `AsyncStorage` en el efecto inicial no tiene captura ni `finally`; si rechaza, `isLoadingStorage` nunca se desactiva y no se presenta el formulario manual. **Fix:** finalizar el estado de carga en todas las rutas, tratar el fallo de almacenamiento con un mensaje recuperable y permitir continuar con el acceso normal. **Suggested command:** `$impeccable harden`.

3. **[P2] La vista biométrica pierde legibilidad en tema oscuro.** Los textos del usuario y la acción para desvincular usan colores claros fijos, y el botón de desvinculación mantiene fondo claro; no hay variantes `dark:`. En tema oscuro el contenido se ve inconsistente y parte del texto puede quedar con contraste insuficiente. **Fix:** usar superficies y colores de texto semánticos para ambos temas, incluidos los estados biométrico y de desvinculación. **Suggested command:** `$impeccable polish`.

4. **[P2] El acceso biométrico no tiene nombre accesible explícito.** El botón del icono de huella es una acción central, pero no declara `accessibilityRole`, `accessibilityLabel` ni una indicación de que inicia sesión. Los usuarios de TalkBack o VoiceOver pueden recibir un nombre ambiguo. **Fix:** nombrar el control y asegurar objetivos táctiles adecuados para las acciones de contraseña y desvinculación. **Suggested command:** `$impeccable audit`.

## Persona Red Flags

**Jordan (primera vez):** puede leer “Usuario” y “Contraseña” y localizar ayuda; si su nombre lleva punto o guion, el campo parece aceptarlo y luego el envío lo rechaza. No se explica cómo resolver esa discrepancia.

**Sam (dependiente de accesibilidad):** los campos de Paper tienen etiquetas, pero el icono de huella no tiene etiqueta accesible explícita. Si usa tema oscuro, la vista biométrica conserva texto y superficies definidos para tema claro.

**Casey (móvil y con interrupciones):** tiene la alternativa biométrica y soporte cerca, y el contenido puede desplazarse con el teclado. Si falla la carga de almacenamiento antes de mostrar la pantalla, no puede continuar por el formulario normal; el enlace textual para contraseña y desvincular también ofrece un área de toque más pequeña que los controles principales.

## Minor Observations

- La carga inicial devuelve solo `ActivityIndicator`, fuera de `ScreenLayout`: no mantiene el fondo de marca ni ofrece texto accesible que explique la espera.
- Si el servidor devuelve un error sin `response.data.message`, se muestra “Error de conexión”, que puede describir incorrectamente un rechazo de credenciales.
- El botón para desvincular elimina credenciales locales sin confirmación; es recuperable iniciando sesión de nuevo, pero puede sorprender.
- El formulario no configura explícitamente el comportamiento del teclado (autocapitalización, autocompletado y acción de envío/avance).

## Questions to Consider

- ¿Qué debería priorizarse primero: coherencia de nombres de usuario y recuperación ante fallos de almacenamiento, o tema oscuro y accesibilidad biométrica?
- ¿Quieres corregir solo los dos problemas P1 o abordar los cuatro problemas prioritarios en una pasada?
