# 🏦 Sistema Bancario Mi Plata - Financial Bank

Proyecto académico desarrollado para la asignatura Desarrollo de Software en CESDE.

## 📋 Descripción del Proyecto

Sistema Bancario Financial Bank es una aplicación web desarrollada en JavaScript bajo el paradigma de Programación Orientada a Objetos (POO), que simula las operaciones de un cajero virtual bancario.

La aplicación permite la administración de usuarios, autenticación segura, gestión de cuentas bancarias y ejecución de transacciones financieras, implementando reglas de negocio reales para productos como:

- Cuenta de Ahorros
- Cuenta Corriente
- Tarjeta de Crédito

El proyecto fue diseñado para aplicar los principios fundamentales de la Programación Orientada a Objetos y las buenas prácticas de desarrollo web.

---

# 👨‍💻 Integrantes

| Nombre |
|----------|
| Carlos Alberto Córdoba |
| Andrés Felipe Duque |
| Leonardo Oscary Pinto |

---

# 👨‍🏫 Docente

Jorge Albeiro Muriel Vélez

---

# 🎯 Objetivo General

Desarrollar una aplicación web funcional que simule el sistema de transacciones bancarias de la sucursal "Financial Bank", permitiendo gestionar clientes, productos financieros y operaciones bancarias mediante la aplicación de Programación Orientada a Objetos.

---

# 🛠️ Tecnologías Utilizadas

- JavaScript (ES6+)
- HTML5
- CSS3
- LocalStorage
- Programación Orientada a Objetos (POO)
- Git
- GitHub

---

# 🏗️ Arquitectura del Proyecto

El sistema se desarrolla siguiendo una estructura modular basada en Programación Orientada a Objetos.

## Clases Principales

### Cliente
Representa los usuarios registrados en la plataforma.

### Cuenta
Clase padre que contiene atributos y comportamientos comunes.

### CuentaAhorros
Hereda de Cuenta e implementa cálculo de intereses.

### CuentaCorriente
Hereda de Cuenta e implementa funcionalidad de sobregiro.

### TarjetaCredito
Clase independiente (NO hereda de Cuenta). Administra el cupo de crédito y la financiación en cuotas.

### Movimiento
Registro histórico de las transacciones. Se almacena como datos (fecha, tipo, valor), no como clase.

---

# 📚 Principios POO Implementados

## Abstracción
Modelado de entidades bancarias reales mediante clases.

## Encapsulamiento
Protección de atributos mediante métodos getters y setters.

## Herencia
Jerarquía entre:

Cuenta
├── CuentaAhorros
└── CuentaCorriente

## Polimorfismo
Implementación diferenciada de operaciones financieras según el tipo de producto.

---

# 🔐 Módulo de Registro y Autenticación

## Registro de Usuarios

Permite registrar:

- Número de identificación
- Nombre completo
- Celular
- Nombre de usuario
- Contraseña
- Confirmación de contraseña

## Inicio de Sesión

Características:

- Validación de credenciales
- Máximo 3 intentos
- Bloqueo automático de cuenta
- Visualización de intentos restantes

## CRUD de Usuarios

Se implementan las siguientes operaciones:

- Crear usuario
- Consultar usuario
- Editar usuario
- Eliminar usuario

---

# 💳 Productos Bancarios

## Cuenta de Ahorros

### Características

- Consignar dinero
- Retirar dinero
- Generación de intereses

### Regla de Negocio

Interés mensual:

1.5%

Restricción:

El retiro no puede exceder el saldo disponible.

---

## Cuenta Corriente

### Características

- Consignaciones
- Retiros
- Transferencias

### Regla de Negocio

Permite sobregiro del 20%.

Ejemplo:

Saldo: $1.000.000

Límite disponible:
$1.200.000

---

## Tarjeta de Crédito

Permite realizar compras financiadas mediante cuotas.

### Tasas de Interés

| Cuotas | Interés |
|----------|----------|
| ≤ 2 | 0% |
| 3-6 | 1.9% |
| ≥ 7 | 2.3% |

### Fórmula de Cuota Mensual

Cuota = (Capital × tasa) / (1 - (1 + tasa)^(-n))

Donde:

- tasa = interés mensual
- n = cantidad de cuotas

---

# 💰 Funcionalidades del Cajero

## Consultar Saldo

Consulta del saldo actualizado del producto seleccionado.

## Consignar Dinero

Validaciones:

- Valor positivo
- Mayor a cero

## Retirar Dinero

Validaciones:

- Disponibilidad de saldo
- Aplicación de reglas según producto

## Transferencias

Permite:

- Entre productos del mismo usuario
- Entre distintos usuarios

Restricción:

No se permiten transferencias al mismo producto.

## Historial de Movimientos

Registro de:

- Fecha
- Hora
- Tipo de operación
- Valor

Movimientos almacenados mediante Arrays.

---

# 👤 Gestión de Perfil

El usuario puede:

- Modificar datos personales
- Cambiar contraseña
- Actualizar información de contacto

---

# 🎨 Interfaz de Usuario

Características:

✅ Diseño responsivo

✅ Adaptación para:

- Desktop
- Tablet
- Mobile

✅ Navegación intuitiva

✅ Identidad visual bancaria

✅ Mensajes claros de retroalimentación

---

# 📂 Estructura del Proyecto

```text
proyecto-cajero-2-momento/
│
├── README.md
├── .gitignore
│
└── CAJERO/
    ├── html/
    │   ├── index.html
    │   ├── registro.html
    │   ├── iniciar-sesion.html
    │   ├── transacciones.html
    │   ├── tarjetas.html
    │   └── estilos.css
    │
    ├── IMG/
    │
    ├── docs/
    │
    └── js/
        ├── config/
        │   └── persistencia.js
        ├── models/
        │   ├── cliente.js
        │   ├── cuenta.js
        │   ├── cuenta-ahorros.js
        │   ├── cuenta-corriente.js
        │   └── tarjeta-credito.js
        ├── service/
        │   └── servicios.js
        └── controller/
            ├── registro.js
            ├── login.js
            └── transacciones.js
```