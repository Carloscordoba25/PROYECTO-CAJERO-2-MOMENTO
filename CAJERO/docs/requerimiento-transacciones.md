# Requerimiento — Módulo de Transacciones (Panel del Cajero)

**Proyecto:** Mi Plata Financial Bank (Cajero Web · CESDE)
**Módulo:** Panel de transacciones
**Responsable de implementación:** Carlos
**Arquitectura:** JavaScript con módulos ES (`import` / `export`), servido con Live Server
**Fecha:** 2026-10-15

---

## 1. Objetivo

Implementar el panel que ve el cliente **después de iniciar sesión**: mostrar su información y sus cuentas (con su saldo), y permitir **consignar**, **retirar** y **transferir** dinero, además de **cerrar sesión**.

## 2. Alcance (componentes)

| Componente | Archivo | Estado |
|---|---|---|
| Servicio (lógica de negocio) | `js/service/servicios.js` | ✅ ya implementado |
| Persistencia | `js/config/persistencia.js` | ✅ ya implementado |
| Controlador (interfaz) | `js/controller/transacciones.js` | ✅ implementado por Carlos |
| HTML | `html/transacciones.html` | ✅ actualizado |

## 2.1 Aclaración sobre el "servicio de sesión"

El controlador **no debe tocar `localStorage`**. Para saber quién inició sesión, el servicio debe exponer una función nueva:

- **`obtenerSesionActiva()`** → `{ exito: true, sesion: { identificacion, usuario } }` o `{ exito: false, mensaje: "No hay sesión activa." }`
- **`cerrarSesionUsuario()`** → cierra la sesión actual.

> ✅ Ambas funciones ya están implementadas en `servicios.js`. El controlador las consume con este contrato.

---

## 3. Regla de arquitectura (obligatoria)

El **controlador** no debe contener lógica de negocio ni tocar `localStorage`.
Su único trabajo: **capturar evento → leer inputs → llamar al servicio → mostrar la respuesta**.
No valida saldos, no calcula intereses y no decide si una transferencia es válida: **el servicio y los modelos ya lo hacen**.

Cada página carga **un solo** `<script type="module">` (ya colocado en `transacciones.html`).

---

## 4. Contratos de los servicios que consumirá

> Todas las funciones devuelven **SIEMPRE** un objeto `{ exito, mensaje, ... }`. Nunca un string ni `undefined`.

| Función | Entrada (en este orden) | Salida en éxito |
|---|---|---|
| `obtenerCuentas` | `identificacion` | `{ exito: true, mensaje, cuentas }` |
| `consultarCliente` | `identificacion` | `{ exito: true, mensaje, datos }` |
| `consignar` | `identificacion`, `numeroCuenta`, `monto` | `{ exito: true, mensaje, saldo }` |
| `retirar` | `identificacion`, `numeroCuenta`, `monto` | `{ exito: true, mensaje, saldo }` |
| `transferir` | `identificacionOrigen`, `numeroCuentaOrigen`, `numeroCuentaDestino`, `monto` | `{ exito: true, mensaje, monto }` |
| `listarMovimientos` | `identificacion` | `{ exito: true, mensaje, movimientos }` (del más reciente al más antiguo) |

**Forma de cada cuenta** devuelta por `obtenerCuentas` (en `cuentas`):

```js
{ tipo: "ahorros" | "corriente", numero: "AH-<id>" | "CT-<id>", saldo: <número>, clienteIdentificacion: "<id>" }
```

**Claves importantes:**
- El campo de la cuenta es **`numero`** (no `numeroCuenta`, no `id`).
- El número de cuenta se construye como **`"AH-" + identificacion`** (ahorros) y **`"CT-" + identificacion`** (corriente).
- El `monto` entra como texto desde el input; el servicio ya lo convierte con `Number(...)`.
- Si algo falla, las funciones devuelven `{ exito: false, mensaje: "..." }` y el controlador solo muestra el `mensaje`.

---

## 5. Función de servicio requerida: sesión activa

Para respetar la regla de arquitectura (el controlador no toca `localStorage`), el dueño del servicio debe exponer:

| Función | Entrada | Salida |
|---|---|---|
| `obtenerSesionActiva()` | ninguna | `{ exito: true, sesion: { identificacion, usuario } }` o `{ exito: false, mensaje: "No hay sesión activa." }` |
| `cerrarSesionUsuario()` | ninguna | `{ exito: true, mensaje }` |

