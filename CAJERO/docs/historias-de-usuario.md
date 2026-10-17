# Historias de usuario — Mi Plata Financial Bank

**Proyecto:** Mi Plata Financial Bank (Cajero Web · CESDE)
**Equipo:** Carlos Alberto Córdoba · Andrés Felipe Duque · Leonardo Oscary Pinto
**Docente:** Jorge Albeiro Muriel Vélez
**Fecha:** 2026-10-17
**Versión:** 1.0

> Documento complementario a `requerimiento-registro.md`, `requerimiento-login.md`,
> `requerimiento-transacciones.md` y `documentacion-nucleo.md`. Aquí se describe **qué necesita el
> usuario** (historias), no **cómo se programa**.

---

## 1. Cómo leer este documento

### 1.1 Formato de cada historia

> **Como** `<rol>`, **quiero** `<acción>`, **para** `<beneficio>`.

Cada historia incluye:

| Campo | Significado |
|---|---|
| **ID** | Identificador único (`HU-01`, `HU-02`, …) |
| **Prioridad** | Alta / Media / Baja |
| **Estimación** | Puntos de historia (1, 2, 3, 5, 8) |
| **Estado** | ✅ Implementada · ⏳ Pendiente |
| **Criterios de aceptación** | Cuándo se considera terminada (formato *Dado – Cuando – Entonces*) |
| **Reglas de negocio** | Restricciones que impone el sistema |

### 1.2 Roles

| Rol | Quién es |
|---|---|
| **Visitante** | Persona sin cuenta que puede registrarse o iniciar sesión. |
| **Cliente** | Usuario registrado y autenticado que opera su dinero en el panel. |
| **Administrador** | Encargado de gestionar usuarios (funcionalidad futura). |
| **Sistema** | Reglas automáticas (redirecciones, bloqueos, validaciones). |

### 1.3 Prioridad y estimación

- **Prioridad:** Alta = imprescindible para el producto mínimo; Media = importante; Baja = deseable.
- **Estimación (Fibonacci):** 1 = trivial, 2 = simple, 3 = normal, 5 = compleja, 8 = muy compleja.

---

## 2. Resumen de historias

| ID | Historia | Rol | Épica | Prioridad | Puntos | Estado |
|---|---|---|---|---|---|---|
| HU-01 | Registrarse como cliente | Visitante | Usuarios | Alta | 5 | ✅ |
| HU-02 | Iniciar sesión | Cliente | Usuarios | Alta | 5 | ✅ |
| HU-03 | Bloques tras 3 intentos fallidos | Sistema | Usuarios | Alta | 5 | ✅ |
| HU-04 | Cerrar sesión | Cliente | Usuarios | Alta | 2 | ✅ |
| HU-05 | Proteger el panel sin sesión | Sistema | Usuarios | Alta | 2 | ✅ |
| HU-06 | Administrar usuarios (CRUD) | Administrador | Usuarios | Media | 8 | ⏳ |
| HU-07 | Consultar saldo | Cliente | Transacciones | Alta | 3 | ✅ |
| HU-08 | Consignar dinero | Cliente | Transacciones | Alta | 3 | ✅ |
| HU-09 | Retirar dinero | Cliente | Transacciones | Alta | 5 | ✅ |
| HU-10 | Transferir dinero | Cliente | Transacciones | Alta | 8 | ✅ |
| HU-11 | Ver movimientos | Cliente | Historial | Alta | 5 | ✅ |
| HU-12 | Ver y editar perfil | Cliente | Perfil | Media | 5 | ⏳ |
| HU-13 | Comprar/abonar con tarjeta de crédito | Cliente | Tarjeta | Baja | 8 | ⏳ |

> **Avance:** 8 de 13 historias implementadas (el núcleo del cajero está completo).

---

## 3. Épica 1 — Usuarios y autenticación

### HU-01 — Registrarse como cliente

- **Como** visitante, **quiero** crear mi cuenta con mis datos personales y credenciales, **para** poder usar los servicios del banco.
- **Prioridad:** Alta · **Estimación:** 5 · **Estado:** ✅ Implementada

**Criterios de aceptación**

