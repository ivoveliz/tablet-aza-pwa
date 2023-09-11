/**
 * Bluetooth Terminal class.
 */
class BluetoothTerminal {
  /**
   * Create preconfigured Bluetooth Terminal instance.
   * @param {!(number|string)} [serviceUuid=0xFFE0] - Service UUID
   * @param {!(number|string)} [characteristicUuid=0xFFE1] - Characteristic UUID
   * @param {string} [receiveSeparator='\n'] - Receive separator
   * @param {string} [sendSeparator='\n'] - Send separator
   */
  constructor(serviceUuid = 0xFFE0, characteristicUuid = 0xFFE1,
      receiveSeparator = '\n', sendSeparator = '\n') {
    // Used private variables.
    this._receiveBuffer = ''; // Buffer containing not separated data.
    this._maxCharacteristicValueLength = 20; // Max characteristic value length.
    this._device = null; // Device object cache.
    this._characteristic = null; // Characteristic object cache.

    // Bound functions used to add and remove appropriate event handlers.
    this._boundHandleDisconnection = this._handleDisconnection.bind(this);
    this._boundHandleCharacteristicValueChanged =
        this._handleCharacteristicValueChanged.bind(this);

    // Configure with specified parameters.
    this.setServiceUuid(serviceUuid);
    this.setCharacteristicUuid(characteristicUuid);
    this.setReceiveSeparator(receiveSeparator);
    this.setSendSeparator(sendSeparator);

    // Agregar una variable para habilitar la conexión automática.
    this._autoConnect = false;

    // Llamar a la función de conexión automáticamente.
    if (this._autoConnect) {
      this.connect(); // Esto inicia la conexión automáticamente al crear una instancia de BluetoothTerminal.
    }
  }

  /**
   * Set number or string representing service UUID used.
   * @param {!(number|string)} uuid - Service UUID
   */
  setServiceUuid(uuid) {
    if (!Number.isInteger(uuid) &&
        !(typeof uuid === 'string' || uuid instanceof String)) {
      throw new Error('UUID type is neither a number nor a string');
    }

    if (!uuid) {
      throw new Error('UUID cannot be null');
    }

    this._serviceUuid = uuid;
  }

  /**
   * Set number or string representing characteristic UUID used.
   * @param {!(number|string)} uuid - Characteristic UUID
   */
  setCharacteristicUuid(uuid) {
    if (!Number.isInteger(uuid) &&
        !(typeof uuid === 'string' || uuid instanceof String)) {
      throw  Error('UUID type is neither a number nor a string');
    }

    if (!uuid) {
      throw new Error('UUID cannot be null');
    }

    this._characteristicUuid = uuid;
  }

  /**
   * Set character representing separator for data coming from the connected
   * device, end of line for example.
   * @param {string} separator - Receive separator with length equal to one
   *                             character
   */
  setReceiveSeparator(separator) {
    if (!(typeof separator === 'string' || separator instanceof String)) {
      throw new Error('Separator type is not a string');
    }

    if (separator.length !== 1) {
      throw new Error('Separator length must be equal to one character');
    }

    this._receiveSeparator = separator;
  }

  /**
   * Set string representing separator for data coming to the connected
   * device, end of line for example.
   * @param {string} separator - Send separator
   */
  setSendSeparator(separator) {
    if (!(typeof separator === 'string' || separator instanceof String)) {
      throw new Error('Separator type is not a string');
    }

    if (separator.length !== 1) {
      throw new Error('Separator length must be equal to one character');
    }

    this._sendSeparator = separator;
  }

  /**
   * Launch Bluetooth device chooser and connect to the selected device.
   * @return {Promise} Promise which will be fulfilled when notifications will
   *                   be started or rejected if something went wrong
   */
  connect() {
    return this._connectToDevice(this._device);
  }

  /**
   * Disconnect from the connected device.
   */
  disconnect() {
    this._disconnectFromDevice(this._device);

    if (this._characteristic) {
      this._characteristic.removeEventListener('characteristicvaluechanged',
          this._boundHandleCharacteristicValueChanged);
      this._characteristic = null;
    }

    this._device = null;
  }

    /**
   * Data receiving handler which called whenever the new data comes from
   * the connected device, override it to handle incoming data.
   * @param {string} data - Data
   */
    receivestatus(data) {
      console.log('receivestatus', data);
      // Handle incoming data.
    }
  /**
   * Data receiving handler which called whenever the new data comes from
   * the connected device, override it to handle incoming data.
   * @param {string} data - Data
   */
  receive(data) {
    console.log('Mensaje recibido del ESP32:', data);
    // Handle incoming data.
  }

