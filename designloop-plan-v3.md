# DesignLoop Dönüşüm Planı v3
## Render-Merkezli → Segmentasyon + Metin Tabanlı Hub Mimarisi

---

## Mevcut Planların Değerlendirmesi

İki mevcut plan arasında bazı çelişkiler ve pratik sorunlar var. Bunları çözerek tek bir uygulanabilir plan oluşturuyorum.

### Plan 1'in (script.js odaklı) sorunları
- "Ayrı js/segmentation.js dosyası açma, tüm mantık script.js içinde kalsın" demesi **yanlış**. script.js zaten büyük; 500 satırlık segmentasyon motoru + 400 satırlık metin modülleri eklenince dosya yönetilemez hale gelir.
- Segmentasyon kontratını "JSON polygon" olarak tanımlıyor ama nasıl üretileceğini belirsiz bırakıyor.

### Plan 2'nin (8 fazlı) sorunları
- "AI materialID mask üretir → client-side vektörleştirme" pipeline'ı çok kırılgan. AI'dan gelen mask'ı canvas'a çizip flood-fill ile polygon çıkarmak pratikte çok hatalı sonuç verir: kenar bulanıklığı, anti-aliasing, renk karışması. Mask-to-polygon dönüşümü tek başına 300+ satır edge-case kodu demek.
- 8 faz çok fazla. Her faz arası entegrasyon noktası = her faz arası kırılma riski. Daha az ama daha bütün fazlar lazım.
- `js/segmentation.js` ve `js/text-modules.js` ayrı dosyalar önerilmiş ama mevcut yapı `script.js` monoliti. Ya tamamen modüler geç, ya hiç geçme — yarı yarıya en kötüsü.
- npm run dev referansı var ama Plan 1 açıkça "npm run dev yok, npm start kullan" diyor. Test planı çelişkili.
- Verification plan'da "browser subagent ile test" var ama bunun pratikte nasıl çalışacağı belirsiz.

### Her iki plandaki ortak sorun
- Segmentasyon'un "bir kez üretilir, sonra tüm hub'larda kullanılır" varsayımı doğru ama **segmentasyonun kalitesi düşükse tüm hub'lar çöker**. Fallback stratejisi yüzeysel.
- Canvas üzerinde 4 farklı hub'ın aynı sahneyi kullanması durumunda state senkronizasyonu tanımlanmamış.
- Rapor fazı "mevcut korunur + genişletilir" diyor ama mevcut rapor yapısı alternatif-merkezli; hub-merkezli veriyle uyumsuz.

---

## Yeni Plan: Temel Kararlar

### Segmentasyon Stratejisi: AI JSON-First, Mask Yok

