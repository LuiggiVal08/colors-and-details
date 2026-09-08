# Tareas Pendientes — Colores y Detalles Mobile

> Formato: `[ ]` pendiente · `[x]` resuelto.
> Cuando una tarea se resuelve: marcar `[x]` y anotar debajo "Cómo se hizo:".
> Antes de tocar/rehacer cualquier **formulario**, su contrato debe estar confirmado (ver sección **Contratos**).

## Contratos de formularios

| Formulario                                                        | Estado contrato | Fuente                       |
| ----------------------------------------------------------------- | --------------- | ---------------------------- |
| Ventas & Pedidos (POST /api/shopping, /api/orders, order-payment) | ✅ Confirmado   | Usuario (09/2026)            |
| Productos / Categorías (inventory)                                | ⏳ Pendiente    | Por usuario o GET al backend |
| Empleados (employee)                                              | ⏳ Pendiente    | Por usuario o GET al backend |
| Servicios / Periodos / Pagos de servicio                          | ⏳ Pendiente    | Por usuario o GET al backend |
| Caja / Apertura / Cierre / Movimientos de caja                    | ⏳ Pendiente    | Por usuario o GET al backend |
| Métodos de pago                                                   | ⏳ Pendiente    | Por usuario o GET al backend |
| IVA / Tasa de cambio                                              | ⏳ Pendiente    | Por usuario o GET al backend |
| Clientes                                                          | ⏳ Pendiente    | Por usuario o GET al backend |
| Nómina / Empleado-nómina                                          | ⏳ Pendiente    | Por usuario o GET al backend |

Nota: no tocar payload de un formulario cuyo contrato esté "Pendiente".

## Resueltos antes de esta lista

- [x] **Require cycles de Metro** (`services/api.ts → socket → stores → services`).
      Cómo se hizo: en `services/socket.ts` se quitaron los 3 imports estáticos de stores y se usan `await import('@/store/...')` dentro de los handlers `tasa-dolar:updated`, `nueva_notificacion`, `caja:status-changed`. Socket quedó como hoja del grafo.
- [x] **Crash `Cannot read property 'displayName' of undefined`** en pantallas de inventario.
      Cómo se hizo: `RefreshControl` se importaba de `react-native-paper` (no existe ahí → `undefined`, y react-native-css-interop le leía `.displayName`). Se movió a `import { RefreshControl } from 'react-native'` en `CategoryList.tsx`, `ProductList.tsx`, `MovementList.tsx`.
- [x] **Campo Precio USD sin decimales** en crear/editar producto.
      Cómo se hizo: se agregaron `Format.monto` (entrada centavos/derecha-izquierda, divide entre 100, punto decimal) y `Format.montoFijo` (fija a 2 decimales) en `helpers/Formats.ts`; se aplicaron en `create.tsx`/`edit.tsx` con `keyboardType="numeric"`.

---

## FASE 0 — Bugs activos (rompen flujo hoy)

- [x] **F0-1 `ReferenceError: producto_id` en `services/productMovement.service.ts:44`.**
      `getAll` no desestructura `producto_id` (línea 40) y lo usa en la 44 → explota en cada llamada. Rompe: pestaña "Movimientos" de inventario (`MovementList.tsx`) y "Últimos movimientos" del detalle de producto (`productos/[id].tsx:44`). No lo detecta lint porque no hay typecheck.
      Cómo se hizo: `producto_id = ''` agregado al destructuring de `getAll`; el `if (producto_id)` ahora filtra cuando viene. Agregar script `typecheck` sigue pendiente en F7-3.

- [x] **F0-2 Rutas duplicadas de Empleados** (`app/(app)/employees/*` legacy SÍN guard + `app/(app)/(admin)/employees/*` completa y protegida). Resolución ambigua; el legacy tiene `[id].tsx` con placeholder "Aquí iría el formulario de edición" y modal muerto.
      Cómo se hizo: se eliminó el grupo `app/(app)/employees/` completo (create.tsx + [id].tsx). `/employees`, `/employees/create` y `/employees/:id` quedan servidos por `(admin)/employees/*` (con guard de rol).

- [x] **F0-3 Ruta duplicada `/shopping`**: pestaña `(tabs)/shopping.tsx` ("Nueva Venta") vs `app/(app)/shopping/*` (historial + detalle de venta). Ambas mapeaban a `/shopping`; el botón "Historial" de la pestaña se apuntaba a sí mismo.
  Cómo se hizo: el grupo de historial/detalle se movió a `app/(app)/ventas/` (git mv). `/shopping` queda exclusivo de la pestaña de venta; `/ventas` es el historial y `/ventas/:id` el detalle. Se actualizaron las referencias en `(tabs)/shopping.tsx` y `ventas/index.tsx`.

