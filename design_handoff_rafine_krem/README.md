# Handoff: DesignLoop · Rafine Krem UI Refactor

## Genel Bakış

Bu paket, **mimarenesyildiz/Designloop3** repo'sundaki mevcut UI'ı tamamen "Rafine Krem" tasarım yönüne taşımak içindir. Mevcut yapı, akış ve özellikler **korunmalı** — sadece görsel katman (renk, tipografi, boşluk, köşe yarıçapı, hairline'lar, AI yorum kutuları, başlık hiyerarşisi) yeniden uygulanacak.

Hedef: Kullanıcı `index.html`'i açtığında, bu paketteki `DesignLoop UI Yenileme.html` mockup'ının "Variant A · Rafine Krem" varyantıyla **birebir aynı görsel dili** taşımalı.

## Tasarım Dosyaları Hakkında

Bu pakettteki HTML dosyaları **tasarım referansıdır** — production kod değildir. Görev, bu HTML mockup'larını hedef repo'nun mevcut ortamında (vanilla JS SPA + tek `style.css`) yeniden uygulamaktır. **Mevcut DOM yapısını ve sınıf isimlerini koruyun**, sadece CSS'i değiştirin. JS davranışı kesinlikle değişmemeli.

## Fidelite

**High-fidelity (hifi)**: Tüm renkler, tipografi, boşluklar, köşeler net olarak belirtildi. Pixel-perfect uygulanmalı.

## Hedef Repo

- **GitHub**: `https://github.com/mimarenesyildiz/Designloop3.git`
- **Branch**: `main`
- **Stack**: Vanilla JS SPA · tek `index.html` + tek `style.css` (191KB) + `script.js` (1MB) + Node `server.js`
- **Mevcut token sistemi**: `style.css` satır 1–14'te `:root { --bg, --text, --blue, --orange, --green, --red, --shadow, --radius }`. Bu yapı **korunmalı ve genişletilmeli**.
- **Mevcut tema**: `body.mimarenes-inspired-theme` (satır 4861) zaten doğru yönde — Manrope + Outfit + sıcak ton kullanıyor. Bu, varsayılan haline getirilebilir.

## Tasarım Token'ları (Rafine Krem)

```css
:root {
  /* Yüzeyler */
  --bg:                 #f5f1e8;   /* sayfa arka planı (kağıt kremi) */
  --bg-paper:           #fbf7ef;   /* kart/panel yüzeyi */
  --bg-elev:            #ffffff;   /* yükseltilmiş yüzey (input, chip) */
  --bg-strong:          #1d1a16;   /* koyu metin/header */

  /* Yazı */
  --text:               #1d1a16;
  --text-soft:          #4a443c;
  --muted:              #7a7468;

  /* Hatlar */
  --panel-border:        rgba(29,26,22,0.10);   /* hairline */
  --panel-border-strong: rgba(29,26,22,0.18);

  /* Aksent — derin ink-blue (parlak #2667ff yerine) */
  --blue:               #1c3d5a;
  --blue-soft:          rgba(28,61,90,0.08);

  /* Status (yumuşatılmış) */
  --green:              #3f7a4f;   --green-soft:  rgba(63,122,79,0.10);
  --orange:             #b25c1a;   --orange-soft: rgba(178,92,26,0.12);
  --red:                #a8392c;

  /* Tipografi */
  --font-display:       'Newsreader', 'Cormorant Garamond', Georgia, serif;
  --font-body:          'Manrope', 'Inter', system-ui, sans-serif;
  --font-mono:          'JetBrains Mono', ui-monospace, monospace;

  /* Köşeler */
  --radius:             16px;   /* eskiden 4px — paneller yumuşar */
  --radius-sm:          10px;
  --radius-pill:        999px;

  --shadow:             0 20px 40px rgba(24,28,31,0.06);  /* eskiden 0.08 */
  --container:          1480px;
}
```

Google Fonts import'u (style.css en üstüne veya index.html'in `<head>` bloğuna):
```
https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap
```

## Tipografi Sistemi

