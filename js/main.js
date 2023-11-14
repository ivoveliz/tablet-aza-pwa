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

// const fallaContainer = document.getElementById("falla-container");
const ingresarFallaButtonMecanica = document.getElementById("ingresar-falla-mecanica");
const ingresarFallaButtonElectrica = document.getElementById("ingresar-falla-electrica");
const ingresarFallaButtonDesconocida = document.getElementById("ingresar-falla-desconocida");
// const closeFallaButton = document.getElementById("close-falla");
// const fallaForm = document.getElementById("falla-form");
// const tipoFallaSelect = document.getElementById("tipo-falla");
// const descripcionFallaTextarea = document.getElementById("descripcion-falla");
// Helpers.
const defaultDeviceName = 'Terminal';
const terminalAutoScrollingLimit = terminalContainer.offsetHeight / 2;
let isTerminalAutoScrolling = true;
let retryInterval; // Variable para el temporizador de reintentos.
let segundosTranscurridos = 0;
//////////////script html 


showFormButton.addEventListener("click", () => {
  if (formContainer.style.display === "none" || formContainer.style.display === "") {
      formContainer.style.display = "block";
      showFormButton.textContent = "Ocultar formulario";
      // Ocultar el "Cuadro principal"
      document.querySelector(".connection-box").style.display = "none";
      ingresarFallaButtonMecanica.style.display = "none";
      ingresarFallaButtonElectrica.style.display = "none";
      ingresarFallaButtonDesconocida.style.display = "none";

  } else {
      formContainer.style.display = "none";
      showFormButton.textContent = "Realizar formulario";
      // Mostrar el "Cuadro principal"
      document.querySelector(".connection-box").style.display = "block";
      ingresarFallaButtonMecanica.style.display = "block";
      ingresarFallaButtonElectrica.style.display = "block";
      ingresarFallaButtonDesconocida.style.display = "block";
  }
});

// JavaScript para ocultar el formulario al enviarlo
submitButton.addEventListener("click", () => {
  formContainer.style.display = "none";
  showFormButton.textContent = "Realizar formulario";
  // Mostrar el "Cuadro principal" después de enviar el formulario
  document.querySelector(".connection-box").style.display = "block";
  ingresarFallaButtonMecanica.style.display = "block";
  ingresarFallaButtonElectrica.style.display = "block";
  ingresarFallaButtonDesconocida.style.display = "block";
});


closeFormButton.addEventListener("click", () => {
  formContainer.style.display = "none";
  showFormButton.textContent = "Realizar formulario";
  // Mostrar el "Cuadro principal"
  document.querySelector(".connection-box").style.display = "block";
  ingresarFallaButtonMecanica.style.display = "block";
  ingresarFallaButtonElectrica.style.display = "block";
  ingresarFallaButtonDesconocida.style.display = "block";
});
// JavaScript para actualizar el nombre de usuario y contadores de tiempo


// Nombre de usuario (reemplaza "Nombre de usuario" con el nombre real)


const username = localStorage.getItem('username') || 'Usuario Predeterminado';
userName.textContent = username; // Actualiza el nombre de usuario

// Variables para rastrear el tiempo de sesión y la hora actual


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
  sessionTime.textContent = `Tiempo sesion:${horasSesion}:${minutosSesion}:${segundosSesion}`;
  
  segundosTranscurridos++;
}

// Actualiza los contadores de tiempo cada segundo
setInterval(updateTimers, 1000);

// Agregar el manejo del clic en el botón "Cerrar Sesión"