  /**
   * Send data to the connected device.
   * @param {string} data - Data
   * @return {Promise} Promise which will be fulfilled when data will be sent or
   *                   rejected if something went wrong
   */
  send(data) {
    // Convert data to the string using global object.
    data = String(data || '');

    // Return rejected promise immediately if data is empty.
    if (!data) {
      return Promise.reject(new Error('Data must be not empty'));
    }

    data += this._sendSeparator;

    // Split data to chunks by max characteristic value length.
    const chunks = this.constructor._splitByLength(data,
        this._maxCharacteristicValueLength);

    // Return rejected promise immediately if there is no connected device.
    if (!this._characteristic) {
      return Promise.reject(new Error('There is no connected device'));
    }

    // Write first chunk to the characteristic immediately.
    let promise = this._writeToCharacteristic(this._characteristic, chunks[0]);

    // Iterate over chunks if there are more than one of it.
    for (let i = 1; i < chunks.length; i++) {
      // Chain new promise.
      promise = promise.then(() => new Promise((resolve, reject) => {
        // Reject promise if the device has been disconnected.
        if (!this._characteristic) {
          reject(new Error('Device has been disconnected'));
        }

        // Write chunk to the characteristic and resolve the promise.
        this._writeToCharacteristic(this._characteristic, chunks[i]).
            then(resolve).
            catch(reject);
      }));
    }
    console.log(data)
    return promise;
  }

  /**
   * Get the connected device name.
   * @return {string} Device name or empty string if not connected
   */
  getDeviceName() {
    if (!this._device) {
      return '';
    }

    return this._device.name;
  }

  /**
   * Connect to device.
   * @param {Object} device
   * @return {Promise}
   * @private
   */
  _connectToDevice(device) {
    return (device ? Promise.resolve(device) : this._requestBluetoothDevice()).
        then((device) => this._connectDeviceAndCacheCharacteristic(device)).
        then((characteristic) => this._startNotifications(characteristic)).
        catch((error) => {
          this._log("Error intentando conectar al dispositivo bluetooth")
          // this._log(error);
          return Promise.reject(error);
        });
  }

  /**
   * Disconnect from device.
   * @param {Object} device
   * @private
   */
  _disconnectFromDevice(device) {
    if (!device) {
      return;
    }

    this._log('Desconectando del dispositivo bluetooth"' + device.name + '" ...');

    device.removeEventListener('gattserverdisconnected',
        this._boundHandleDisconnection);

    if (!device.gatt.connected) {
      this._log('Dispositivo bluetooth ' + device.name +
          ' ya está desconectado.');
      return;
    }

    device.gatt.disconnect();

    this._log('Dispositivo bluetooth ' +  device.name + ' desconectado');
  }

  /**
   * Request bluetooth device.
   * @return {Promise}
   * @private
   */
  _requestBluetoothDevice() {
    this._log('Solicitando conexion a dispositivo bluetooth...');
  
    return navigator.bluetooth.requestDevice({
      filters: [{ name: 'ESP32' }],
      optionalServices: [
        '0000ffe0-0000-1000-8000-00805f9b34fb'  // UUID adicional
      ]
    }).
      then((device) => {
        this._log('Dispositivo bluetooth ' + device.name+' seleccionado');
  
        this._device = device; // Remember device.
        this._device.addEventListener('gattserverdisconnected',
          this._boundHandleDisconnection);
  
        return this._device;
      });
  }

  /**
   * Connect device and cache characteristic.
   * @param {Object} device
   * @return {Promise}
   * @private
   */
  _connectDeviceAndCacheCharacteristic(device) {
    // Check remembered characteristic.
    if (device.gatt.connected && this._characteristic) {
      return Promise.resolve(this._characteristic);
    }

    this._log('Conectando a dispositivo bluetooth '+ device.name+'....');

    return device.gatt.connect().
        then((server) => {
          this._log('Servidor GATT conectando', 'Obteniendo servicio...');

          return server.getPrimaryService(this._serviceUuid);
        }).
        then((service) => {
          this._log('Servicio encontrado', 'Obteniendo caracteristicas...');

          return service.getCharacteristic(this._characteristicUuid);
        }).
        then((characteristic) => {
          this._log('Caracteristicas encontradas');

          this._characteristic = characteristic; // Remember characteristic.

          return this._characteristic;
        });
  }

  /**
   * Start notifications.
   * @param {Object} characteristic
   * @return {Promise}
   * @private
   */
  _startNotifications(characteristic) {
    this._log('Estableciendo canal de mensajeria...');

    return characteristic.startNotifications().
        then(() => {
          this._log('Canal de mensajeria iniciado');
          this._log('Dispositivo bluetooth en linea..');
          showFormButton.removeAttribute('disabled');
          characteristic.addEventListener('characteristicvaluechanged',
              this._boundHandleCharacteristicValueChanged);
        });
  }

