# Renk Hub Yeniden Tasarimi - Uc Modlu Mimari



## Bağlam

Mevcut Renk Hub'ı her öğe için ayrı ayrı AI önerisi sunuyor (Global Kararı / Bölge Kararı tabları). Kullanıcı bunu gereksiz buluyor. Bunun yerine 3 farklı renk modu butonuyla çalışan, önce genel değerlendirme sonra detaya inen bir yapı isteniyor.



## Hedef

Mevcut Global/Local tab yapısını kaldırıp 3 ana modla değiştirmek:

1. **AI Tam Palet** — AI tek tuşla tüm yüzeylere renk atar

2. **Algoritmik Denge** — AI'sız, 60/30/10 dağılımıyla proje paletini uygular (önce nötrleştir, sonra uygula)

3. **AI Metin Önerisi** — AI metinsel önerileri segment haritası üzerinden uygular (ince/radikal alt modlu)



---



## Faz 1: Temel Altyapı — Per-Segment BaseMode



### 1.1 State Genişletme

**Dosya:** `script.js` — `normalizeColorToolState()` (satır 13011)



`colorTool` objesine yeni alanlar ekle:

```js

activeColorMode: "none",       // "ai-palette" | "algorithmic" | "ai-text" | "none"

aiTextSubMode: "subtle",       // "subtle" | "radical"

perSegmentBaseMode: {},         // { [targetIndex]: "original"|"neutral" }

aiPaletteResult: null,          // cache

aiTextResult: null,             // cache

algorithmicSnapshot: null,      // cache
```

### 1.2 Pixel Loop Değişikliği (Anti-Aliasing ve Tolerans)

**Dosya:** `script.js` — `renderSegmentationOverlay()` (satır 13596-13630)

> [!IMPORTANT]
> **Anti-Aliasing Çözümü:** Segmentasyon resmi okunurken maske renklerinin kenarlarındaki yumuşatmalar (anti-aliasing) hesaba katılmalıdır. Hedef maske rengini ararken kesin eşleşme (`===`) yerine, ufak bir tolerans aralığı (örn. RGB Euclidean Distance < 20) kullanılmalıdır. Aksi halde maskelerin kenarlarındaki objeler boş kalır.

**Mevcut (satır 13612):**

```js
const source = applyBaseModeToRgb(originalSource, colorTool.baseMode || "original");
```

**Yeni:**

```js
const perSegBase = perSegBaseModes[tIdx] || globalBaseMode;
const source = applyBaseModeToRgb(originalSource, perSegBase);
```

Pre-loop cache bloğuna (satır 13578-13594) ekle:

```js
const globalBaseMode = colorTool.baseMode || "original";
const perSegBaseModes = {};
regions.forEach((region) => {
  const ti = region?.targetIndex;
  if (ti == null || ti < 0 || perSegBaseModes[ti] !== undefined) return;
  perSegBaseModes[ti] = colorTool.perSegmentBaseMode?.[String(ti)] || globalBaseMode;
});
```

### 1.3 drawAfterImage Koşulunu Güncelle

**Dosya:** `script.js` (satır 13563)

```js
const hasPerSegBaseChange = Object.values(colorTool.perSegmentBaseMode || {}).some(m => m !== "original");
const hasBaseModeChange = (colorTool.baseMode || "original") !== "original" || hasPerSegBaseChange;
```

### 1.4 Mod Bazlı Cache Yönetimi ve Fingerprint
Şu anki tek kanal cache yerine yapı tamamen ayrı ve izlenebilir (stale control) olmalıdır:
```js
hubEvaluations.color = {
  generalAssessment: { result: null, refs: {} },
  aiPalette: { result: null, refs: {} },
  aiText: {
    subtle: { result: null, refs: {} },
    radical: { result: null, refs: {} }
  }
}
```
**Fingerprint (refs) Mekanizması:**
Her cache kaydı için; `referenceRenderId`, `segmentationFingerprint` (segment sayısı vb) ve `projectPaletteFingerprint` tutulmalıdır.
*Neden:* Renk paleti veya kamera açısı (render) değiştiğinde eski AI sonuçlarının sahnede hortlamasını veya algoritmik/AI palette modlarının bayat (stale) bilgiyle çalışmasını kesin olarak engeller.

---

## Faz 2: Algoritmik Denge (AI'sız, Hemen Test Edilebilir)