logoutButton.addEventListener("click", () => {
// Obtener el tiempo de sesión actual en formato HH:mm:ss
const tiempoSesion = sessionTime.textContent;

// Crear el objeto de datos para enviar, incluyendo el nombre de usuario y el tiempo de sesión
// const dataToSend = {
// Usuario: username,
// StatusSession: 'desconected',
// TiempoSesion: tiempoSesion
// };
let currentId = parseInt(localStorage.getItem('reportId')) || 1;
const dataToSend ={
  Id:currentId,
Turn: "",
UserId: username,
DateTurn: "",
Cleaning: "",
Kilometer: "",
NameOperator: "",
DateMaintenace: "",
LevelOil: "",
LevelFuel: "",
StatusSession: 0,//discoected
TimeSession:segundosTranscurridos,
Typefail:""
}
currentId++;
// Guarda el nuevo valor del ID en localStorage
localStorage.setItem('reportId', currentId);
// Convertir el objeto de datos a formato JSON
const jsonData = JSON.stringify(dataToSend);

const crc32Value = crc32(jsonData);
const crc32Control=crc32Value+"*"
localStorage.setItem('crc32Control', crc32Control);
const JsonSend= JSON.stringify(jsonData+crc32Value+"*").replace(/\\/g, "");
// Enviar los datos
terminal.send(JsonSend);

// Eliminar el nombre de usuario de localStorage
localStorage.removeItem('username');


// Agregar un retraso de 1 segundo antes de redirigir a la página "index.html"
setTimeout(() => {
window.location.href = 'index.html';
}, 2000); // 1000 milisegundos = 1 segundo
});

// Obtén referencias a los elementos del formulario de falla


// Agrega un event listener para mostrar el formulario de falla cuando se hace clic en el botón "Ingresar Falla"
// ingresarFallaButton.addEventListener("click", () => {
// fallaContainer.style.display = "block";
// document.querySelector(".connection-box").style.display = "none";
// ingresarFallaButton.style.display = "none";
// });

ingresarFallaButtonMecanica.addEventListener("click", () => {
  event.preventDefault();



// Crea un objeto con los datos de la falla
// const fallaData = {
// TipoFalla: "mecanica"
// };
const username = localStorage.getItem('username') || 'Usuario Predeterminado';
let currentId = parseInt(localStorage.getItem('reportId')) || 1;
const fallaData={
  Id:currentId,
  Turn: "",
  UserId: username,
  DateTurn: "",
  Cleaning: "",
  Kilometer: "",
  NameOperator: "",
  DateMaintenace: "",
  LevelOil: "",
  LevelFuel: "",
  StatusSession: "",
  TimeSession:"",
  Typefail:0//mecanic = 0 
  }
  currentId++;
      // Guarda el nuevo valor del ID en localStorage
      localStorage.setItem('reportId', currentId);
// Convierte el objeto a formato JSON
const fallaJsonData = JSON.stringify(fallaData);
// terminal.send(fallaJsonData);
const crc32Value = crc32(fallaJsonData);
const crc32Control=crc32Value+"*"
localStorage.setItem('crc32Control', crc32Control);
const fallaJsonSend= JSON.stringify(fallaJsonData+crc32Value+"*").replace(/\\/g, "");
showLoadingModal();
// Simula el envío de datos (reemplázalo con tu lógica real de envío de datos)
sendWithRetry(fallaJsonSend);
console.log("Falla enviada:", fallaJsonSend);
  
  });
ingresarFallaButtonElectrica.addEventListener("click", () => {
    event.preventDefault();
  
  
  // Crea un objeto con los datos de la falla
  // const fallaData = {
  // TipoFalla: "electrica"
  // };
  const username = localStorage.getItem('username') || 'Usuario Predeterminado';
  let currentId = parseInt(localStorage.getItem('reportId')) || 1;

  const fallaData={
    Id:currentId,
    Turn: "",
    UserId: username,
    DateTurn: "",
    Cleaning: "",
    Kilometer: "",
    NameOperator: "",
    DateMaintenace: "",
    LevelOil: "",
    LevelFuel: "",
    StatusSession: "",
    TimeSession:"",
    Typefail:1//electric=1
    }
    currentId++;
      // Guarda el nuevo valor del ID en localStorage
      localStorage.setItem('reportId', currentId);
    const fallaJsonData = JSON.stringify(fallaData);
    // terminal.send(fallaJsonData);
    const crc32Value = crc32(fallaJsonData);
    const crc32Control=crc32Value+"*"
    localStorage.setItem('crc32Control', crc32Control);
    const fallaJsonSend= JSON.stringify(fallaJsonData+crc32Value+"*").replace(/\\/g, "");
    showLoadingModal();
    // Simula el envío de datos (reemplázalo con tu lógica real de envío de datos)
    sendWithRetry(fallaJsonSend);
    console.log("Falla enviada:", fallaJsonSend);
    
    });

