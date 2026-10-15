
// ==============================
// SISTEMA DE ATENCIÓN POR COLAS
// ==============================
console.log("SCRIPT CARGADO CORRECTAMENTE");
// CARGAR DATOS GUARDADOS
function cargarDatos(clave, valorInicial) {
    try {
        const datos = localStorage.getItem(clave);
        return datos === null ? valorInicial : JSON.parse(datos);
    } catch (error) {
        return valorInicial;
    }
}

let fila = cargarDatos("turnos", []);
let contadorTurno = cargarDatos("contadorTurno", 1);
let entradaPausada = false;

// VALIDAR DATOS GUARDADOS
if (!Array.isArray(fila)) {
    fila = [];
}

if (!Number.isInteger(contadorTurno) || contadorTurno < 1) {
    contadorTurno = 1;
}

// ELEMENTOS HTML
const input = document.getElementById("nombreInput");
const btnAnotar = document.getElementById("btnAnotar");
const btnAtender = document.getElementById("btnAtender");
const btnReiniciar = document.getElementById("btnReiniciar");
const btnPausa = document.getElementById("btnPausa");

const visor = document.getElementById("clienteActual");
const lista = document.getElementById("lista");
const panel = document.getElementById("panelEntrada");
const contador = document.getElementById("contador");
const mensaje = document.getElementById("mensaje");

// MOSTRAR MENSAJES
let temporizadorMensaje;

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = tipo;

    clearTimeout(temporizadorMensaje);

    temporizadorMensaje = setTimeout(() => {
        mensaje.textContent = "";
        mensaje.className = "";
    }, 2500);
}

// GUARDAR DATOS
function guardarDatos() {
    try {
        localStorage.setItem("turnos", JSON.stringify(fila));
        localStorage.setItem(
            "contadorTurno",
            JSON.stringify(contadorTurno)
        );
    } catch (error) {
        mostrarMensaje("No se pudieron guardar los datos", "error");
    }
}

// ACTUALIZAR LISTA DE ESPERA
function actualizarLista() {
    lista.innerHTML = "";

    fila.forEach((cliente) => {
        const li = document.createElement("li");

        li.textContent =
            `Turno ${cliente.turno} - ${cliente.nombre}`;

        lista.appendChild(li);
    });

    contador.textContent =
        `Clientes en espera: ${fila.length}`;
}

// ANOTAR CLIENTE
function anotarCliente() {
    if (entradaPausada) {
        mostrarMensaje("La entrada está pausada", "error");
        return;
    }

    const nombre = input.value.trim();

    if (nombre === "") {
        mostrarMensaje("Ingrese un nombre", "error");
        input.focus();
        return;
    }

    // EVITAR NOMBRES REPETIDOS EN LA FILA
    const existe = fila.some((cliente) =>
        cliente.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (existe) {
        mostrarMensaje("Ese nombre ya está en la lista", "error");
        input.focus();
        return;
    }

    // CREAR TURNO
    const nuevoCliente = {
        turno: contadorTurno,
        nombre: nombre,
        hora: new Date().toLocaleTimeString()
    };

    fila.push(nuevoCliente);
    contadorTurno++;

    guardarDatos();
    actualizarLista();

    input.value = "";
    input.focus();

    mostrarMensaje("Cliente anotado correctamente", "exito");
}

// BOTÓN ANOTAR
btnAnotar.addEventListener("click", anotarCliente);

// ANOTAR PRESIONANDO ENTER
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        anotarCliente();
    }
});

// ATENDER SIGUIENTE CLIENTE
btnAtender.addEventListener("click", () => {
    if (fila.length === 0) {
        mostrarMensaje("No hay clientes en espera", "error");
        return;
    }

    const atendido = fila.shift();

    visor.textContent =
        `Turno ${atendido.turno} - ${atendido.nombre}`;

    guardarDatos();
    actualizarLista();

    mostrarMensaje(
        `Atendiendo a ${atendido.nombre}`,
        "exito"
    );
});

// REINICIAR EL DÍA
btnReiniciar.addEventListener("click", () => {
    const confirmar = confirm(
        "¿Estás seguro de reiniciar el día? Se perderán los turnos guardados."
    );

    if (!confirmar) {
        return;
    }

    fila = [];
    contadorTurno = 1;

    visor.textContent = "---";

    guardarDatos();
    actualizarLista();

    mostrarMensaje("Sistema reiniciado correctamente", "exito");
});

// PAUSAR Y REANUDAR LA ENTRADA
btnPausa.addEventListener("click", () => {
    entradaPausada = !entradaPausada;

    panel.classList.toggle("pausado", entradaPausada);

    // DESACTIVAR REALMENTE LOS CONTROLES DE ENTRADA
    input.disabled = entradaPausada;
    btnAnotar.disabled = entradaPausada;

    btnPausa.textContent = entradaPausada
        ? "Reanudar Entrada"
        : "Pausar Entrada";

    if (entradaPausada) {
        mostrarMensaje("Entrada pausada", "error");
    } else {
        mostrarMensaje("Entrada reanudada", "exito");
        input.focus();
    }
});

// INICIAR SISTEMA
actualizarLista();
input.focus();
