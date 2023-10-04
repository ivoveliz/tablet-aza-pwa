// UI elements.
const deviceNameLabel = document.getElementById('device-name');
const userNameLabel = document.getElementById('user-name');
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const terminalContainer = document.getElementById('terminal');
const sendForm = document.getElementById('send-form');
const loadingModal = document.getElementById('loading-modal');
//formulario
const inputField = document.getElementById('aceite');
const inputTurno = document.getElementById('turno');
const inputCombustible = document.getElementById('combustible');
const inputKilometraje = document.getElementById('kilometraje');
const inputLimpieza = document.querySelectorAll('input[name="limpieza"]');
const inputInicioTurno = document.getElementById('inicio-turno');
const inputFinTurno = document.getElementById('fin-turno');
const inputNombreOperador = document.getElementById('nombre-operador');
//html
const formContainer = document.getElementById("form-container");
const showFormButton = document.getElementById("show-form");
const submitButton = document.getElementById("submit");
const logoutButton = document.getElementById("logout-button");
const closeFormButton = document.getElementById("close-form");
const userBox = document.getElementById("user-box");
const userName = document.getElementById("user-name");
const timeCounter = document.getElementById("time-counter");
const sessionTime = document.getElementById("session-time");

const fallaContainer = document.getElementById("falla-container");
const ingresarFallaButton = document.getElementById("ingresar-falla");
const closeFallaButton = document.getElementById("close-falla");
const fallaForm = document.getElementById("falla-form");
const tipoFallaSelect = document.getElementById("tipo-falla");
const descripcionFallaTextarea = document.getElementById("descripcion-falla");
// Helpers.
const defaultDeviceName = 'Terminal';
const terminalAutoScrollingLimit = terminalContainer.offsetHeight / 2;
let isTerminalAutoScrolling = true;
let retryInterval; // Variable para el temporizador de reintentos.
//////////////script html 


showFormButton.addEventListener("click", () => {
  if (formContainer.style.display === "none" || formContainer.style.display === "") {
      formContainer.style.display = "block";
      showFormButton.textContent = "Ocultar formulario";
      // Ocultar el "Cuadro principal"
      document.querySelector(".connection-box").style.display = "none";
      ingresarFallaButton.style.display = "none";

  } else {
      formContainer.style.display = "none";
      showFormButton.textContent = "Realizar formulario";
      // Mostrar el "Cuadro principal"
      document.querySelector(".connection-box").style.display = "block";
      ingresarFallaButton.style.display = "block";
  }
});

// JavaScript para ocultar el formulario al enviarlo
submitButton.addEventListener("click", () => {
  formContainer.style.display = "none";
  showFormButton.textContent = "Realizar formulario";
  // Mostrar el "Cuadro principal" después de enviar el formulario
  document.querySelector(".connection-box").style.display = "block";
  ingresarFallaButton.style.display = "block";
});


closeFormButton.addEventListener("click", () => {
  formContainer.style.display = "none";
  showFormButton.textContent = "Realizar formulario";
  // Mostrar el "Cuadro principal"
  document.querySelector(".connection-box").style.display = "block";
  ingresarFallaButton.style.display = "block";
});
// JavaScript para actualizar el nombre de usuario y contadores de tiempo


// Nombre de usuario (reemplaza "Nombre de usuario" con el nombre real)
const username = localStorage.getItem('username') || 'Usuario Predeterminado';
userName.textContent = username; // Actualiza el nombre de usuario

// Variables para rastrear el tiempo de sesión y la hora actual
let segundosTranscurridos = 0;

// Función para actualizar los contadores de tiempo
function updateTimers() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  timeCounter.textContent = `Hora Actual: ${hours}:${minutes}:${seconds}`;
  
  // Actualiza el tiempo de sesión en HH:mm:ss
  const horasSesion = String(Math.floor(segundosTranscurridos / 3600)).padStart(2, "0");
  const minutosSesion = String(Math.floor((segundosTranscurridos % 3600) / 60)).padStart(2, "0");
  const segundosSesion = String(segundosTranscurridos % 60).padStart(2, "0");
  sessionTime.textContent = `Tiempo de Sesion: ${horasSesion}:${minutosSesion}:${segundosSesion}`;
  
  segundosTranscurridos++;
}

