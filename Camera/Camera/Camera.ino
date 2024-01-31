#include "WiFi.h"
#include "esp_camera.h"
#include "Arduino.h"
#include "soc/soc.h"           // Disable brownout problems
#include "soc/rtc_cntl_reg.h"  // Disable brownout problems
#include "driver/rtc_io.h"
#include <SPIFFS.h>
#include <FS.h>
// #include <WiFiManager.h>
#include <Base64.h>
// Provide the token generation process info.
#include "config.h"
#include <HTTPClient.h>
#include <WebSocketsClient.h>


WiFiClient espClient;
unsigned long startTime;

// Stellen Sie sicher, dass diese Werte korrekt sind
const char* masterSSID = "PlantappMaster";
const char* masterPassword = "12345678";

uint32_t lastPictureForAutoExposure = 0;
uint16_t numCorrectionFrames = 0;
bool takePicture = false;

void checkAndReconnectWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi-Verbindung verloren. Versuche, mit dem master-WLAN zu verbinden...");

    int maxReconnectAttempts = 20; // Maximale Anzahl von Verbindungsversuchen
    int reconnectAttempts = 0; // Zähler für aktuelle Versuche

    while (WiFi.status() != WL_CONNECTED && reconnectAttempts < maxReconnectAttempts) {
      WiFi.begin(masterSSID, masterPassword);
      
      unsigned long startAttemptTime = millis();

      while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 5000) {
        delay(200);
        Serial.print(".");
      }

      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nVerbunden mit master-WiFi.");
        return; // Verbindung erfolgreich, verlasse die Funktion
      } else {
        Serial.println("\nVersuch fehlgeschlagen, wiederhole...");
        Serial.println( masterSSID);
        reconnectAttempts++;
      }
    }

    if (reconnectAttempts >= maxReconnectAttempts) {
      Serial.println("Maximale Anzahl von Verbindungsversuchen erreicht. Neustart...");
      reconnectAttempts = 0;
      delay(5000);
      ESP.restart(); // Neustart des ESP, da alle Verbindungsversuche fehlgeschlagen sind
    }
  }
}




WebSocketsClient webSocket;

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  if (type == WStype_TEXT) {
    String receivedData = String((char*)payload);
    Serial.println("Empfangene Daten: " + receivedData);

    // Trennen der empfangenen Daten in SSID und Passwort
    int ssidStart = receivedData.indexOf("SSID:") + 5;
    int pwdStart = receivedData.indexOf(";PW:") + 4;

    String ssid = receivedData.substring(ssidStart, receivedData.indexOf(";", ssidStart));
    String password = receivedData.substring(pwdStart, receivedData.length());

    // Verwenden der Credentials, um sich mit dem WLAN zu verbinden
    WiFi.begin(ssid.c_str(), password.c_str());

    // Warten auf Verbindung
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }


    Serial.println("\nVerbunden mit WiFi");
    Serial.print("SSID: ");
    Serial.println(WiFi.SSID());
  }
}



void initCamera() {
  // OV2640 camera module
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_VGA;
    config.jpeg_quality = 15;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;  // turn quality down al the way
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }
  // Camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    ESP.restart();
  }
}

void setup() {
  startTime = millis();
  // Serial port for debugging purposes
  Serial.begin(115200);
  // initWiFi();

  // Konfigurieren des WebSocket-Clients
  webSocket.begin("192.168.4.1", 81, "/");  // Ersetzen Sie "server_ip" mit der IP-Adresse des WebSocket-Servers
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);  // Automatisches Neuverbinden alle 5 Sekunden

  // Turn-off the 'brownout detector'
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  initCamera();

  sensor_t* s = esp_camera_sensor_get();
  s->set_vflip(s, -1);
  s->set_gain_ctrl(s, 1);      // auto gain on
  s->set_exposure_ctrl(s, 1);  // auto exposure on
  s->set_awb_gain(s, 1);       // Auto White Balance enable (0 or 1)
  s->set_brightness(s, -4);
}

void loop() {

  // Pflege des WebSocket-Clients
  if (millis() - startTime < 240000) {
    webSocket.loop();
  }
  checkAndReconnectWiFi();

  // Überprüfen Sie, ob es Zeit ist, ein Bild zu nehmen und zu senden
  if (millis() % 10000 == 0) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Kameraaufnahme fehlgeschlagen");
      return;
    }

    delay(20000);

    // HTTP-Client initialisieren
    HTTPClient http;
    http.begin(API_URL);  // Setzen Sie Ihre Ziel-URL hier
    http.addHeader("Content-Type", "image/jpeg");

    // Senden des Bildes
    int httpResponseCode = http.POST(fb->buf, fb->len);

    if (httpResponseCode > 0) {
      // Erfolgreiche Übertragung
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      // Fehlerhafte Übertragung
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }

    // Schließen der Verbindung
    http.end();
    esp_camera_fb_return(fb);
    delay(100);
  }
}
