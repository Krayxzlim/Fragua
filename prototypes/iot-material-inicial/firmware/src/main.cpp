// FRAGUA lab: AI Thinker ESP32-CAM / OV3660, Arduino ESP32 2.0.17.
// No SD card: GPIO13 is PIR input, GPIO4 drives the onboard flash LED.
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_camera.h"
#if __has_include("secrets.h")
#include "secrets.h"
#else
#include "secrets.example.h"
#endif

constexpr int PIR_PIN = 13, LED_PIN = 4;
constexpr uint32_t WARMUP_MS = 60000, SETTLE_MS = 2500;
constexpr uint32_t GAP_MS = 700, COOLDOWN_MS = 5000;
enum class State { Warmup, Ready, Settling, Capturing, Rearm, Fault };
State state = State::Warmup;
uint32_t stateAt = 0, lastWifiAttempt = 0;
bool seenLow = false;
unsigned frameIndex = 0, sequence = 0;
String bootId, rollId;

void enter(State next) { state = next; stateAt = millis(); }

bool initCamera() {
  camera_config_t c = {};
  c.ledc_channel = LEDC_CHANNEL_0; c.ledc_timer = LEDC_TIMER_0;
  c.pin_d0 = 5; c.pin_d1 = 18; c.pin_d2 = 19; c.pin_d3 = 21;
  c.pin_d4 = 36; c.pin_d5 = 39; c.pin_d6 = 34; c.pin_d7 = 35;
  c.pin_xclk = 0; c.pin_pclk = 22; c.pin_vsync = 25; c.pin_href = 23;
  c.pin_sccb_sda = 26; c.pin_sccb_scl = 27;
  c.pin_pwdn = 32; c.pin_reset = -1; c.xclk_freq_hz = 20000000;
  c.pixel_format = PIXFORMAT_JPEG;
  c.frame_size = psramFound() ? FRAMESIZE_VGA : FRAMESIZE_QVGA;
  c.jpeg_quality = 12; c.fb_count = 1;
  c.fb_location = psramFound() ? CAMERA_FB_IN_PSRAM : CAMERA_FB_IN_DRAM;
  c.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  esp_err_t result = esp_camera_init(&c);
  Serial.printf("camera_init=0x%x psram=%d\n", result, psramFound());
  return result == ESP_OK;
}

void captureAndSend() {
  // Flush queued exposure. The light is OFF during capture to limit reflections.
  camera_fb_t *stale = esp_camera_fb_get();
  if (stale) esp_camera_fb_return(stale);
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) { Serial.println("capture_failed"); return; }
  Serial.printf("roll=%s frame=%u jpeg_bytes=%u\n", rollId.c_str(), frameIndex, unsigned(fb->len));
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    http.setConnectTimeout(3000); http.setTimeout(5000);
    // HTTP is only for an isolated trusted LAN. Production requires TLS.
    if (http.begin(client, API_URL)) {
      http.addHeader("Content-Type", "image/jpeg");
      http.addHeader("Authorization", String("Bearer ") + API_TOKEN);
      http.addHeader("X-Device-Id", DEVICE_ID);
      http.addHeader("X-Roll-Id", rollId);
      http.addHeader("X-Frame-Index", String(frameIndex));
      int status = http.POST(fb->buf, fb->len);
      Serial.printf("http=%d\n", status);
      if (status > 0) Serial.println(http.getString());
      http.end();
    }
  } else {
    Serial.println("offline_capture_discarded: no SD/offline queue");
  }
  // Always release the frame, even on network failure.
  esp_camera_fb_return(fb);
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT); digitalWrite(LED_PIN, LOW);
  pinMode(PIR_PIN, INPUT_PULLDOWN);
  bootId = String(esp_random(), HEX) + String(esp_random(), HEX);
  if (!initCamera()) { enter(State::Fault); return; }
  WiFi.mode(WIFI_STA); WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lastWifiAttempt = millis();
  Serial.println("PIR warmup 60s; then LOW required. Serial 'c' = manual capture.");
  enter(State::Warmup);
}

void loop() {
  if (state == State::Fault) { delay(100); return; }
  const uint32_t now = millis();
  if (WiFi.status() != WL_CONNECTED && now - lastWifiAttempt >= 15000) {
    WiFi.reconnect(); lastWifiAttempt = now;
  }
  const bool high = digitalRead(PIR_PIN) == HIGH;
  const bool manual = Serial.available() && Serial.read() == 'c';
  switch (state) {
    case State::Warmup:
      if (now - stateAt >= WARMUP_MS) { seenLow = false; enter(State::Ready); }
      break;
    case State::Ready:
      if (!high) seenLow = true;
      if (manual || (seenLow && high)) {
        rollId = bootId + "-" + String(++sequence); frameIndex = 0;
        Serial.printf("trigger=%s roll=%s\n", manual ? "manual" : "PIR", rollId.c_str());
        digitalWrite(LED_PIN, HIGH); enter(State::Settling);
      }
      break;
    case State::Settling:
      // Visible 80ms pulse proves actuator command, not its physical operation.
      if (now - stateAt >= 80) digitalWrite(LED_PIN, LOW);
      if (now - stateAt >= SETTLE_MS) enter(State::Capturing);
      break;
    case State::Capturing:
      if (frameIndex == 0 || now - stateAt >= GAP_MS) {
        captureAndSend(); ++frameIndex; stateAt = millis();
        if (frameIndex == 3) enter(State::Rearm);
      }
      break;
    case State::Rearm:
      // Requires LOW after capture; prevents repeated rolls while PIR stays HIGH.
      if (!high && now - stateAt >= COOLDOWN_MS) {
        seenLow = false; enter(State::Ready); Serial.println("ready");
      }
      break;
    default: break;
  }
  delay(5);
}