| Eleman | Font | Weight | Size | Letter-spacing |
|---|---|---|---|---|
| Brand wordmark (`.brand-name`) | Newsreader | 500 | 56px | -0.02em |
| Section başlığı (`.section-title`) | Newsreader | 500 | clamp(36px, 4vw, 52px) | -0.025em |
| Panel başlığı `h3` | Newsreader | 500 | 22px | -0.015em |
| Kart başlığı `h4` | Newsreader | 500 | 18–26px | -0.015em |
| Body / paragraf | Manrope | 400 | 13–14px | normal |
| Buton, chip, nav-pill | Manrope | 600 | 12–13px | normal |
| Eyebrow / mono etiket | JetBrains Mono | 400/600 | 10–11px | 0.10–0.16em uppercase |
| Stat sayıları | Newsreader | 500 | 36px | -0.025em |
| Cost/numerik tablo | JetBrains Mono | 400 | 12px | normal |

`h1, h2, h3, h4` için **default** Newsreader serif, 500 weight, -0.02em letter-spacing.

## Bileşen Spec'leri

### 1) Header / Wordmark Bloğu
- Üst eyebrow: `AI ITERATIVE DESIGN COSTING PROTOTYPE` — JetBrains Mono 10px, letter-spacing 0.16em, uppercase, color `var(--muted)`
- Wordmark: "DesignLoop" — Newsreader 500, 56px, line-height 0.95, color `var(--text)`
- Tagline pill row: `<span class="pill is-live">AI Bağlı</span>` — beyaz pill, 1px hairline, 999px radius, sol tarafta yeşil dot + glow (`box-shadow: 0 0 0 4px var(--green-soft)`)
- Header sağ tarafı: ref-tile (44x44 thumbnail + 2 satır meta) ya da CTA cluster