- [x] **F0-4 `/reports` no existe** (`app/(app)/(tabs)/more.tsx:62`). Al tocarlo → ruta sin pantalla.
      Cómo se hizo: se quitó la entrada "Reportes" del menú "Más". Cuando exista una pantalla de reportes real se vuelve a agregar.

## FASE 1 — Seguridad

- [ ] **F1-1 Contraseña en texto plano persistida** (`app/(auth)/login.tsx:53-57` + `feature/profile/components/SecurityTab.tsx:50-59`). Se guarda `{ username, password }` en SecureStore para re-login biométrico.
      Fix: usar token de refresco/ticket emitido por el backend en vez del password; hacer el "recordar este dispositivo" opt-in y revocable.

- [x] **F1-2 `loadTasa()`/`loadIva()` corren sin sesión** (`app/(app)/_layout.tsx:50-56`). Disparan 401 y logout redundante en cold start logueado.
      Cómo se hizo: los efectos ahora dependen de `user?.token` y solo corren con sesión.

- [x] **F1-3 `logout()` de `store/auth.ts:36` no desconecta socket**; cada caller debe acordarse. Riesgo de socket con token muerto.
      Cómo se hizo: `logout()` ahora hace `set({ user: null })` y un `await import('@/services/socket')` dinámico para llamar `disconnectSocket()` (evita ciclos estáticos).

- [x] **F1-4 Sesión con `user` pero sin `token` no se invalida** en arranque (`(app)/_layout.tsx:31-35`) → loop de 401.
      Cómo se hizo: si `user` existe pero no hay `token`, `_layout` hace `disconnectSocket()` + `logout()` y redirige a login.

- [x] **F1-5 Botón debug "Testear conexión"** en login de producción (`login.tsx:104-122`).
      Cómo se hizo: se eliminó el `Pressable` de debug, la línea comentada y el import `API_BASE_URL` (quedó sin uso).

## FASE 2 — Socket / conexión

- [x] **F2-1 Doble conexión socket en login**: `login.tsx:52` conecta con el token del login y `(app)/_layout.tsx:38` vuelve a conectar tras `/validate`. El guard `socket?.connected` (socket.ts:8) no evita duplicados durante conectar/reconectar → eventos duplicados (doble notificación, doble refetch).
      Cómo se hizo: `connectSocket` ahora retorna si `socket` ya existe `(if (socket) return;)`, sin importar su estado de conexión.

- [x] **F2-2 El `AppState` "active" no reconecta socket al volver** (`(app)/_layout.tsx:65-80`), y deps incompletas.
      Cómo se hizo: al ser `active`, tras validar OK se vuelve a llamar `connectSocket(token)`; el guard de F2-1 evita duplicar.

- [ ] **F2-3 `services/api.ts:36-43`**: cada respuesta con header `Authorization` derriba y recrea el socket (churn).
      Fix: debounce/coalescer rotación de token.

## FASE 3 — Roles / navegación / placeholders

- [ ] **F3-1 Menú "Más" muestra opciones admin a todo rol** (`more.tsx:58-69`); rol `user` bota en silencio al tocar (`(admin)/_layout` re-renderiza a tabs).
      Estado: pendiente por decisión del usuario — va a entregar la matriz de permisos (user vs admin/superadmin); mientras tanto no se filtra.
      Fix: filtrar opciones por `user.role`.

- [ ] **F3-2 `(auth)/rescue.tsx` placeholder** del enlace "¿Olvidaste tu contraseña?" (`login.tsx:344`).
      Fix: implementar recuperación o quitar el enlace.

- [x] **F3-3 `(app)/backup.tsx` stub** ("solo web").
      Cómo se hizo: decisión del usuario — se quita (el backup de la DB es cosa de la web). Borrado el archivo y su entrada "Respaldo" en `(tabs)/more.tsx` (ruta `/backup` única referencia).

- [ ] **F3-4 `(admin)/(maintenance)/database.tsx` texto estático.** Implementar o retirar.

- [ ] **F3-5 `(super)/management/index.tsx` y `[...splat].tsx`**: cards decorativas / 404 con estilo.
      Fix: implementar pantallas de gestión o dejarlo como stub consciente.