1. **Dado** que completo identificación, nombre, celular, correo, usuario, contraseña y confirmación, **cuando** envío el formulario, **entonces** veo el mensaje de éxito y soy redirigido a `iniciar-sesion.html`.
2. **Dado** que dejo un campo vacío, **cuando** envío, **entonces** se muestra "Debes completar todos los campos." y **no** se llama al servicio.
3. **Dado** que las contraseñas no coinciden, **cuando** envío, **entonces** se muestra "Las contraseñas no coinciden.".
4. **Dado** que la identificación o el usuario ya existen, **cuando** envío, **entonces** se muestra "La identificacion o el usuario ya estan registrados.".
5. **Dado** un registro exitoso, **cuando** se guarda, **entonces** se crean: 1 usuario + Cuenta de Ahorros + Cuenta Corriente (saldo 0) + Tarjeta de Crédito (cupo $2.000.000), y el formulario queda limpio.

**Reglas de negocio**

- El usuario inicia con estado `"activo"` e intentos en 0.
- Los números de producto se derivan de la identificación: `AH-<id>`, `CT-<id>`, `TC-<id>`.
- El registro se puede enviar también con la tecla **Enter**.

---

### HU-02 — Iniciar sesión

- **Como** cliente registrado, **quiero** entrar con mi usuario y contraseña, **para** acceder a mi panel de transacciones.
- **Prioridad:** Alta · **Estimación:** 5 · **Estado:** ✅ Implementada

**Criterios de aceptación**

1. **Dado** un usuario y contraseña correctos, **cuando** envío, **entonces** se guarda la sesión y soy redirigido a `transacciones.html`.
2. **Dado** que dejo usuario o contraseña vacíos, **cuando** envío, **entonces** se muestra "Debes completar usuario y contraseña." y **no** se llama al servicio.
3. **Dado** un usuario que no existe, **cuando** envío, **entonces** se muestra "Usuario no encontrado.".
4. **Dado** una contraseña incorrecta, **cuando** envío, **entonces** se muestra "Contraseña incorrecta. Intento X de 3." y el campo contraseña se limpia.
5. **Dado** que ya tengo sesión activa, **cuando** abro `iniciar-sesion.html`, **entonces** soy redirigido al panel.

**Reglas de negocio**

- El sistema guarda la sesión como `{ identificacion, usuario }`.
- La contraseña **nunca** se muestra de nuevo tras un error.

---

### HU-03 — Bloquear tras 3 intentos fallidos

- **Como** sistema, **quiero** bloquear temporalmente la cuenta tras 3 contraseñas incorrectas, **para** proteger el dinero del cliente.
- **Prioridad:** Alta · **Estimación:** 5 · **Estado:** ✅ Implementada

**Criterios de aceptación**

1. **Dado** 2 intentos fallidos previos, **cuando** fallo la contraseña por 3.ª vez, **entonces** la cuenta queda bloqueada y veo "Cuenta bloqueada por 3 intentos fallidos.".
2. **Dado** que estoy bloqueado, **cuando** intento entrar, **entonces** veo "Cuenta bloqueada. Intenta de nuevo en X min." **sin** validarse la contraseña.
3. **Dado** que pasaron 5 minutos del bloqueo, **cuando** intento entrar con la contraseña correcta, **entonces** el bloqueo se levanta solo y entro al panel.
4. **Dado** un auto-desbloqueo, **entonces** el contador de intentos vuelve a 0.

**Reglas de negocio**

- Duración del bloqueo: `MINUTOS_BLOQUEO = 5` (configurable en la clase `Cliente`).
- Al bloquear se guarda `fechaBloqueo` (ISO) para calcular el tiempo restante.

---

### HU-04 — Cerrar sesión

- **Como** cliente, **quiero** cerrar sesión, **para** dejar de estar autenticado en el equipo.
- **Prioridad:** Alta · **Estimación:** 2 · **Estado:** ✅ Implementada

**Criterios de aceptación**

1. **Dado** que estoy en el panel, **cuando** pulso `Cerrar sesión`, **entonces** la sesión se elimina y soy redirigido a `index.html`.
2. **Dado** que cerré sesión, **cuando** vuelvo al panel, **entonces** se me exige iniciar sesión de nuevo.

---

### HU-05 — Proteger el panel sin sesión

- **Como** sistema, **quiero** exigir una sesión activa para entrar al panel, **para** que nadie vea datos ajenos.
- **Prioridad:** Alta · **Estimación:** 2 · **Estado:** ✅ Implementada

