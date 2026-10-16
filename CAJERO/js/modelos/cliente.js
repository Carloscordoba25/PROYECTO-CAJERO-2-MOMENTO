export class Cliente {
    // Nivel 2 · Encapsulamiento REAL con campos privados (#)
    #identificacion;
    #nombre;
    #celular;
    #usuario;
    #contrasena;
    #estado;

    // estado es opcional: si no se pasa, el cliente nace "activo".
    constructor(identificacion, nombre, celular, usuario, contrasena, estado = "activo") {
        this.#identificacion = identificacion;
        this.#nombre = nombre;
        this.#celular = celular;
        this.#usuario = usuario;
        this.#contrasena = contrasena;
        this.#estado = estado;
    }

    /* ------------ Accesores: la única puerta hacia los campos ------------- */

    // Fijos (se leen, no se cambian desde fuera)
    get identificacion() {
        return this.#identificacion;
    }

    get nombre() {
        return this.#nombre;
    }

    get celular() {
        return this.#celular;
    }

        get correo() {
        return this.#correo;
    }

    get usuario() {
        return this.#usuario;
    }

    get contrasena() {
        return this.#contrasena;
    }

    // Estado de SOLO LECTURA para el exterior: solo se modifica con
    // bloquear() / desbloquear(). Así nadie lo tolera por accidente.
    get estado() {
        return this.#estado;
    }


    // Editables (el panel Perfil los modificará más adelante)
    set nombre(valor) {
        this.#nombre = valor;
    }


    set celular(valor) {
        this.#celular = valor;
    }

<<<<<<< Updated upstream:CAJERO/js/modelos/cliente.js
    get contrasena() {
        return this.#contrasena;
    }
    set contrasena(valor) {
        this.#contrasena = valor;
    }
=======
    set correo(valor) {
        this.#correo = valor;
    }

    //Se elimina el setter de la contraseña ya que para esto se tiene el método que cambia la contraseña.
    // set contrasena(valor) {
    //     this.#contrasena = valor;
    // }
>>>>>>> Stashed changes:CAJERO/js/models/cliente.js

    
    /* ------------------------- Control del estado ------------------------- */
    bloquear() {
        this.#estado = "bloqueado";
    }

    desbloquear() {
        this.#estado = "activo";
    }

    estaBloqueado() {
        return this.#estado === "bloqueado";
    }
}