import { leerUsuarios, guardarUsuarios, leerCuentas, guardarCuentas, leerTarjetas, guardarTarjetas, aumentarIntentos, reiniciarIntentos, guardarSesion, leerSesion, cerrarSesion } from "../config/persistencia.js";
import { Cliente } from "../models/cliente.js";
import { CuentaAhorros } from "../models/cuenta-ahorros.js";
import { CuentaCorriente } from "../models/cuenta-corriente.js";
import { TarjetaCredito } from "../models/tarjeta-credito.js";

//Registro de cliente
export function registrarCliente(identificacion, nombre, celular, correo, usuario, contrasena, confirmarContrasena) {    
    if(!identificacion || !nombre || !celular || !correo || !usuario || !contrasena || !confirmarContrasena) {
        return {
            "exito" : false,
            "mensaje" : "No pueden quedar campos vacios."
        }
    }
    
    if(contrasena !== confirmarContrasena) {
        return {
            "exito" : false,
            "mensaje" : "Las contraseñas no coinciden."
        }
    }

    const usuariosActuales = leerUsuarios();
    
    const validarIdUsuario = usuariosActuales.find(u => (u.identificacion === identificacion) || (u.usuario === usuario));
    if(validarIdUsuario) {
        return {
            "exito" : false,
            "mensaje" : "La identificacion o el usuario ya estan registrados."
        }
    }

    const nuevoCliente = new Cliente(identificacion, nombre, celular, correo, usuario, contrasena, "activo");
    const nuevaCuentaAhorros = new CuentaAhorros("AH-" + identificacion, 0, identificacion);
    const nuevaCuentaCorriente = new CuentaCorriente("CT-" + identificacion, 0, identificacion);
    const nuevaTarjetaCredito = new TarjetaCredito("TC-" + identificacion, 2000000, identificacion);

    const clientePlano = clienteADatos(nuevoCliente);
    const ahorrosPlano = cuentaADatos(nuevaCuentaAhorros); 
    const corrientePlano = cuentaADatos(nuevaCuentaCorriente);
    const tarjetaPlano = tarjetaADatos(nuevaTarjetaCredito);
    
    usuariosActuales.push(clientePlano)
    guardarUsuarios(usuariosActuales);

    const cuentasActuales = leerCuentas();
    cuentasActuales.push(ahorrosPlano, corrientePlano)
    guardarCuentas(cuentasActuales);

    const tarjetasActuales = leerTarjetas();
    tarjetasActuales.push(tarjetaPlano)
    guardarTarjetas(tarjetasActuales);

    
    return {
        "exito" : true,
        "mensaje" : "Cliente registrado con exito"
    }
}

//Inicio de sesion
export function iniciarSesion(usuario, contrasena) {
    const usuariosActuales = leerUsuarios();

    const indice = usuariosActuales.findIndex(u => u.usuario === usuario);
    if(indice === -1) {
        return {
            "exito" : false,
            "mensaje" : "Usuario no encontrado."
        }
    }

    const cliente = clienteDesdeDatos(usuariosActuales[indice]);

    // Si el bloqueo sigue vigente, no puede intentar todavia.
    if(cliente.bloqueoVigente()) {
        return{
            "exito" : false,
            "mensaje" : "Cuenta bloqueada. Intenta de nuevo en " 
            + cliente.minutosRestantesBloqueo() + " min."
        }
    }

    // Si el bloqueo ya expiro, se desbloquea automaticamente y sigue el flujo.
    if(cliente.estaBloqueado()){
        cliente.desbloquear();
        reiniciarIntentos(usuario)
        usuariosActuales[indice] = clienteADatos(cliente);
        guardarUsuarios(usuariosActuales);
    }

    if(cliente.contrasena !== contrasena) {
        const intentos = aumentarIntentos(usuario);
        if(intentos >= 3) {
            cliente.bloquear();
            usuariosActuales[indice] = clienteADatos(cliente);
            guardarUsuarios(usuariosActuales);
            return {
                "exito" : false,
                "mensaje" : "Cuenta bloqueada por 3 intentos fallidos."
            }
        }
        return {
            "exito" : false,
            "mensaje" : "Contraseña incorrecta. Intento " + intentos + " de 3."
        }
    }

    reiniciarIntentos(usuario);
    guardarSesion({ "identificacion" : cliente.identificacion, "usuario" : cliente.usuario });
    return {
        "exito" : true,
        "mensaje" : "Inicio de sesion exitoso"
    }
}

