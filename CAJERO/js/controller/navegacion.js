// Importa las funciones que consultan la sesión y la eliminan al cerrar sesión.
import { cerrarSesion, leerSesion } from "../config/persistencia.js";

// Busca la barra de navegación que se actualizará en la página actual.
const navegacion = document.querySelector(".navegacion-principal");
// Lee los datos del usuario que inició sesión desde el almacenamiento local.
const sesion = leerSesion();

// Comprueba que exista navegación y una sesión con nombre de usuario.
if (navegacion && sesion && sesion.usuario) {
    // Sustituye los enlaces públicos por los enlaces y el menú del usuario.
    mostrarMenuUsuario(navegacion, sesion.usuario);
}

// Busca posibles controles de cierre de sesión ya presentes en el HTML.
document.querySelectorAll(".boton-cerrar-sesion").forEach(boton => {
    // Escucha el clic de cada control encontrado.
    boton.addEventListener("click", evento => {
        // Evita que el enlace navegue a su destino predeterminado.
        evento.preventDefault();
        // Ejecuta el cierre de sesión y la redirección.
        cerrarSesionActual();
    });
});

// Construye la navegación autenticada y el menú desplegable del usuario.
function mostrarMenuUsuario(contenedor, usuario) {
    // Quita los enlaces actuales para reemplazarlos según la sesión activa.
    contenedor.replaceChildren();
    // Agrega un acceso a la página principal.
    agregarEnlace(contenedor, "index.html", "Inicio");
    // Agrega un acceso a la página de tarjetas.
    agregarEnlace(contenedor, "tarjetas.html", "Tarjetas");
    // Agrega un acceso al panel de transacciones.
    agregarEnlace(contenedor, "transacciones.html", "Transacciones");

    // Crea el contenedor que agrupa el botón y su menú desplegable.
    const menu = document.createElement("div");
    // Asigna la clase usada por los estilos y el manejo del menú.
    menu.className = "menu-usuario";

    // Crea el botón que muestra el nombre y abre o cierra el menú.
    const botonMenu = document.createElement("button");
    // Evita que el botón envíe formularios.
    botonMenu.type = "button";
    // Asigna un identificador único al botón.
    botonMenu.id = "boton-menu-usuario";
    // Aplica la clase visual del botón.
    botonMenu.className = "boton-menu-usuario";
    // Informa a tecnologías de asistencia que el botón controla un menú.
    botonMenu.setAttribute("aria-haspopup", "true");
    // Indica inicialmente que el menú está cerrado.
    botonMenu.setAttribute("aria-expanded", "false");
    // Relaciona el botón con el identificador del menú.
    botonMenu.setAttribute("aria-controls", "desplegable-usuario");
    // Muestra en el botón el nombre del usuario de la sesión.
    botonMenu.textContent = usuario;

    // Crea el indicador visual que señala que el botón despliega opciones.
    const indicador = document.createElement("span");
    // Aplica los estilos correspondientes al indicador.
    indicador.className = "indicador-menu-usuario";
    // Oculta el indicador a lectores de pantalla porque es decorativo.
    indicador.setAttribute("aria-hidden", "true");
    // Añade el símbolo de flecha hacia abajo.
    indicador.textContent = " ▾";
    // Incorpora la flecha dentro del botón del usuario.
    botonMenu.append(indicador);

    // Crea el panel que contendrá el nombre y el botón de cierre de sesión.
    const desplegable = document.createElement("div");
    // Asigna el identificador asociado al atributo aria-controls del botón.
    desplegable.id = "desplegable-usuario";
    // Aplica la clase visual del panel desplegable.
    desplegable.className = "desplegable-usuario";
    // Mantiene el panel oculto hasta que el usuario abra el menú.
    desplegable.hidden = true;

    // Crea el elemento donde se repetirá el nombre dentro del menú.
    const nombreUsuario = document.createElement("span");
    // Aplica los estilos del nombre mostrado en el panel.
    nombreUsuario.className = "nombre-usuario";
    // Inserta el nombre como texto, sin interpretarlo como HTML.
    nombreUsuario.textContent = usuario;

    // Crea el botón que permite terminar la sesión.
    const botonCerrarSesion = document.createElement("button");
    // Declara que no es un botón de envío de formulario.
    botonCerrarSesion.type = "button";
    // Le asigna la clase usada para localizarlo y aplicarle estilos.
    botonCerrarSesion.className = "boton-cerrar-sesion";
    // Define el texto visible para la acción de cierre.
    botonCerrarSesion.textContent = "Cerrar sesión";
    // Ejecuta el cierre de sesión cuando el usuario pulsa el botón.
    botonCerrarSesion.addEventListener("click", cerrarSesionActual);

    // Coloca el nombre y el botón de cierre dentro del panel.
    desplegable.append(nombreUsuario, botonCerrarSesion);
    // Agrupa el botón principal y el panel dentro del menú.
    menu.append(botonMenu, desplegable);
    // Añade el menú completo a la barra de navegación.
    contenedor.append(menu);

    // Alterna la visibilidad del panel cuando se pulsa el botón del usuario.
    botonMenu.addEventListener("click", () => {
        // Calcula el nuevo estado a partir de si el panel está oculto.
        const estaAbierto = !desplegable.hidden;
        // Actualiza la visibilidad del panel.
        desplegable.hidden = estaAbierto;
        // Mantiene actualizado el estado accesible del botón.
        botonMenu.setAttribute("aria-expanded", String(!estaAbierto));
    });

    // Escucha clics del documento para cerrar el panel al pulsar fuera del menú.
    document.addEventListener("click", evento => {
        // Comprueba que el elemento pulsado no pertenezca al menú.
        if (!menu.contains(evento.target)) {
            // Oculta el panel desplegable.
            desplegable.hidden = true;
            // Informa que el menú está cerrado para tecnologías de asistencia.
            botonMenu.setAttribute("aria-expanded", "false");
        }
    });

    // Permite cerrar el panel con la tecla Escape.
    document.addEventListener("keydown", evento => {
        // Actúa únicamente si la tecla pulsada es Escape.
        if (evento.key === "Escape") {
            // Oculta el panel desplegable.
            desplegable.hidden = true;
            // Actualiza el estado accesible del botón.
            botonMenu.setAttribute("aria-expanded", "false");
            // Devuelve el foco al botón que abre el menú.
            botonMenu.focus();
        }
    });
}

// Crea y agrega un enlace de navegación con la ruta y el texto recibidos.
function agregarEnlace(contenedor, destino, texto) {
    // Crea el elemento HTML de enlace.
    const enlace = document.createElement("a");
    // Define la dirección a la que navegará el enlace.
    enlace.href = destino;
    // Aplica la clase visual común a los enlaces de navegación.
    enlace.className = "enlace-nav";
    // Establece el texto visible de forma segura.
    enlace.textContent = texto;
    // Inserta el enlace dentro de la barra de navegación recibida.
    contenedor.append(enlace);
}

// Termina la sesión actual y lleva al usuario a la página principal.
function cerrarSesionActual() {
    // Borra del almacenamiento local los datos de la sesión activa.
    cerrarSesion();
    // Redirige a la página principal después de cerrar sesión.
    window.location.href = "index.html";
}