- [ ] **F3-6 Notificaciones tipo `SERVICE` → `/(admin)/service/:id`**: para rol `user` es dead-end; `notif.url` sin validar (`feature/notifications/components/NotificationList.tsx`).
      Fix: desviar por rol y validar URL.

- [ ] **F3-7 `(auth)/help.tsx` re-exporta `(app)/help`** (import de ruta desde `app/` — frágil). Extraer a `components/`/`feature/` compartido.

- [x] **F3-8 Switch "stock bajo"** (fix aplicado: `ScreenLayout.tsx` usa `Gesture.Native()` en vez de `Gesture.Tap()`).
      Cómo se hizo: confirmado por el usuario en dispositvo — el switch ya se mueve y el dismiss de teclado no se rompió.

## FASE 4 — Ventas & Pedidos (contrato confirmado)

Contrato: ver sección arriba + documento provisto por el usuario (POST/PUT/DELETE de `/api/shopping`, `/api/orders`, `/api/order-payment`).

- [x] **F4-1 `(tabs)/shopping.tsx` ajustar a contrato VENTAS**:
  - Enviar `usuario_id` real (del auth store, hoy envía `''`), `iva_id` vigente (store iva).
  - `pagos[]` con `tasa_id`, `metodo_pago_id`, `monto` (string USD) que sumen `total + IVA` (el backend exige igualdad exacta).
  - `total`, `precio_unitario`, `subtotal`, `cantidad` como string (formato "125.00"/"50.00"); no fecha; descuenta stock real — validar stock antes del submit y manejar 400 `Stock insuficiente`.
  - Leer respuesta `201 { venta, message }` con el shape tipado (hoy usa `(result as any)?.venta`).
  Cómo se hizo: `shopping.service.ts` ahora exige `cliente_id`/`usuario_id`/`total`/`iva_id`, sin `fecha` en la venta ni en `pagos[]` (contrato: el server fija la fecha), `tasa_id` obligatorio; `create` tipado como `{ venta, message }`. En `shopping.tsx` se manda `usuario_id` del auth store, decimal con punto, `pagos[].monto` = monto Bs ÷ tasa (USD), cliente/IVA/tasa requeridos antes de cobrar, y validación de stock previa por producto con mensaje "Disponible: X".

- [x] **F4-2 `order/new.tsx` ajustar a contrato PEDIDOS**:
  - Body con `usuario_id` (token), `iva_id`, `total` string, `detalles[]` con `precio_pedido_producto` y `subtotal`; `fecha_entrega` opcional futura (validar `fecha_entrega > fecha`).
  - Stock agregado validado (400 con `Disponible: X, Requerido: Y`).
  - Respuesta `201 { pedido }`.
  Cómo se hizo: `CreateOrderDTO` perdió `fecha` (el server la fija) y ganó `usuario_id`. En `new.tsx` se envía `usuario_id` del auth store, `precio_pedido_producto` = precio unitario (ya no "0,00"), números con punto, `fecha_entrega` en `YYYY-MM-DD`, validación de stock por producto antes de enviar, y la validación de fecha compara día-puro (rechaza el mismo día, no solo fechas anteriores). `normalizeOrder` ahora desempaqueta `{ pedido }` en POST/PUT.

- [x] **F4-3 Flujo de pago de pedido (`order/[id]/payment.tsx`)** a `POST /api/order-payment`:
  - Body `{ pedido_id, metodo_pago_id, fecha, monto (string USD), referencia_pago? }`, sin `tasa_id`.
  - Estado → `procesado` cuando pagos == total+IVA.
  - Decisión del usuario (realidad): **los pagos no se borran** (son el registro de caja); solo se **edita la referencia**.
  Cómo se hizo: `CreateOrderPaymentDTO` incluye `fecha`; `payment.tsx` envía `monto` en USD con punto (+ `fecha`), y el saldo pendiente incluye IVA (`totalConIva`), lo que permite que el pedido llegue a `procesado` al cubrir total+IVA. `normalizePayment` desempaqueta `{ message, data }`. Se agregó `orderService.updatePayment(id, body)` = PUT `/api/order-payment/:id`, y en `order/[id].tsx` el modal "Detalle del Pago" ahora permite editar solo `referencia_pago` (campo TextInput + botón "Guardar Referencia"; sin UI de borrar), invalida `['order-payments', id]` y `['order', id]`.