**Criterios de aceptación**

1. **Dado** que no tengo sesión, **cuando** abro `transacciones.html`, **entonces** soy redirigido a `iniciar-sesion.html`.
2. **Dado** que tengo sesión, **cuando** abro el panel, **entonces** veo mi nombre y mis productos.

---

### HU-06 — Administrar usuarios (CRUD)

- **Como** administrador, **quiero** crear, consultar, editar y eliminar usuarios, **para** gestionar los clientes del banco.
- **Prioridad:** Media · **Estimación:** 8 · **Estado:** ⏳ Pendiente

**Criterios de aceptación** *(a definir)*

1. **Dado** un administrador autenticado, **cuando** lista usuarios, **entonces** ve los clientes registrados.
2. **Dado** un cliente, **cuando** edito sus datos, **entonces** los cambios se guardan.
3. **Dado** un cliente, **cuando** lo elimino, **entonces** se confirma antes de borrarlo.

> Depende de nuevas funciones de servicio (editar/eliminar) que aún no existen.

---

## 4. Épica 2 — Transacciones del panel

> Regla general: toda operación devuelve `{ exito, mensaje, ... }` y, si es exitosa, **registra su movimiento**.

### HU-07 — Consultar saldo

- **Como** cliente, **quiero** consultar el saldo de mis cuentas, **para** saber cuánto dinero tengo disponible.
- **Prioridad:** Alta · **Estimación:** 3 · **Estado:** ✅ Implementada

**Criterios de aceptación**

1. **Dado** que entro al panel, **entonces** veo mis cuentas (Ahorros y Corriente) en la lista de selección.
2. **Dado** que selecciono una cuenta, **entonces** se muestra su saldo actual.
3. **Dado** que hago una operación, **entonces** el saldo mostrado se actualiza automáticamente.

---

### HU-08 — Consignar dinero

- **Como** cliente, **quiero** consignar dinero en una cuenta, **para** aumentar mi saldo.
- **Prioridad:** Alta · **Estimación:** 3 · **Estado:** ✅ Implementada

**Criterios de aceptación**

1. **Dado** un monto válido (número positivo mayor a cero), **cuando** consigno, **entonces** el saldo aumenta y veo el mensaje de éxito.
2. **Dado** un monto vacío, cero o negativo, **cuando** consigno, **entonces** se muestra un error y el saldo no cambia.
3. **Dado** una consignación exitosa, **entonces** se registra un movimiento de tipo **consignación**.

---

### HU-09 — Retirar dinero

- **Como** cliente, **quiero** retirar dinero de una cuenta, **para** disponer de mi efectivo.
- **Prioridad:** Alta · **Estimación:** 5 · **Estado:** ✅ Implementada

**Criterios de aceptación**

1. **Dado** un monto válido y con saldo suficiente, **cuando** retiro, **entonces** el saldo disminuye y veo el mensaje de éxito.
2. **Dado** un monto mayor al permitido, **cuando** retiro, **entonces** se muestra un error y el saldo no cambia.
3. **Dado** un retiro exitoso, **entonces** se registra un movimiento de tipo **retiro**.

**Reglas de negocio**

- **Cuenta de Ahorros:** antes de retirar se aplica un **interés del 1,5 %**; el tope es `saldo × 1,015`.
- **Cuenta Corriente:** permite **sobregiro del 20 %**; el tope es `saldo × 1,20`.

---

### HU-10 — Transferir dinero

- **Como** cliente, **quiero** transferir dinero a otra de mis cuentas o a otro cliente, **para** mover mi dinero.
- **Prioridad:** Alta · **Estimación:** 8 · **Estado:** ✅ Implementada

**Criterios de aceptación**

1. **Dado** un monto válido y una cuenta destino distinta, **cuando** transfiero, **entonces** el origen baja y el destino sube por el mismo valor.
2. **Dado** que elijo la **misma** cuenta como origen y destino, **cuando** transfiero, **entonces** se muestra un error.
3. **Dado** una cuenta destino inexistente, **cuando** transfiero, **entonces** se muestra un error y no se mueve dinero.
4. **Dado** una transferencia exitosa, **entonces** se registran **dos** movimientos: uno de salida (origen) y otro de entrada (destino).

**Reglas de negocio**