  /**
   * Stop notifications.
   * @param {Object} characteristic
   * @return {Promise}
   * @private
   */
  _stopNotifications(characteristic) {
    this._log('Deteniendo canal de mensajeria...');

    return characteristic.stopNotifications().
        then(() => {
          this._log('Canal de mensajeria detenido');

          characteristic.removeEventListener('characteristicvaluechanged',
              this._boundHandleCharacteristicValueChanged);
        });
  }

  /**
   * Handle disconnection.
   * @param {Object} event
   * @private
   */
  _handleDisconnection(event) {
    const device = event.target;
    const maxReconnectionAttempts = 3; // Establece el número máximo de intentos de reconexión
    let reconnectionAttempts = 0;

    this._log('Dispositivo bluetooth desconectado ' + device.name +
        ' intentando volver a conectar...');

    const tryReconnect = () => {
        reconnectionAttempts++;
        this._log(`Intento de reconexion ${reconnectionAttempts}`);
        showFormButton.setAttribute('disabled', 'true');
        if (reconnectionAttempts > maxReconnectionAttempts) {
           showFormButton.setAttribute('disabled', 'true');
            this._log(`Maximo de intentos de reconexion superado (${maxReconnectionAttempts}).De clic en conectar bluetooth`);
            return; // No intentar más conexiones
        }

        this._connectDeviceAndCacheCharacteristic(device)
            .then((characteristic) => this._startNotifications(characteristic))
            .catch((error) => {
                // this._log(error);
                showFormButton.setAttribute('disabled', 'true');
                this._log("No se puede realizar conexion con dispositivo bluetooth "+ device.name );
                 
                // Espera un tiempo antes de intentar la próxima reconexión (por ejemplo, 5 segundos)
                setTimeout(tryReconnect, 5000);
            });
    };

    // Inicia el primer intento de reconexión
    tryReconnect();
}


  /**
   * Handle characteristic value changed.
   * @param {Object} event
   * @private
   */
  // _handleCharacteristicValueChanged(event) {
  //   const value = new TextDecoder().decode(event.target.value);
  
  //   for (const c of value) {
  //     if (c === this._receiveSeparator) {
  //       const data = this._receiveBuffer.trim();
  //       this._receiveBuffer = '';
  
  //       if (data) {
  //         //const mensajeRecibido = `Mensaje recibido del ESP32: ${data}`;
  //         const mensajeRecibido = data;
  //         this.receive(mensajeRecibido);
  //       }
  //     } else {
  //       this._receiveBuffer += c;
  //     }
  //   }
  // }
  
  _handleCharacteristicValueChanged(event) {
    const value = new TextDecoder().decode(event.target.value);
  
    try {
      const jsonData = JSON.parse(value);
  
      if (jsonData.Newuser && jsonData.Newuser.username && jsonData.Newuser.password) {
        // Cargar los datos actuales de users.json desde localStorage
        const usersData = JSON.parse(localStorage.getItem('users.json')) || [];
  
        // Agregar el nuevo usuario al arreglo
        usersData.push({
          username: jsonData.Newuser.username,
          password: jsonData.Newuser.password
        });
  
        // Almacenar los datos actualizados de users.json en localStorage
        localStorage.setItem('users.json', JSON.stringify(usersData));
  
        // Realizar cualquier acción adicional que necesites
        this.receive('Nuevo usuario agregado: ' + jsonData.Newuser.username);
       
        this._log('Dispositivo bluetooth en linea..');
        
      } else if (jsonData.responseelectron && jsonData.responseelectron.status === "true" && jsonData.responseelectron.sendlora === "true") {
        // Si es un "responseelectron" con status "true" y sendlora "true", mostrar por consola
        this.receivestatus(true);
      } else {
        this.receivestatus(false);
      }
    } catch (error) {
      this.receive('Error al analizar el JSON: ' + error.message);
      this._log('Dispositivo bluetooth en linea..');
    }
  }
  
  

  /**
   * Write to characteristic.
   * @param {Object} characteristic
   * @param {string} data
   * @return {Promise}
   * @private
   */
  _writeToCharacteristic(characteristic, data) {
    return characteristic.writeValue(new TextEncoder().encode(data));
  }

  /**
   * Log.
   * @param {Array} messages
   * @private
   */
  _log(...messages) {
    console.log(...messages); // eslint-disable-line no-console
  }

  /**
   * Split by length.
   * @param {string} string
   * @param {number} length
   * @return {Array}
   * @private
   */
  static _splitByLength(string, length) {
    return string.match(new RegExp('(.|[\r\n]){1,' + length + '}', 'g'));
  }
}

// Export class as a module to support requiring.
/* istanbul ignore next */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = BluetoothTerminal;
}