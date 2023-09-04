// UI elements.
const deviceNameLabel = document.getElementById('device-name');
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const terminalContainer = document.getElementById('terminal');
const sendForm = document.getElementById('send-form');
const inputField = document.getElementById('input');

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

// Function to check if the user is authenticated
const isAuthenticated = () => {
  // Obtener el nombre de usuario y contraseña ingresados por el usuario.
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Verificar si el nombre de usuario y contraseña coinciden con los datos en users.json.
  // Este es un ejemplo básico, debes implementar un método más seguro para la autenticación.
  const users = [
    {
      "username": "admin",
      "password": "1"
    },
    {
      "username": "usuario2",
      "password": "contrasena2"
    },
    {
      "username": "usuario3",
      "password": "contrasena3"
    }
  ];

  const authenticatedUser = users.find((user) => {
    return user.username === username && user.password === password;
  });

  return authenticatedUser !== undefined;
};

// Obtain configured instance.
const terminal = new BluetoothTerminal();

// Override `receive` method to log incoming data to the terminal.
terminal.receive = function (data) {
  logToTerminal(data, 'in');
};

// Override default log method to output messages to the terminal and console.
terminal._log = function (...messages) {
  messages.forEach((message) => {
    logToTerminal(message);
    console.log(message); // eslint-disable-line no-console
  });
};

// Implement own send function to log outgoing data to the terminal.
const send = (data) => {
  terminal.send(data)
    .then(() => logToTerminal(data, 'out'))
    .catch((error) => logToTerminal(error));
};

// Bind event listeners to the UI elements.
connectButton.addEventListener('click', () => {
  if (!isAuthenticated()) {
    // Redirect to the login page if not authenticated.
    window.location.href = 'login.html';
    return;
  }

  terminal.connect()
    .then(() => {
      deviceNameLabel.textContent = terminal.getDeviceName() ?
        terminal.getDeviceName() : defaultDeviceName;
    });
});

disconnectButton.addEventListener('click', () => {
  terminal.disconnect();
  deviceNameLabel.textContent = defaultDeviceName;
});

sendForm.addEventListener('submit', (event) => {
  event.preventDefault();

  send(inputField.value);

  inputField.value = '';
  inputField.focus();
});

// Switch terminal auto-scrolling if it scrolls out of the bottom.
terminalContainer.addEventListener('scroll', () => {
  const scrollTopOffset = terminalContainer.scrollHeight -
    terminalContainer.offsetHeight - terminalAutoScrollingLimit;

  isTerminalAutoScrolling = (scrollTopOffset < terminalContainer.scrollTop);
});
