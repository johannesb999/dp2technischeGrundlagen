#include "NetworkManager.h"

NetworkManager::NetworkManager() : mqttClient(espClient) {}

void NetworkManager::setup() {
    connectToWifi();
    setupOTA();
    initializeMqtt();
}

void NetworkManager::loop() {
    ArduinoOTA.handle();
    if (!mqttClient.connected()) {
        handleMqttReconnect();
    }
    mqttClient.loop();
}

PubSubClient& NetworkManager::getMqttClient() {
    return mqttClient;
}

void NetworkManager::connectToWifi() {
    WiFi.begin(ssid, password);
    Serial.print("Verbindung zu WiFi herstellen");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nVerbunden mit WiFi");
}

void NetworkManager::initializeMqtt() {
    mqttClient.setServer(mqtt_server, mqtt_port);
}

void NetworkManager::handleMqttReconnect() {
    while (!mqttClient.connected()) {
        Serial.print("Versuche, MQTT-Verbindung herzustellen...");
        String clientId = "ESP-" + String(random(0xffff), HEX);
        if (mqttClient.connect(clientId.c_str())) {
            Serial.println("verbunden");
        } else {
            Serial.print("Fehler, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" neuer Versuch in 5 Sekunden");
            delay(5000);
        }
    }
}

void NetworkManager::setupOTA() {
    ArduinoOTA.setHostname("MeinESP32");
    ArduinoOTA.begin();
}