- [x] **F4-4 Moneda / tipo de dato consistente en órdenes y ventas**: contrato confirmado → `total`, `precio_unitario`, `subtotal`, `monto` son **USD** (string). El lado de lectura pintaba como Bs con conversión invertida.
  Cómo se hizo (decisión usuario: "eso sí corrige"): la lectura ahora muestra USD primario y, cuando hay tasa, el equivalente en Bs como dato informativo. `OrderCard` ya no hace `total / tasa` (conversión invertida), muestra `$ total` + `(Bs. total × tasa)`. `order/[id].tsx` pinta subtotal/IVA/total con IVA/pagado/saldo en `$`. `ventas/index.tsx` y `ventas/[id].tsx` (detalle + comprobante compartido) en `$` con 2 decimales. El lado de escritura ya estaba en USD desde F4-1/F4-2. Dominios Bs legítimos (nómina, caja, tasas, precio Bs de producto) sin tocar.

## FASE 5 — CRUD incompleto / tres tipos

- [x] **F5-1 Eliminar sin UI** aunque el service lo soporte: caja (`boxRegisterService.delete`), métodos de pago (`paymentMethodService.delete`), servicios (`serviceService.delete`).
      Cómo se hizo (decisión del usuario: "ok pero con cuidado"): se cableó UI de eliminar con **guarda de dependencias** (si el registro ya tiene movimientos, pagos, períodos u otros asociados, el backend lo rechaza y se muestra el mensaje del server). Tap en papelera con `Alert.alert` de confirmación + texto que avisa de la restricción. Pantallas: `payments-methods/index.tsx` y `service/index.tsx` (icono trash en las tarjetas vía `CardPaymentMethod`/`CardService` + `onDelete` en sus List), `box-register/index.tsx` (trash en `BoxItem`). Los errores del server se leen con el helper nuevo `helpers/apiErrorMessage.ts` y se muestran en Snackbar.
- [ ] **F5-2 Periodos y pagos de servicio**: solo `getByService`/`create`, sin editar/borrar.
- [ ] **F5-3 `payments-methods/create.tsx` sin toggle `activo`** (siempre activos hasta editar).
- [ ] **F5-4 Eliminación de imagen de producto no persiste** (`productos/[id]/edit.tsx:116-127`): "Quitar" no envía nada al server.
- [ ] **F5-5 Selector de producto de movimientos limitado a 100** (`movimientos/create.tsx:36`). Agregar búsqueda/paginación.
- [ ] **F5-6 `service/[id].tsx` sin estados de error** para sus queries (box-register/[id] igual — ver F6-2).

## FASE 6 — Tipos / consistencia de datos

- [x] **F6-1 `types/service.d.ts:8` `Servicio.precio: string` vs pantallas que leen `servicio.precios?.[0]?.precio`** → el precio no renderizaba.
      Cómo se hizo: por fin lo destapó el nuevo typecheck (F7-3). `service/[id].tsx` y `CardService.tsx` ahora leen `servicio.precio` (el shape real del DTO). Se quitó el bloque "Precio vigente desde {fecha_inicio}" (era de `ServicioPrecio`, que no viene del backend).
- [x] **F6-2 Box detail: "Saldo Actual" mostraba `caja.monto` (obsolescente)** (`box-register/[id].tsx:291-293`).
      Cómo se hizo: ahora muestra `saldoEsperado` (apertura + ingresos − egresos), el mismo número que valida el cierre. Pendiente aparte: estados de error de queries/F5-6.
- [x] **F6-3 `empresa_id` hardcodeado `'1'`** en `(admin)/service/create.tsx:37`, `CreateServiceForm.tsx:42-43`, `(admin)/employees/create.tsx:40`.
      Cómo se hizo: decisión del usuario — "siempre es la misma empresa, nunca va a cambiar". **Por diseño**: se deja `'1'` tal cual, no se toma del usuario autenticado.
- [x] **F6-4 `EditEmployeeForm.tsx:84` usa `control._formValues` (API privada de react-hook-form).**
      Cómo se hizo: se reemplazó por `watch('activo')` (API pública y reactiva, el Switch se mueve al togglear).
- [ ] **F6-5 `shopping.tsx` / `order/new.tsx` duplican lógica de carrito.** Extraer store/hook compartido.
- [ ] **F6-6 `(tabs)/customers.tsx` y tarjetas**: resumen de cliente hardcodeado/poco fiel (ver auditoría) — revisar al confirmar contrato de clientes.
- [ ] **F6-7 `useAnalytics` baja listas completas (`/shopping`, `/orders`, `/product`, `/customer`) para KPIs**; `order/[id]` baja todos los pagos y filtra en cliente. Optimizar con endpoints/params del backend.

