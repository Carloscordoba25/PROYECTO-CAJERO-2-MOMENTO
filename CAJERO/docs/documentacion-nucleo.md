# Documentación — Núcleo del sistema (Modelos, Persistencia y Servicio)

**Proyecto:** Mi Plata Financial Bank (Cajero Web · CESDE)
**Responsable:** Leonardo Pinto
**Descripción:** Documentación de la capa de datos y de lógica del cajero: las **clases (modelos)**, la **persistencia** (localStorage) y el **servicio** que conecta ambos con los controladores.
**Estado:** ✅ Implementado y probado con pruebas automatizadas.

---

## 1. Visión general de las capas

```
HTML  →  Controller (interfaz)  →  Service (servicios.js)  →  Modelos (clases)
                                        |
                                        └──> Persistencia (config/persistencia.js → localStorage)
```

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Modelos | `js/models/` | Las reglas y datos de cada concepto (Cliente, Cuenta, Tarjeta). |
| Persistencia | `js/config/persistencia.js` | Leer y escribir en `localStorage`. No contiene lógica de negocio. |
| Servicio | `js/service/servicios.js` | Une persistencia + modelos; expone operaciones al controlador. |
| Controlador | `js/controller/` | Solo conecta el HTML con el servicio (no toca datos). |

**Regla de arquitectura:** un controlador **nunca** entra a `localStorage`; siempre pasa por el servicio.

---

## 1. Modelos (`js/models/`)

Todos usan **encapsulamiento Nivel 2**: campos privados reales (`#campo`) y acceso solo por
`get`/`set`. Cada clase vive en su propio archivo.

### 1.1 `Cliente` (`cliente.js`)

**Campos privados:** `#identificacion`, `#nombre`, `#celular`, `#correo`, `#usuario`, `#contrasena`, `#estado`.

**Constructor:**
`new Cliente(identificacion, nombre, celular, correo, usuario, contrasena, estado = "activo")`

- `estado` es opcional: si no se pasa, nace **"activo"**.

**Getters/Setters:**

| Campo | Lectura | Escritura |
|---|---|---|
| `identificacion` | get | — (fijo) |
| `usuario` | get | — (fijo) |
| `estado` | get | — (solo vía métodos) |
| `nombre`, `celular`, `correo`, `contrasena` | get | set (editables) |

**Métodos:** `bloquear()` → "bloqueado"; `desbloquear()` → "activo"; `estaBloqueado()` → booleano.

### 1.2 `Cuenta` (`cuenta.js`) — clase base

**Campos privados:** `#tipo`, `#numero`, `#saldo`, `#clienteIdentificacion`.

**Constructor:** `new Cuenta(tipo, numero, saldo, clienteIdentificacion)`
> Normalmente se usan las hijas; a la base se llega por herencia.

**Getters/Setters:** `tipo`, `numero`, `clienteIdentificacion` (get) y `saldo` (get + set).

**Métodos:**

| Método | Qué hace | Respuesta |
|---|---|---|
| `consultarSaldo()` | devuelve el saldo | número |
| `consignar(monto)` | suma al saldo | `{ exito, mensaje, monto, saldoNuevo }` |
| `retirar(monto)` | valida monto > 0 y tope; aplica reglas; resta | `{ exito, mensaje, saldoAnterior, monto, interesAplicado, saldoNuevo }` |
| `calcularMontoMaximoRetiro()` | tope de retiro (lo redefine cada hija) | número |
| `aplicarReglasPrevioRetiro()` | gancho polimórfico (lo redefine cada hija) | `{ interesAplicado }` |
| `transferirSalida(monto)` | reutiliza `retirar` | igual que `retirar` |
| `transferirEntrada(monto)` | suma un abono recibido | `{ exito, mensaje, monto, saldoNuevo }` |

### 1.3 `CuentaAhorros` (`cuenta-ahorros.js`) — hija

- `tipo` = **"ahorros"**.
- Constante: `TASA_INTERES_MENSUAL = 0.015` (1.5%).
- `calcularMontoMaximoRetiro()` = `saldo * 1.015`.
- `aplicarReglasPrevioRetiro()`: **suma el interés** al saldo antes de retirar.