AI'dan **doğrudan JSON polygon koordinatları** iste, mask image üretme. Neden:
- JSON polygon → SVG path dönüşümü trivial (5 satır kod)
- Mask → polygon dönüşümü karmaşık ve kırılgan (300+ satır + edge case'ler)
- JSON üzerinde düzeltme kolay (kullanıcı polygon noktalarını sürükleyebilir)
- Mask üzerinde düzeltme zor (piksel bazlı editing gerekir)
- JSON daha küçük (KB vs MB), daha hızlı transfer

AI'a gönderilecek prompt: referans render + analiz adımından gelen malzeme/yüzey listesi. AI'dan istenen: her tespit edilen bölge için polygon koordinatları (normalize 0-1 aralığında), label, materialId, confidence.

Fallback: AI polygon kalitesi düşükse veya başarısızsa, kullanıcıya basit polygon çizim aracı. Bu araç lasso/point-click ile çalışır, kullanıcı bölge çizer ve label atar.

### Dosya Yapısı: Modüler Ama Kontrollü

script.js monolitini korumak gerçekçi değil. Ama tam modüler geçiş de bu fazda riskli. Orta yol:

```
script.js          → ana orkestrasyon, step yönetimi, mevcut core logic
js/segmentation.js → segmentasyon motoru (AI iletişim + canvas + etkileşim)  
js/hub-engine.js   → hub'ların ortak davranışları (karar kayıt, panel render, state sync)
js/text-ai.js      → metin tabanlı AI modülleri (eleştiri, çeviri, checklist)
js/state.js        → mevcut (genişletilecek)
js/api.js          → mevcut (genişletilecek)
js/cost-engine.js  → mevcut (minor adaptasyon)
```

Kural: yeni dosyalar script.js'i import etmez, script.js onları çağırır. Bağımlılık tek yönlü.

### Faz Sayısı: 8 Değil, 4

Her faz kendi içinde test edilebilir ve bağımsız değer üretir:

```
Faz 1: Altyapı         → Segmentasyon + hub navigation + state modeli
Faz 2: Renk + Malzeme   → İlk iki hub (en somut, en test edilebilir)
Faz 3: Aydınlatma + Mobilya + Tasarım → Kalan hub'lar
Faz 4: Rapor + Premium   → Çıktı katmanı
```

---

## Veri Modeli

### State Genişletmesi (js/state.js)

```javascript
// Mevcut state'e eklenenler:

segmentation: {
  status: 'idle' | 'loading' | 'ready' | 'failed' | 'manual',
  regions: [
    {
      id: string,              // "region-01"
      label: string,           // "Tavan", "Zemin", "Duvar-Sol"
      materialId: string,      // "ceiling-plaster", "floor-laminate"
      polygonPoints: [[x,y]],  // normalize 0-1
      detectedCategory: string,// "ceiling", "floor", "wall", "furniture"
      detectedMaterial: string, // "sıva boya", "laminat parke"
      confidence: number,      // 0-1
      // Hub kararları — her hub kendi alanını yazar
      colorAdjustments: { h: 0, s: 0, l: 0 } | null,
      materialDecision: { selected: string, costImpact: number } | null,
      lightingDecision: { layers: [], notes: string } | null,
      furnitureDecision: { action: string, notes: string } | null,
    }
  ],
  sceneSummary: { notes: string, warnings: string[] }
},

// Her hub kararı iki yere yazılır:
// 1. İlgili region'ın içine (yukarıda)
// 2. Kronolojik karar günlüğüne (aşağıda)

decisionLog: [
  {
    timestamp: ISO string,
    hub: 'color' | 'material' | 'lighting' | 'furniture' | 'design',
    regionId: string | null,    // null = genel karar
    action: string,             // "Tavan rengi 2 ton koyulaştırıldı"
    details: object             // hub-specific veri
  }
],

// Brief ve strateji (Step 3 - Tasarım Hub)
designBrief: {
  approach: string | null,
  primaryProblem: string | null,
  atmosphere: string | null,
  budgetTone: string | null,
  interventionLevel: string | null,
  customNotes: string | null,
  strategy: {
    priorities: string[],
    successCriteria: string | null,
    clientSensitivities: string | null,
  }
},

// Rapor taslağı
reportDraft: {
  selectedSections: string[],
  tone: string,
  clientLanguageEnabled: boolean,
  premiumRenderRequested: boolean,
  premiumRenderPrompt: string | null,
  generatedSummary: string | null,
}
```

### Kritik tasarım kararı: region-centric state

Tüm hub kararları region nesnesinin içinde yaşar. Bu şu anlama gelir:
- Renk hub'ı `region.colorAdjustments` yazar
- Malzeme hub'ı `region.materialDecision` yazar
- Rapor tüm region'ları iterate edip kararları toplar
- Bir region silindiğinde ona bağlı tüm kararlar da gider
- Hub'lar arası veri aktarımı region üzerinden dolaylı olur (renk kararı → malzeme filtreleme: malzeme hub region'ın colorAdjustments'ına bakar)

---

## API Kontratı

### POST /api/segment

```javascript
// Request
{
  referenceImageBase64: string,  // veya referenceImageUrl
  analysisContext: {
    detectedMaterials: string[], // analiz adımından gelen malzeme listesi
    roomType: string,            // "ofis", "konut-salon", "lobi"
    quantityTakeoff: object      // mevcut metraj verisi (opsiyonel, zenginleştirme için)
  }
}

// Response — başarılı
{
  success: true,
  regions: [
    {
      id: "region-01",
      label: "Tavan",
      materialId: "ceiling-plaster",
      polygonPoints: [[0.0, 0.0], [1.0, 0.0], [1.0, 0.25], [0.0, 0.25]],
      detectedCategory: "ceiling",
      detectedMaterial: "sıva boya, beyaz",
      confidence: 0.85
    },
    // ...
  ],
  sceneSummary: {
    notes: "5 ana bölge tespit edildi. Zemin ve tavan yüksek güvenle, mobilya bölgeleri orta güvenle.",
    warnings: ["Sol duvar kısmen mobilya tarafından kapatılmış, polygon yaklaşık"]
  }
}

// Response — başarısız / düşük kalite
{
  success: false,
  fallbackReason: "Görsel kalitesi yetersiz / bölgeler ayırt edilemiyor",
  partialRegions: [...] // varsa kısmi sonuç
}
```

### AI Prompt Stratejisi (segmentasyon için)

```
Bu iç mekan görselini analiz et.

Daha önce yapılan analizde şu malzemeler/yüzeyler tespit edildi:
{detectedMaterials listesi}

Görseldeki her ana yüzeyi/bölgeyi tanımla ve her biri için:
1. Bölge adı (Türkçe: Tavan, Zemin, Duvar-Sol, Duvar-Sağ, vb.)
2. materialId (İngilizce, kebab-case: ceiling-plaster, floor-laminate)
3. Tespit edilen malzeme açıklaması
4. Bölgenin sınırlarını tanımlayan polygon koordinatları 
   (görselin sol-üst köşesi 0,0 — sağ-alt köşesi 1,1 normalize koordinat sistemi)
   (her bölge için en az 4, en fazla 12 köşe noktası ver)
5. Tespit güven seviyesi (0-1)

Mobilya ve dekoratif objeleri de ayrı bölge olarak işaretle.

JSON formatında döndür, başka metin ekleme.
```

Bu prompt'un güçlü yanı: analiz adımından gelen malzeme listesiyle AI'ı yönlendiriyoruz, sıfırdan tespit ettirmiyoruz. Bu güvenilirliği artırır.

---

## Faz Detayları

### Faz 1: Altyapı (Segmentasyon + Hub Navigation + State)

**Hedef:** 8 step'li navigation çalışır, segmentasyon API'si bağlanır, canvas üzerinde bölgeler tıklanabilir, hub shell (sol canvas + sağ panel) render olur. Henüz hub içerikleri boş.

#### index.html değişiklikleri

Mevcut step-4 (Tasarım/Alternatif Explorer) ve step-5 (Render) section'ları kaldırılır.

Yeni step yapısı:
```
step-1: Kurulum (mevcut, korunur)
step-2: Analiz (mevcut + segmentasyon tetikleyici eklenir)
step-3: Tasarım (brief + strateji — mevcut hedef step'inden genişler)
step-4: Renk (YENİ — hub layout)
step-5: Malzeme (YENİ — hub layout)
step-6: Aydınlatma (YENİ — hub layout)
step-7: Mobilya (YENİ — hub layout)
step-8: Rapor (mevcut rapor genişletilir)
```

Her hub section'ın ortak HTML iskelet yapısı:
```html
<section id="step-N" class="step-section">
  <div class="section-heading">...</div>
  <div class="hub-shell">
    <div class="hub-canvas-area">
      <!-- Referans render + SVG overlay — TÜM HUB'LARDA AYNI -->
      <div class="hub-canvas-container">
        <img class="hub-reference-image" />
        <svg class="hub-segmentation-overlay"></svg>
      </div>
      <!-- Canvas altı: seçili bölge bilgisi -->
      <div class="hub-selection-info"></div>
    </div>
    <div class="hub-panel-area">
      <!-- Hub'a özel içerik buraya gelir -->
    </div>
  </div>
</section>
```

**Önemli karar: Canvas değil SVG.** Canvas yerine SVG overlay kullan. Nedenleri:
- SVG path'leri CSS ile stillenebilir (hover, selected, focus)
- SVG elementleri DOM'da var, event listener atamak trivial
- Responsive: viewBox ile otomatik ölçeklenir
- Canvas'ta her değişiklikte redraw gerekir, SVG'de class toggle yeterli
- Polygon düzenleme (fallback'te) SVG'de çok daha kolay
- Erişilebilirlik: SVG elementlerine aria-label atanabilir

SVG overlay mantığı:
```html
<svg viewBox="0 0 1 1" preserveAspectRatio="none" class="hub-segmentation-overlay">
  <!-- Her bölge bir path -->
  <path d="M0,0 L1,0 L1,0.25 L0,0.25 Z" 
        data-region-id="region-01"
        class="seg-region" />
  <!-- Hover ve seçim CSS ile -->
</svg>
```

```css
.seg-region {
  fill: transparent;
  stroke: transparent;
  cursor: pointer;
  transition: fill 0.15s;
}
.seg-region:hover {
  fill: rgba(var(--hub-color-rgb), 0.15);
  stroke: rgba(var(--hub-color-rgb), 0.6);
}
.seg-region.selected {
  fill: rgba(var(--hub-color-rgb), 0.2);
  stroke: rgba(var(--hub-color-rgb), 0.8);
  stroke-width: 0.003;
}
```

Her hub farklı `--hub-color-rgb` tanımlar: renk hub'ı mor, malzeme hub'ı teal, aydınlatma hub'ı amber, mobilya hub'ı blue.

#### js/segmentation.js — yeni dosya (~350 satır)

Sorumlulukları:
1. Segmentasyon API çağrısı ve response parse
2. SVG overlay oluşturma (polygon → SVG path dönüşümü)
3. Bölge etkileşim yönetimi (hover, select, deselect)
4. Fallback polygon çizim aracı
5. Renk overlay (HSL manipulation — Renk hub'ı için)

```javascript
// Temel API
export function requestSegmentation(imageData, analysisContext) → Promise<SegmentationResult>
export function renderSegmentationOverlay(svgElement, regions) → void
export function setupRegionInteraction(svgElement, onSelect, onHover) → void
export function applyColorOverlay(svgElement, regionId, hslAdjustments) → void
export function startManualPolygonDraw(svgElement, onComplete) → void
export function getRegionAtPoint(svgElement, normalizedX, normalizedY) → Region|null
```

Renk overlay mantığı (client-side, bedava):
- SVG path'in fill'ini HSL değerleriyle manipüle et
- Orijinal bölge rengi analiz adımında AI tarafından tahmin edilmiş
- Kullanıcı slider kaydırdığında: `fill: hsla(origH + deltaH, origS + deltaS%, origL + deltaL%, 0.6)`
- Bu tam doğru bir renk simülasyonu değil, ama "yön" göstermeye yeter
- Kullanıcıya açıkça söyle: "Bu renk önizlemesi yaklaşıktır, kesin renk numune ile belirlenir"

#### js/hub-engine.js — yeni dosya (~250 satır)

Hub'ların ortak davranışları:
```javascript
export function initHub(stepNumber, hubConfig) → void
export function getSelectedRegion() → Region|null
export function recordDecision(hub, regionId, action, details) → void
export function getDecisionsForRegion(regionId) → Decision[]
export function getDecisionsForHub(hub) → Decision[]
export function renderDecisionLog(containerEl, filter?) → void
export function syncRegionStateToUI(region) → void
```

`recordDecision` hem region nesnesine hem decisionLog'a yazar. Tek kaynak, iki görünüm.

#### script.js değişiklikleri

- `NAV_ITEMS` → 8 step
- `STEP_BAND_CONTENT` → 8 step
- `showStep()` → hub step'lerine geçişte segmentasyon overlay'ini güncelle
- Kaldırılacaklar: `renderAlternatives()`, `renderExplorerDetail()`, `renderExplorerGrid()`, `renderStoryboardPanel()`, `handleGenerateAlternatives()` ve ilişkili tüm alternatif explorer fonksiyonları
- Step kilit mantığı güncellenir: Step 4-7 (hub'lar) ancak segmentasyon hazırsa açılır (veya fallback tamamlanmışsa)

#### style.css değişiklikleri

```css
/* Hub ortak shell */
.hub-shell {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  min-height: 500px;
}

/* Mobil: tek kolon, canvas üstte */
@media (max-width: 900px) {
  .hub-shell {
    grid-template-columns: 1fr;
  }
}

.hub-canvas-area {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-secondary);
}

.hub-reference-image {
  width: 100%;
  display: block;
}

.hub-segmentation-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: all;
}

.hub-panel-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: 600px;
}
```

#### Faz 1 test kriterleri

- [ ] 8 step navigation çalışır, step geçişleri sorunsuz
- [ ] Analiz step'inde "Segmentasyon hazırla" butonu görünür
- [ ] Buton tıklandığında /api/segment çağrılır
- [ ] Başarılı response'ta SVG overlay render olur
- [ ] Bölgeler hover'da highlight olur
- [ ] Bölge tıklandığında selection state güncellenir
- [ ] API başarısızsa fallback polygon çizim aracı açılır
- [ ] Hub step'lerine geçişte aynı overlay görünür
- [ ] Hub panel alanı boş ama mevcut (placeholder mesaj)
- [ ] Mevcut Kurulum ve Analiz adımları bozulmamış
- [ ] Maliyet drawer'ı hâlâ erişilebilir
- [ ] localStorage state yeni modelle tutarlı

---

### Faz 2: Renk Hub'ı + Malzeme Hub'ı

**Hedef:** İlk iki hub tam çalışır. Bu faz end-to-end test noktası — segmentasyondan karar kaydına kadar tüm akış doğrulanır.

#### Step 4: Renk Hub'ı

**Sol panel (canvas alanı):**
- Referans render + segmentasyon overlay
- Bölge tıklama → seçim
- Seçili bölge üzerinde renk overlay (HSL slider'larla anlık)
- "Tüm değişiklikleri göster" toggle: tüm bölgelerdeki renk kararlarını aynı anda overlay et
- "Orijinale dön" butonu: tüm overlay'leri temizle

**Sağ panel (AI + kontroller):**

Bölge seçilmeden önce:
```
"Sol tarafta bir bölge seçin. 
 Seçtiğiniz bölge için renk önerileri ve kontroller burada görünecek."
```

Bölge seçildikten sonra:
1. **Seçili bölge bilgisi**: label, tespit edilen malzeme, mevcut renk tahmini
2. **HSL slider'lar**: Hue / Saturation / Lightness — her biri -50 ile +50 arasında delta
3. **AI palet önerileri**: 3-4 hazır palet seti (button olarak, tıkla → uygula)
   - "Sıcak nötr" / "Soğuk kurumsal" / "Doğal toprak" / "Mevcut koru"
   - Her palet seti tüm bölgeler için önerilen renk yönlerini içerir
4. **AI metin yorumu**: bölge-spesifik öneri
   - "Bu tavan beyaz sıva. Yarım ton krem yönüne kaymak mekanı ısıtır."
   - "Duvar-zemin kontrastı zayıf. Duvarı 1-2 ton açmak derinlik katar."
5. **Karar kayıt butonu**: "Bu renk kararını kaydet" → decisionLog'a yazar
6. **Bölge karar durumu**: bu bölge için daha önce karar verilmişse göster

**Mevcut koddan taşınacaklar:**
- `globalColorPalette` sistemi → palet önerilerinin temeli
- `hexToRgb`, `rgbToHsl`, `hslToRgb`, `hslToHex` → slider mantığı
- `generateRelatedPalette`, `shiftColor` → palet üretimi
- `colorDNA` ve `suggestedColors` veri yapıları → AI prompt zenginleştirme

**AI çağrısı (Renk Hub için — metin tabanlı):**
- Tetikleyici: bölge seçildiğinde ve ilk kez veya "öneri yenile" tıklandığında
- Girdi: referans render + bölge bilgisi + mevcut brief + diğer bölgelerdeki kararlar
- Çıktı: bölge-spesifik renk yorumu + palet önerileri (JSON)
- Maliyet: düşük (sadece metin üretimi, görsel yok)

#### Step 5: Malzeme Hub'ı

**Sol panel:** Renk hub'ıyla aynı segmentasyon overlay. Ama burada renk overlay yerine malzeme kategorisi renkleri gösterilir (zemin = yeşil tonu, duvar = mavi tonu, tavan = mor tonu — kategoriye göre).

**Sağ panel (bölge seçildikten sonra):**

1. **Mevcut malzeme tespiti**: AI'ın tespit ettiği malzeme + güven seviyesi
2. **Alternatif malzeme listesi**: cost-database.json'dan filtrelenmiş
   - Her malzeme kartında:
     - Malzeme adı
     - Birim fiyat + işçilik (veritabanından)
     - Bütçe bandı etiketi: 💰 ekonomik / 💰💰 standart / 💰💰💰 premium
     - AI metin: 1-2 cümle avantaj/dezavantaj
   - "Bilinmiyor" malzemeler için: kullanıcı manuel giriş alanı
3. **Maliyet etkisi hesabı**:
   - Seçilen malzeme × bölgenin tahmini metrajı = yaklaşık maliyet
   - Mevcut malzemeyle fark: "+₺12,000" veya "-₺5,000"
   - Güven göstergesi: "Metraj tahmini ±%15 hata payı içerir"
4. **Renk hub'ından gelen karar**: eğer bu bölge için renk kararı varsa, malzeme önerileri buna göre filtrelenir
   - "Sıcak tona kaydırdınız → soğuk gri mermer uyumsuz olabilir" gibi uyarı
5. **Karar kayıt**: malzeme seçimi → region.materialDecision + decisionLog

**Mevcut koddan taşınacaklar:**
- `resolveMaterialCostProfile()` → malzeme maliyet hesaplama
- `classifyStoryboardMaterial()` → malzeme kategorizasyonu
- `estimateAlternativeDecisionCostImpact()` → maliyet etki hesabı
- cost-database.json → doğrudan kullanılır, dönüşüm gerekmez
- Bilinmeyen malzeme yönetimi → mevcut unknownMaterials akışı adaptasyonu

#### Faz 2 test kriterleri

- [ ] Renk hub'ında bölge seçimi → slider'lar görünür
- [ ] Slider kaydırma → anlık renk overlay (AI çağrısı yok, client-side)
- [ ] AI palet önerisi yüklenebilir
- [ ] Renk kararı kaydedilir, decisionLog'da görünür
- [ ] Malzeme hub'ında bölge seçimi → malzeme listesi görünür
- [ ] Malzeme seçimi → maliyet etkisi hesaplanır
- [ ] Renk hub'ındaki karar malzeme hub'ında görünür (cross-hub veri)
- [ ] Bilinmeyen malzeme → kullanıcı giriş alanı çalışır
- [ ] Karar günlüğü her iki hub'ın kararlarını kronolojik gösterir

---

### Faz 3: Aydınlatma + Mobilya + Tasarım Hub'ı

#### Step 6: Aydınlatma Hub'ı

**Sol panel:**
- Referans render + segmentasyon overlay
- Ek: sıcaklık/yoğunluk overlay (CSS filter veya SVG feColorMatrix ile)
  - Sıcak overlay: sarımsı yarı-saydam katman
  - Soğuk overlay: mavimsi yarı-saydam katman
  - Yoğunluk: overlay opacity
- Bu overlay tüm görsele uygulanır (bölge-spesifik değil)

**Sağ panel:**
1. **AI mevcut aydınlatma analizi** (metin):
   - "Mevcut durumda tek katmanlı genel aydınlatma var"
   - "Görev aydınlatması yok, vurgu katmanı eksik"
2. **Aydınlatma katmanları checklist'i**:
   - ☐ Genel aydınlatma
   - ☐ Görev aydınlatması (tezgah, masa, ayna)
   - ☐ Vurgu aydınlatması (niş, obje, duvar)
   - ☐ Atmosfer aydınlatması (gizli LED, şerit)
   - Her katman için tıklanınca AI metin önerisi açılır
3. **Sıcaklık kontrolü**: slider (2700K sıcak ↔ 6500K soğuk)
   - Client-side overlay güncellenir
   - AI metin: "Bu mekan için 3000-3500K aralığı önerilir: sıcak ama tanımlı"
4. **Bölge-spesifik notlar**: bir bölge seçildiğinde o bölge için aydınlatma notu eklenebilir
   - "Tezgah üstü: lineer LED, 4000K"
5. **Karar kayıt**

**Not:** Aydınlatma hub'ı diğerlerinden farklı çünkü kararlar bölge-spesifik olduğu kadar genel mekana da yönelik. Bu yüzden "bölge seçmeden de karar verebilme" mümkün olmalı.

#### Step 7: Mobilya Hub'ı

**Sol panel:**
- Referans render + segmentasyon overlay
- Mobilya bölgeleri farklı renkle vurgulu (kategori = furniture olanlar)

**Sağ panel:**
1. **AI mobilya tespiti** (metin):
   - "Tespit edilen mobilyalar: 3'lü koltuk, sehpa, TV ünitesi, yemek masası + 4 sandalye"
   - Her biri segmentasyon bölgesiyle eşleşmiş
2. **Seçili mobilya değerlendirmesi** (bölge seçildiğinde):
   - Ölçek analizi: "Bu koltuk mekana oranla büyük görünüyor"
   - Ergonomi notu: "Sehpa-koltuk mesafesi dar olabilir"
   - Depolama analizi: "Bu duvarda depolama potansiyeli var"
   - Aksiyon seçenekleri: Koru / İyileştir / Değiştir / Kaldır
3. **Genel mobilya kurgusu önerileri** (metin):
   - "Oturma düzenini 2+1'e çevirmek sirkülasyonu rahatlatır"
   - "TV ünitesi yerine duvar paneli + konsol daha ferah olabilir"
4. **Karar kayıt**

**Mevcut koddan taşınacaklar:**
- `formDNA` ve `formChoice` sistemi → mobilya karar yapısı

#### Step 3: Tasarım Hub'ı (Brief + Strateji + Metin Modülleri)

Mevcut hedef/brief step'i genişletilerek tasarım hub'ına dönüşür.

**Sağ panel yok — tam genişlik layout (hub-shell değil):**

1. **Brief kurulumu** (mevcut yapılandırılmış seçimler korunur):
   - Tasarım yaklaşımı
   - Mekanın öncelikli problemi
   - Atmosfer hedefi
   - Bütçe tonu / bandı
   - Müdahale seviyesi
   - Manuel ek not

2. **Strateji tanımı** (yeni):
   - Öncelik sıralaması (sürükle-bırak)
   - Başarı ölçütü
   - Koru / iyileştir / değiştir dengesi (slider)
   - Müşteri hassasiyetleri (serbest metin)

3. **Metin modülleri** (yeni — js/text-ai.js):

   **Tasarım eleştirisi:**
   - Referans render + analiz verisinden yapılandırılmış eleştiri
   - Güçlü yönler / zayıf yönler / fırsatlar
   - Mevcut `designCritique` sistemi genişletilir

   **Karşılaştırma:**
   - İki farklı render/fotoğraf yükle → AI fark analizi (metin)
   - "A: sıcak palet + ahşap ağırlıklı. B: soğuk palet + taş ağırlıklı"

   **Müşteri dili çevirici:**
   - Sol: teknik karar metni (iç mimar yazar)
   - Sağ: müşteri dili çevirisi (AI üretir)
   - "Tavan kotunu 15cm düşürüp gizli LED kanalı açıyoruz"
   - → "Tavanınızda yumuşak bir ışık hattı oluşturacağız"

   **Checklist üreticisi:**
   - Kapsam + brief'ten otomatik kontrol listesi
   - "Zemin değişikliği var → şap kontrolü, kot farkı, geçiş profili, süpürgelik"

#### Faz 3 test kriterleri

- [ ] Aydınlatma hub'ında sıcaklık slider'ı → overlay değişir
- [ ] Aydınlatma checklist'i → AI metin önerisi yüklenebilir
- [ ] Mobilya hub'ında mobilya bölgeleri vurgulu görünür
- [ ] Mobilya seçimi → AI ölçek/ergonomi değerlendirmesi
- [ ] Tasarım hub'ında brief + strateji alanları çalışır
- [ ] Müşteri dili çevirici: metin gir → AI çevirisi gelir
- [ ] Checklist üreticisi: kapsam verisinden otomatik liste
- [ ] Tüm hub kararları decisionLog'da kronolojik görünür

---

### Faz 4: Rapor + Premium Render

#### Step 8: Rapor & Karar Günlüğü

Mevcut rapor tamamen yeniden yapılandırılır. Artık alternatif-merkezli değil, hub kararları-merkezli.

**Rapor yapısı:**

1. **Karar günlüğü timeline** (otomatik, decisionLog'dan):
   - Kronolojik karar listesi
   - Her kararın yanında hub ikonu ve bölge etiketi
   - Filtreleme: hub'a göre, bölgeye göre

2. **Hub bazlı karar özet kartları** (otomatik, region state'inden):
   - **Renk kartı**: mevcut → yeni palet gösterimi (renk kutucukları)
   - **Malzeme kartı**: değişen malzemeler listesi + toplam maliyet etkisi
   - **Aydınlatma kartı**: seçilen katmanlar + sıcaklık kararı
   - **Mobilya kartı**: aksiyonlar (koru/değiştir/kaldır) özeti
   - Her kart "detay aç" ile hub'a geri gönderebilir

3. **Bütçe özeti** (otomatik, malzeme kararlarından):
   - Toplam tahmini maliyet etkisi
   - Güvenilir vs tahmini oranı
   - Kalem bazlı fark tablosu

4. **Müşteri dili çevirisi alanı**:
   - AI tüm kararları müşteri diline çevirir
   - İç mimar düzenleyebilir
   - "Bu metin müşteriye sunum için hazırlanmıştır"

5. **AI genel değerlendirme** (metin):
   - Tüm hub kararlarını birlikte değerlendiren özet
   - Tutarsızlık uyarıları: "Renk kararı sıcak yönde ama malzeme kararı soğuk gri mermer içeriyor"
   - Eksik karar uyarıları: "Aydınlatma hub'ında karar verilmedi"

6. **Premium render butonu** (opsiyonel):
   - "Bu kararları görsele dök" butonu
   - Tıklandığında: tüm hub kararları toplanır → kontrol paneli gösterilir
   - Kullanıcı onaylar → render prompt otomatik oluşturulur → mevcut image generation API çağrılır
   - Prompt kaynakları: renk kararları + malzeme seçimleri + aydınlatma kararları + brief
   - Sonuç rapora eklenir

7. **Export** (ikinci iterasyonda):
   - PDF export — ilk versiyonda yok
   - Ekran içi görüntü yeterli
   - "PDF export yakında" placeholder

**Mevcut render step'inden taşınacaklar:**
- `buildControlledVisualPrompt()` → hub kararlarından beslenen yeni versiyon
- `generateVisualMockOrFromAPI()` → premium render handler'ına
- `handleGenerateVisuals()` → premium buton handler'ına

**Kaldırılacaklar:**
- Mevcut rapor'un alternatif bazlı section seçimi
- Alternatif karşılaştırma tablosu (yerine hub karar kartları)
- Storyboard referansları

#### Faz 4 test kriterleri

- [ ] Rapor step'inde karar günlüğü timeline görünür
- [ ] Hub özet kartları doğru veri gösterir
- [ ] Bütçe özeti malzeme kararlarından hesaplanır
- [ ] Müşteri dili çevirisi çalışır
- [ ] AI tutarsızlık uyarıları doğru (varsa)
- [ ] Premium render butonu tüm kararları toplar
- [ ] Render prompt'u hub kararlarını yansıtır
- [ ] Mevcut Kurulum ve Analiz adımları hâlâ sağlam

---

## Kaldırılacak Kod Envanteri

Faz 1'de temizlenecekler (kullanılmayan kod birikmesin):

```
Fonksiyonlar:
- renderAlternatives()
- renderExplorerDetail()  
- renderExplorerGrid()
- renderStoryboardPanel()
- handleGenerateAlternatives()
- buildAlternativePrompt()
- renderVisualPanels() (kısmen — premium render'a taşınan kısım hariç)
- handleGenerateVisuals() (kısmen — premium render'a taşınan kısım hariç)

State alanları:
- alternatives dizisi → kaldırılır
- selectedAlternative → kaldırılır
- storyboard → kaldırılır (malzeme/renk/form DNA verileri hub state'e taşınır)

HTML:
- step-4 (Tasarım/Alternatif Explorer) section → tamamen kaldırılır
- step-5 (Render) section → tamamen kaldırılır
- Alternatif ile ilgili tüm modal ve drawer'lar

CSS:
- .alternative-card, .explorer-*, .storyboard-* sınıfları
- .visual-panel-*, .render-* sınıfları (premium render hariç)
```

---

## Riskler ve Azaltma Stratejileri

### Risk 1: Segmentasyon kalitesi düşük
**Etki:** Tüm hub'lar kullanılamaz hale gelir.
**Azaltma:**
- Fallback polygon çizim aracı zorunlu (Faz 1'de)
- AI segmentasyonu "düzenlenebilir" olmalı: kullanıcı polygon noktalarını sürükleyip düzeltebilmeli
- Segmentasyon olmadan da hub'lar çalışabilmeli: "bölge seçmeden genel öneri al" modu
- İlk versiyonda basit bölge yapısıyla başla (5-8 bölge: tavan, zemin, duvarlar, ana mobilyalar). Detaylı segmentasyon sonraki iterasyonlarda.

### Risk 2: Hub'lar arası state senkronizasyonu
**Etki:** Renk hub'ındaki karar malzeme hub'ında görünmez, tutarsız sonuçlar.
**Azaltma:**
- Region-centric state modeli (tek kaynak)
- Hub geçişinde region state'i yeniden okunur (cache yok)
- decisionLog append-only — hub'lar birbirinin kararını silmez veya değiştirmez

### Risk 3: Metin tabanlı önerilerin jenerik kalması
**Etki:** AI önerileri her projede aynı, kullanıcı ciddiye almaz.
**Azaltma:**
- AI prompt'larına her zaman projeye özel bağlam ekle: brief, kapsam, önceki hub kararları, mekan tipi
- Önerileri "seçenek" olarak sun, "talimat" olarak değil
- Kullanıcı AI önerisini reddedebilmeli ve nedenini yazabilmeli (bu veri ileride AI'ı iyileştirir)

### Risk 4: Rapor'un alternatif-merkezliden hub-merkezliye geçişi
**Etki:** Mevcut rapor yapısı çöker, yeni yapı eksik kalır.
**Azaltma:**
- Rapor'u en son yap (Faz 4)
- Faz 1-3'te karar verisi düzgün birikirse rapor "otomatik" çalışır
- İlk versiyonda ekran içi rapor yeterli, PDF sonra

---

## Uygulama Sırası ve Tahmini Büyüklükler

```
Faz 1: Altyapı
├── js/segmentation.js (yeni, ~350 satır)
├── js/hub-engine.js (yeni, ~250 satır)  
├── index.html (büyük değişiklik: 2 section kaldır, 4 section ekle, nav güncelle)
├── script.js (büyük değişiklik: NAV, step, kaldırılan fonksiyonlar)
├── style.css (orta değişiklik: hub layout'ları)
├── js/state.js (orta değişiklik: yeni state alanları)
├── server.js (minor: /api/segment endpoint)
└── Tahmini: 1200-1500 yeni/değişen satır

Faz 2: Renk + Malzeme Hub'ları
├── script.js (hub render fonksiyonları)
├── js/segmentation.js (renk overlay)
├── js/hub-engine.js (karar kayıt UI)
├── index.html (hub içerikleri)
├── style.css (hub-specific stiller)
├── js/api.js (hub-aware AI çağrıları)
└── Tahmini: 800-1000 yeni/değişen satır

Faz 3: Aydınlatma + Mobilya + Tasarım Hub'ları  
├── script.js (3 hub render fonksiyonu)
├── js/text-ai.js (yeni, ~300 satır)
├── index.html (hub içerikleri + metin modül UI)
├── style.css (hub varyasyonları)
└── Tahmini: 900-1100 yeni/değişen satır

Faz 4: Rapor + Premium Render
├── script.js (rapor yeniden yapılandırma)
├── index.html (rapor section yeniden)
├── style.css (rapor + timeline stiller)
└── Tahmini: 600-800 yeni/değişen satır
```

**Toplam tahmin: ~3500-4400 satır değişiklik/ekleme**

---

## Notlar

### Monolite dokunma stratejisi
script.js büyük ve karmaşık. Strateji: yeni kod yeni dosyalarda, eski kodda sadece kaldırma ve bağlantı noktaları. script.js'e yeni büyük fonksiyonlar yazmak yerine, yeni dosyalardaki fonksiyonları script.js'den çağır.

### Segmentasyon prompt'unu iyileştirme
İlk versiyon basit polygon'larla başlasın. Zamanla:
- Analiz adımındaki tespit kalitesi arttıkça segmentasyon prompt'u zenginleşir
- Kullanıcı düzeltmeleri biriktirilirse, ofis bazında "bu tip mekanlarda beklenen bölgeler" öğrenilebilir
- ControlNet gibi yapısal kılavuzlar eklenebilir (uzun vade)

### npm start vs npm run dev
Test komutu `npm start`. Plan 2'deki `npm run dev` referansları yanlış. Tüm testler `npm start` ile yapılacak.

### Cost-database.json
Dönüşüm gerekmez. Mevcut yapı hub mimarisinde de çalışır. Malzeme hub'ı bu dosyayı doğrudan okur.