## FASE 7 — Lint / tooling

- [x] **F7-1 Añadir ignores a ESLint** para `.agents/`, `.opencode/` (`eslint.config.js`) — hoy les pasa lint a estos directorios.
      Cómo se hizo: agregados `.agents/*` y `.opencode/*` al bloque `ignores`.
- [x] **F7-2 Errores ESLint en código app**:
  - `app/(app)/employees/[id].tsx` (se elimina con F0-2).
  - `feature/payment-methods/components/CardPaymentMethod.tsx:13` `getTipoIcon` sin usar (icono hardcodeado `card`). Usarla o borrarla.
    Cómo se hizo: el legacy de employees se borró con F0-2; en `CardPaymentMethod` el icono ahora usa `getTipoIcon(paymentMethod.tipo)`.
- [x] **F7-3 Script `typecheck`** (`tsc --noEmit`) — sin él, errores como F0-1 pasan.
      Cómo se hizo: agregado `"typecheck": "tsc --noEmit"` a `package.json`. Se corrigieron los 14 errores que destapó: `BoxItem.monto? ` (BoxRegister monto opcional), `useRef<...|null>(null)` en payroll, `precios→precio` en service/CardService, `feature/employees/types.ts` (import de `Employee` además del re-export), zod v4 `required_error→message` en `employeeSchema`, `notif.titulo→mensaje` en socket, `pago.monto→detalle.subtotal` en `ventas/[id].tsx` (bug de variable equivocada en detalles), y `estimatedItemSize` eliminado de 4 `FlashList` (no existe en la prop de la versión instalada). `npm run typecheck` pasa limpio.
- [ ] **F7-4 Prettier no corre si ESLint falla** (script con `&&` en `package.json`). Encadenar con `||`/`;` o correr aparte.
- [ ] **F7-5 Dependencias**: quitar sin uso (`react-native-gifted-charts`, `expo-linear-gradient`, `expo-linking`); declarar fantasma (`dotenv`, `@react-navigation/native`, `@types/lodash`); fijar `nativewind` (hoy `"latest"`).

## FASE 8 — Dead code

- [ ] **F8-1 Componentes compartidos sin usar**: `components/Button.tsx`, `Badge.tsx`, `SearchBar.tsx`, `CajaIndicator.tsx`, `FormHeader.tsx`.
- [ ] **F8-2 Componentes de feature sin usar**: `feature/clients/components/{ModalEdit,CreateClientForm}.tsx`, `feature/payment-methods/components/CreatePaymentMethodForm.tsx`, `feature/service/components/CreateServiceForm.tsx`, `feature/employees/components/ListEmployees.tsx`.
- [ ] **F8-3 `store/employees.ts` con datos demo** (Laura Mendoza, Carlos Paredes, María Rodríguez) — nunca importado.
- [ ] **F8-4 Tipos muertos**: `types/service.d.ts` `ServicioPrecio`, `types/nomina.d.ts` `NominaSocketEvent`; `helpers/Formats.ts` `regExp` nunca usado.
- [ ] **F8-5 Métodos de service nunca llamados**: `cashMovement.{getByBox,getById}`, `boxRegister.getEstadoActual`, `category.getById`, `client.delete`, `employee.getEmployeeByUserId`, `employeePayroll.{getById,update}`, `shopping.delete`. Decidir: cablear UI o borrar. (Ya cableados con F5-1: `boxRegister.delete`, `paymentMethod.delete`, `service.delete`.)

## FASE 9 — API / endpoints

- [ ] **F9-1 `/employe` (sic) en `employee.service.ts` y `employeeDebt.service.ts`** vs `/employee-payroll`, `/nomina`. Verificar el route real del backend y normalizar.
- [ ] **F9-2 Slashes inconsistentes**: `servicePeriod.service.ts:13` y `servicePayment.service.ts:6` postean con `/` final; `more.tsx` usan `/payments-methods/`, `/service/`, `/employees/`. Estandarizar sin slash.
- [ ] **F9-3 `auth.service.ts:11`** comentario dice `/user/singin` pero postea `/user/signin`. Ajustar comentario o código.
- [ ] **F9-4 Llamadas crudas**: `/validate` en `(app)/_layout.tsx`, `/health` en `login.tsx` (se va con F1-5). Mover a services.

---
