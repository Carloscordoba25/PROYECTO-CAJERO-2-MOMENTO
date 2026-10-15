# Requerimiento â€” MÃ³dulo de Inicio de SesiÃ³n

**Proyecto:** Mi Plata Financial Bank (Cajero Web Â· CESDE)
**MÃ³dulo:** AutenticaciÃ³n / Login
**Responsable de implementaciÃ³n:** AndrÃ©s
**Arquitectura:** JavaScript con mÃ³dulos ES (`import` / `export`), servido con Live Server
**Fecha:** 2026-10-14

---

## 1. Objetivo

Implementar el inicio de sesiÃ³n: el cliente escribe **usuario** y **contraseÃ±a**; el sistema valida contra los datos guardados, aplica la regla de **bloqueo automÃ¡tico tras 3 intentos fallidos**, crea la sesiÃ³n y redirige al panel de transacciones.

## 2. Alcance (2 componentes)

| Componente | Archivo | Tipo |
|---|---|---|
| Servicio (lÃ³gica de negocio) | `js/service/servicios.js` | funciÃ³n `iniciarSesion(usuario, contrasena)` |
| Controlador (interfaz) | `js/controller/login.js` | captura eventos del formulario |

> Si el servicio ya existe, respetar su contrato (secciÃ³n 4).
> Si no existe, AndrÃ©s debe implementarlo con las reglas de la secciÃ³n 5.

## 3. Regla de arquitectura (obligatoria)

El **controlador** no debe contener lÃ³gica de negocio ni tocar `localStorage`.
Su Ãºnico trabajo: **capturar evento â†’ leer inputs â†’ llamar al servicio â†’ manejar la respuesta**.
Cada pÃ¡gina carga **un solo** `<script type="module">`.

## 4. Contrato del servicio `iniciarSesion(usuario, contrasena)`

- **Entrada:** `usuario` (string), `contrasena` (string).
- **Salida:** SIEMPRE un objeto `{ exito: boolean, mensaje: string, ... }`. Nunca un string ni `undefined`.

| Caso | Respuesta |
|---|---|
| Usuario no existe | `{ exito: false, mensaje: "Usuario no encontrado." }` |
| Cuenta bloqueada | `{ exito: false, mensaje: "Cuenta bloqueada por 3 intentos fallidos." }` |
| ContraseÃ±a incorrecta (intento < 3) | `{ exito: false, mensaje: "ContraseÃ±a incorrecta. Intento N de 3." }` |
| Tercer intento fallido | Bloquea la cuenta y responde `{ exito: false, mensaje: "Cuenta bloqueada por 3 intentos fallidos." }` |
| Credenciales correctas | Reinicia intentos, guarda sesiÃ³n y responde `{ exito: true, mensaje: "Bienvenido, <nombre>." }` |

## 5. Reglas internas del servicio (si AndrÃ©s lo implementa)

1. Buscar el cliente por `usuario` entre los usuarios guardados (`leerUsuarios`).
2. Reconstruir la instancia `Cliente` a partir del dato plano.
3. Si el cliente `estaBloqueado()` â†’ rechazar de inmediato.
4. Comparar la contraseÃ±a.
5. Por cada fallo: aumentar el contador de intentos del usuario.
6. Al llegar a **3** fallos: marcar al cliente como bloqueado (`bloquear()`) y guardar.
7. Si acierta: reiniciar el contador de intentos y guardar la sesiÃ³n (`{ identificacion, usuario }`).

> Existen ya funciones de persistencia para esto: `leerUsuarios`, `guardarUsuarios`, `leerIntentos`, `aumentarIntentos`, `reiniciarIntentos`, `guardarSesion`.

## 6. HTML â€” estado actual y cambios requeridos

**Existe hoy** en `iniciar-sesion.html`:
- Input usuario: `id="usuario"` (type text)
- Input contraseÃ±a: `id="contrasena"` (type password)
- BotÃ³n: "Ingresar al cajero" con `type="button"` (sin id)

**Cambios que AndrÃ©s debe hacer en el HTML:**
1. Cambiar el botÃ³n de `type="button"` a **`type="submit"`** (para permitir la tecla Enter).
2. **Agregar** un contenedor de mensajes debajo del botÃ³n:
   `<p id="mensaje-login" role="alert" aria-live="polite"></p>`
3. Cargar el controlador antes de `</body>` (ya colocado):
   `<script type="module" src="../js/controller/login.js"></script>` (ya colocado)
4. (Opcional) estilos: rojo para error, verde para Ã©xito.

## 7. Requerimientos funcionales â€” controlador `login.js`

- **RF-01** Al cargar la pÃ¡gina, si ya hay una sesiÃ³n activa, redirigir al panel (opcional pero recomendado).
- **RF-02** Escuchar el evento `submit` del formulario y ejecutar `preventDefault()`.
- **RF-03** Leer los valores de `#usuario` y `#contrasena` y aplicarles `.trim()`.
- **RF-04** Validar **campos vacÃ­os** localmente antes de llamar al servicio (mensaje: "Debes completar usuario y contraseÃ±a.").
- **RF-05** Llamar a `iniciarSesion(usuario, contrasena)`.
- **RF-06** Si `exito === false`: mostrar el `mensaje` en `#mensaje-login` con estilo de error y **limpiar el campo contraseÃ±a**.
- **RF-07** Si `exito === true`: mostrar el mensaje de Ã©xito y redirigir a `transacciones.html`.
- **RF-08** El controlador **no** compara contraseÃ±as ni cuenta intentos (eso es del servicio).
- **RF-09** No usar `localStorage` directamente.

## 8. Criterios de aceptaciÃ³n (pruebas)

| # | AcciÃ³n | Resultado esperado |
|---|---|---|
| 1 | Login con credenciales correctas | Redirige a `transacciones.html` |
| 2 | Usuario inexistente | Muestra "Usuario no encontrado." |
| 3 | ContraseÃ±a incorrecta (1Âª vez) | Muestra "ContraseÃ±a incorrecta. Intento 1 de 3." |
| 4 | 2Âª y 3Âª vez incorrecta | "Intento 2 de 3" y luego "Cuenta bloqueada por 3 intentos fallidos." |
| 5 | Tras el bloqueo, credenciales correctas | Muestra "Cuenta bloqueada por 3 intentos fallidos." |
| 6 | Enviar con campos vacÃ­os | Muestra validaciÃ³n local; **no** llama al servicio |
| 7 | Presionar Enter en un input | Dispara el login (por `type="submit"`) |
| 8 | Tras un error | El campo contraseÃ±a queda vacÃ­o |

## 9. QuÃ© NO hacer (errores que se penalizan)

- No usar `alert()` como Ãºnica forma de feedback (usar `#mensaje-login`).
- No guardar nada en `localStorage` desde `login.js`.
- No duplicar en el controlador la lÃ³gica de intentos o de comparaciÃ³n de claves.
- No dejar la contraseÃ±a escrita en el input despuÃ©s de un error.

## 10. Entregable

- `js/controller/login.js` funcional (controlador).
- FunciÃ³n `iniciarSesion` en `js/service/servicios.js` (ya existe).
- `iniciar-sesion.html` actualizado: `type="submit"`, `#mensaje-login` y el `<script type="module">`.




