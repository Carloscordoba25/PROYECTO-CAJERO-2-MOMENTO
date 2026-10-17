// Simulacro de localStorage para poder correr las pruebas en Node (ESM).
// Reproduce la interfaz mínima usada por persistencia.js:
// getItem / setItem / removeItem / clear.

let datos = {};

export const localStorageMock = {
    getItem(clave) {
        return Object.prototype.hasOwnProperty.call(datos, clave) ? datos[clave] : null;
    },
    setItem(clave, valor) {
        datos[clave] = String(valor);
    },
    removeItem(clave) {
        delete datos[clave];
    },
    clear() {
        datos = {};
    }
};

// Vacía el almacenamiento entre bloques de pruebas.
export function resetStorage() {
    datos = {};
}