### 2.1 Yeni Fonksiyon: `applyAlgorithmicBalance()`

**Dosya:** `script.js` — `applyColorAiAlternative()` fonksiyonunun yanına (satır ~12748)

Adımlar:
1. getColorSurfaceStats() → coverage'a göre sıralı yüzeyler
2. appState.globalColorPalette.colors → proje paleti (3-6 renk)
3. Tüm önceki kararları sıfırla: resetColorScope("all")
4. Global baseMode = "neutral" (tüm render nötrleşir)
5. Yüzey ataması:
   - surfaces[0] → palette[0], strength 0.78 (dominant, %60)
   - surfaces[1] → palette[1], strength 0.68 (ikincil, %30)
   - surfaces[2] → palette[2], strength 0.72 (vurgu, %10)
   - Geri kalanlar → palette renklerinin desatüre türevleri, strength 0.42
6. Her atama için setTargetColorDecision(targetIndex, { hex, strength, lightness: 0 })
7. Malzeme sınıfı zaten applyTargetColorBlend() içinde devreye giriyor (ahşap 0.58, metal 0.42 vs.)
8. State kaydet + overlay yeniden çiz

### 2.2 Yardımcı: `deriveNeutralFillColor(palette, index)`

Palette renklerinden desatüre türev üret: s-24, l+14 ile `shiftHslColor()` kullan.

### 2.3 Yüzey Uygunluk Filtresi (Eligibility)
Her segment 60/30/10 dağıtımına aday olmamalıdır. Bir `getColorEligibleSurfaces()` filtresi oluşturulmalı:
- **Dahil (Varsayılan):** Duvar, zemin, tavan, büyük paneller, dev/baskın sabit mobilyalar, büyük döşemeler.
- **Hariç (Atlanan):** Cam, metal profil, küçük dekorlar, kapı kolu, aksesuar, ekstra küçük segmentler.
*Neden:* Aksesuar gibi donanım bazlı veya çok minik objelerin alan hesaplarını bozmasının ve sistem vurgu (accent) rengini yanlişlikla minik bir kaba atamasının önüne geçer.

### 2.4 Algoritmik Dağıtım İçin Rol Tayini
Sadece pixel alanına göre oran atamak kritiktir bir hatadır (örneğin 3. büyük alan her zaman tavan olabilir ve tavan vurgu rengi olmamalıdır). Rol atama sırası:
1. **Dominant (%60):** En büyük uygun 'ana yüzey' (Zemin veya Duvar).
2. **Secondary (%30):** İkinci büyük uygun yüzey.
3. **Accent (%10):** En görünür ve uygun 'odak (focus)' kategorisi (Mobilya > Halı vb.). Alan hesabı kadar "Category" bilgisi ağırlıklı olmalı.
4. **Residual (Geri Kalan):** Ana renklerin desatüre alt türevleri (strength 0.42).

---

## Faz 3: AI Tam Palet

### 3.1 Yeni Prompt: `buildAiFullPalettePrompt()`

**Dosya:** `script.js` — `buildClientHubEvalPrompt()` yanına (satır ~11588)

Mevcut `buildClientHubEvalPrompt("color", ...)` yapısını dallandır:

```js
if (hubType === "color") {
  const mode = appState.colorTool?.activeColorMode;
  if (mode === "ai-palette") return buildAiFullPalettePrompt(stats, distribution, ...);
  if (mode === "ai-text") return buildAiTextPrompt(stats, subMode, ...);
  // ... mevcut prompt
}
```

**Prompt İçeriği:**
- Proje bağlamı (buildProjectContextDirective)
- Tüm yüzey listesi (coverage, material, category, currentHex)
- Proje paleti renkleri
- 60/30/10 dağılımı
- Tek seferde tüm yüzeylere renk ata
- JSON çıktı: `{ surfaceAssignments: [{ targetIndex, surfaceKey, surface, hex, strength, lightness, rationale }] }`

### 3.2 Uygulama: `applyAiFullPalette(result)`

Her `surfaceAssignment` için `setTargetColorDecision()` çağır. Cache'e yaz.

### 3.3 API

Mevcut `/api/hub-evaluate` endpoint'ini kullan — prompt zaten client-side oluşturuluyor.

---

## Faz 4: AI Metin Önerisi (İnce + Radikal)

### 4.1 Segment-Renk Haritası

