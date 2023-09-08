// UI elements.
const deviceNameLabel = document.getElementById('device-name');
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const terminalContainer = document.getElementById('terminal');
const sendForm = document.getElementById('send-form'); // Cambiado el ID
const inputField = document.getElementById('aceite'); // Cambiado el ID
const inputTurno = document.getElementById('turno');
const inputCombustible = document.getElementById('combustible');
const inputKilometraje = document.getElementById('kilometraje');
const inputLimpieza = document.querySelectorAll('input[name="limpieza"]');
const inputInicioTurno = document.getElementById('inicio-turno');
const inputFinTurno = document.getElementById('fin-turno');
const loadingModal = document.getElementById('loading-modal'); // Ventana modal de carga

// Helpers.
const defaultDeviceName = 'Terminal';
const terminalAutoScrollingLimit = terminalContainer.offsetHeight / 2;
let isTerminalAutoScrolling = true;

const scrollElement = (element) => {
  const scrollTop = element.scrollHeight - element.offsetHeight;

  if (scrollTop > 0) {
    element.scrollTop = scrollTop;
  }
};

const logToTerminal = (message, type = '') => {
  terminalContainer.insertAdjacentHTML('beforeend',
      `<div${type && ` class="${type}"`}>${message}</div>`);

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

let retryInterval; // Variable para el temporizador de reintentos.

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
    .then(() => logToTerminal(data, 'out'))
    .catch((error) => logToTerminal(error));
};

// Bind event listeners to the UI elements.
connectButton.addEventListener('click', () => {
  terminal.connect()
    .then(() => {
      deviceNameLabel.textContent = "CONECTADO";
      // deviceNameLabel.textContent = terminal.getDeviceName() ?
      //   terminal.getDeviceName() : defaultDeviceName;
    });
});

disconnectButton.addEventListener('click', () => {
  terminal.disconnect();
  deviceNameLabel.textContent = "DESCONECTADO";
  // deviceNameLabel.textContent = defaultDeviceName;
});

sendForm.addEventListener('submit', (e) => { // Cambiado el evento a 'submit'
  e.preventDefault(); // Evitar el envío predeterminado del formulario

  const valor = inputField.value;
  const turno = inputTurno.value;
  const combustible = inputCombustible.value;
  const kilometraje = inputKilometraje.value;
  const limpieza = [...inputLimpieza].find((radio) => radio.checked)?.value || '';
  const inicioTurno = inputInicioTurno.value;
  const finTurno = inputFinTurno.value;

  // Combina los valores en el formato que deseas enviar.
  const dataToSend = `Turno: ${turno}, Aceite: ${valor}, Combustible: ${combustible}, Kilometraje: ${kilometraje}, Limpieza: ${limpieza}, Inicio de turno: ${inicioTurno}, Fin de turno: ${finTurno}`;

  // Limpia los campos después de enviar.
  inputField.value = '';
  inputTurno.value = 'A'; // Puedes establecer un valor predeterminado si lo deseas.
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
