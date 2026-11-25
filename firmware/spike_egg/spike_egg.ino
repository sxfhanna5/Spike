/*
 * SPIKE · firmware of the egg
 * Board:   ESP32 DevKit (30 pins) · Bluetooth LE (Nordic UART service)
 * Ring:    12 × WS2812 (NeoPixel) on GPIO18
 * Buttons: ● yellow GPIO25 · ▲ blue GPIO26 · ■ purple GPIO27 · «?» white GPIO13   (to GND, internal pull-up)
 * No sound, no vibration, no light travelling around the ring. Max brightness 100/255, max 3 flashes per second.
 *
 * Libraries (Library Manager): "Adafruit NeoPixel". BLE comes with the ESP32 Arduino core.
 * Protocol: see PROTOCOLO.md.   Effects: effects.h (generated from src/egg/effects.json).
 */
#include <Adafruit_NeoPixel.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <math.h>
#include "effects.h"

/* ---------------------------------- pins ---------------------------------- */
#define PIN_RING 18
const uint8_t BTN_PIN[4] = {25, 26, 27, 13};
const char BTN_CODE[4] = {'1', '2', '3', 'Q'};   // ● ▲ ■ ?

/* ---------------------------------- BLE (Nordic UART) ---------------------------------- */
#define NUS_SERVICE "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define NUS_RX      "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"   // the app writes here
#define NUS_TX      "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"   // the egg notifies here
#define DEVICE_NAME "SPIKE-Huevo"
#define HEARTBEAT_MS 2000

Adafruit_NeoPixel ring(LED_COUNT, PIN_RING, NEO_GRB + NEO_KHZ800);
BLEServer* server = nullptr;
BLECharacteristic* txChar = nullptr;
volatile bool clientConnected = false;
bool wasConnected = false;

/* ---------------------------------- state ---------------------------------- */
int heat = 0;                       // 0..12 lit heat LEDs
int prevHeat = 0;                   // heat when the running effect started
uint32_t moduleColor = 0xFF8001;    // C:RRGGBB
uint8_t fx = FX_WAIT;               // running effect (FX_NONE = just the heat)
uint32_t fxStart = 0;
bool held = false;                  // HATCH keeps its last state until something new arrives
uint32_t pressAt = 0;               // local PRESS flash
bool pressing = false;
String rxLine;

