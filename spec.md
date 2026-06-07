# Colores y Detalles — React Native App Spec

> Aplicación móvil para gestión de inventario, ventas (POS), pedidos, caja, empleados, nómina, servicios empresariales y configuración.
> Backend API: Express + Sequelize + MySQL. Repo: `server/`

---

## Tabla de Contenido

1. [Arquitectura General](#1-arquitectura-general)
2. [Estructura de Navegación](#2-estructura-de-navegación)
3. [Módulos](#3-módulos)
   - 3.1 [Autenticación](#31-autenticación)
   - 3.2 [Dashboard](#32-dashboard)
   - 3.3 [Ventas (POS)](#33-ventas-pos)
   - 3.4 [Pedidos](#34-pedidos)
   - 3.5 [Inventario y Productos](#35-inventario-y-productos)
   - 3.6 [Categorías](#36-categorías)
   - 3.7 [Movimientos de Producto](#37-movimientos-de-producto)
   - 3.8 [Clientes](#38-clientes)
   - 3.9 [Caja](#39-caja)
   - 3.10 [Movimientos de Caja](#310-movimientos-de-caja)
   - 3.11 [Empleados](#311-empleados)
   - 3.12 [Nómina](#312-nómina)
   - 3.13 [Servicios Empresariales](#313-servicios-empresariales)
   - 3.14 [Tasa de Dólar](#314-tasa-de-dólar)
   - 3.15 [IVA](#315-iva)
   - 3.16 [Usuarios y Roles](#316-usuarios-y-roles)
   - 3.17 [Notificaciones](#317-notificaciones)
   - 3.18 [Reportes PDF](#318-reportes-pdf)
   - 3.19 [Configuración de Empresa](#319-configuración-de-empresa)
   - 3.20 [Recuperación de Contraseña](#320-recuperación-de-contraseña)
   - 3.21 [Preguntas de Seguridad](#321-preguntas-de-seguridad)
4. [Plan de Implementación](#4-plan-de-implementación)
5. [Consideraciones Técnicas](#5-consideraciones-técnicas)

---

## 1. Arquitectura General

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React Native (Expo) |
| Navegación | `@react-navigation/native` + `@react-navigation/drawer` + `@react-navigation/bottom-tabs` |
| Estado Global | Zustand o React Context |
| HTTP Client | Axios o ky |
| Almacén Seguro | `expo-secure-store` (JWT, biometría) |
| Cache Local | `react-native-mmkv` o `@react-native-async-storage/async-storage` |
| Tiempo Real | `socket.io-client` |
| Push Notifications | `expo-notifications` |
| Biometría | `expo-local-authentication` |
| PDF Viewer | `react-native-pdf` o `expo-file-system` + `expo-sharing` |
| Formularios | React Hook Form + Zod |
| UI Kit | React Native Paper / NativeBase / Tailwind (NativeWind) |

### Conexión API

- Base URL desde variable de entorno: `API_URL`
- JWT enviado como `Authorization: Bearer <token>` (el server acepta tanto cookie como header)
- Refresh automático del token al recibir 401 (el server ya renueva el token en `isAuthenticate.js`)
- Socket.IO conectado post-login usando el mismo JWT

### Manejo de Moneda Dual

- Todos los precios viajan en Bs. (moneda local) desde el servidor
- La app muestra siempre el precio en Bs. + su equivalente en USD (tasa activa)
- En formularios de pago, el usuario puede ingresar monto en Bs. o en USD (se convierte automáticamente)
- La tasa activa se obtiene de `GET /api/exchange-rate/actual` y se cachea
- Cuando la tasa cambia, Socket.IO emite `tasa-dolar:updated`

---

## 2. Estructura de Navegación

```
App
├── AuthStack (no autenticado)
│   ├── LoginScreen
│   └── PasswordRecoveryFlow
│       ├── UsernameLookup
│       ├── SecurityQuestions
│       └── NewPassword
│
└── MainDrawer (autenticado, header con menú hamburguesa)
    │
    ├── BottomTabNavigator
    │   ├── Tab: Inicio (DashboardStack)
    │   │   └── DashboardScreen
    │   │
    │   ├── Tab: POS (POSStack)
    │   │   ├── POSScreen (crear venta)
    │   │   ├── SaleHistoryScreen
    │   │   └── SaleDetailScreen
    │   │
    │   ├── Tab: Inventario (InventoryStack)
    │   │   ├── ProductListScreen
    │   │   ├── ProductDetailScreen
    │   │   ├── ProductFormScreen (create/edit)
    │   │   └── StockMovementScreen
    │   │
    │   └── Tab: Clientes (CustomerStack)
    │       ├── CustomerListScreen
    │       └── CustomerFormScreen
    │
    ├── DrawerItems (DrawerContent)
    │   ├── Dashboard (ya en tabs)
    │   ├── POS / Ventas
    │   ├── Pedidos
    │   │   ├── OrderListScreen
    │   │   ├── OrderDetailScreen
    │   │   └── OrderFormScreen
    │   ├── Inventario
    │   ├── Clientes
    │   ├── Caja
    │   │   ├── BoxListScreen
    │   │   ├── BoxControlScreen (apertura/cierre)
    │   │   ├── BoxMovementListScreen
    │   │   └── BoxMovementFormScreen
    │   ├── Empleados
    │   │   ├── EmployeeListScreen
    │   │   ├── EmployeeFormScreen
    │   │   └── EmployeeDetailScreen
    │   ├── Nómina
    │   │   ├── PayrollListScreen
    │   │   ├── PayrollDetailScreen
    │   │   ├── PayrollGenerateScreen
    │   │   └── EmployeePayrollListScreen
    │   ├── Servicios
    │   │   ├── ServiceListScreen
    │   │   ├── ServiceDetailScreen
    │   │   ├── ServiceFormScreen
    │   │   ├── ServicePeriodListScreen
    │   │   └── ServicePaymentFormScreen
    │   ├── Tasas / IVA
    │   │   ├── ExchangeRateScreen
    │   │   └── IVAScreen
    │   ├── Usuarios (rol admin/superadmin)
    │   │   ├── UserListScreen
    │   │   └── UserFormScreen
    │   ├── Reportes
    │   │   └── ReportScreen
    │   ├── Notificaciones
    │   │   └── NotificationListScreen
    │   └── Configuración
    │       ├── ProfileScreen
    │       ├── CompanySettingsScreen
    │       ├── SecurityQuestionsSetupScreen
    │       └── ChangePasswordScreen
    │
    └── Modales Globales
        ├── SelectProductModal (buscar/seleccionar producto para venta/pedido)
        ├── SelectCustomerModal (buscar/seleccionar cliente)
        ├── PaymentModal (ingresar monto, método de pago)
        └── PDFPreviewModal (vista previa del PDF generado)
```

### Reglas de Visibilidad por Rol

| Rol | Módulos Visibles |
|-----|-----------------|
| `usuario` (vendedor) | POS, Inventario (consulta), Clientes, Caja (operar), Dashboard |
| `admin` | Todo excepto Configuración avanzada del sistema |
| `superadmin` | Todo: incluye Usuarios, Configuración empresa, Restaurar DB |

---

## 3. Módulos

---

### 3.1 Autenticación

#### User Stories

| ID | Historia |
|----|----------|
| `AUTH-01` | Como usuario, quiero iniciar sesión con usuario y contraseña para acceder al sistema |
| `AUTH-02` | Como usuario, quiero que la app recuerde mi sesión con biometría para no tener que escribir la contraseña cada vez |
| `AUTH-03` | Como usuario, quiero cerrar sesión para proteger mis datos |
| `AUTH-04` | Como usuario, quiero recuperar mi contraseña si la olvido |
| `AUTH-05` | Como usuario, quiero que la sesión expire automáticamente por seguridad |

#### Happy Path — Login

1. Usuario abre la app → ve `LoginScreen`
2. Ingresa `username` y `password`
3. Presiona "Iniciar Sesión"
4. App llama a `POST /api/user/signin`
5. Servidor valida credenciales, devuelve `{ user, token }`, setea cookie `sid`
6. App guarda `token` en SecureStore, guarda `user` en estado global
7. Si es primer login o no tiene biometría configurada → prompt "¿Activar biometría?"
8. Si acepta → guarda credenciales biométricas
9. Conecta Socket.IO con el token
10. Navega a `MainDrawer` (Dashboard)

#### Happy Path — Biometría (reingreso)

1. Usuario cierra app y la reabre
2. App detecta token guardado en SecureStore + biometría activa
3. Muestra `LoginScreen` con botón "Huella/Face ID"
4. Usuario autentica con biometría
5. App valida token (o lo usa directamente)
6. Si token expiró → hace refresh o pide contraseña
7. Navega a `MainDrawer`

#### Sad Path

| Escenario | Flujo | Respuesta App |
|-----------|-------|---------------|
| Usuario no existe | `POST /api/user/signin` → 401 | Toast/alert: "Usuario o contraseña incorrectos" |
| Contraseña incorrecta | `POST /api/user/signin` → 401 | Toast/alert: "Usuario o contraseña incorrectos" |
| Usuario inactivo | `POST /api/user/signin` → 403 | Toast: "Cuenta desactivada. Contacta al administrador" |
| Error de red | Timeout / Network error | Toast: "Error de conexión. Verifica tu internet" + opción reintentar |
| Token expirado | Cualquier request → 401 | Intentar refresh automático. Si falla → logout + redirigir a Login |
| Biometría no disponible | Dispositivo sin huella/face | Ocultar opción biometría, login normal |
| Biometría falla 3 veces | Fallback a contraseña manual | Mostrar input de contraseña |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| POST | `/api/user/signin` | Login |
| DELETE | `/api/user/logout` | Logout (limpia cookie) |

#### Cache offline

- Guardar `{ token, user }` en SecureStore
- Guardar `{ username }` para biometría en Keychain (iOS) / Keystore (Android)
- No requiere datos offline para login

---

### 3.2 Dashboard

#### User Stories

| ID | Historia |
|----|----------|
| `DASH-01` | Como usuario, quiero ver un resumen del negocio al abrir la app para tener visibilidad rápida |
| `DASH-02` | Como usuario, quiero ver alertas de stock bajo para reabastecer |

#### Happy Path

1. Usuario inicia sesión → llega a `DashboardScreen`
2. Ve tarjetas con: ventas del día, pedidos pendientes, productos con stock bajo, caja abierta/cerrada
3. Los datos se cargan de endpoints del dashboard o de consultas específicas
4. Las tarjetas son touchables → navegan al módulo correspondiente

> **Nota:** El servidor **no tiene un endpoint específico de dashboard**. Se debe construir con llamadas paralelas:
> - `GET /api/product/?lowStock=1&limit=5` — productos con stock bajo
> - `GET /api/shopping/` — últimas ventas (filtrar por fecha en frontend)
> - `GET /api/orders/?estado=pendiente` — pedidos pendientes
> - `GET /api/box-register-control/mi-actual` — estado de caja

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Error al cargar datos | Mostrar esqueleto/loader con toast de error. Reintentar |
| Sin datos (negocio nuevo) | Mostrar cards vacías con mensaje "Aún no hay datos" |
| Sin conexión | Mostrar últimos datos cacheados con indicador "offline" |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/product/?lowStock=1&limit=5` | Productos con stock bajo |
| GET | `/api/box-register-control/mi-actual` | Estado de caja actual |

---

### 3.3 Ventas (POS)

#### User Stories

| ID | Historia |
|----|----------|
| `POS-01` | Como vendedor, quiero crear una venta rápida seleccionando productos y cliente para cobrar |
| `POS-02` | Como vendedor, quiero buscar productos por nombre o código para agregarlos rápido |
| `POS-03` | Como vendedor, quiero registrar pagos en Bs. y USD para aceptar ambos tipos |
| `POS-04` | Como vendedor, quiero ver el historial de ventas para consultar transacciones pasadas |
| `POS-05` | Como vendedor, quiero ver el detalle de una venta para confirmar lo que se cobró |
| `POS-06` | Como administrador, quiero eliminar una venta para corregir errores |

#### Happy Path — Crear Venta

1. Usuario navega a tab POS → `POSScreen`
2. Ve carrito vacío + selector de productos + selector de cliente
3. Toca "Agregar Producto" → modal `SelectProductModal`:
   - Busca por nombre o código
   - Ve stock disponible, precio unitario (Bs. + USD)
   - Selecciona producto, elige cantidad
4. El producto se agrega al carrito con subtotal
5. Repite hasta completar la venta
6. Toca "Cliente" → modal `SelectCustomerModal`:
   - Busca cliente por nombre o cédula
   - Opción "Cliente Genérico" (cliente sin registrar)
7. Toca "Cobrar" → modal `PaymentModal`:
   - Ve total en Bs. + USD
   - Selecciona método de pago (efectivo, transferencia, punto, etc.)
   - Si es efectivo: ingresa monto recibido → calcula vuelto
   - Si es divisa: ingresa monto en USD → convierte a Bs.
   - Puede dividir pago en varios métodos
8. Confirma → `POST /api/shopping/`
9. Si hay caja abierta y método efectivo → registra ingreso automático en caja
10. Venta creada → navega a `SaleDetailScreen` con resumen
11. Opción: compartir comprobante (captura de pantalla o datos)

#### Happy Path — Historial de Ventas

1. Usuario va a `SaleHistoryScreen`
2. Ve lista de ventas (fecha, cliente, total, método pago)
3. Puede filtrar por fecha o buscar por cliente
4. Toca una venta → `SaleDetailScreen` con todos los datos (productos, pagos, IVA)

#### Sad Path

| Escenario | Flujo | Respuesta |
|-----------|-------|-----------|
| Producto sin stock | Intenta agregar cantidad > stock | Modal: "Stock insuficiente. Disponible: X" |
| Carrito vacío | Toca "Cobrar" | Alert: "Agrega al menos un producto" |
| Sin cliente seleccionado | Toca "Cobrar" | Usar cliente genérico automáticamente |
| Sin caja abierta | Intenta cobrar en efectivo | Alert: "Debes abrir la caja primero" + opción ir a Caja |
| Monto de pago insuficiente | Ingresa monto < total | Alert: "El monto debe cubrir el total" |
| Error al crear venta | `POST /api/shopping/` → error | Toast error + mantener carrito para reintentar |
| Error de red | Timeout | Guardar venta pendiente en cola offline |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/shopping/` | Listar ventas (historial) |
| GET | `/api/shopping/:id` | Detalle de venta |
| POST | `/api/shopping/` | Crear venta (body: `{ cliente_id, productos: [{ producto_id, cantidad }], pagos: [{ metodo_pago_id, monto, referencia, tasa_id? }], iva_id? }`) |
| DELETE | `/api/shopping/:id` | Eliminar venta |

#### Payload de creación (`POST /api/shopping`)

```json
{
  "cliente_id": 1,
  "iva_id": 1,
  "observaciones": "Venta en mostrador",
  "detalles": [
    { "producto_id": 5, "cantidad": 2 },
    { "producto_id": 8, "cantidad": 1 }
  ],
  "pagos": [
    {
      "metodo_pago_id": 1,
      "monto": 45.50,
      "tasa_id": null,
      "referencia_pago": null
    }
  ]
}
```

#### Cache offline

- Cachear lista de productos + precios (para carrito rápido)
- Cachear clientes frecuentes
- No permitir crear ventas offline (semi-offline) → mostrar mensaje si no hay conexión

---

### 3.4 Pedidos

#### User Stories

| ID | Historia |
|----|----------|
| `ORD-01` | Como vendedor, quiero crear un pedido para un cliente con fecha de entrega futura |
| `ORD-02` | Como vendedor, quiero ver la lista de pedidos pendientes para dar seguimiento |
| `ORD-03` | Como vendedor, quiero actualizar el estado de un pedido (procesado/completado) |
| `ORD-04` | Como vendedor, quiero registrar pagos parciales contra un pedido |

#### Happy Path — Crear Pedido

1. Usuario va a `OrderFormScreen`
2. Selecciona cliente (modal `SelectCustomerModal`)
3. Agrega productos (modal `SelectProductModal`) con cantidades
4. Ingresa `fecha_entrega` (date picker)
5. Ingresa `observaciones` (opcional)
6. Confirma → `POST /api/orders/`
7. Pedido creado con estado `pendiente`
8. Navega a `OrderDetailScreen`

#### Happy Path — Registrar Pago en Pedido

1. Usuario ve `OrderDetailScreen` → sección "Pagos"
2. Ve total del pedido, cuanto lleva pagado, saldo pendiente
3. Toca "Registrar Pago" → modal `PaymentModal`
4. Ingresa monto, método de pago
5. Confirma → `POST /api/order-payment/`
6. Si el total está cubierto → pedido pasa a `procesado`
7. Si es efectivo y hay caja abierta → registra ingreso en caja

#### Happy Path — Cambiar Estado

1. Usuario ve `OrderDetailScreen`
2. Toca botón "Marcar como Completado"
3. Confirma → `PUT /api/orders/:id` con estado `completado`

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Fecha de entrega en pasado | Alert: "La fecha debe ser futura" |
| Producto sin stock al crear | Alert: "Stock insuficiente" (el server valida) |
| Pedido no encontrado | 404 → Toast: "Pedido no existe" |
| Pagar más del total | Limitar monto al saldo pendiente |
| Error de red | Mantener datos del formulario + toast reintentar |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/orders/` | Listar pedidos (filtro `?estado=pendiente`) |
| GET | `/api/orders/:id` | Detalle del pedido |
| POST | `/api/orders/` | Crear pedido |
| PUT | `/api/orders/:id` | Actualizar estado |
| DELETE | `/api/orders/:id` | Eliminar pedido |
| GET | `/api/order-payment/` | Listar pagos |
| POST | `/api/order-payment/` | Crear pago |

---

### 3.5 Inventario y Productos

#### User Stories

| ID | Historia |
|----|----------|
| `INV-01` | Como usuario, quiero ver la lista de productos con stock y precio para consultar el inventario |
| `INV-02` | Como usuario, quiero buscar productos por nombre o código para encontrarlos rápido |
| `INV-03` | Como administrador, quiero crear/editar productos para mantener el catálogo actualizado |
| `INV-04` | Como administrador, quiero ver productos con stock bajo para reabastecer |
| `INV-05` | Como administrador, quiero eliminar productos que ya no se venden |
| `INV-06` | Como usuario, quiero ver el detalle de un producto con su historial de movimientos |

#### Happy Path — Listar Productos

1. Usuario navega a tab Inventario → `ProductListScreen`
2. Ve lista paginada de productos con: nombre, código, precio Bs., precio USD (calculado), stock, categoría
3. Puede buscar por nombre o código (campo de búsqueda)
4. Puede filtrar por categoría
5. Puede activar filtro "Stock Bajo" (productos con stock ≤ umbral)
6. Toca un producto → `ProductDetailScreen`

#### Happy Path — Crear Producto

1. Usuario va a `ProductFormScreen` (modo crear)
2. Ingresa: nombre, código, descripción, precio, stock inicial, selecciona categoría
3. Opcional: sube imagen del producto
4. Confirma → `POST /api/product/`
5. Producto creado → vuelve a lista

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Código de producto duplicado | 409 → Toast: "Ya existe un producto con ese código" |
| Nombre de categoría no existe | Mostrar error si categoría inválida |
| Producto no encontrado | 404 → Toast: "Producto no existe" |
| Sin conexión | Mostrar datos cacheados con indicador offline |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/product/` | Listar (query: `?search=&categoria_id=&lowStock=1&page=&limit=`) |
| GET | `/api/product/:id` | Detalle del producto |
| POST | `/api/product/` | Crear (multipart: imagen + JSON) |
| PUT | `/api/product/:id` | Actualizar |
| DELETE | `/api/product/:id` | Eliminar |

#### Cache offline

- Cachear lista de productos completa en MMKV
- Actualizar caché cada vez que se carga la lista
- Usar caché para mostrar productos en modal POS sin conexión

---

### 3.6 Categorías

#### User Stories

| ID | Historia |
|----|----------|
| `CAT-01` | Como administrador, quiero gestionar categorías de productos para organizar el inventario |

#### Happy Path

1. Usuario accede a categorías desde `ProductFormScreen` o sección de gestión
2. Ve lista de categorías
3. Crea/edita/elimina categorías

> **Nota:** Las categorías son un sub-módulo del inventario. Se puede implementar como un modal o pantalla separada.

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/category/` | Listar categorías |
| GET | `/api/category/:id` | Detalle |
| POST | `/api/category/` | Crear |
| PUT | `/api/category/:id` | Actualizar |
| DELETE | `/api/category/:id` | Eliminar |

---

### 3.7 Movimientos de Producto

#### User Stories

| ID | Historia |
|----|----------|
| `MOV-01` | Como administrador, quiero registrar entradas de stock para aumentar inventario |
| `MOV-02` | Como administrador, quiero registrar salidas de stock (ajustes, mermas) |
| `MOV-03` | Como usuario, quiero ver el historial de movimientos de un producto |

#### Happy Path

1. Usuario va a `ProductDetailScreen` → sección "Movimientos"
2. Ve historial de entradas/salidas con fecha, tipo, cantidad, usuario
3. Toca "+" → `StockMovementForm`
4. Selecciona tipo: "Entrada" o "Salida"
5. Ingresa cantidad y observación
6. Confirma → `POST /api/product-movement/`
7. Stock se actualiza automáticamente en el servidor

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Salida > stock actual | Alert: "Stock insuficiente. Disponible: X" |
| Cantidad ≤ 0 | Validación: debe ser > 0 |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/product-movement/` | Listar movimientos (query: `?tipo=entrada&producto_id=`) |
| GET | `/api/product-movement/:id` | Detalle |
| POST | `/api/product-movement/` | Crear movimiento |
| DELETE | `/api/product-movement/:id` | Eliminar |

---

### 3.8 Clientes

#### User Stories

| ID | Historia |
|----|----------|
| `CLI-01` | Como usuario, quiero buscar clientes por nombre o cédula para asignarlos a ventas/pedidos |
| `CLI-02` | Como usuario, quiero crear clientes nuevos para registrar sus datos |
| `CLI-03` | Como usuario, quiero editar datos de un cliente para mantenerlos actualizados |
| `CLI-04` | Como administrador, quiero eliminar clientes que ya no operan con nosotros |

#### Happy Path

1. Usuario navega a tab Clientes → `CustomerListScreen`
2. Busca por nombre o cédula
3. Ve resultados paginados
4. Toca cliente → `CustomerFormScreen` (modo edición)
5. Toca "+" → `CustomerFormScreen` (modo crear)
6. Ingresa: nombre, apellido, cédula (unique), teléfono, email, dirección
7. Confirma → `POST /api/customer/` o `PUT /api/customer/:id`

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Cédula duplicada | 409 → Toast: "Ya existe un cliente con esa cédula" |
| Cliente no encontrado | 404 → Toast |
| Sin conexión | Mostrar clientes cacheados |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/customer/` | Listar (query: `?search=&page=&limit=`) |
| GET | `/api/customer/:id` | Detalle |
| POST | `/api/customer/` | Crear |
| PUT | `/api/customer/:id` | Actualizar |
| DELETE | `/api/customer/:id` | Eliminar |

#### Cache offline

- Cachear lista de clientes para búsqueda rápida en POS

---

### 3.9 Caja

#### User Stories

| ID | Historia |
|----|----------|
| `CAJA-01` | Como vendedor, quiero ver las cajas disponibles para saber cuál usar |
| `CAJA-02` | Como vendedor, quiero abrir una caja con un monto inicial para comenzar operaciones |
| `CAJA-03` | Como vendedor, quiero cerrar la caja al final del día con el monto final para cuadrar |
| `CAJA-04` | Como usuario, quiero ver mi caja actual (abierta) para saber el estado |
| `CAJA-05` | Como administrador, quiero ver todos los movimientos de una caja para auditar |
| `CAJA-06` | Como administrador, quiero gestionar las cajas registradoras |

#### Happy Path — Abrir Caja

1. Usuario va a `BoxListScreen`
2. Ve lista de cajas disponibles con su estado (último control)
3. Toca una caja → `BoxControlScreen`
4. Ve historial de aperturas/cierres
5. Toca "Abrir Caja"
6. Si no hay control activo → `POST /api/box-register-control/apertura/:caja_id`
7. Caja se marca como abierta con monto inicial (el que tenga la caja en DB)
8. Confirma → redirige a estado actual

#### Happy Path — Cerrar Caja

1. Usuario va a caja activa
2. Toca "Cerrar Caja"
3. Ingresa `monto_cierre` (efectivo final en caja)
4. App muestra resumen: monto inicial, ingresos, egresos, esperado vs real
5. Confirma → `POST /api/box-register-control/cierre/:caja_id`
6. Caja cerrada

#### Happy Path — Ver Estado Actual

1. Usuario va a `BoxControlScreen`
2. Toca "Mi Caja Actual" o automático si tiene caja abierta
3. Ve: monto apertura, movimientos del día, saldo actual

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Caja ya tiene apertura activa | Alert: "La caja ya está abierta por [usuario]" |
| Caja no tiene apertura | Alert: "Debes abrir la caja primero" |
| Cierre sin estar abierta | Alert: "La caja no está abierta" |
| Monto de cierre no cuadra | Confirmación: "El monto esperado es X. ¿Continuar?" |
| Sin conexión | Cachear último estado, no permitir apertura/cierre offline |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/box-register/` | Listar cajas |
| GET | `/api/box-register/:id` | Detalle caja |
| POST | `/api/box-register/` | Crear caja |
| PUT | `/api/box-register/:id` | Actualizar |
| DELETE | `/api/box-register/:id` | Eliminar |
| GET | `/api/box-register-control/` | Listar controles |
| GET | `/api/box-register-control/mi-actual` | Mi caja actual (pendiente: incluye token de usuario) |
| GET | `/api/box-register-control/by-box/:caja_id` | Controles de una caja |
| GET | `/api/box-register-control/actual/:caja_id` | Estado actual de caja |
| POST | `/api/box-register-control/apertura/:caja_id` | Abrir caja |
| POST | `/api/box-register-control/cierre/:caja_id` | Cerrar caja |

---

### 3.10 Movimientos de Caja

#### User Stories

| ID | Historia |
|----|----------|
| `MOVCAJA-01` | Como vendedor, quiero registrar ingresos o egresos de caja (gastos menores, retiros) |
| `MOVCAJA-02` | Como usuario, quiero ver los movimientos de la caja activa |

#### Happy Path

1. Usuario ve caja abierta → toca "Agregar Movimiento"
2. Selecciona tipo: `ingreso` o `egreso`
3. Ingresa: monto, descripción
4. Confirma → `POST /api/cash-movements/`
5. Movimiento registrado, saldo de caja actualizado

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Sin caja abierta | Alert: "Debes abrir una caja primero" |
| Egreso mayor a saldo | Confirmación: "El saldo actual es X. ¿Confirmas el egreso?" |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/cash-movements/by-box/:box_id` | Movimientos de caja activa |
| GET | `/api/cash-movements/by-control/:control_id` | Movimientos por control |
| GET | `/api/cash-movements/:id` | Detalle movimiento |
| POST | `/api/cash-movements/` | Crear movimiento |

---

### 3.11 Empleados

#### User Stories

| ID | Historia |
|----|----------|
| `EMP-01` | Como administrador, quiero gestionar empleados (CRUD) para mantener el registro del personal |
| `EMP-02` | Como administrador, quiero ver el detalle de un empleado con su deuda acumulada |
| `EMP-03` | Como administrador, quiero buscar empleados por nombre o cédula |

#### Happy Path

1. Usuario va a `EmployeeListScreen`
2. Busca por nombre o cédula
3. Toca empleado → `EmployeeDetailScreen`
   - Datos personales, salario, frecuencia de pago
   - Deuda calculada (historial de nómina vs pagos)
   - Botón "Ver Nóminas"
4. Toca "+" → `EmployeeFormScreen`
   - Ingresa: nombre, apellido, cédula, teléfono, email, dirección, salario_base, frecuencia_pago (mensual/quincenal/semanal)
5. Confirma → `POST /api/employe/`

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Cédula duplicada | 409 → Toast |
| Salario inválido | Validación: debe ser > 0 |
| Empleado no encontrado | 404 → Toast |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/employe/` | Listar (query: `?search=&page=&limit=`) |
| GET | `/api/employe/:id` | Detalle |
| GET | `/api/employe/deuda/:id` | Deuda del empleado |
| POST | `/api/employe/` | Crear |
| PUT | `/api/employe/:id` | Actualizar |
| DELETE | `/api/employe/:id` | Eliminar |

---

### 3.12 Nómina

#### User Stories

| ID | Historia |
|----|----------|
| `NOM-01` | Como administrador, quiero generar la nómina para un período para pagar a los empleados |
| `NOM-02` | Como administrador, quiero ver el historial de nóminas generadas |
| `NOM-03` | Como administrador, quiero ver el detalle de una nómina (qué empleados, montos) |
| `NOM-04` | Como administrador, quiero registrar pagos individuales a empleados (fuera de nómina batch) |

#### Happy Path — Generar Nómina

1. Usuario va a `PayrollListScreen`
2. Toca "Generar Nómina" → `PayrollGenerateScreen`
3. Selecciona período: fecha inicio, fecha fin
4. Confirma → `POST /api/nomina/generate` (BullMQ job)
5. App muestra loader: "Generando nómina..."
6. Socket.IO recibe evento `nomina_generada` → actualiza lista
7. Nómina creada con estado `completed`

> **Nota:** La generación es asíncrona (BullMQ). La app debe:
> 1. Enviar la solicitud
> 2. Mostrar feedback inmediato ("Nómina en proceso...")
> 3. Escuchar evento Socket.IO `nomina_generada` para actualizar
> 4. Si no llega Socket.IO, hacer polling a `GET /api/nomina/:id`

#### Happy Path — Empleado Payroll Individual

1. Usuario va a `EmployeePayrollListScreen`
2. Toca "+" → formulario
3. Selecciona empleado, período, monto, bono, deducción
4. Confirma → `POST /api/employee-payroll/`
5. Monto en USD se calcula automáticamente con tasa activa

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Período duplicado | Alert: "Ya existe una nómina para este período" |
| Sin empleados activos | Alert: "No hay empleados activos para generar nómina" |
| Socket.IO no llega | Fallback: polling cada 5s hasta que estado != 'processing' |
| Error de worker | Estado `failed` → Toast: "Error al generar nómina. Reintenta" |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/nomina/` | Listar nóminas batch |
| GET | `/api/nomina/:id` | Detalle nómina (con detalles de empleados) |
| POST | `/api/nomina/generate` | Generar nómina (async) |
| GET | `/api/employee-payroll/` | Listar payroll individual |
| GET | `/api/employee-payroll/:id` | Detalle |
| POST | `/api/employee-payroll/` | Crear payroll individual |
| PUT | `/api/employee-payroll/:id` | Actualizar |
| DELETE | `/api/employee-payroll/:id` | Eliminar |

---

### 3.13 Servicios Empresariales

#### User Stories

| ID | Historia |
|----|----------|
| `SERV-01` | Como administrador, quiero gestionar servicios contratados (electricidad, internet, etc.) |
| `SERV-02` | Como administrador, quiero ver los períodos de facturación de un servicio |
| `SERV-03` | Como administrador, quiero registrar pagos contra servicios |

#### Happy Path

1. Usuario va a `ServiceListScreen`
2. Ve lista de servicios (nombre, proveedor, precio, estado)
3. Toca servicio → `ServiceDetailScreen`
   - Datos del servicio
   - Períodos de facturación (mes/año, monto, balance, estado)
   - Pagos registrados
4. Toca "Registrar Pago" → `ServicePaymentFormScreen`
   - Selecciona período (o automático al período actual)
   - Ingresa monto, descripción
   - Confirma → `POST /api/service-payment/`
5. Toca "+" → `ServiceFormScreen`
   - Ingresa: nombre, proveedor, día de corte, precio
   - El servidor auto-genera el primer período

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Servicio sin períodos | Mostrar "Sin períodos generados" |
| Pago > balance del período | Confirmación: "El monto excede el balance. ¿Continuar?" |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/service/` | Listar servicios |
| GET | `/api/service/:id` | Detalle |
| POST | `/api/service/` | Crear |
| PUT | `/api/service/:id` | Actualizar |
| DELETE | `/api/service/:id` | Eliminar |
| GET | `/api/service-period/by-service/:id` | Períodos de un servicio |
| POST | `/api/service-period/` | Crear período manual |
| POST | `/api/service-payment/` | Registrar pago |

---

### 3.14 Tasa de Dólar

#### User Stories

| ID | Historia |
|----|----------|
| `TASA-01` | Como administrador, quiero ver la tasa de dólar actual para referencia |
| `TASA-02` | Como administrador, quiero actualizar la tasa de dólar para mantener precios al día |
| `TASA-03` | Como usuario, quiero ver el historial de tasas |

#### Happy Path

1. Usuario va a `ExchangeRateScreen`
2. Ve: tasa actual (fecha, valor, quién la actualizó)
3. Toca "Actualizar Tasa"
4. Ingresa nuevo valor
5. Confirma → `POST /api/exchange-rate/`
6. Tasa anterior se desactiva automáticamente
7. Socket.IO emite `tasa-dolar:updated` → app actualiza tasas en tiempo real
8. Todos los precios en USD se recalculan automáticamente en la app

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Tasa ≤ 0 | Validación: debe ser > 0 |
| Sin conexión | Mostrar última tasa cachead |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/exchange-rate/actual` | Tasa actual |
| GET | `/api/exchange-rate/` | Historial de tasas |
| POST | `/api/exchange-rate/` | Crear nueva tasa |

#### Socket.IO

| Evento | Acción |
|--------|--------|
| `tasa-dolar:updated` | Actualizar tasa en store global, refrescar precios USD en pantallas activas |

---

### 3.15 IVA

#### User Stories

| ID | Historia |
|----|----------|
| `IVA-01` | Como administrador, quiero ver el IVA actual para referencia |
| `IVA-02` | Como administrador, quiero actualizar el porcentaje de IVA |

#### Happy Path

1. Usuario va a `IVAScreen`
2. Ve: tasa actual de IVA (%, fecha, quién)
3. Toca "Actualizar"
4. Ingresa nuevo porcentaje + observación
5. Confirma → `POST /api/iva/`
6. IVA anterior se desactiva automáticamente

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Porcentaje < 0 | Validación |
| Sin conexión | Mostrar último IVA cachead |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/iva/actual` | IVA actual |
| GET | `/api/iva/` | Historial |
| POST | `/api/iva/` | Crear nuevo IVA |

---

### 3.16 Usuarios y Roles

#### User Stories

| ID | Historia |
|----|----------|
| `USER-01` | Como superadmin, quiero gestionar usuarios del sistema (CRUD) |
| `USER-02` | Como superadmin, quiero asignar roles a los usuarios |
| `USER-03` | Como superadmin, quiero activar/desactivar usuarios |
| `USER-04` | Como usuario, quiero cambiar mi contraseña |

#### Happy Path

1. Usuario (superadmin) va a `UserListScreen`
2. Ve lista de usuarios con: username, empleado asociado, rol, activo
3. Toca "+" → `UserFormScreen`
   - Asocia a empleado existente (selector)
   - Asigna username, contraseña inicial
   - Selecciona rol (`superadmin`, `admin`, `usuario`)
4. Confirma → `POST /api/user/`
5. Toca usuario → editar: puede cambiar rol, activar/desactivar

#### Happy Path — Cambiar Contraseña

1. Usuario va a `ChangePasswordScreen` (desde Configuración)
2. Ingresa: contraseña actual, nueva contraseña, confirmar
3. Confirma → `POST /api/user/change-password/:id`

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Username duplicado | 409 → Toast |
| Contraseña actual incorrecta | Toast: "Contraseña actual incorrecta" |
| Nueva contraseña ≠ confirmación | Validación local |
| Usuario intenta cambiar rol propio | Prevenir: "No puedes cambiar tu propio rol" |
| Sin permisos | El server devuelve 403, app oculta opciones según rol |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/user/` | Listar usuarios |
| GET | `/api/user/:id` | Detalle |
| POST | `/api/user/` | Crear |
| PUT | `/api/user/:id` | Actualizar (solo tipo_usuario_id, activo) |
| DELETE | `/api/user/:id` | Eliminar |
| POST | `/api/user/change-password/:id` | Cambiar contraseña |
| GET | `/api/user-types/` | Listar roles |
| GET | `/api/user-types/:id` | Detalle rol |
| POST | `/api/user-types/` | Crear rol |
| PUT | `/api/user-types/:id` | Actualizar rol |
| DELETE | `/api/user-types/:id` | Eliminar rol |

---

### 3.17 Notificaciones

#### User Stories

| ID | Historia |
|----|----------|
| `NOTIF-01` | Como usuario, quiero recibir notificaciones de servicios próximos a vencer y pedidos pendientes |
| `NOTIF-02` | Como usuario, quiero ver la lista de notificaciones en la app |
| `NOTIF-03` | Como usuario, quiero marcar notificaciones como leídas |

#### Happy Path

1. Usuario recibe notificación push (Expo) o ve badge en icono
2. Abre app → va a `NotificationListScreen`
3. Ve lista de notificaciones (tipo: warning/danger, mensaje, entidad)
4. Toca una notificación → navega a la entidad relacionada (ej: servicio vencido → ServiceDetailScreen)
5. Toca "Marcar como leída" → `PATCH /api/notifications/:id/read`
6. Toca "Marcar todas leídas" → `PATCH /api/notifications/read-all`

#### Socket.IO (Tiempo Real)

- Conectar socket después de login con token JWT
- Unirse a room: `notifs_user_${userId}`
- Escuchar evento `nueva_notificacion` → mostrar in-app toast/banner + actualizar lista

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/notifications/` | Obtener no leídas |
| PATCH | `/api/notifications/:id/read` | Marcar como leída |
| PATCH | `/api/notifications/read-all` | Marcar todas leídas |

#### Expo Push

- Registrar token Expo Push en el servidor al login
- Enviar token a endpoint custom (no existe aún en servidor) o almacenar localmente
- El servidor envía push notifications via Expo cuando se crean notificaciones

---

### 3.18 Reportes PDF

#### User Stories

| ID | Historia |
|----|----------|
| `REP-01` | Como usuario, quiero generar un reporte PDF de ventas para un rango de fechas |
| `REP-02` | Como usuario, quiero generar un reporte PDF de productos |
| `REP-03` | Como usuario, quiero descargar/compartir el PDF generado |

#### Happy Path

1. Usuario va a `ReportScreen`
2. Selecciona tipo de reporte: "Ventas" o "Productos"
3. Si es Ventas: selecciona fecha inicio y fecha fin (date picker)
4. Toca "Generar Reporte"
5. App muestra loader: "Generando reporte..."
6. Servidor procesa (BullMQ job) → cuando termina emite Socket.IO `reporte-listo`
7. App recibe evento → muestra botón "Descargar"
8. Toca "Descargar" → `GET /api/reports/download/:fileName`
9. App descarga PDF usando `expo-file-system` → ofrece compartir con `expo-sharing`

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Fecha inicio > fecha fin | Validación local |
| Sin ventas en el período | Mensaje: "No hay ventas en el período seleccionado" |
| Socket.IO no llega | Fallback: mostrar "Verifica en unos minutos" |
| Archivo no encontrado | 404 → Toast |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| POST | `/api/shopping/report` | Generar reporte ventas (body: `{ fecha_inicio, fecha_fin }`) |
| POST | `/api/product/report/get-all` | Generar reporte productos |
| GET | `/api/reports/download/:fileName` | Descargar PDF |

---

### 3.19 Configuración de Empresa

> ⛔ **No implementado en mobile.** Decisión: la empresa solo se gestiona desde la web (SSR). El link "Compañía" fue eliminado de `more.tsx`.

#### User Stories

| ID | Historia |
|----|----------|
| `CONF-01` | ~~Como superadmin, quiero actualizar los datos de la empresa~~ |
| `CONF-02` | Como usuario, quiero ver mi perfil |

#### Happy Path

1. ~~Usuario va a `CompanySettingsScreen`~~
2. ~~Ve datos actuales: nombre, RIF, dirección, teléfono, email, logo~~
3. ~~Edita campos~~
4. ~~Confirma → `PUT /api/company/:id`~~
5. Perfil de usuario: `ProfileScreen` con datos del empleado asociado

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| PUT | `/api/company/:id` | Actualizar empresa (solo desde web) |

---

### 3.20 Recuperación de Contraseña

#### User Stories

| ID | Historia |
|----|----------|
| `REC-01` | Como usuario, quiero recuperar mi contraseña si la olvido, respondiendo preguntas de seguridad |

#### Happy Path

1. Usuario en `LoginScreen` toca "¿Olvidaste tu contraseña?"
2. Navega a `UsernameLookup`:
   - Ingresa su username
   - `POST /api/request/username/`
   - Servidor devuelve las preguntas de seguridad (sin respuestas)
3. Navega a `SecurityQuestions`:
   - Ve 3 preguntas de seguridad
   - Responde cada una
   - `POST /api/request/security-questions/:userId`
   - Si respuestas correctas → recibe token de recuperación
4. Navega a `NewPassword`:
   - Ingresa nueva contraseña + confirmación
   - `POST /api/request/password-change/:userId`
   - Contraseña actualizada → redirige a Login

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Username no existe | Toast: "Usuario no encontrado" |
| Respuestas incorrectas | Toast: "Respuestas incorrectas. Intenta de nuevo" (máx 3 intentos) |
| Token de recuperación expira | Redirigir al paso 1 |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| POST | `/api/request/username/` | Buscar username, obtener preguntas |
| POST | `/api/request/security-questions/:id` | Validar respuestas |
| POST | `/api/request/password-change/:id` | Cambiar contraseña |

---

### 3.21 Preguntas de Seguridad

#### User Stories

| ID | Historia |
|----|----------|
| `SEG-01` | Como usuario, quiero configurar mis preguntas de seguridad para poder recuperar la contraseña |

#### Happy Path

1. Usuario va a `SecurityQuestionsSetupScreen` (desde Configuración)
2. Ve 3 selectores de preguntas (de la lista global `GET /api/questions/`)
3. Selecciona 3 preguntas y escribe sus respuestas
4. Confirma → `POST /api/questions/valid-questions/:id_usuario`
5. Respuestas guardadas (hasheadas con bcrypt)
6. Si ya tenía preguntas configuradas, se reemplazan

#### Sad Path

| Escenario | Respuesta |
|-----------|-----------|
| Menos de 3 preguntas | Validación: "Debes seleccionar 3 preguntas" |
| Respuestas vacías | Validación local |
| Sin preguntas globales | Mostrar mensaje: "El administrador no ha configurado preguntas" |

#### API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/questions/` | Listar preguntas globales |
| GET | `/api/questions/user-check` | Verificar si el usuario tiene preguntas configuradas |
| POST | `/api/questions/valid-user/:userId` | Validar contraseña actual antes de cambiar preguntas |
| POST | `/api/questions/valid-questions/:id_usuario` | Guardar/actualizar respuestas |

---

## 4. Plan de Implementación

### Fase 1 — Fundación (Sprint 1)

| Orden | Módulo | Dependencias | Estimación |
|-------|--------|-------------|------------|
| 1.1 | Proyecto base Expo + navegación + temas | Ninguna | 1 día |
| 1.2 | API client (Axios + interceptors + refresh token) | 1.1 | 1 día |
| 1.3 | SecureStore + persistencia de sesión | 1.1 | 0.5 día |
| 1.4 | Login + Biometría | 1.2, 1.3 | 1.5 días |
| 1.5 | Socket.IO setup + auth | 1.2, 1.4 | 0.5 día |
| 1.6 | Dashboard (esqueleto + cards) | 1.4 | 1 día |

### Fase 2 — Core de Negocio (Sprint 2)

| Orden | Módulo | Dependencias | Estimación |
|-------|--------|-------------|------------|
| 2.1 | Clientes (listado + formulario) | 1.4 | 1 día |
| 2.2 | Productos (listado + formulario + búsqueda) | 1.4 | 2 días |
| 2.3 | Categorías (CRUD básico) | 1.4 | 0.5 día |
| 2.4 | POS — Carrito + creación de venta | 2.1, 2.2, 1.2 | 3 días |
| 2.5 | POS — Pagos (modal multi-método, Bs/USD) | 2.4 | 2 días |
| 2.6 | Historial de ventas + detalle | 2.4 | 1 día |

### Fase 3 — Caja y Pedidos (Sprint 3)

| Orden | Módulo | Dependencias | Estimación |
|-------|--------|-------------|------------|
| 3.1 | Caja — listado, apertura, cierre | 1.4, 2.4 | 2 días |
| 3.2 | Movimientos de caja | 3.1 | 1 día |
| 3.3 | Pedidos — CRUD, estados | 2.1, 2.2 | 2 días |
| 3.4 | Pagos de pedidos | 3.3 | 1 día |
| 3.5 | Movimientos de producto (stock) | 2.2 | 1 día |

### Fase 4 — Administración (Sprint 4)

| Orden | Módulo | Dependencias | Estimación |
|-------|--------|-------------|------------|
| 4.1 | Empleados | 1.4 | 1.5 días |
| 4.2 | Nómina (batch + individual) | 4.1 | 2 días |
| 4.3 | Servicios empresariales + períodos + pagos | 1.4 | 2 días |
| 4.4 | Tasa de dólar + IVA | 1.4 | 1 día |

### Fase 5 — Finalización (Sprint 5)

| Orden | Módulo | Dependencias | Estimación |
|-------|--------|-------------|------------|
| 5.1 | Usuarios + roles | 4.1 | 1.5 días |
| 5.2 | Reportes PDF | 1.5, 2.4 | 1.5 días |
| 5.3 | Notificaciones (Socket.IO + Expo Push) | 1.5, 3.3, 4.3 | 2 días |
| 5.4 | Recuperación de contraseña + preguntas de seguridad | 1.4 | 1 día |
| 5.5 | Configuración empresa + perfil | 1.4 | 0.5 día |

### Fase 6 — Pulido (Sprint 6)

| Orden | Módulo | Dependencias | Estimación |
|-------|--------|-------------|------------|
| 6.1 | Cache offline (MMKV) | Todas las fases anteriores | 2 días |
| 6.2 | Roles y filtros de UI por tipo_usuario | 5.1 | 1 día |
| 6.3 | Testing + bug fixing | Todo | 3 días |
| 6.4 | Publicación en stores | Todo | 1 día |

---

## 5. Consideraciones Técnicas

### 5.1 Manejo de Estado Global

```typescript
// Store principal (Zustand)
interface AppStore {
  user: User | null;
  token: string | null;
  exchangeRate: ExchangeRate | null;
  iva: IVA | null;
  activeBox: ControlCaja | null;
  notifications: Notification[];

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setExchangeRate: (rate: ExchangeRate) => void;
  setActiveBox: (control: ControlCaja | null) => void;
}
```

### 5.2 API Client (Axios)

```typescript
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Interceptor: agrega JWT
api.interceptors.request.use((config) => {
  const token = SecureStore.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: maneja 401 → logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      SecureStore.deleteItemAsync('token');
      // navegar a Login
    }
    return Promise.reject(err);
  }
);
```

### 5.3 Socket.IO

```typescript
const socket = io(API_URL, {
  auth: { token: SecureStore.getItem('token') },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Socket conectado');
});

socket.on('tasa-dolar:updated', (data) => {
  store.setExchangeRate(data);
});

socket.on('nueva_notificacion', (notif) => {
  store.addNotification(notif);
  // mostrar in-app toast
});

socket.on('reporte-listo', ({ jobId, fileName }) => {
  // habilitar descarga
});

socket.on('nomina_generada', (nomina) => {
  // actualizar lista de nóminas
});
```

### 5.4 Cache Offline (MMKV)

```typescript
// Estrategia de caché por entidad
const CACHE_KEYS = {
  PRODUCTS: 'cache:products',
  CUSTOMERS: 'cache:customers',
  EXCHANGE_RATE: 'cache:exchange_rate',
  IVA: 'cache:iva',
  ACTIVE_BOX: 'cache:active_box',
};

// Al cargar lista desde API → guardar en MMKV
// Al buscar sin conexión → leer de MMKV
// Al crear/actualizar → invalidar caché de esa entidad
```

### 5.5 Moneda Dual

```typescript
// Hook para formatear precios
function usePriceFormatter() {
  const rate = useStore((s) => s.exchangeRate);

  const formatBs = (amount: number) =>
    new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);

  const formatUsd = (amountInBs: number) => {
    if (!rate) return '—';
    const usd = amountInBs / rate.tasa;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
  };

  return { formatBs, formatUsd, rate };
}

// Uso en componente:
// <Text>{formatBs(producto.precio)}</Text>
// <Text style="color:gray">≈ {formatUsd(producto.precio)}</Text>
```

### 5.6 Notas sobre Bugs del Servidor (Corregir)

Los siguientes bugs en el servidor deben corregirse para que el frontend funcione correctamente:

| Archivo | Línea | Problema | Fix |
|---------|-------|----------|-----|
| `src/controllers/company.controller.js` | 15-18 | `modelss` vs `empresas` → undefined | Renombrar variable a `empresas` |
| `src/middlewares/validRole.js` | Varias | Falta `return` después de `res.render()` | Agregar `return` en cada error path |
| `src/controllers/boxMovement.controller.js` | 108 | `Usuario` sin importar | Cambiar a `models.Usuario` |
| `src/routes/index.js` | — | No hay endpoint para registrar Expo Push Token | Crear `POST /api/user/push-token` |

### 5.7 Roles y Permisos en UI

```typescript
type UserRole = 'superadmin' | 'admin' | 'usuario';

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['*'], // todo
  admin: [
    'pos', 'orders', 'inventory', 'customers', 'box',
    'employees', 'payroll', 'services', 'rates', 'iva',
    'notifications', 'reports', 'profile',
  ],
  usuario: [
    'pos', 'inventory:read', 'customers', 'box:operate',
    'notifications', 'profile',
  ],
};

// Hook para verificar permisos
function usePermission(resource: string): boolean {
  const role = useStore((s) => s.user?.tipo_usuario?.nombre);
  if (role === 'superadmin') return true;
  const permissions = ROLE_PERMISSIONS[role as UserRole] ?? [];
  return permissions.includes(resource) || permissions.includes('*');
}
```

---

## Resumen de Estimación Total

| Fase | Días |
|------|------|
| Fase 1 — Fundación | ~4.5 días |
| Fase 2 — Core negocio | ~9.5 días |
| Fase 3 — Caja y Pedidos | ~6 días |
| Fase 4 — Administración | ~6.5 días |
| Fase 5 — Finalización | ~6.5 días |
| Fase 6 — Pulido | ~7 días |
| **Total** | **~40 días hábiles** |

> Esto es ~2 meses de desarrollo con 1 desarrollador full-time. Ajustar según disponibilidad del equipo.