### 1.4 `CuentaCorriente` (`cuenta-corriente.js`) — hija

- `tipo` = **"corriente"**.
- Constante: `PORCENTAJE_SOBREGIRO = 0.20` (permite un sobregiro del **20%**).
- `calcularMontoMaximoRetiro()` = `saldo * 1.20` (permite sobregiro).
- No aplica intereses.

### 1.5 `TarjetaCredito` (`tarjeta-credito.js`)

**Campos privados:** `#numero`, `#cupo`, `#deuda`, `#clienteIdentificacion`.

**Constructor:** `new TarjetaCredito(numero, cupo, clienteIdentificacion)` → la deuda nace en **0**.

**Getters/Setters:** `numero`, `cupo`, `clienteIdentificacion` (get); `deuda` (get + set, el set existe para restaurar la deuda al reconstruir desde la persistencia).

**Constantes de tasa por cuotas:**

| Cuotas | Tasa |
|---|---|
| `<= 2` | `0` |
| `3 a 6` | `0.019` |
| `>= 7` | `0.023` |

**Métodos:** `cupoDisponible()` = cupo − deuda; `calcularTasa(cuotas)`; `calcularCuotaMensual(capital, cuotas)`; `realizarCompra(capital, cuotas)` → valida capital, cuotas enteras ≥ 1 y cupo, suma a la deuda y responde `{ exito, mensaje, capital, cuotas, tasa, cuotaMensual, deudaNueva }`.

---

## 2. Persistencia (`js/config/persistencia.js`)

Envuelve `localStorage` con funciones madres y funciones específicas. Todo se guarda como **texto JSON**.

### 2.1 Funciones madre

| Función | Qué hace |
|---|---|
| `leerDatos(clave, valorPorDefecto = [])` | lee y hace `JSON.parse`; si no existe, devuelve el valor por defecto |
| `guardarDatos(clave, datos)` | hace `JSON.stringify` y guarda |

### 2.2 Funciones específicas y sus claves de almacenamiento

| Función | Clave en localStorage | Valor por defecto |
|---|---|---|
| `leerUsuarios()` / `guardarUsuarios(lista)` | `usuarios` | `[]` |
| `leerCuentas()` / `guardarCuentas(lista)` | `cuentas` | `[]` |
| `leerTarjetas()` / `guardarTarjetas(lista)` | `tarjetas` | `[]` |
| `leerMovimientos()` / `guardarMovimientos(lista)` | `movimientos` | `[]` |
| `leerIntentos(usuario)` | `intentos_<usuario>` | `0` |
| `aumentarIntentos(usuario)` | `intentos_<usuario>` | incrementa y devuelve el total |
| `reiniciarIntentos(usuario)` | `intentos_<usuario>` | pone en `0` |
| `guardarSesion(datos)` | `sesion` | — |
| `leerSesion()` | `sesion` | `null` |
| `cerrarSesion()` | `sesion` | elimina la clave |

### 2.3 Forma de los datos guardados (objetos planos)

```js
usuario     : { identificacion, nombre, celular, correo, usuario, contrasena, estado }
cuenta      : { tipo, numero, saldo, clienteIdentificacion }
tarjeta     : { numero, cupo, deuda, clienteIdentificacion }
sesion      : { identificacion, usuario }
movimiento  : (por definir)
```

> Claves de relación: **`clienteIdentificacion`** une cuentas y tarjetas con su dueño.
> Identificador de cuenta: el campo es **`numero`** (ej. `"AH-123"`, `"CT-123"`).

---

## 3. Servicio (`js/service/servicios.js`)

Es la capa que consumen los controladores. Importa la persistencia y los modelos, y **siempre**
devuelve un objeto `{ exito, mensaje, ... }` (nunca un string ni `undefined`).

### 3.1 Funciones exportadas