struct Rgbf { float r, g, b; };
static inline float smooth(float x) { return x * x * (3.0f - 2.0f * x); }
static inline float bump(float u) { if (u <= 0.0f || u >= 1.0f) return 0.0f; float s = sinf(PI * u); return s * s; }
static inline float clamp01(float x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
static inline Rgbf unpack(uint32_t c) { return { ((c >> 16) & 255) / 255.0f, ((c >> 8) & 255) / 255.0f, (c & 255) / 255.0f }; }
static inline Rgbf mixc(Rgbf a, Rgbf b, float t) { return { a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t }; }

/** Same pseudo-random sequence as the simulator (render.ts) so both play identical sparkles. */
static uint32_t hashN(uint32_t n) {
  uint32_t x = (uint32_t)((uint64_t)n * 2654435761ULL);
  x ^= x >> 15;
  x = x * 2246822519UL;
  x ^= x >> 13;
  return x;
}

/** Heat colours: accent → orange → yellow. */
static Rgbf heatColor(int i) {
  if (i < 6) return mixc(unpack(0xFF4F1A), unpack(0xFF8001), i / 5.0f);
  return mixc(unpack(0xFF8001), unpack(0xFFE44C), (i - 6) / 5.0f);
}
static Rgbf colorOf(uint32_t c, int i) {
  if (c == COL_MODULE) return unpack(moduleColor);
  if (c == COL_HEAT) return heatColor(i);
  return unpack(c);
}
static bool inTarget(uint8_t t, int i) {
  switch (t) {
    case T_ALL: return true;
    case T_LIT: return i < heat;
    case T_UNLIT: return i >= heat;
    case T_NEW: return i >= prevHeat && i < heat;
  }
  return false;
}

/** Composes the ring: the heat is the base, the layers of the running effect go on top. */
static void compose(Rgbf* out, uint8_t effect, int32_t t, bool holdState) {
  for (int i = 0; i < LED_COUNT; i++) out[i] = {0, 0, 0};
  const Effect* def = effect == FX_NONE ? nullptr : &EFFECTS[effect];
  bool active = def && t >= 0 && (def->loop || t < def->dur);
  int32_t lt = (def && def->loop && t >= 0) ? t % def->dur : t;
  bool live = active || (def && def->holdAfter && holdState);

  float gain = 1.0f;
  bool hidden[LED_COUNT] = {false};
  if (active) {
    for (uint8_t k = 0; k < def->nLayers; k++) {
      const Layer& L = def->layers[k];
      if (L.kind == K_HEATGAIN) gain = L.a + (L.b - L.a) * smooth(clamp01((lt - L.start) / (float)L.dur));
      if (L.kind == K_SEQ) for (int i = 0; i < LED_COUNT; i++) hidden[i] = inTarget(L.target, i);
    }
  }
  if (!(def && def->replaceBase && active)) {
    for (int i = 0; i < LED_COUNT; i++) if (i < heat && !hidden[i]) { Rgbf h = heatColor(i); out[i] = {h.r * gain, h.g * gain, h.b * gain}; }
  }
  if (!live) return;

  int32_t tt = active ? lt : def->dur + 1;
  auto add = [&](int i, Rgbf c, float a) {
    a = clamp01(a);
    out[i].r += (c.r - out[i].r) * a; out[i].g += (c.g - out[i].g) * a; out[i].b += (c.b - out[i].b) * a;
  };
  for (uint8_t k = 0; k < def->nLayers; k++) {
    const Layer& L = def->layers[k];
    switch (L.kind) {
      case K_BREATHE: {
        if (tt < L.start || tt >= L.start + L.dur) break;
        float u = ((tt - L.start) % L.len) / (float)L.len;
        float a = L.a + (L.b - L.a) * (0.5f - 0.5f * cosf(2.0f * PI * u));
        for (int i = 0; i < LED_COUNT; i++) if (inTarget(L.target, i)) add(i, colorOf(L.color, i), a);
        break;
      }
      case K_PULSE: {
        float a = 0;
        for (uint8_t n = 0; n < L.nTimes; n++) {
          float peak = L.peaks[0] > 0 ? L.peaks[n] : L.a;
          float v = bump((tt - (int32_t)L.times[n]) / (float)L.len) * peak;
          if (v > a) a = v;
        }
        if (a > 0) for (int i = 0; i < LED_COUNT; i++) if (inTarget(L.target, i)) add(i, colorOf(L.color, i), a);
        break;
      }
      case K_FADE: {
        if (tt < L.start || tt > L.start + L.dur) break;
        float a = L.a + (L.b - L.a) * ((tt - L.start) / (float)L.dur);
        for (int i = 0; i < LED_COUNT; i++) if (inTarget(L.target, i)) add(i, colorOf(L.color, i), a);
        break;
      }
      case K_HOLD: {
        int32_t end = L.dur > 0 ? L.start + L.dur : 0x7FFFFFFF;
        if (tt < L.start || tt >= end) break;
        float a = L.a * (L.fadeIn ? smooth(clamp01((tt - L.start) / (float)L.fadeIn)) : 1.0f);
        for (int i = 0; i < LED_COUNT; i++) if (inTarget(L.target, i)) add(i, colorOf(L.color, i), a);
        break;
      }
      case K_SEQ: {      // new LEDs light one by one (never a travelling light: only the new ones)
        int n = 0;
        for (int i = 0; i < LED_COUNT; i++) {
          if (!inTarget(L.target, i)) continue;
          float a = clamp01((tt - L.start - n * (int32_t)L.step) / (float)L.len);
          if (a > 0) add(i, colorOf(L.color, i), smooth(a));
          n++;
        }
        break;
      }
      case K_SPARKLE: {  // soft random sparks, at most `rate` (≤ 3) per second
        if (tt < L.start || tt >= L.start + L.dur + L.life) break;
        float every = 1000.0f / L.b;
        int32_t n = (int32_t)((tt - L.start) / every);
        int32_t from = n - (int32_t)ceilf(L.life / every);
        if (from < 0) from = 0;
        for (int32_t s = from; s <= n; s++) {
          float born = L.start + s * every;
          if (born >= L.start + L.dur) break;
          float age = (tt - born) / (float)L.life;
          if (age < 0 || age > 1) continue;
          uint32_t h = hashN(s + 7);
          int led = h % LED_COUNT;
          if (!inTarget(L.target, led)) continue;
          add(led, colorOf(L.pal[(h >> 8) % L.nPal], led), bump(age) * L.a);
        }
        break;
      }
    }
  }
}

static void show(const Rgbf* px) {
  for (int i = 0; i < LED_COUNT; i++) {
    // 1.0 = full strip value; ring.setBrightness(MAX_BRIGHTNESS) is the hard ceiling (100/255)
    ring.setPixelColor(i, ring.Color((uint8_t)(clamp01(px[i].r) * 255), (uint8_t)(clamp01(px[i].g) * 255), (uint8_t)(clamp01(px[i].b) * 255)));
  }
  ring.show();
}

/* ---------------------------------- commands from the app ---------------------------------- */
static int fxIndex(const String& name) {
  for (int i = 0; i < FX_COUNT; i++) if (name.equals(EFFECTS[i].name)) return i;
  return -1;
}
static void playFx(uint8_t id) {
  prevHeat = heat;          // the LEDs added after this point are the "new" ones (OK effect)
  fx = id;
  fxStart = millis();
  held = false;
}
static void handleLine(String line) {
  line.trim();
  if (line.startsWith("H:")) {
    int n = line.substring(2).toInt();
    heat = n < 0 ? 0 : (n > LED_COUNT ? LED_COUNT : n);
    if (held && fx != FX_HATCH) held = false;
  } else if (line.startsWith("C:") && line.length() >= 8) {
    moduleColor = strtoul(line.substring(2, 8).c_str(), nullptr, 16);
  } else if (line.startsWith("FX:")) {
    int id = fxIndex(line.substring(3));
    if (id >= 0) playFx(id);
  }
}

class RxCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* c) override {
    std::string v = c->getValue();
    for (char ch : v) {
      if (ch == '\n') { handleLine(rxLine); rxLine = ""; }
      else if (rxLine.length() < 32) rxLine += ch;
    }
  }
};
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer*) override { clientConnected = true; }
  void onDisconnect(BLEServer*) override { clientConnected = false; }
};