> ✅ Implementadas: el arranque del panel consulta la sesión con `obtenerSesionActiva()` y el cierre con `cerrarSesionUsuario()`.

---

## 6. HTML — estado actual y cambios requeridos en `transacciones.html`

**Ids que YA existen** (los usará el controlador):

| Elemento | id |
|---|---|
| Selector de cuenta principal | `cuenta-seleccionada` |
| Monto a consignar | `monto-consignacion` |
| Monto a retirar | `monto-retiro` |
| Cuenta de origen (transferencia) | `cuenta-origen` |
| Tipo de destino (transferencia) | `tipo-destino` |
| Producto de destino | `cuenta-destino` |
| Identificación del destinatario | `identificacion-destino` |
| Monto a transferir | `monto-transferencia` |
| Cuerpo de la tabla de movimientos | `cuerpo-movimientos` |

**Cambios que Carlos debe hacer en el HTML:**

1. Poner **`id` a cada formulario de operación**:
   - `id="formulario-consignacion"`, `id="formulario-retiro"`, `id="formulario-transferencia"`.
2. Cambiar los botones de `type="button"` a **`type="submit"`** (consignar, retirar, transferir).
3. **Agregar** un párrafo de mensaje por operación, debajo del botón:
   - `<p id="mensaje-consignacion" role="alert" aria-live="polite"></p>`
   - `<p id="mensaje-retiro" role="alert" aria-live="polite"></p>`
   - `<p id="mensaje-transferencia" role="alert" aria-live="polite"></p>`
4. Darle **`id="saldo-actual"`** al `<strong class="valor-saldo">` para poder actualizar el saldo mostrado.
5. (Recomendado) Agregar un contenedor para el nombre del cliente, ej. `<strong id="nombre-cliente"></strong>`.
6. Los **`select`** de cuentas (`cuenta-seleccionada`, `cuenta-origen`, `cuenta-destino`) los llenará el controlador: cada `<option>` debe quedar con **`value` = número de cuenta** y texto legible ("Cuenta de Ahorros" / "Cuenta Corriente").
7. Corregir la hoja de estilos: `href="estilos.css"` → **`href="../js/styles/estilos.css"`**.

---

## 7. Requerimientos funcionales — controlador `transacciones.js`

- **RF-01** Al cargar la página: obtener la sesión. Si **no hay** sesión activa → redirigir a `iniciar-sesion.html`.
- **RF-02** Traer las cuentas con `obtenerCuentas(identificacion)` y **llenar los `select`** de cuentas con esas cuentas.
- **RF-03** Mostrar el **saldo** de la cuenta seleccionada en `#saldo-actual`, y **actualizarlo** al cambiar la selección.
- **RF-04** **Consignar**: escuchar `submit`, `preventDefault()`, leer el monto de `#monto-consignacion`, llamar `consignar(identificacion, numeroCuentaSeleccionada, monto)`, mostrar el mensaje y **refrescar el saldo**.
- **RF-05** **Retirar**: igual que consignar pero con `retirar(...)` y `#monto-retiro`.
- **RF-06** **Transferir**: calcular el **número de cuenta destino** a partir del tipo de destino:
  - Si es "Otro producto propio" → destino con la identificación del **usuario en sesión**.
  - Si es "Cuenta de otro usuario" → destino con la **identificación escrita** en `#identificacion-destino`.
  - El número destino es `"AH-" + idDestino` o `"CT-" + idDestino` según el producto elegido.
  - Llamar `transferir(identificacion, numeroCuentaOrigen, numeroCuentaDestino, monto)`.
- **RF-07** Mostrar **siempre** el `mensaje` devuelto por el servicio (sea éxito o error) en el contenedor de mensajes de esa operación.
- **RF-08** **Cerrar sesión**: cerrar la sesión (función del servicio) y redirigir a `iniciar-sesion.html`.
- **RF-09** El controlador **no** valida saldos, topes ni intereses (eso es del modelo/servicio).
- **RF-10** No usar `localStorage` directamente.
- **RF-11** (Opcional) Formatear los montos con `toLocaleString("es-CO")`.

---

## 8. Historial de movimientos (implementado) y fuera de alcance

### 8.1 Historial de movimientos — implementado

