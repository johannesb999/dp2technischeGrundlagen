#include "WiFi.h"
#include "esp_camera.h"
#include "Arduino.h"
#include "soc/soc.h"           // Disable brownout problems
#include "soc/rtc_cntl_reg.h"  // Disable brownout problems
#include "driver/rtc_io.h"
#include <SPIFFS.h>
#include <FS.h>
#include <WiFiManager.h>
#include <Base64.h>
// Provide the token generation process info.
#include "config.h"
#include <HTTPClient.h>


WiFiClient espClient;


uint32_t lastPictureForAutoExposure = 0;

uint16_t numCorrectionFrames = 0;

bool takePicture = false;

void initWiFi() {
  WiFiManager wifiManager;
  // wifiManager.resetSettings();
  bool connected = wifiManager.autoConnect("AutoConnectAP");
  Serial.println("Connected to WiFi.");
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
    config.frame_size = FRAMESIZE_VGA;  // we dont need much quality
    config.jpeg_quality = 10;
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
  // Serial port for debugging purposes
  Serial.begin(115200);
  initWiFi();

  // Turn-off the 'brownout detector'
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  initCamera();

  sensor_t* s = esp_camera_sensor_get();
  s->set_vflip(s, -1);
  s->set_gain_ctrl(s, 1);      // auto gain on
  s->set_exposure_ctrl(s, 1);  // auto exposure on
  s->set_awb_gain(s, 1);       // Auto White Balance enable (0 or 1)
  s->set_brightness(s, -2);
}

void loop() {
  // Überprüfen Sie, ob es Zeit ist, ein Bild zu nehmen und zu senden
  if (millis() % 10000 == 0) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Kameraaufnahme fehlgeschlagen");
      return;
    }

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