`getSegmentationTargetsFromTakeoff()` (satır 9312) zaten her segment'e `SEGMENTATION_BASE_COLORS[index]` atıyor. Bu haritayı prompt'a ekle:

```
- targetIndex 0: "Duvar Boyası" (duvar) → #ff595e
- targetIndex 1: "Koltuk" (mobilya) → #2563eb
```

### 4.2 İnce Müdahale Promptu

- AI'dan küçük grade ayarları iste (h, s, l, temperature shift)
- Nötrleştirme YOK — doğrudan orijinal render'a uygulanır
- JSON: `{ subtleAdjustments: [{ targetIndex, surfaceKey, gradeShift: { h, s, l, temperature, contrast }, rationale }] }`
- Uygulama: `setTargetColorGrade(targetIndex, gradeShift)`

### 4.3 Radikal Öneri Promptu

- AI'dan cesur renk değişiklikleri iste (hex + strength)
- Etkilenen alanlar önce nötrleştirilir sonra yeni renk uygulanır
- JSON: `{ radicalAssignments: [{ targetIndex, surfaceKey, hex, strength, lightness, rationale }] }`
- Uygulama:
  1. `perSegmentBaseMode[targetIndex] = "neutral"` (sadece etkilenen segment)
  2. `setTargetColorDecision(targetIndex, { hex, strength, lightness })`
  3. AI'ın bahsetmediği segmentler dokunulmaz (baseMode = "original")

### 4.4 İsteğe Bağlı Ürün Spesifik (On-Demand) Analiz
> [!TIP]
> Kullanıcı "Genel Değerlendirme" dışına çıkmak istediğinde AI maliyetlerini düşürmek ve performansı artırmak için uygulanmalıdır.

- Özellik: Segmentasyon overlay'inde (veya listede) spesifik bir yüzeye/objeye (örn: Sadece "Koltuk") tıklandığında ekvatora "Özel Analiz İste" butonu gelir.
- Action: Sadece o `targetIndex` için API'ye istek atılır ve sadece o ürüne uygulanacak renk alternatifi veya ince metin uyarisi getirilir. AI tam paneli tetiklenmeden lokal çözüm sağlanır.

