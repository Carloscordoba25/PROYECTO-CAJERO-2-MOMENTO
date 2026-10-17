# Requerimiento — Módulo de inicio de sesión

**Proyecto:** Mi Plata Financial Bank (CESDE, POO con JavaScript)
**Módulo:** Autenticación / inicio de sesión
**Responsable:** Andrés Felipe Duque
**Arquitectura:** ES Modules (`import`/`export`) + `localStorage`
**Núcleo involucrado:** clase `Cliente` (`js/models/cliente.js`) y servicio `iniciarSesion` (`js/service/servicios.js`)

## 1. Objetivo
Permitir que un cliente inicie sesión con su usuario y contraseña. El servicio aplica la regla de intentos fallidos y el **bloqueo temporal con fecha**. El controlador solo captura el evento, lee los inputs, llama al servicio y muestra el resultado en pantalla.

## 2. Alcance
- **Controlador:** `js/controller/login.js` (Andrés).
- **Servicio:** `iniciarSesion(usuario, contrasena)` (ya implementado).
- **HTML:** `html/iniciar-sesion.html`.

## 3. Regla de arquitectura (obligatoria)
- El **controlador NO** valida contraseñas, **NO** cuenta intentos y **NO** toca `localStorage`.
- Su único trabajo: **capturar evento → leer inputs → llamar al servicio → mostrar la respuesta**.
- Cada página carga **un solo** `<script type="module">`.

## 4. Contrato del servicio `iniciarSesion(usuario, contrasena)`
- **Entrada:** `usuario` (string), `contrasena` (string).
- **Salida:** SIEMPRE `{ exito: boolean, mensaje: string, ... }`.

| Caso | Resultado |
|---|---|
| Usuario inexistente | `{ exito:false, mensaje:"Usuario no encontrado." }` |
| Contraseña incorrecta (1.º y 2.º fallo) | `{ exito:false, mensaje:"Contraseña incorrecta. Intento N de 3." }` |
| 3.er fallo | bloquea la cuenta y `{ exito:false, mensaje:"Cuenta bloqueada por 3 intentos fallidos." }` |
| Intento con **bloqueo vigente** | `{ exito:false, mensaje:"Cuenta bloqueada. Intenta de nuevo en X min." }` |
| Intento con **bloqueo expirado** | se desbloquea solo y continúa la validación normal |
| Credenciales correctas | `{ exito:true, mensaje:"Inicio de sesion exitoso" }` |

## 5. Reglas del núcleo — bloqueo con fecha (clase `Cliente`)

1. La clase tiene la constante `static MINUTOS_BLOQUEO = 5` (duración del bloqueo, configurable).
2. `bloquear()` → marca `estado = "bloqueado"` **y** guarda `fechaBloqueo = new Date()`.
3. `desbloquear()` → marca `estado = "activo"` **y** limpia `fechaBloqueo = null`.
4. `estaBloqueado()` → `estado === "bloqueado"` (solo mira el estado, no el tiempo).
5. `bloqueoVigente()` → indica si el bloqueo **no ha expirado**:
   - no está bloqueado → `false`;
   - bloqueado **sin fecha** (bloqueo viejo o manual) → `true` (se respeta);
   - bloqueado con fecha → `transcurrido < MINUTOS_BLOQUEO * 60000`.
6. `minutosRestantesBloqueo()` → minutos que faltan para que expire (mínimo **1**); si no hay fecha → `MINUTOS_BLOQUEO`.

**Persistencia:** el objeto plano del cliente guarda `fechaBloqueo` como texto ISO (o `null`), y `clienteDesdeDatos` lo restaura al reconstruir la instancia.

