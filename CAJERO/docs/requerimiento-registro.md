# Requerimiento — Módulo de Registro de Cliente

**Proyecto:** Mi Plata Financial Bank (Cajero Web · CESDE)
**Módulo:** Registro de nuevo cliente
**Responsable de implementación:** Carlos
**Arquitectura:** JavaScript con módulos ES (`import` / `export`), servido con Live Server
**Fecha:** 2026-10-14

---

## 1. Objetivo

Permitir que una persona cree su cuenta en el banco: el cliente diligencia sus datos personales y credenciales; el sistema valida la información, verifica que la identificación y el usuario no existan, guarda al cliente, le crea sus productos bancarios (Cuenta de Ahorros, Cuenta Corriente y Tarjeta de Crédito) y confirma el registro.

## 2. Alcance (2 componentes)

| Componente | Archivo | Tipo |
|---|---|---|
| Servicio (lógica de negocio) | `js/service/servicios.js` | función `registrarCliente(...)` — **YA EXISTE** |
| Controlador (interfaz) | `js/controller/registro.js` | captura eventos del formulario |

> El servicio `registrarCliente` **ya está implementado y probado**. Carlos solo debe consumirlo según el contrato de la sección 4 y construir el controlador.

## 3. Regla de arquitectura (obligatoria)

El **controlador** no debe contener lógica de negocio ni tocar `localStorage`.
Su único trabajo: **capturar evento → leer inputs → llamar al servicio → manejar la respuesta**.
Cada página carga **un solo** `<script type="module">`.

## 4. Contrato del servicio `registrarCliente(...)`

- **Entrada (en este orden exacto):** `identificacion`, `nombre`, `celular`, `correo`, `usuario`, `contrasena`, `confirmarContrasena`.
- **Salida:** SIEMPRE un objeto `{ exito: boolean, mensaje: string }`. Nunca un string ni `undefined`.

| Caso | Respuesta |
|---|---|
| Algún campo vacío | `{ exito: false, mensaje: "No pueden quedar campos vacios." }` |
| Contraseñas distintas | `{ exito: false, mensaje: "Las contraseñas no coinciden." }` |
| Identificación **o** usuario ya registrados | `{ exito: false, mensaje: "La identificacion o el usuario ya estan registrados." }` |
| Registro correcto | `{ exito: true, mensaje: "Cliente registrado con exito" }` |

## 5. Reglas internas del servicio (ya implementadas — solo referencia)

1. Validar que ningún campo esté vacío.
2. Validar que `contrasena === confirmarContrasena`.
3. Verificar que la identificación y el usuario **no** existan ya.
4. Crear:
   - `Cliente` (identificación, nombre, celular, correo, usuario y contraseña) con estado `"activo"`.
   - `CuentaAhorros` con número `"AH-" + identificacion` y saldo **0**.
   - `CuentaCorriente` con número `"CT-" + identificacion` y saldo **0**.
   - `TarjetaCredito` con número `"TC-" + identificacion` y cupo **$2.000.000**.
5. Guardar usuario, cuentas y tarjeta en la persistencia.

## 6. HTML — estado actual y cambios requeridos en `registro.html`

**Ids existentes** (leer por su `id`):
| Campo | id |
|---|---|
| Número de identificación | `identificacion` |
| Nombre completo | `nombre-completo` |
| Número de celular | `celular` |
| Correo electrónico | `correo` |
| Nombre de usuario | `nuevo-usuario` |
| Contraseña | `nueva-contrasena` |
| Confirmar contraseña | `confirmar-contrasena` |

**Cambios que Carlos debe hacer en el HTML:**
1. Cambiar el botón "Completar registro" de `type="button"` a **`type="submit"`** (para permitir la tecla Enter).
2. **Agregar** un contenedor de mensajes debajo del botón:
   `<p id="mensaje-registro" role="alert" aria-live="polite"></p>`
3. Cargar el controlador antes de `</body>` (ya colocado):
   `<script type="module" src="../js/controller/registro.js"></script>`
4. (Recomendado) Darle un `id` al formulario (ej. `id="formulario-registro"`) para seleccionarlo con seguridad.
5. (Opcional) Estilos: rojo para error, verde para éxito.

## 7. Requerimientos funcionales — controlador `registro.js`

- **RF-01** Escuchar el evento `submit` del formulario y ejecutar `preventDefault()`.
- **RF-02** Leer los 7 campos por su `id` y aplicarles `.trim()`.
- **RF-03** Validar **campos vacíos** localmente antes de llamar al servicio (mensaje: "Debes completar todos los campos.").
- **RF-04** Validar localmente que **las contraseñas coincidan** (mensaje: "Las contraseñas no coinciden.").
- **RF-05** Llamar a `registrarCliente(identificacion, nombre, celular, correo, usuario, contrasena, confirmarContrasena)` **en ese orden**.
- **RF-06** Si `exito === false`: mostrar el `mensaje` en `#mensaje-registro` con estilo de error.
- **RF-07** Si `exito === true`: mostrar el mensaje de éxito, **limpiar el formulario** y redirigir a `iniciar-sesion.html`.
- **RF-08** El controlador **no** valida duplicados ni crea cuentas (eso es del servicio).
- **RF-09** No usar `localStorage` directamente.

## 8. Criterios de aceptación (pruebas)

| # | Acción | Resultado esperado |
|---|---|---|
| 1 | Completar todo correctamente y enviar | Muestra éxito y redirige a `iniciar-sesion.html` |
| 2 | Dejar un campo vacío | Mensaje local; **no** llama al servicio |
| 3 | Contraseñas distintas | "Las contraseñas no coinciden." |
| 4 | Identificación ya registrada | "La identificacion o el usuario ya estan registrados." |
| 5 | Usuario ya registrado | "La identificacion o el usuario ya estan registrados." |
| 6 | Registro correcto | Se crean 1 usuario + 2 cuentas (saldo 0) + 1 tarjeta |
| 7 | Presionar Enter en un input | Dispara el registro (por `type="submit"`) |
| 8 | Tras un error | El mensaje aparece en `#mensaje-registro` |

## 9. Qué NO hacer (errores que se penalizan)

- No usar `alert()` como única forma de feedback (usar `#mensaje-registro`).
- No guardar nada en `localStorage` desde `registro.js`.
- No duplicar en el controlador la verificación de identificación/usuario.
- No pasar los argumentos en otro orden (el servicio los recibe posicionalmente).
- No dejar el formulario con datos tras un registro exitoso.

## 10. Entregable

- `js/controller/registro.js` funcional (controlador).
- `registro.html` actualizado: `type="submit"`, `#mensaje-registro` y el `<script type="module">`.