### 4.5 İnce vs Radikal Uygulama Politikası (Mekanik Çizgi)
Grafiksel/görsel davranışların net ayrışması için katı politikalar:
- **Subtle (İnce):** `perSegmentBaseMode` kesinlikle "original" kalır. Nötrleştirme yapılmaz. Başlıca araç `setTargetColorGrade()` (Işık/sıcaklık/kontrast kaydırma) olmalıdır. `targetColor` sadece mecbur kalınırsa çok çok düşük strength ile blend edilir.
- **Radical (Radikal):** YALNIZCA etkilenen segmentlerde `perSegmentBaseMode` = "neutral" yapılır (AI'nin dokunmadığı tüm alanlar tamamen "original" kalır). Başlıca eylem aracı `setTargetColorDecision()` (direkt rank ataması) olmalıdır. 

---

## Faz 5: UI Değişiklikleri

### 5.1 Mod Seçici — `renderColorQuickNav()` yerine `renderColorModeSelector()`

**Dosya:** `script.js` (satır 10186-10207)

3 ana buton:
- "AI Tam Palet" (`ai-palette`)
- "Algoritmik Denge" (`algorithmic`)
- "AI Metin Önerisi" (`ai-text`)

### 5.2 Mod-Spesifik Paneller

`renderColorTools()` (satır 10339) dallanır:
- `ai-palette` → `renderAiPalettePanel()` — sonuç yüzey kartları + "Yeniden Oluştur" butonu
- `algorithmic` → `renderAlgorithmicPanel()` — proje paleti + dağılım haritası + strength slider'ları
- `ai-text` → `renderAiTextPanel()` — alt mod toggle (İnce/Radikal) + "Öneri İste" butonu + sonuç kartları

### 5.3 Alt Mod Toggle (Faz 4 için)

İnce Müdahale / Radikal Öneri toggle butonları.

### 5.4 Event Handling

**Dosya:** `script.js` — `handleColorHubPanelClick()` (satır 14019)

Yeni data-attribute handler'ları:
- `[data-color-mode]` → `activateColorMode(mode)`
- `[data-ai-text-submode]` → aiTextSubMode değiştir + re-render
- `[data-regenerate]` → ilgili modu tekrar çalıştır

### 5.5 Mod Geçiş Orchestrator'u: `activateColorMode(mode)`

```
1. Önceki kararları sıfırla (resetColorScope + perSegmentBaseMode = {})
2. activeColorMode = mode
3. Eğer "algorithmic" → applyAlgorithmicBalance() (anında)
4. Eğer "ai-palette" → triggerAiFullPalette() (async)
5. Eğer "ai-text" → sadece UI göster, kullanıcı sub-mode seçip "Öneri İste" diyecek
```

### 5.6 Modlar Arası State Temizlik (Boundary) Prensipleri
Mod değiştiğinde hibrit (kırma) bir görselle veya bug'lı bir state ile karşılaşmamak için nelerin temizlenip nelerin korunacağı katı kurallara bağlanır:
- **TEMİZLENECEKLER:** `targetColors`, `targetGrades`, `perSegmentBaseMode`, `activeAiAlternativeId`. *(Açıklama: Mod değiştiği an eski uygulama görseli/dokusu sahnede KALMAMALI, tertemiz bir kanvas gösterilmelidir).*
- **KORUNACAKLAR:** AI cache sonuçları (fingerprint doğruysa), ui içerisinde seçili olan segment (click state'i), ve split view ayarları.

---

## Kritik Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `script.js:13011` | `normalizeColorToolState()` — yeni alanlar |
| `script.js:13578-13630` | Pixel loop — per-segment baseMode |
| `script.js:13563` | `drawAfterImage` koşulu |
| `script.js:10186-10207` | `renderColorQuickNav()` → `renderColorModeSelector()` |
| `script.js:10339` | `renderColorTools()` — mod dallanması |
| `script.js:11588-11641` | `buildClientHubEvalPrompt()` — yeni prompt dalları |
| `script.js:~12748` | Yeni fonksiyonlar: `applyAlgorithmicBalance()`, `applyAiFullPalette()` |
| `script.js:14019` | `handleColorHubPanelClick()` — yeni event handler'lar |
| `script.js:~13986` | `resetColorScope()` — yeni alanları temizle |
| `style.css` | Mod seçici butonlar, alt mod toggle CSS |

## Mevcut Yeniden Kullanılacak Fonksiyonlar

- `getColorSurfaceStats()` (12412) — yüzey coverage verileri
- `getColorDistributionSummary()` (12452) — 60/30/10 analizi
- `setTargetColorDecision()` (13075) — per-segment renk kararı
- `setTargetColorGrade()` (13068) — per-segment grade
- `applyBaseModeToRgb()` (13084) — nötrleştirme (**Revizyon Gereği:** Radikal renk değişimlerinde 3D algısını korumak için, burada RGB'den HSL'e dönüşüm yapılmalı; `L` -Luminance- değeri %100 KORUNMALI ve sadece `S` -Saturation- değeri sıfırlanmalıdır).
- `applyTargetColorBlend()` (13142) — malzeme-duyarlı renk blend (**Revizyon Gereği:** CSS'teki *Overlay* veya *Multiply* blend modlarının matematiği ile renk yedirilmeli, düz bir renk boyaması izlenimi vermemeli).
- `getMaterialNeutralizationStrength()` (13114) — malzeme sınıfı ağırlıkları
- `resetColorScope()` (13986) — karar sıfırlama
- `inferColorMaterialClass()` (13102) — malzeme tespit

- `buildProjectContextDirective()` — proje bağlamı

- `SEGMENTATION_BASE_COLORS` (45) — segment renk paleti

- `getSegmentationTargetsFromTakeoff()` (9312) — segment-takeoff mapping



## Doğrulama

1. Segmentasyon yap → Algoritmik Denge butonuna bas → render nötrleşip proje paletinde renklendirildiğini doğrula

2. AI Tam Palet butonuna bas → tüm yüzeylere tek seferde renk atandığını doğrula

3. AI Metin Önerisi > İnce Müdahale → küçük grade shift'lerin orijinal render'a uygulandığını doğrula

4. AI Metin Önerisi > Radikal Öneri → etkilenen segmentlerin nötrleşip yeni renklediğini, diğerlerinin değişmediğini doğrula

5. Modlar arası geçişte önceki kararların temizlendiğini doğrula

6. Split view'ın tüm modlarda çalıştığını doğrula

