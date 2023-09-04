#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>

#define BLE_NAME "ESP32"
#define SERVICE_UUID "0000ffe0-0000-1000-8000-00805f9b34fb"
#define CHARACTERISTIC_UUID "0000ffe1-0000-1000-8000-00805f9b34fb"

BLEServer *pServer;
BLECharacteristic *pCharacteristic;

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
        std::string value = pCharacteristic->getValue();

        if (value.length() > 0) {
            Serial.println("*********");
            Serial.print("Valor Recibido: ");
            for (int i = 0; i < value.length(); i++) {
                Serial.print(value[i]);
            }
            Serial.println();
            Serial.println("*********");

            // Aquí puedes procesar los datos recibidos.

            // Responde al dispositivo central (opcional).
            //pCharacteristic->setValue(value + "\n");
            //pCharacteristic->notify();
        }
    }
};

void setup() {
    Serial.begin(115200);

    Serial.println("1- Download and install a BLE scanner app on your phone");
    Serial.println("2- Scan for BLE devices in the app");
    Serial.println("3- Connect to MyESP32");
    Serial.println("4- Go to CUSTOM CHARACTERISTIC in CUSTOM SERVICE and write something");
    Serial.println("5- See the magic =)");

    BLEDevice::init(BLE_NAME);
    pServer = BLEDevice::createServer();
    BLEService *pService = pServer->createService(SERVICE_UUID);
    pCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_WRITE |
        BLECharacteristic::PROPERTY_NOTIFY
    );
    pCharacteristic->setCallbacks(new MyCallbacks());
    pCharacteristic->addDescriptor(new BLE2902());
    pService->start();
    BLEAdvertising *pAdvertising = pServer->getAdvertising();
    pAdvertising->start();
}

void loop() {
    // Aquí puedes realizar otras tareas si es necesario.
    // Por ejemplo, leer el puerto serial y enviar datos a través de BLE.
    if (Serial.available() > 0) {
        String data = Serial.readString();
        pCharacteristic->setValue(data.c_str());
        pCharacteristic->notify();
    }
    delay(2000);
}
