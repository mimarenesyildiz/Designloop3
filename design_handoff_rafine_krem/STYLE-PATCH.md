# Designloop3 — Rafine Krem Patch'i

Repo'nuzu inceledim. **İyi haber:** zaten `:root { --bg, --blue, --orange... }` token sistemi kullanıyorsunuz. Bu yüzden değişiklik **çok küçük** — sadece bu blokta birkaç satır + bir font import.

---

## Adım 1 · `style.css` üst kısmı (satır 1–14)

**Mevcut:**
```css
:root {
  --bg: #f4f4f1;
  --bg-strong: #121416;
  --panel-border: rgba(18, 20, 22, 0.12);
  --text: #15181b;
  --muted: #5c646d;
  --blue: #2667ff;
  --green: #1e8e5c;
  --orange: #c97918;
  --red: #b53a2d;
  --shadow: 0 20px 40px rgba(24, 28, 31, 0.08);
  --radius: 4px;
  --container: 1480px;
}
```

**Bunu yerine koyun:**
```css
:root {
  --bg: #f5f1e8;                         /* daha sıcak kağıt kremi */
  --bg-paper: #fbf7ef;                   /* YENİ — kart yüzeyi */
  --bg-strong: #1d1a16;                  /* siyah → ink */
  --panel-border: rgba(29, 26, 22, 0.10);
  --panel-border-strong: rgba(29, 26, 22, 0.18); /* YENİ */
  --text: #1d1a16;
  --text-soft: #4a443c;                  /* YENİ — gövde yazısı */
  --muted: #7a7468;                      /* daha sıcak gri */
  --blue: #1c3d5a;                       /* parlak mavi → ink-blue */
  --blue-soft: rgba(28, 61, 90, 0.08);   /* YENİ */
  --green: #3f7a4f;                      /* yumuşak yeşil */
  --green-soft: rgba(63, 122, 79, 0.10); /* YENİ */
  --orange: #b25c1a;                     /* yumuşak terra */
  --orange-soft: rgba(178, 92, 26, 0.12);/* YENİ */
  --red: #a8392c;
  --shadow: 0 20px 40px rgba(24, 28, 31, 0.06); /* gölge biraz hafif */
  --radius: 16px;                        /* 4 → 16, panel köşeleri yumuşar */
  --radius-sm: 10px;                     /* YENİ — input'lar için */
  --radius-pill: 999px;                  /* YENİ */
  --container: 1480px;
  --font-display: "Newsreader", "Cormorant Garamond", Georgia, serif; /* YENİ */
  --font-body: "Manrope", "Inter", system-ui, sans-serif;             /* YENİ */
  --font-mono: "JetBrains Mono", ui-monospace, monospace;             /* YENİ */
}
```

> Not: `--blue: #2667ff` → `#1c3d5a` tek başına sitede **mavi her yerde** otomatik olarak ink-blue olur. `var(--blue, #2667ff)` fallback'ları da çalışmaya devam eder.

---

## Adım 2 · Font import — `style.css`'in **en başına** (satır 1'den önce)

```css
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

Veya daha temizi — `index.html`'in `<head>` bloğuna (`<link rel="stylesheet" href="style.css">` satırının **üstüne**):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## Adım 3 · Body font — satır 24 civarı

**Mevcut:**
```css
body {
  margin: 0;
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  ...
}
```

**Değişiklik:**
```css
body {
  margin: 0;
  font-family: var(--font-body);
  ...
}
```

---

## Adım 4 · Başlıkları serif yap — `style.css`'in **EN ALTINA** ekleyin

```css
/* === Rafine Krem · serif başlık katmanı === */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--text);
}

/* "Eyebrow" mono etiketler — istediğiniz yerde kullanın */
.eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

/* AI yorum / öneri kutuları için yardımcı */
.ai-suggestion-box {
  padding: 14px 16px;
  background: var(--blue-soft);
  border-left: 3px solid var(--blue);
  border-radius: var(--radius-sm);
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-soft);
  font-style: italic;
}
```

---

## Adım 5 · Find/Replace — sabit hex'ler için (opsiyonel ama önerilir)

`style.css`'de geçen şu **iki sabit `#2667ff`** satırını da var ile bağlayın:
- Satır **6090**: `color: #2667ff;` → `color: var(--blue);`
- Satır **7576**: `color: #2667ff;` → `color: var(--blue);`
- Satır **7864**: `color: #2667ff;` → `color: var(--blue);`
- `rgba(38, 103, 255, ...)` → `var(--blue-soft)` (tüm geçişler)

VS Code'da: `Cmd/Ctrl + Shift + F` → arama: `#2667ff` → değiştir: `var(--blue)`. 4 sonuç çıkmalı.

---

## Adım 6 · `mimarenes-inspired-theme` (satır 4861) zaten doğru yönde!

Repo'nuzda zaten bu sınıf var ve **Manrope + Outfit + sıcak ton** kullanıyor — tam istediğimiz yön. Eğer body'de `mimarenes-inspired-theme` sınıfını **kalıcı olarak** açarsanız (varsa toggle'ı kaldırın), Rafine Krem hissi neredeyse anında gelir.

`index.html`:
```html
<body class="mimarenes-inspired-theme">
```

---

## Test sırası

1. **Sadece Adım 1+2+3'ü** uygulayıp siteyi açın → kağıt sıcaklığı + ink-blue hemen görünür.
2. Adım 4'ü ekleyin → başlıklar Newsreader serif olur (en büyük his değişimi).
3. Adım 6'yı (mimarenes-inspired-theme) açın → tüm sayfada uyumlu olur.
4. Adım 5'i (find/replace) bitirin → temizlik.

Her adım bağımsız — ortada bırakırsanız bir şey kırılmaz. Beğenmediğiniz adımı geri alın.

---

## Sonraki adım?

Belirli bir ekran/component için (örn. hub canvas, brief sliders, report sheet) **birebir patch** isterseniz: o ekranın CSS bölümünü söyleyin, sınıf bazında dönüşüm yazayım.
