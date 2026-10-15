export class Cliente {
    // Nivel 2 · Encapsulamiento REAL con campos privados (#)
    #identificacion;
    #nombre;
    #celular;
    #correo;
    #usuario;
    #contrasena;
    #estado;

    // estado es opcional: si no se pasa, el cliente nace "activo".
    constructor(identificacion, nombre, celular, correo, usuario, contrasena, estado = "activo") {
        this.#identificacion = identificacion;
        this.#nombre = nombre;
        this.#celular = celular;
        this.#correo = correo;
        this.#usuario = usuario;
        this.#contrasena = contrasena;
        this.#estado = estado;
    }

    /* ------------ Accesores: la única puerta hacia los campos ------------- */

    // Fijos (se leen, no se cambian desde fuera)
    get identificacion() {
        return this.#identificacion;
    }

    get usuario() {
        return this.#usuario;
    }

    // Estado de SOLO LECTURA para el exterior: solo se modifica con
    // bloquear() / desbloquear(). Así nadie lo tolera por accidente.
    get estado() {
        return this.#estado;
    }

    // Editables (el panel Perfil los modificará más adelante)
    get nombre() {
        return this.#nombre;
    }
    set nombre(valor) {
        this.#nombre = valor;
    }

    get celular() {
        return this.#celular;
    }
    set celular(valor) {
        this.#celular = valor;
    }

    get correo() {
        return this.#correo;
    }
    set correo(valor) {
        this.#correo = valor;
    }

    get contrasena() {
        return this.#contrasena;
    }
    set contrasena(valor) {
        this.#contrasena = valor;
    }

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