// Actualiza los contadores de tiempo cada segundo
setInterval(updateTimers, 1000);

// Agregar el manejo del clic en el botón "Cerrar Sesión"


logoutButton.addEventListener("click", () => {
// Obtener el tiempo de sesión actual en formato HH:mm:ss
const tiempoSesion = sessionTime.textContent;

// Crear el objeto de datos para enviar, incluyendo el nombre de usuario y el tiempo de sesión
const dataToSend = {
Usuario: username,
statussesion: 'desconected',
TiempoSesion: tiempoSesion
};

// Convertir el objeto de datos a formato JSON
const jsonData = JSON.stringify(dataToSend);

// Enviar los datos
terminal.send(jsonData);

// Eliminar el nombre de usuario de localStorage
localStorage.removeItem('username');

// Agregar un retraso de 1 segundo antes de redirigir a la página "index.html"
setTimeout(() => {
window.location.href = 'index.html';
}, 1000); // 1000 milisegundos = 1 segundo
});

// Obtén referencias a los elementos del formulario de falla


// Agrega un event listener para mostrar el formulario de falla cuando se hace clic en el botón "Ingresar Falla"
ingresarFallaButton.addEventListener("click", () => {
fallaContainer.style.display = "block";
document.querySelector(".connection-box").style.display = "none";
ingresarFallaButton.style.display = "none";
});

// Agrega un event listener para ocultar el formulario de falla cuando se hace clic en el botón "Cerrar"
closeFallaButton.addEventListener("click", () => {
fallaContainer.style.display = "none";
document.querySelector(".connection-box").style.display = "block";
ingresarFallaButton.style.display = "block";
});

// Agrega un event listener para enviar el formulario de falla cuando se hace clic en el botón "Enviar falla"
fallaForm.addEventListener("submit", (event) => {
event.preventDefault();

// Obtiene los valores del formulario
const tipoFalla = tipoFallaSelect.value;
const descripcionFalla = descripcionFallaTextarea.value;

// Crea un objeto con los datos de la falla
const fallaData = {
TipoFalla: tipoFalla,
DescripcionFalla: descripcionFalla
};

// Convierte el objeto a formato JSON
const fallaJsonData = JSON.stringify(fallaData);
// terminal.send(fallaJsonData);
showLoadingModal();
// Simula el envío de datos (reemplázalo con tu lógica real de envío de datos)
sendWithRetry(fallaJsonData);
console.log("Falla enviada:", fallaJsonData);

// Opcional: limpia el formulario después de enviar la falla
tipoFallaSelect.value = "mecanica"; // Restaura el valor predeterminado
descripcionFallaTextarea.value = ""; // Limpia el campo de descripción

// Opcional: oculta el formulario después de enviar la falla
fallaContainer.style.display = "none";
document.querySelector(".connection-box").style.display = "block";
ingresarFallaButton.style.display = "block";

});
////////////////////////////////////
const scrollElement = (element) => {
  const scrollTop = element.scrollHeight - element.offsetHeight;
  if (scrollTop > 0) {
    element.scrollTop = scrollTop;
  }
};

const logToTerminal = (message, type = '') => {
  terminalContainer.insertAdjacentHTML('beforeend',
      `<div${type && ` class="${type}"`}>${message}</div>`);
  deviceNameLabel.textContent = message;
  userNameLabel
  if (isTerminalAutoScrolling) {
    scrollElement(terminalContainer);
  }
};

// Function to show the loading modal.
const showLoadingModal = () => {
  loadingModal.style.display = 'block';
};

// Function to hide the loading modal.
const hideLoadingModal = () => {
  loadingModal.style.display = 'none';
};

// Función para enviar el mensaje y gestionar los reintentos.
const sendWithRetry = (dataToSend) => {
  // Función para realizar un intento de envío.
  const trySend = () => {
    send(dataToSend); // Intenta enviar el mensaje.
  };

  trySend(); // Envía el mensaje inicialmente.

  // Configura un temporizador para reintentar cada 10 segundos.
  retryInterval = setInterval(() => {
    trySend(); // Intenta enviar el mensaje nuevamente cada 10 segundos.
  }, 10000); // 10000 milisegundos = 10 segundos
};