//consultar cliente
export function consultarCliente(identificacion) {
    const usuarios = leerUsuarios();
    
    const validarUsuario = usuarios.find(u => u.identificacion === identificacion);
    if(validarUsuario === undefined) {
        return {
            "exito" : false,
            "mensaje": "Usuario no encontrado"
        };
    }
    
    return {
        "exito" : true,
        "mensaje" : "Usuario encontrado",
        "datos" : {
            "identificacion" : validarUsuario.identificacion,
            "nombre" : validarUsuario.nombre,
            "celular" : validarUsuario.celular,
            "correo" : validarUsuario.correo,
            "usuario" : validarUsuario.usuario,
            "estado" : validarUsuario.estado
}
    };
}

//Validar cuentas
export function obtenerCuentas(identificacion) {
    const usuarios = leerUsuarios();

    const validarUsuario = usuarios.find(u => u.identificacion === identificacion);
    if(validarUsuario === undefined) {
        return {
            "exito" : false,
            "mensaje": "Usuario no encontrado"
        };
    }

    const cuentas = leerCuentas().filter(c => c.clienteIdentificacion === identificacion);
    return{
        "exito" : true,
        "mensaje" : "OK",
        "cuentas" : cuentas
    };
}

//Obtener tarjetas
export function obtenerTarjetas(identificacion) {
    const usuario = leerUsuarios().find(u => u.identificacion === identificacion); 
    if (usuario === undefined) {
        return {
            "exito" : false,
            "mensaje": "Usuario no encontrado"
        }
    };
    
    const tarjetas = leerTarjetas().filter(t => t.clienteIdentificacion === identificacion);
    
    return{
        "exito" : true,
        "mensaje" : "OK",
        "tarjetas" : tarjetas 
    };
}

//Consignar
export function consignar(identificacion, numeroCuenta, monto) {
    const montoNumero = Number(monto);

    const buscarCuenta = leerCuentas().find(c => (c.clienteIdentificacion === identificacion) && (c.numero === numeroCuenta));
    if(buscarCuenta === undefined) {
        return {
            "exito" : false,
            "mensaje" : "Cuenta no encontrada"
        }
    }

    const cuenta = cuentaDesdeDatos(buscarCuenta);

    const respuesta = cuenta.consignar(montoNumero);
    if(respuesta.exito === false) {
        return respuesta;
    }

    const cuentas = leerCuentas();
    const indice = cuentas.findIndex(c => c.numero === buscarCuenta.numero);
    cuentas[indice] = cuentaADatos(cuenta);
    guardarCuentas(cuentas)

    return {
        "exito" : true,
        "mensaje" : "Consignacion Exitosa",
        "saldo" : cuenta.saldo
    }

}

// Retirar
export function retirar(identificacion, numeroCuenta, monto) {
    const montoNumero = Number(monto);

    const buscarCuenta = leerCuentas().find(c => (c.clienteIdentificacion === identificacion) && (c.numero === numeroCuenta));
    if(buscarCuenta === undefined) {
        return {
            "exito" : false,
            "mensaje" : "Cuenta no Encontrada"
        }
    }; 
    
    const cuenta = cuentaDesdeDatos(buscarCuenta);

    const respuesta = cuenta.retirar(montoNumero);
    if(respuesta.exito === false) {
        return respuesta;
    }

    const cuentas = leerCuentas();
    const indice = cuentas.findIndex(c => c.numero === buscarCuenta.numero);
    cuentas[indice] = cuentaADatos(cuenta);
    guardarCuentas(cuentas);

    return {
        "exito" : true,
        "mensaje" : "Retiro Exitoso",
        "saldo" : cuenta.saldo
    };
}

