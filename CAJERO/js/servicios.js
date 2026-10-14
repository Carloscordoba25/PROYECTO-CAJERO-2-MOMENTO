import { leerUsuarios, leerCuentas, guardarUsuarios, guardarCuentas, leerTarjetas, guardarTarjetas} from "./persistencia.js";
import { Cliente } from "./modelos/cliente.js";
import { CuentaAhorros } from "./modelos/cuenta-ahorros.js";
import { CuentaCorriente } from "./modelos/cuenta-corriente.js";
import { TarjetaCredito } from "./modelos/tarjeta-credito.js";

export function registrarCliente(identificacion, nombre, celular, usuario, contrasena, confirmarContrasena) {
    
    if(!identificacion || !nombre || !celular || !usuario || !contrasena || !confirmarContrasena) {
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

    const nuevoCliente = new Cliente(identificacion, nombre, celular, usuario, contrasena, "activo");
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

function clienteADatos(cliente) {
    return {
        identificacion: cliente.identificacion,
        nombre: cliente.nombre,
        celular: cliente.celular,
        usuario: cliente.usuario,
        contrasena: cliente.contrasena,
        estado: cliente.estado
    };
}

function cuentaADatos(cuenta) {
    return {
        tipo: cuenta.tipo,
        numero: cuenta.numero,
        saldo: cuenta.saldo,
        clienteIdentificacion: cuenta.clienteIdentificacion
    };
}

function tarjetaADatos(tarjeta) {
    return {
        numero: tarjeta.numero,
        cupo: tarjeta.cupo,
        deuda: tarjeta.deuda,
        clienteIdentificacion: tarjeta.clienteIdentificacion
    };

}

/* --------- Traductores inversos: datos planos -> instancia --------- */

function clienteDesdeDatos(datos) {
    return new Cliente(
        datos.identificacion,
        datos.nombre,
        datos.celular,
        datos.usuario,
        datos.contrasena,
        datos.estado
    );
}

// Reconstrucción polimórfica: según el tipo de cuenta se crea la clase hija correcta.
function cuentaDesdeDatos(datos) {
    if (datos.tipo === "ahorros") {
        return new CuentaAhorros(datos.numero, datos.saldo, datos.clienteIdentificacion);
    }
    return new CuentaCorriente(datos.numero, datos.saldo, datos.clienteIdentificacion);
}

function tarjetaDesdeDatos(datos) {
    const tarjeta = new TarjetaCredito(datos.numero, datos.cupo, datos.clienteIdentificacion);
    tarjeta.deuda = datos.deuda;
    return tarjeta;
}