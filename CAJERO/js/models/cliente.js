export class Cliente {
    // Nivel 2 · Encapsulamiento REAL con campos privados (#)
    static MINUTOS_BLOQUEO = 5; // 60000

    #identificacion;
    #nombre;
    #celular;
    #correo;
    #usuario;
    #contrasena;
    #estado;
    #fechaBloqueo;

    // estado es opcional: si no se pasa, el cliente nace "activo".
    constructor(identificacion, nombre, celular, correo, usuario, contrasena, estado = "activo", fechaBloqueo = null) {
        this.#identificacion = identificacion;
        this.#nombre = nombre;
        this.#celular = celular;
        this.#correo = correo;
        this.#usuario = usuario;
        this.#contrasena = contrasena;
        this.#estado = estado;
        this.#fechaBloqueo = fechaBloqueo ? new Date(fechaBloqueo) : null;
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

    get fechaBloqueo() {
        return this.#fechaBloqueo;
    }

    // Editables (el panel Perfil los modificará más adelante)
    set nombre(valor) {
        this.#nombre = valor;
    }

    set celular(valor) {
        this.#celular = valor;
    }

    set correo(valor) {
        this.#correo = valor;
    }

    set contrasena(valor) {
        this.#contrasena = valor;
    }

    /* ------------------------- Control del estado ------------------------- */

    // Marca al cliente como bloqueado.
    bloquear() {
        this.#estado = "bloqueado";
        this.#fechaBloqueo = new Date();
    }

    // Vuelve a dejar al cliente activo.
    desbloquear() {
        this.#estado = "activo";
        this.#fechaBloqueo = null;
    }

    // Indica si el bloqueo sigue activo (aun no ha expirado).
    bloqueoVigente() {
        if (!this.estaBloqueado()){
        return false;
        }

        if (this.#fechaBloqueo === null) {
        return true;
        }

        const transcurrido = Date.now() - this.#fechaBloqueo.getTime();
        return transcurrido < Cliente.MINUTOS_BLOQUEO * 60000;
        
    }

    // Minutos que faltan para que el bloqueo expire.
    minutosRestantesBloqueo() {
        if (this.#fechaBloqueo === null) {
            return Cliente.MINUTOS_BLOQUEO;
        }

        const restante = (this.#fechaBloqueo.getTime() + Cliente.MINUTOS_BLOQUEO * 60000 - Date.now());
        return Math.max(1, Math.ceil(restante / 60000));
    }

    // Indica si el cliente está bloqueado.
    estaBloqueado() {
        return this.#estado === "bloqueado";
    }
}