ingresarFallaButtonDesconocida.addEventListener("click", () => {
      event.preventDefault();
    
    
    
    // Crea un objeto con los datos de la falla
    // const fallaData = {
    // TipoFalla: "desconocida"
    // };
    const username = localStorage.getItem('username') || 'Usuario Predeterminado';
    let currentId = parseInt(localStorage.getItem('reportId')) || 1;

    const fallaData={
      Id:currentId,
      Turn: "",
      UserId: username,
      DateTurn: "",
      Cleaning: "",
      Kilometer: "",
      NameOperator: "",
      DateMaintenace: "",
      LevelOil: "",
      LevelFuel: "",
      StatusSession: "",
      TimeSession:"",
      Typefail:2//"unknown"
      }
      currentId++;
      // Guarda el nuevo valor del ID en localStorage
      localStorage.setItem('reportId', currentId);
      const fallaJsonData = JSON.stringify(fallaData);
      // terminal.send(fallaJsonData);
      const crc32Value = crc32(fallaJsonData);
      const crc32Control=crc32Value+"*"
      localStorage.setItem('crc32Control', crc32Control);
      const fallaJsonSend= JSON.stringify(fallaJsonData+crc32Value+"*").replace(/\\/g, "");
      showLoadingModal();
      // Simula el envío de datos (reemplázalo con tu lógica real de envío de datos)
      sendWithRetry(fallaJsonSend);
      console.log("Falla enviada:", fallaJsonSend);
      
      });

// Agrega un event listener para ocultar el formulario de falla cuando se hace clic en el botón "Cerrar"
// closeFallaButton.addEventListener("click", () => {
// fallaContainer.style.display = "none";
// document.querySelector(".connection-box").style.display = "block";
// ingresarFallaButton.style.display = "block";
// });

// Agrega un event listener para enviar el formulario de falla cuando se hace clic en el botón "Enviar falla"
// fallaForm.addEventListener("submit", (event) => {
// event.preventDefault();

// // Obtiene los valores del formulario
// const tipoFalla = tipoFallaSelect.value;
// const descripcionFalla = descripcionFallaTextarea.value;

// // Crea un objeto con los datos de la falla
// const fallaData = {
// TipoFalla: tipoFalla,
// DescripcionFalla: descripcionFalla
// };

// // Convierte el objeto a formato JSON
// const fallaJsonData = JSON.stringify(fallaData);
// // terminal.send(fallaJsonData);
// showLoadingModal();
// // Simula el envío de datos (reemplázalo con tu lógica real de envío de datos)
// sendWithRetry(fallaJsonData);
// console.log("Falla enviada:", fallaJsonData);

// // Opcional: limpia el formulario después de enviar la falla
// tipoFallaSelect.value = "mecanica"; // Restaura el valor predeterminado
// descripcionFallaTextarea.value = ""; // Limpia el campo de descripción

// // Opcional: oculta el formulario después de enviar la falla
// fallaContainer.style.display = "none";
// document.querySelector(".connection-box").style.display = "block";
// ingresarFallaButton.style.display = "block";

// });
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

