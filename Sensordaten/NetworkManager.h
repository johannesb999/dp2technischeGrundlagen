#ifndef NETWORKMANAGER_H
#define NETWORKMANAGER_H

#include <WiFi.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <ArduinoOTA.h>
#include "config.h"

class NetworkManager {
public:
    NetworkManager();
    void setup();
    void loop();
    PubSubClient& getMqttClient();

private:
    WiFiClient espClient;
    PubSubClient mqttClient;
    void connectToWifi();
    void initializeMqtt();
    void handleMqttReconnect();
    void setupOTA();
};

#endif // NETWORKMANAGER_H