| Función | Entrada | Éxito devuelve |
|---|---|---|
| `registrarCliente` | `identificacion, nombre, celular, correo, usuario, contrasena, confirmarContrasena` | `{ exito: true, mensaje }` |
| `iniciarSesion` | `usuario, contrasena` | `{ exito: true, mensaje }` y guarda la sesión |
| `consultarCliente` | `identificacion` | `{ exito: true, mensaje, datos }` (sin contraseña) |
| `obtenerCuentas` | `identificacion` | `{ exito: true, mensaje, cuentas }` |
| `obtenerTarjetas` | `identificacion` | `{ exito: true, mensaje, tarjetas }` |
| `consignar` | `identificacion, numeroCuenta, monto` | `{ exito: true, mensaje, saldo }` |
| `retirar` | `identificacion, numeroCuenta, monto` | `{ exito: true, mensaje, saldo }` |
| `transferir` | `identificacionOrigen, numeroCuentaOrigen, numeroCuentaDestino, monto` | `{ exito: true, mensaje, monto }` |

### 3.2 Reglas internas destacadas

- **`registrarCliente`**: valida campos vacíos y que las contraseñas coincidan; verifica que la
  identificación o el usuario **no** existan; crea el `Cliente` y **3 productos**:
  - `CuentaAhorros` → `"AH-" + identificacion`, saldo **0**
  - `CuentaCorriente` → `"CT-" + identificacion`, saldo **0**
  - `TarjetaCredito` → `"TC-" + identificacion`, cupo **2.000.000**
- **`iniciarSesion`**: busca por `usuario`; si está bloqueado rechaza; si falla la clave cuenta
  intentos y al **3.º** bloquea al cliente; si acierta reinicia intentos y guarda la sesión.
- **`consignar` / `retirar`**: buscan la cuenta por `identificacion` **y** `numero`, reconstruyen la
  instancia con `cuentaDesdeDatos`, delegan en el modelo (`.consignar` / `.retirar`), y si fue bien
  **reemplazan** la cuenta en la lista (`findIndex` + asignación) y guardan. Nunca usan `push`.
- **`transferir`**: lee la lista **una sola vez**, retira **primero** (`transferirSalida`) y solo si
  funciona consigna (`transferirEntrada`); valida que origen y destino existan y sean distintos;
  guarda los dos cambios juntos. Este orden evita "crear dinero" si algo falla.

### 3.3 Traductores (instancia ↔ objeto plano)

El servicio convierte entre instancias de clase y lo que se guarda en `localStorage`:

| Dirección | Funciones |
|---|---|
| Instancia → plano | `clienteADatos`, `cuentaADatos`, `tarjetaADatos` |
| Plano → instancia | `clienteDesdeDatos`, `cuentaDesdeDatos`, `tarjetaDesdeDatos` |

`cuentaDesdeDatos` es **polimórfica**: crea `CuentaAhorros` o `CuentaCorriente` según `tipo`.

> **Cuidado:** `clienteADatos` **incluye la contraseña** (se necesita para persistir). Por eso
> funciones de consulta como `consultarCliente` **no** deben reutilizarlo; construyen su propia
> respuesta pública sin `contrasena`.

---

## 4. Estado y pruebas

El núcleo está **implementado y probado** con un entorno que simula `localStorage` en Node:

| Bloque | Resultado |
|---|---|
| Persistencia (leer/guardar de todas las claves) | ✔ pasa |
| `registrarCliente` + `iniciarSesion` | ✔ pasa |
| `consultarCliente`, `obtenerCuentas`, `obtenerTarjetas` | ✔ pasa |
| `consignar`, `retirar`, `transferir` (incluye errores y atomicidad) | ✔ pasa |
| Validación integral del servicio | ✔ todas las pruebas pasan |

---

## 5. Pendientes del núcleo

| Pendiente | Detalle |
|---|---|
| Función de sesión para controladores | Exponer `obtenerSesionActiva()` y `cerrarSesionUsuario()` para que los controladores no toquen `localStorage`. |
| **Movimientos** | Falta el modelo `Movimiento` y las funciones de servicio para **registrar** un movimiento en cada operación y **listarlos**. La persistencia ya tiene `leerMovimientos`/`guardarMovimientos`, pero sin uso. |
| Funciones de tarjeta | Faltan funciones de servicio para compras/abonos de tarjeta usando `TarjetaCredito.realizarCompra`. |
| Perfil | Falta función de servicio para actualizar datos del cliente y cambiar contraseña. |