//Transferir
export function transferir(identificacionOrigen, numeroCuentaOrigen, numeroCuentaDestino, monto) {
    const montoNumero = Number(monto);

    const cuentas = leerCuentas();

    const cuentaOrigen = cuentas.find(c => (c.clienteIdentificacion === identificacionOrigen) && (c.numero === numeroCuentaOrigen));
    if(cuentaOrigen === undefined) {
        return {
            "exito" : false,
            "mensaje" : "Cuenta de origen no encontrada"
        };
    }

    const cuentaDestino = cuentas.find( c => c.numero === numeroCuentaDestino);
    if(cuentaDestino === undefined) {
        return {
            "exito" : false,
            "mensaje" : "Cuenta de destino no encontrada"
        };
    }

    if(numeroCuentaOrigen === numeroCuentaDestino) {
        return {
            "exito" : false,
            "mensaje" : "No puedes transferir a la misma cuenta"
        };
    }

    const origen = cuentaDesdeDatos(cuentaOrigen);
    const destino = cuentaDesdeDatos(cuentaDestino);

    const salida = origen.transferirSalida(montoNumero);
    if(salida.exito === false) {
        return salida;
    }

    destino.transferirEntrada(montoNumero);
    
    cuentas[cuentas.findIndex(c => c.numero === cuentaOrigen.numero)] = cuentaADatos(origen);
    cuentas[cuentas.findIndex(c => c.numero === cuentaDestino.numero)] = cuentaADatos(destino);
    guardarCuentas(cuentas);

    return { 
        "exito" : true, 
        "mensaje" : "Transferencia Exitosa", 
        "monto" : montoNumero 
    };
}

// Sesion activa
export function obtenerSesionActiva() {
    const sesionActiva = leerSesion();
    if((sesionActiva === null) || (sesionActiva === undefined)) {
        return {
            "exito" : false,
            "mensaje" : "No se encontro sesion activa"
        };
    }
    return {
        "exito" : true,
        "mensaje" : "OK",
        "sesion" : sesionActiva
    };
}

// Cerrar Sesion
export function cerrarSesionUsuario() {
    cerrarSesion();
    return {
        "exito" : true,
        "mensaje" : "Sesion cerrada"
    };
}

// Convierte una instancia Cliente en objeto plano para guardar.
function clienteADatos(cliente) {
    return {
        identificacion: cliente.identificacion,
        nombre: cliente.nombre,
        celular: cliente.celular,
        correo: cliente.correo,
        usuario: cliente.usuario,
        contrasena: cliente.contrasena,
        estado: cliente.estado,
        fechaBloqueo: cliente.fechaBloqueo ? cliente.fechaBloqueo.toISOString() : null
    };
}

// Convierte una instancia Cuenta en objeto plano para guardar.
function cuentaADatos(cuenta) {
    return {
        tipo: cuenta.tipo,
        numero: cuenta.numero,
        saldo: cuenta.saldo,
        clienteIdentificacion: cuenta.clienteIdentificacion
    };
}

// Convierte una instancia TarjetaCredito en objeto plano para guardar.
function tarjetaADatos(tarjeta) {
    return {
        numero: tarjeta.numero,
        cupo: tarjeta.cupo,
        deuda: tarjeta.deuda,
        clienteIdentificacion: tarjeta.clienteIdentificacion
    };

}

/* --------- Traductores inversos: datos planos -> instancia --------- */

// Reconstruye un Cliente desde el objeto plano guardado.
function clienteDesdeDatos(datos) {
    return new Cliente(
        datos.identificacion,
        datos.nombre,
        datos.celular,
        datos.correo,
        datos.usuario,
        datos.contrasena,
        datos.estado,
        datos.fechaBloqueo
    );
}

// Reconstrucción polimórfica: según el tipo de cuenta se crea la clase hija correcta.
function cuentaDesdeDatos(datos) {
    if (datos.tipo === "ahorros") {
        return new CuentaAhorros(datos.numero, datos.saldo, datos.clienteIdentificacion);
    }
    return new CuentaCorriente(datos.numero, datos.saldo, datos.clienteIdentificacion);
}

// Reconstruye una TarjetaCredito desde el objeto plano (restaura su deuda).
function tarjetaDesdeDatos(datos) {
    const tarjeta = new TarjetaCredito(datos.numero, datos.cupo, datos.clienteIdentificacion);
    tarjeta.deuda = datos.deuda;
    return tarjeta;
}