terminal.DownlinkStatus = function(data) {
  // console.log(data);

  terminal.send(data)
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

      let currentId = parseInt(localStorage.getItem('reportId')) || 1;
// Cuando se escribe un nuevo reporte, incrementa el ID
      const username = localStorage.getItem('username') || 'Usuario Predeterminado';
      // const dataToSend = `{Usuario: ${username},StatusSession:conected}`
      const dataToSend ={
        Id:currentId,
        Turn: "",
        UserId: username,
        DateTurn: "",
        Cleaning: "",
        Kilometer: "",
        NameOperator: "",
        DateMaintenace: "",
        LevelOil: "",
        LevelFuel: "",
        StatusSession: 1,//conected
        TimeSession:"",
        Typefail:""
        }

        currentId++;
      // Guarda el nuevo valor del ID en localStorage
      localStorage.setItem('reportId', currentId);
        // Convertir el objeto de datos a formato JSON
        const jsonData = JSON.stringify(dataToSend);
        
        const crc32Value = crc32(jsonData);
        const crc32Control=crc32Value+"*"
localStorage.setItem('crc32Control', crc32Control);
        const JsonSend= JSON.stringify(jsonData+crc32Value+"*").replace(/\\/g, "");
      terminal.send(JsonSend)
      // terminal.send(dataToSend)
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

  // const ReportData={
  //   Turn: turno,
  //   UserId: username,
  //   DateTurn: inicioTurno,
  //   Cleaning: limpieza,
  //   Kilometer: kilometraje,
  //   NameOperator: operador,
  //   DateMaintenace: finTurno,
  //   LevelOil: valor,
  //   LevelFuel: combustible,
  //   StatusSession: "",
  //   TimeSession:"",
  //   Typefail:""
  //   }
  let currentId = parseInt(localStorage.getItem('reportId')) || 1;
  const ReportData = {
    Id:currentId,
    Turn: turno,
    UserId: username,
    DateTurn: new Date(inicioTurno).getTime(), // Convierte la fecha a timestamp
    Cleaning: parseInt(limpieza),
    Kilometer: parseInt(kilometraje), // Convierte el kilometraje a número
    NameOperator: parseInt(operador),
    DateMaintenace: new Date(finTurno).getTime(), // Convierte la fecha a timestamp
    LevelOil: parseInt(valor), // Convierte el valor del aceite a número
    LevelFuel: parseInt(combustible), // Convierte el nivel de combustible a número
    StatusSession: "",
    TimeSession: "", // Dejamos la hora como string
    TypeFail: ""
};

currentId++;
// Guarda el nuevo valor del ID en localStorage
localStorage.setItem('reportId', currentId);
    const ReportDataJsonData = JSON.stringify(ReportData);
    // terminal.send(fallaJsonData);
    const crc32Value = crc32(ReportDataJsonData);
    const crc32Control=crc32Value+"*"
localStorage.setItem('crc32Control', crc32Control);
    // const ReportJsonSend= JSON.stringify(ReportDataJsonData+crc32Value+"*")
    const ReportJsonSend = JSON.stringify(ReportDataJsonData + crc32Value + "*").replace(/\\/g, "");
    showLoadingModal();
    // Simula el envío de datos (reemplázalo con tu lógica real de envío de datos)
    sendWithRetry(ReportJsonSend);
    console.log("reprote enviado:", ReportJsonSend);

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
  // sendWithRetry(dataToSend);
});

// Switch terminal auto-scrolling if it scrolls out of the bottom.
terminalContainer.addEventListener('scroll', () => {
  const scrollTopOffset = terminalContainer.scrollHeight -
    terminalContainer.offsetHeight - terminalAutoScrollingLimit;

  isTerminalAutoScrolling = (scrollTopOffset < terminalContainer.scrollTop);
});


function crc32(str) {
  const table = [];
  for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
          c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
  }

  let crc = 0 ^ -1;
  for (let i = 0; i < str.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xFF];
  }

  // Convierte el valor CRC32 a hexadecimal
  const crc32Hex = (crc ^ -1) >>> 0; // Valor sin signo
  return crc32Hex.toString(16).toUpperCase(); // Representación hexadecimal en mayúsculas
}