El PDF del docente pide, dentro del panel, la opción **"Ver movimientos"** (requisito "Consultar Movimientos"): *registrar cada transacción almacenando fecha y hora, tipo (retiro, consignación, transferencia) y valor, y mostrar el historial ordenado por fecha descendente*.

| Capa | Elemento | Detalle |
|---|---|---|
| Modelo | `js/models/movimiento.js` | Clase `Movimiento` (Nivel 2): `fecha`, `tipo`, `valor`, `numeroCuenta`, `clienteIdentificacion`. |
| Servicio | `registrarMovimiento(...)` (privada) | Se invoca dentro de `consignar`, `retirar` y `transferir` para guardar cada movimiento. |
| Servicio | `listarMovimientos(identificacion)` | Devuelve `{ exito, mensaje, movimientos }` filtrados por cliente y ordenados por fecha descendente. |
| Controlador | `actualizarMovimientos()` | Pinta las filas del historial y lo refresca tras cada operación. |
| HTML | `<tbody id="cuerpo-movimientos">` | Cuerpo de la tabla "Movimientos recientes". |

**Reglas:**

- `tipo` usa valores internos `"consignacion"`, `"retiro"` y `"transferencia"`; el controlador los muestra como **Consignación**, **Retiro** y **Transferencia**.
- Una **transferencia** genera **dos** movimientos: uno para la cuenta de origen y otro para la de destino, así cada usuario ve el movimiento en su propio historial.
- Si el cliente no tiene movimientos, la tabla muestra "No hay movimientos registrados para mostrar.".

### 8.2 Fuera de alcance

Estas partes del panel **no** se implementan aún porque el servicio todavía no las soporta:

| Sección del panel | Motivo |
|---|---|
| Compras/abonos con Tarjeta de Crédito | Falta la función de servicio que use `TarjetaCredito.realizarCompra` (pendiente del núcleo). |
| "Perfil" (editar datos / cambiar contraseña) | No existe función de servicio para actualizar ni guardar cambios de perfil. |

> Mientras esas funciones no existan en el servicio, esas dos secciones quedan pendientes.

---

## 9. Criterios de aceptación (pruebas)

| # | Acción | Resultado esperado |
|---|---|---|
| 1 | Entrar al panel sin sesión activa | Redirige a `iniciar-sesion.html` |
| 2 | Entrar con sesión activa | Muestra nombre y las 2 cuentas en los selects |
| 3 | Cambiar la cuenta seleccionada | El saldo mostrado cambia |
| 4 | Consignar $50.000 | Muestra mensaje de éxito y el saldo sube |
| 5 | Retirar más del tope | Muestra el mensaje de error del servicio |
| 6 | Transferir a otra cuenta | Muestra éxito y el saldo de origen baja |
| 7 | Transferir a la misma cuenta | Muestra el error del servicio |
| 8 | Dejar el monto vacío o en 0 | El servicio responde error y se muestra |
| 9 | Cerrar sesión | Redirige a `iniciar-sesion.html` |
| 10 | Ver movimientos tras consignar, retirar y transferir | La tabla muestra cada operación con fecha, tipo y valor, de la más reciente a la más antigua |
| 11 | Ver movimientos sin operaciones | Muestra "No hay movimientos registrados para mostrar." |

---

## 10. Qué NO hacer (errores que se penalizan)

- No validar saldos/intereses en el controlador (duplicar lógica del modelo).
- No guardar ni leer `localStorage` directamente.
- No usar `alert()` como único medio (usar los `#mensaje-*`).
- No pasar la cuenta por su **tipo** ("Cuenta de Ahorros"): el servicio espera el **número** ("AH-123").
- No confundir el campo de la cuenta: es **`numero`**.
- No dejar el saldo de la pantalla desactualizado tras una operación.

---

## 11. Entregable

- `js/controller/transacciones.js` funcional (controlador).
- `transacciones.html` actualizado: ids de formularios, `type="submit"`, contenedores `#mensaje-*`, `#saldo-actual` y el CSS corregido.
- (Dependencia del servicio) `obtenerSesionActiva()` y `cerrarSesionUsuario()` en `servicios.js`.
- Historial de movimientos: `js/models/movimiento.js`, `listarMovimientos()` en `servicios.js` y el render en `#cuerpo-movimientos`.