### 2) Step Navigation (`.nav-pills`)
- Container: `padding: 4px; background: var(--bg-elev); border: 1px solid var(--panel-border); border-radius: 999px`
- Pill: 8px×16px padding, font 13px/600 Manrope
- Aktif pill: `background: var(--text); color: var(--bg-paper)` (siyah pill, krem yazı)
- Pill içinde küçük mono numara: `01 / 02 / 03...` JetBrains Mono 10px, color muted (aktif pill'de rgba(255,255,255,0.55))
- Locked step: opacity 0.55, color muted

### 3) Section Heading
- Iki kolonlu grid (1.2fr 1fr)
- Sol: meta etiket + section-title; sağ: section-copy paragrafı (max 540px, justify-self: end)
- Meta etiket önünde 28px hairline çizgi, color `var(--blue)`, mono 10px uppercase

### 4) Panel / Kart
- `background: var(--bg-paper); border: 1px solid var(--panel-border); border-radius: 16px; padding: 22px`
- Featured / vurgulu kart: ek olarak `background: radial-gradient(circle at 0% 0%, var(--blue-soft), transparent 60%), var(--bg-paper); border-color: var(--blue)`
- Asla heavy shadow yok — sadece hairline border. `--shadow` sadece report-sheet için.

### 5) Choice Chip / Brief Seçimleri
- Default: `padding: 8px 12px; border-radius: 999px; border: 1px solid var(--panel-border); background: var(--bg-elev); color: var(--text-soft); font: 600 12px Manrope`
- Pressed (`aria-pressed="true"`): `background: var(--blue); color: #fff; border-color: var(--blue)`

### 6) Buton Sistemi
- `.btn` (default): hairline border + `--bg-elev` + 999px radius + 10×16 padding + 13px/600
- `.btn-primary`: siyah pill `background: var(--text); color: var(--bg-paper); border-color: var(--text)` (mockup'ta header CTA'ları için)
- `.btn-accent`: ink-blue `background: var(--blue); color: #fff` (Brief tamamlandı, vb.)
- Hover: `background: var(--bg-paper)` (ya da sırasıyla bir ton koyu)

### 7) AI Suggestion Box
- `padding: 14px 16px; background: var(--blue-soft); border-left: 3px solid var(--blue); border-radius: 10px; font-style: italic; font-size: 13px; line-height: 1.55; color: var(--text-soft)`
- `::before` ile "AI · YORUM" mono caption (10px, letter-spacing 0.12em, color `var(--blue)`, normal style)

### 8) Stat Tile (Analiz strip)
- 18–20px padding, hairline border, 16px radius
- `<small>` mono 10px uppercase muted; `<strong>` Newsreader 36px display; `<span>` 12px muted alt-açıklama

### 9) Hub Canvas
- `min-height: 480px`, koyu arka plan `#1a1816`, içe yerleştirilmiş gradient render mock
- Sağ üstte canvas-toolbar pill: `rgba(26,24,22,0.85) + backdrop-blur(12px)`, içinde mono uppercase butonlar (`SEG / SPLIT / ORİJİNAL`); aktif buton krem-on-koyu
- Bölge etiketleri (`.seg-label`): mono 10px uppercase, status renkli pill (üstüne çakışan corner-cut)
- Sol alt canvas-meta: mono 11px, color `rgba(243,234,215,0.7)`

### 10) HSL / Slider Kontrolü
- Track: 4–6px height, `var(--panel-border)` rail
- Fill: `var(--blue)`, knob: 14×14 yuvarlak, `var(--bg-elev)` zemin + 2px `var(--blue)` border
- Range slider'da iki knob (örn. bütçe min/max)

### 11) Decision Log / Karar Listesi
- Hairline-dashed satır ayırıcılar (border-bottom: 1px dashed)
- Sol kolonda mono saat (10px), sağ kolonda başlık (text) + alt-açıklama (muted 12px)

### 12) Alternatif Kart (Üretim ekranı)
- Üst: 16/10 oranında render mock görsel (radial gradient placeholder), sol-üst köşede mono "A · Sıcak Nötr" tag, sağ-alt köşede ₺ cost pill (krem zemin, koyu yazı)
- Alt body: 18px padding, h4 Newsreader, p muted, footer'da chip-row (kontrollü/üst segment/akustik)
- Kart hairline border, 16px radius

### 13) Report Sheet (Rapor)
- 40–44px padding, `--shadow`, hairline border, 16px radius
- Header: 2px solid var(--text) border-bottom, eyebrow + Newsreader 38px başlık + meta-row (Mono 11px, "X alternatif · Y hub · ₺Z önerilen · 09 Mayıs 2026")
- Section başlıkları `<h3 data-num="§ 01">` — `::before` ile mono accent rengi numara
- Cost table: mono numerik kolonlar, `border-bottom: 2px solid var(--text)` th'lerin altında, total row'da kalın

### 14) Modal
- Overlay: `rgba(20,18,16,0.6) + backdrop-filter: blur(8px)`
- Dialog: max-width 640, 32px padding, 20px radius, krem zemin, hairline border, `--shadow`

### 15) Drawer (AI Ayarları)
- Sağdan açılır, 380px genişlik
- Krem zemin, sol tarafta hairline ayırıcı
- Header: eyebrow + Newsreader 24px başlık + close icon button
- Body: mono uppercase label'lar + krem input alanları (10px radius, hairline border)
- Üstte ayrıca `var(--blue-soft) + 3px solid var(--blue) border-left` info kutusu

## Ekran Bazında Uygulama

| # | Ekran | Mockup'taki id | Repo'daki muhtemel selector |
|---|---|---|---|
| 01 | Dashboard / Projelerim | `#screen-1` | `#projects-section`, `.project-card`, `.dashboard-toolbar` |
| 02 | Step 1 — Kurulum (yükleme) | `#screen-2` | dropzone + file row blokları |
| 03 | Step 2 — Analiz + Hub Canvas | `#screen-3` | `.hub-pill`, `.canvas-stage`, `.selection-card`, `.decision-log` |
| 04 | Step 3 — Tasarım Briefi | `#screen-4` | `.brief-pool`, `.choice-chip`, `.budget-range-control` |
| 05 | Üretim — Alternatifler | `#screen-5` | `.alternative-card` |
| 06 | Render — Karşılaştırma | `#screen-6` | render row container |
| 07 | Rapor / Sunum | `#screen-7` | report workbench + sheet |
| 08 | Modal · Yeni Proje | `#screen-8` | proje oluştur dialog |
| 09 | Drawer · AI Ayarları | `#screen-9` | sağ panel ayarlar |

Her ekran için mockup HTML'ini açıp **DOM yapısını** ve **sınıf adlandırmasını** referans alın. Repo'daki sınıf isimleri farklı olabilir — bu durumda mockup'taki sınıfa karşılık gelen repo sınıfını bulun ve **repo'nun sınıfını koruyarak** kuralları yeniden uygulayın.

## Etkileşim & Davranış

JS davranışı **değişmeden** kalmalı:
- Step navigasyonu `script.js`'teki mevcut router korunacak
- Modal/drawer açılış/kapanış mantığı dokunulmayacak
- Hub seçim, brief slider, render üretim — tümü mevcut kod
- Sadece görsel sınıflar (CSS) güncellenir; HTML yapısı yalnızca **eyebrow** etiketleri, mono numara span'ları ve `data-num="§ 01"` gibi cosmetic eklemeler için değiştirilebilir

## Erişilebilirlik
- Aktif step pill için `aria-current="page"` veya `aria-current="step"`
- Choice chip seçimleri için `aria-pressed="true"`
- Modal'da `role="dialog"`, `aria-modal="true"`, focus trap
- Tüm renk kontrastları WCAG AA seviyesinde

## Asset'ler
- Tüm görseller mockup'ta CSS gradient placeholder olarak hazırlandı. Repo'da `katplani.jpeg` zaten var. Render placeholder'ları repo'daki gerçek render mock'larıyla değiştirilebilir.
- Icon'lar: mevcut repo icon'ları (varsa) korunur. Yoksa Lucide icons (https://lucide.dev) önerilir; ince stroke ve hairline kaliteli paletle uyumlu.
- Font'lar: Google Fonts'tan yüklenir, ek dosya gerekmez.

## Dosyalar (Bu Pakette)

- **`DesignLoop UI Yenileme.html`** — Tüm 9 ekranın hi-fi mockup'ı. Üstte A/B varyant toggle var; **Variant A · Rafine Krem** referans olarak alınmalı (Variant B kullanılmayacak).
- **`refine-tokens.css`** — Hazır token sistemi, `style.css` üstüne import edilebilir başlangıç dosyası.
- **`STYLE-PATCH.md`** — `style.css`'in mevcut `:root` bloğuna birebir patch (hangi satıra ne yazılır).
- **`UYGULAMA-REHBERI.md`** — Türkçe genel rehber (kavramsal yaklaşım).

## Önerilen Uygulama Sırası

1. **Token katmanı** — `style.css` `:root` bloğunu STYLE-PATCH.md'deki yeni hali ile değiştir; font import'larını ekle.
2. **Body + headings** — `body { font-family: var(--font-body) }` ve `h1,h2,h3,h4 { font-family: var(--font-display); font-weight: 500; letter-spacing: -0.02em }`.
3. **Header/wordmark** — eyebrow + Newsreader wordmark + pill tagline.
4. **Step navigation** — pill row, aktif pill (siyah), mono numara.
5. **Buton & chip sistemi** — `.btn`, `.btn-primary`, `.btn-accent`, `.choice-chip[aria-pressed]`.
6. **Panel/kart geneli** — radius 16px, hairline border, gölge minimal.
7. **Ekran bazında**: Dashboard → Setup → Analiz/Hub → Brief → Üretim → Render → Rapor → Modal/Drawer.
8. **Cleanup** — sabit `#2667ff` kalıntıları (4 yer), eski shadow değerleri, eski radius 4px değerleri.

Her ekran sonrası `npm start` (server.js) ile lokalde aç ve mockup ile yan yana karşılaştır. Pixel-perfect olana kadar iter et.

## Tek Cümlelik Hedef
> *"Mevcut DesignLoop SPA'sının HTML yapısı ve JS davranışı korunarak, görsel katmanı `DesignLoop UI Yenileme.html`'in Variant A · Rafine Krem varyantına birebir uydurulacak — ink-blue aksent, krem kağıt zemin, Newsreader serif başlıklar, hairline border'lar, 16px köşe yarıçapı, JetBrains Mono eyebrow etiketleri."*
