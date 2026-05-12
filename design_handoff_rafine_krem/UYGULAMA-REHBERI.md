# DesignLoop · Rafine Krem'i Sitenize Uygulama

Bu rehber, `Designloop3` repo'nuzdaki mevcut yapıyı **bozmadan**, sadece görsel cila uygulamak içindir. Sıralı uygulayın — her adım bağımsız çalışır, ortada bırakırsanız da bir şey kırılmaz.

---

## 1) Token dosyasını ekleyin

`handoff/refine-tokens.css` dosyasını projenize kopyalayın:

```
src/styles/refine-tokens.css
```

Mevcut **style.css'in EN ÜSTÜNE** ekleyin (kendi kurallarınızı override etmesin diye):

```css
@import "./refine-tokens.css";
/* ...mevcut stilleriniz aşağıda... */
```

Bu adımdan sonra `var(--bg)`, `var(--accent)`, `var(--font-display)` gibi değişkenler kullanılabilir hale gelir. Hiçbir şey görsel olarak değişmez (henüz).

---

## 2) Body & temel font'u uygulayın

Mevcut `body { ... }` kuralınızı şöyle güncelleyin:

```css
body {
  background: var(--bg);            /* eskiden #f4f4f1 idi → #f5f1e8 */
  color: var(--text);
  font-family: var(--font-body);    /* Manrope kalıyor */
}
```

Ve sayfada **başlıkları (`h1, h2, h3`)** Newsreader serif yapmak için:

```css
h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: -0.02em;
}
```

> Bu tek adım, sitenin **%60 hissini** rafine krem yönüne çekecek.

---

## 3) Mavi'yi ink-blue ile değiştirin

`style.css` içinde geçen tüm parlak mavi (`#2667ff` ve türevleri) renklerini bulup `var(--accent)` ile değiştirin. Hızlı yol:

```bash
# style.css içinde — bunları find/replace yapabilirsiniz:
#2667ff      →  var(--accent)
#1f5be0      →  var(--accent)
#3b82f6      →  var(--accent)
rgba(38,103,255, *) → var(--accent-soft)   /* bg/hover için */
```

Aynısı **status renkleri için** de geçerli — yumuşak ton istiyorsanız:
- yeşil → `var(--good)`
- turuncu/uyarı → `var(--warn)`
- kırmızı → `var(--danger)`

---

## 4) Bileşen sınıflarını eşleyin

Mockup'taki bileşen isimleri muhtemelen sizinkilerle birebir aynı **değil**. En etkili eşlemeler:

| Mockup'taki sınıf      | Sitenizdeki muhtemel karşılığı                                  |
| ---------------------- | --------------------------------------------------------------- |
| `.nav-pill`            | step navigasyonu (Kurulum / Analiz / Brief …)                   |
| `.choice-chip`         | brief sayfasındaki "Kontrollü Yenileme / Premium Yorum…" chip'leri |
| `.btn` / `.btn-primary`| tüm buton CTA'lar                                               |
| `.panel`               | beyaz kart panelleri (resepsiyon karar paneli, brief paneli)    |
| `.section-title`       | sayfa başlığı (büyük serif başlık)                              |
| `.eyebrow`             | başlık üstündeki `STEP 02 · ANALİZ` mono etiketi                |
| `.ai-suggestion`       | AI yorum / öneri kutuları                                       |

İki seçeneğiniz var:

**A) Hızlı yol:** Kendi sınıflarınıza ek olarak bu sınıfları HTML'inize ekleyin. Örn:
```html
<button class="btn btn-primary brief-cta">Alternatifleri Üret</button>
```

**B) Temiz yol:** Kendi sınıflarınızın altına `refine-tokens.css`'teki kuralların aynısını taşıyın:
```css
.brief-cta {        /* sizin mevcut sınıfınız */
  background: var(--text); color: var(--bg-paper);
  border: 1px solid var(--text);
  border-radius: var(--radius-pill);
  padding: 10px 16px;
  font: 600 13px/1 var(--font-body);
}
```

---

## 5) Köşeleri yumuşatın

Mockup `--radius: 16px` kullanıyor. Sitede çok keskin köşeli kart varsa:
- Kartlar / paneller → `border-radius: var(--radius);` (16px)
- Inputlar → `var(--radius-sm);` (10px)
- Pill'ler / butonlar → `var(--radius-pill);` (999px)

---

## 6) İnce hatları kullanın

Mevcut sitede genellikle koyu/kalın `border` veya `box-shadow: 0 4px 12px ...` kullanıyorsanız, bunları **hairline** ile değiştirin:

```css
.card {
  border: 1px solid var(--hairline);
  box-shadow: none;          /* gölgeyi kaldır, hairline yeterli */
}
```

Ayırıcılar:
```html
<hr class="hairline-dashed">
```

---

## 7) Eyebrow + mono numaralandırma ekleyin (opsiyonel ama fark yaratır)

Sayfa başlığının üstüne küçük bir mono etiket koyduğunuzda editöryel his kuvvetlenir:

```html
<p class="section-heading-meta">Step 02 · Analiz</p>
<h2 class="section-title">Mekan Analizi</h2>
```

Aynı kalıbı step navigasyonunda **01 / 02 / 03** olarak yeniden kullanın — mockup'ta bu detay var.

---

## Test sırası

1. Sadece `refine-tokens.css`'i import edin → site bozulmamış olmalı.
2. `body` ve `h*` kurallarını güncelleyin → font/atmosfer geçişi olur.
3. Bir sayfada (örn. Brief) chip'leri ve butonları sınıf eşlemesiyle güncelleyip kıyaslayın.
4. Beğendiyseniz aynı kalıbı diğer sayfalara yayın.

---

## Yardım gerekirse

Repo'nuzdaki **belirli bir dosyayı** (örn. `style.css` veya bir component) buraya iliştirin — sınıfları birebir eşleyip patch çıkarabilirim. Ya da GitHub linkini Import menüsünden bağlarsanız, ben repo üzerinden gidip her ekranı tek tek dönüştürebilirim.
