# Cost Database (Maliyet ve Malzeme Veritabanı) Mimari Geliştirme Planı

## Bağlam
Mevcut `cost-database.json` dosyası, mükemmel bir saf "Keşif/Metraj" aracıdır. Ancak **Malzeme Hub**'ının (Bütçe Farkındalığı, Malzeme Pasaportu, Muadil Bulma) kalbi olabilmesi için, bu veritabanının düz bir excel formatından çıkarak **"İlişkisel ve Akıllı Bir Mimari Veritabanına" (Relational Architectural DB)** dönüşmesi gerekmektedir.

## Hedef
Veritabanını baştan yazmak yerine, mevcut `unitPrice`, `labor` verilerini koruyarak; AI gereksinimlerini, UI pasaportlarını ve oyunlaştırılmış özellikleri (Smart Luxury, Look for Less) destekleyecek yeni `key`'ler eklemek.

---

## Faz 1: Schema (Şema) Genişletmesi

Şu anki yapıya ek olarak 3 ana metrik bloğu eklenmelidir:

### 1. "Material Passport" (Teknik Kimlik) Bağlantıları
UI'da şık pop-up'larda / ikonlarda çıkacak bilgiler:
- `durability` (Dayanıklılık Eğrisi): `1-5` (1: Narin/Çizilir, 5: Endüstriyel direnç).
- `waterResistance` (Su Direnci): `true/false` veya `0-100`. Banyo/Mutfak atamalarında hata yapılmasını engeller.
- `maintenance` (Bakım İhtiyacı): `"zero", "low", "high"`. (Masif parke cila ister -> high).
- `ecoFootprint` (Karbon Ayak İzi): Sürdürülebilirlik rozeti kazandırmak için.

### 2. "Smart Connections" (İlişkisel Ağlar)
Sistemin AI beklemeden anında muadil veya vizyon sunmasını sağlayacak harita:
- `lookForLessId`: Eğer ilgili malzeme aşırı pahalıysa (örn: Lamine Meşe), onun "uygun fiyatlı görsel muadilinin" veritabanındaki diğer ID'si (Örn: `"db-25"` - LVT Zemin).
- `compatibleStyles`: Bu malzemenin hangi mimari tarzlara ait olduğunu belirtir. `["japandi", "warm_minimal", "bohemian"]`. (Bu sayede sistem "Japandi" stilini tek tıkla sahneye giydirirken bu listeden çeker).

### 3. Rendering / Görsel Atama Metadataları
- `previewHex` / `textureType`: Canvas üzerinde o malzemenin piksel blend rengi/tipi (örn: Ahşap malzeme seçilince sahne önce `#D2B48C` koduna nötrlenip, ağaç damarı harmanlaması yapılır).
- `renderPromptAffix`: Görüntü render'a gönderilirken o malzeme için modele eklenecek sihirli kelimeler. (Örn: Porselen için `"high gloss, reflective marble texture, 60x120 slab"`).

---

## Faz 2: Örnek Modellenmiş Yeni Veri Yapısı

Mevcut yapıdan yeni yapıya geçiş örneği:

**Eski Hali (Saf Maliyet):**
```json
{ 
  "id": "db-22", "category": "Zemin Kaplamaları", "name": "Masif Parke (Meşe)", 
  "unit": "m²", "unitPrice": 2200, "labor": 350, "supplierNote": "Sistre dahil." 
}
```

**Yeni Hali (Akıllı Hub Motoru):**
```json
{ 
  "id": "db-22", 
  "category": "Zemin Kaplamaları", 
  "name": "Masif Parke (Meşe)", 
  "unit": "m²", 
  "unitPrice": 2200, 
  "labor": 350, 
  "supplierNote": "Sistre ve cila işçiliği dahildir.",
  
  // -- YENİ: PASAPORT BİLGİLERİ --
  "passport": {
    "durability": 3,
    "waterResistance": false,
    "maintenance": "high",
    "ecoFootprint": "medium",
    "shortNote": "Ömür boyu asalet sunar ancak nemli alanlardan uzak tutulmalıdır."
  },

  // -- YENİ: MUADİL VE STİL İLİŞKİLERİ --
  "relations": {
    "lookForLessId": "db-25", // LVT kaplamaya giden direkt köprü
    "styles": ["mid-century", "classic", "japandi"]
  },

  // -- YENİ: GÖRÜNTÜ İŞLEME & AI --
  "rendering": {
    "materialClass": "wood",
    "uiColorHex": "#9C6B30",
    "aiPromptAffix": "solid oak wood floor, visible grain texture, matte finish"
  }
}
```

---

## Faz 3: Uygulama Geliştirme Akışı

### 3.1 Otomatik Migrasyon (Migration Script)
Tek tek 67 öğeyi JSON'a elle girmek intihar olur. `scripts/` klasörü altına minik bir NodeJS betiği veya `script.js` içine tek seferlik bir fonksiyon yazılır. 
- AI Model API (veya ChatGPT) kullanılarak mevcut `cost-database.json` yapısına JSON Şeması (Schema) verilir.
- Tüm ürünlerin pasaportları ve İngilizce render promptları saniyeler içinde otomatik doldurtulup yeni DB olarak kaydedilir.

### 3.2 "Look For Less" (Graph/Ağ Testi)
Sistemde dairesel döngü (circular dependency) veya kırık bağlantı kalmamalıdır. Örneğin Mermer (`db-24`), muadil olarak gidip yine kendisinden pahalı olan başka bir mermeri işaret etmemelidir. Uygun fiyatlı `unitPrice` hedeflenmelidir.

### 3.3 Hata Önleme Süzgeci (Smart Eligibility)
- `waterResistance: false` olan bir malzeme (örn: Laminat Parke) eğer "Banyo / Islak Hacim" segmentine atanmaya çalışılırsa UI anında **Titreme Animasyonu** ve kırmızı `Uyarı: Bu malzeme ıslak hacimde şişme yapar!` uyarısı verecektir. (Böylece iç mimarlar stajyerleri bile bu programla eğitebilir).

---

## Sonuç
`cost-database.json` dosyasını bu formata yükselttiğimizde:
1. Malzeme Hub'ı %100 istikrarlı (Stable) çalışır.
2. AI Halüsinasyonları biter, çünkü `aiPromptAffix` içindeki sihirli kelimeler her malzeme için optimize edilip kilitlenmiştir.
3. Uygulamanız; bütçeyi, mimari kuralları ve render zekasını tek bir veritabanında harmanlamış olur.