- La operación es **atómica**: primero se retira del origen y **solo si funciona** se abona al destino (evita "crear dinero" si algo falla).
- Se permiten transferencias entre cuentas propias y hacia cuentas de otros clientes.

---

## 5. Épica 3 — Historial

### HU-11 — Ver movimientos

- **Como** cliente, **quiero** ver el historial de mis movimientos, **para** hacer seguimiento a mis operaciones.
- **Prioridad:** Alta · **Estimación:** 5 · **Estado:** ✅ Implementada

**Criterios de aceptación**

1. **Dado** que hice operaciones, **cuando** entro a "Ver movimientos", **entonces** veo cada movimiento con **fecha y hora**, **tipo** y **valor**.
2. **Dado** varios movimientos, **entonces** se muestran **del más reciente al más antiguo**.
3. **Dado** que hay varios clientes, **entonces** solo veo **mis** movimientos.
4. **Dado** que no tengo movimientos, **entonces** veo "No hay movimientos registrados para mostrar.".
5. **Dado** que hago una nueva operación, **entonces** el historial se actualiza.

**Reglas de negocio**

- Tipos posibles: **Consignación**, **Retiro** y **Transferencia**.
- Una transferencia genera un movimiento para cada cuenta involucrada.

---

## 6. Épica 4 — Perfil (pendiente)

### HU-12 — Ver y editar perfil

- **Como** cliente, **quiero** ver y actualizar mis datos y cambiar mi contraseña, **para** mantener mi información al día.
- **Prioridad:** Media · **Estimación:** 5 · **Estado:** ⏳ Pendiente

**Criterios de aceptación** *(a definir)*

1. **Dado** que abro mi perfil, **entonces** veo mis datos actuales.
2. **Dado** que edito mis datos, **cuando** guardo, **entonces** los cambios quedan almacenados.
3. **Dado** que cambio mi contraseña, **entonces** se valida y se guarda la nueva.

> Depende de una función de servicio para actualizar el cliente (pendiente del núcleo).

---

## 7. Épica 5 — Tarjeta de crédito (pendiente)

### HU-13 — Comprar y abonar con tarjeta de crédito

- **Como** cliente, **quiero** usar mi tarjeta de crédito para compras a cuotas y abonos, **para** financiar mis compras.
- **Prioridad:** Baja · **Estimación:** 8 · **Estado:** ⏳ Pendiente

**Criterios de aceptación** *(a definir)*

1. **Dado** un cupo disponible, **cuando** realizo una compra, **entonces** la deuda aumenta y el cupo disponible baja.
2. **Dado** que elijo cuotas, **entonces** se calcula la tasa y la cuota mensual.
3. **Dado** un abono, **entonces** la deuda disminuye.

**Reglas de negocio**

- Cupo inicial: **$2.000.000**.
- Tasas por cuotas: hasta 2 cuotas → **0 %**; de 3 a 6 → **1,9 %**; 7 o más → **2,3 %**.

---

## 8. Definición de terminado (Definition of Done)

Una historia se considera **terminada** cuando:

- [ ] Cumple **todos** los criterios de aceptación.
- [ ] El controlador **no** usa `localStorage` ni contiene lógica de negocio.
- [ ] El servicio devuelve `{ exito, mensaje, ... }` y los datos quedan persistidos.
- [ ] Se probó en el navegador (mensajes correctos y sin errores en consola).
- [ ] El mensaje de éxito/error se muestra en el contenedor `#mensaje-*` (no solo con `alert`).

---

## 9. Trazabilidad (historia ↔ documento)

| Historias | Documento de referencia |
|---|---|
| HU-01 | `requerimiento-registro.md` |
| HU-02, HU-03, HU-04, HU-05 | `requerimiento-login.md` y `requerimiento-transacciones.md` |
| HU-07 a HU-11 | `requerimiento-transacciones.md` |
| HU-01…HU-13 (base técnica) | `documentacion-nucleo.md` |
| HU-06, HU-12, HU-13 | PDF del docente (fuera del alcance actual del equipo) |

---

## 10. Priorización (MoSCoW)

| Nivel | Historias |
|---|---|
| **Must have** | HU-01, HU-02, HU-03, HU-04, HU-05, HU-07, HU-08, HU-09, HU-10, HU-11 |
| **Should have** | HU-12 |
| **Could have** | HU-06, HU-13 |
| **Won't have (por ahora)** | — |