// Obtain configured instance.
const terminal = new BluetoothTerminal();

// Override `receive` method to log incoming data to the terminal.
terminal.receive = function(data) {
  logToTerminal(data, 'in');
};

terminal.receivestatus = function(data) {
  console.log(data);

  if (data === true) {
    // Detener el temporizador de reintentos cuando se recibe 'true'.
    clearInterval(retryInterval);

    // Ocultar la ventana modal de carga cuando se recibe 'true'.
    hideLoadingModal();

    // Mostrar un mensaje de confirmación (personalizable).
    alert('Reporte enviado con exito.');

    // Opcionalmente, puedes restablecer el formulario u otras acciones.
    // ...
  }
};

// Override default log method to output messages to the terminal and console.
terminal._log = function(...messages) {
  messages.forEach((message) => {
    logToTerminal(message);
    console.log("mensaje", message); // eslint-disable-line no-console
  });
};

// Implement own send function to log outgoing data to the terminal.
const send = (data) => {
  console.log(data);

  // Show the loading modal before sending data.
  showLoadingModal();

  terminal.send(data)
    // .then(() => logToTerminal(data, 'out'))
    .catch((error) => logToTerminal(error));
};

// Bind event listeners to the UI elements.
connectButton.addEventListener('click', () => {
  // Solicitar la conexión Bluetooth solo cuando el usuario hace clic en el botón de conexión.
  terminal.connect()
    .then(() => {
      const username = localStorage.getItem('username') || 'Usuario Predeterminado';
      const dataToSend = `{Usuario: ${username},statussesion:conected}`
      terminal.send(dataToSend)
    console.log("conectado")
    
    // showFormButton.removeAttribute('disabled');
    })
    .catch((error) => {
      console.error('Error al conectar:', error);
  //     console.log("desconectado")

  // showFormButton.setAttribute('disabled', 'true');
    });
});

disconnectButton.addEventListener('click', () => {
  terminal.disconnect();
  console.log("desconectado")
 
  showFormButton.setAttribute('disabled', 'true');
  // deviceNameLabel.textContent = "DESCONECTADO DEL DISPOSITIVO";
});

 
sendForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const valor = inputField.value;
  const turno = inputTurno.value;
  const combustible = inputCombustible.value;
  const kilometraje = inputKilometraje.value;
  const limpieza = [...inputLimpieza].find((radio) => radio.checked)?.value || '';
  const inicioTurno = inputInicioTurno.value;
  const finTurno = inputFinTurno.value;
  const operador=inputNombreOperador.value;

  // Obtén el nombre de usuario desde localStorage
  const username = localStorage.getItem('username') || 'Usuario Predeterminado';
  userNameLabel.textContent = username;
  
  const dataToSend = `Usuario: ${username}, Turno: ${turno},
  operador: ${operador},
  Aceite: ${valor}, Combustible: ${combustible}, 
  Kilometraje: ${kilometraje}, Limpieza: ${limpieza},
  Inicio de turno: ${inicioTurno},Fin de turno: ${finTurno}`;

  inputNombreOperador.value= '';
  inputField.value = '';
  inputTurno.value = '';
  inputCombustible.value = '';
  inputKilometraje.value = '';
  inputLimpieza.forEach((radio) => {
    radio.checked = false;
  });
  inputInicioTurno.value = '';
  inputFinTurno.value = '';

  inputField.focus();

  // Intenta enviar el mensaje y configura reintentos.
  sendWithRetry(dataToSend);
});

// Switch terminal auto-scrolling if it scrolls out of the bottom.
terminalContainer.addEventListener('scroll', () => {
  const scrollTopOffset = terminalContainer.scrollHeight -
    terminalContainer.offsetHeight - terminalAutoScrollingLimit;

  isTerminalAutoScrolling = (scrollTopOffset < terminalContainer.scrollTop);
});