static void notify(const char* msg) {
  if (!clientConnected || !txChar) return;
  txChar->setValue((uint8_t*)msg, strlen(msg));
  txChar->notify();
}

/* ---------------------------------- buttons ---------------------------------- */
static bool lastLevel[4] = {true, true, true, true};
static uint32_t changedAt[4] = {0, 0, 0, 0};
static void readButtons() {
  for (int i = 0; i < 4; i++) {
    bool level = digitalRead(BTN_PIN[i]);                 // LOW = pressed
    if (level != lastLevel[i] && millis() - changedAt[i] > 30) {   // 30 ms debounce
      changedAt[i] = millis();
      lastLevel[i] = level;
      if (!level) {
        char msg[5] = {'B', ':', BTN_CODE[i], '\n', 0};
        notify(msg);
        pressAt = millis();                               // local feedback, no round trip to the phone
        pressing = true;
      }
    }
  }
}

/* ---------------------------------- setup / loop ---------------------------------- */
void setup() {
  for (int i = 0; i < 4; i++) pinMode(BTN_PIN[i], INPUT_PULLUP);
  ring.begin();
  ring.setBrightness(MAX_BRIGHTNESS);   // hard ceiling: 100 of 255
  ring.clear();
  ring.show();

  BLEDevice::init(DEVICE_NAME);
  server = BLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());
  BLEService* service = server->createService(NUS_SERVICE);
  txChar = service->createCharacteristic(NUS_TX, BLECharacteristic::PROPERTY_NOTIFY);
  txChar->addDescriptor(new BLE2902());
  BLECharacteristic* rxChar = service->createCharacteristic(NUS_RX, BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR);
  rxChar->setCallbacks(new RxCallbacks());
  service->start();
  BLEAdvertising* adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(NUS_SERVICE);
  adv->setScanResponse(true);
  BLEDevice::startAdvertising();
}

void loop() {
  static uint32_t lastFrame = 0, lastHb = 0;
  uint32_t now = millis();

  // link state: without a phone the egg breathes in light blue (WAIT)
  if (clientConnected != wasConnected) {
    wasConnected = clientConnected;
    if (clientConnected) { fx = FX_NONE; held = false; }
    else { heat = 0; playFx(FX_WAIT); BLEDevice::startAdvertising(); }
  }
  if (!clientConnected && fx != FX_WAIT) playFx(FX_WAIT);

  readButtons();

  if (clientConnected && now - lastHb >= HEARTBEAT_MS) { lastHb = now; notify("HB\n"); }

  if (now - lastFrame >= 20) {   // 50 frames per second
    lastFrame = now;
    Rgbf px[LED_COUNT];
    int32_t t = (fx == FX_NONE) ? -1 : (int32_t)(now - fxStart);
    if (fx != FX_NONE && !EFFECTS[fx].loop && t >= EFFECTS[fx].dur) {
      if (EFFECTS[fx].holdAfter) held = true;
      else { fx = FX_NONE; t = -1; }
    }
    compose(px, fx, t, held);
    // local PRESS flash (30 %), laid over whatever is showing
    if (pressing) {
      int32_t pt = now - pressAt;
      if (pt >= EFFECTS[FX_PRESS].dur) pressing = false;
      else {
        Rgbf f[LED_COUNT];
        compose(f, FX_PRESS, pt, false);
        for (int i = 0; i < LED_COUNT; i++) { if (f[i].r > px[i].r) px[i].r = f[i].r; if (f[i].g > px[i].g) px[i].g = f[i].g; if (f[i].b > px[i].b) px[i].b = f[i].b; }
      }
    }
    show(px);
  }
}