### Regla de intentos y bloqueo (servicio `iniciarSesion`)
1. Buscar el cliente por `usuario`. Si no existe → "Usuario no encontrado.".
2. Reconstruir el `Cliente` (trae su `fechaBloqueo`).
3. Si `bloqueoVigente()` → rechazar con los minutos restantes (`minutosRestantesBloqueo()`).
3. Si **no** vigente pero `estaBloqueado()` → desbloquear solo: `desbloquear()` + `reiniciarIntentos()` + guardar el cliente, y **continuar**.
4. Comparar la contraseña.
5. Cada fallo → `aumentarIntentos(usuario)`.
6. Al llegar a **3** fallos → `bloquear()` (estampa la fecha) y guardar → mensaje de bloqueo.
7. Si acierta → `reiniciarIntentos(usuario)` y `guardarSesion({ identificacion, usuario })`.

> El **auto-desbloqueo** es una mejora sobre el requisito base (el PDF no define tiempo). Se documenta aquí para dejar constancia de que es intencional.

## 6. HTML — estado actual y cambios requeridos

**Cambios que Andrés debe hacer en `iniciar-sesion.html`:**
1. El botón debe ser **`type="submit"`** (ya aplicado, id `ingresar`).
2. **Agregar** el contenedor de mensajes debajo del botón:
   `<p id="mensaje-login" role="alert" aria-live="polite"></p>`
3. El `<script type="module" src="../js/controller/login.js">` ya está colocado.
4. (Opcional) estilos: rojo para error, verde para éxito.

## 7. Requerimientos funcionales — controlador `login.js`
- **RF-01** Al cargar, si ya hay sesión activa (`obtenerSesionActiva()`), redirigir a `transacciones.html`.
- **RF-02** Escuchar el evento `submit` del formulario y ejecutar `preventDefault()`.
- **RF-03** Leer `#usuario` y `#contrasena` aplicando `.trim()`.
- **RF-04** Validar campos vacíos localmente (mensaje: "Debes completar usuario y contraseña.") sin llamar al servicio.
- **RF-05** Llamar a `iniciarSesion(usuario, contrasena)`.
- **RF-06** Si `exito === false`: mostrar `resultado.mensaje` en `#mensaje-login` con estilo de error y **limpiar la contraseña**.
- **RF-07** Si `exito === true`: mostrar el mensaje y redirigir a `transacciones.html`.
- **RF-08** El controlador no compara contraseñas ni cuenta intentos (eso es del servicio).
- **RF-09** No usar `localStorage` directamente.

## 8. Criterios de aceptación (pruebas)

| # | Acción | Resultado esperado |
|---|---|---|
| 1 | Login con credenciales correctas | Redirige a `transacciones.html` |
| 2 | Usuario inexistente | "Usuario no encontrado." |
| 3 | Contraseña incorrecta (1.ª y 2.ª vez) | "Contraseña incorrecta. Intento 1 de 3." / "... 2 de 3." |
| 4 | 3.ª vez incorrecta | "Cuenta bloqueada por 3 intentos fallidos." |
| 5 | Intento inmediato estando bloqueado | "Cuenta bloqueada. Intenta de nuevo en X min." (no valida la contraseña) |
| 6 | Intento **5 minutos después** del bloqueo | Se desbloquea solo y, con la clave correcta, **entra** |
| 7 | Tras el auto-desbloqueo | El contador de intentos vuelve a `0` |
| 8 | Enviar con campos vacíos | Validación local; **no** llama al servicio |
| 9 | Presionar Enter en un input | Dispara el login (por `type="submit"`) |
| 10 | Tras un error | El campo contraseña queda vacío |

## 9. Qué NO hacer (errores que se penalizan)
- No usar `alert()` como única forma de feedback (usar `#mensaje-login`).
- No guardar nada en `localStorage` desde `login.js`.
- No duplicar en el controlador la lógica de intentos, bloqueo o comparación de claves.
- No dejar la contraseña escrita en el input después de un error.

## 10. Entregable
- `js/controller/login.js` funcional (controlador).
- `iniciar-sesion.html` con `type="submit"` y `#mensaje-login`.
- Núcleo ya listo: `Cliente` (con fecha de bloqueo) e `iniciarSesion` en el servicio.
