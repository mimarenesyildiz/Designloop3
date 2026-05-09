# Malzeme Hub Yeniden Tasarımı & Uygulama Planı (Keşif ve Bütçe Odaklı)

## Bağlam
Mevcut Malzeme Hub'ı, sadece objelerin kaplamalarını değiştiren basit bir doku kütüphanesi olmaktan çıkarılıp "Bütçe Farkındalığı (Value Engineering)", "İnovatif Malzeme Keşfi" ve "Teknik Bilgilendirme" işlevini üstlenen profesyonel bir İç Mimar Asistanı paneline dönüştürülecektir. 

Renk Hub'ındaki 60/30/10 mantığı, burada yerini **Maliyet x Yüzey Büyüklüğü (Bütçe Yönetimi)** matematiğine bırakacaktır.

## Hedef (3 Ana Sütun)
1. **Material Passport (Malzeme Kimliği):** Uygulanan veya seçilen malzemenin dayanıklılık, karbon ayak izi ve bakım zorluğunu şık kartlarla sunmak.
2. **Budget Impact (Maliyet Etki Analizi):** Malzemenin "Fiyat/Prestij" çarpanını, uygulandığı yüzeyin "Yüzdelik Büyüklüğü (Coverage)" ile çarparak mekanın bütçesine olan yükünü canlı olarak hissettirmek.
3. **On-Demand Keşif (Look for Less & Surprise Me):** Kullanıcıyı bilmediği veya aklına gelmeyen muadil, düşük maliyetli ama yüksek dirençli (örn. Doğal Ahşap yerine LVP, Mermer yerine Porselen) inovatif malzemelerle tanıştırmak.

---

## Faz 1: Altyapı ve Malzeme "Metadata" Genişletmesi

### 1.1 Mevcut Maliyet Veritabanının Zenginleştirilmesi (Cost Database)
**Dosya:** `cost-database.json`
Projede önceden var olan muazzam Metraj/Maliyet veritabanı (Porselen Seramik 850₺ vb.) Malzeme Hub'ının kalbi olacaktır. Regex kurguları veya AI yerine **bu database** kullanılacaktır.
Pasaport verileri için, mevcut JSON objelerine birkaç yeni key eklenecek/detaylandırılacaktır:
```json
{ 
  "id": "db-22", "category": "Zemin", "name": "Masif Parke", "unitPrice": 2200, "labor": 350,
  "durability": "high", "maintenance": "requires_polish", "ecoFriendly": 4,
  "lookForLess": "db-25" // LVT Vinil Zemin (650₺)
}
```

### 1.2 "Gerçek Bütçe x Metraj" Hesaplama Modülü (Akıllı Lüks Algoritması)
**Dosya:** `script.js`
Yeni bir fonksiyon yazılacak: `calculateMaterialBudgetImpact(targetIndex, dbItemId)`
- Alan verisi perspektif yanılsaması (pixel) olmadan doğrudan **Metraj (Takeoff)** verisinden çekilir (Örn: Duvar 45 m²).
- `cost-database.json` içinden seçilen malzemenin `(unitPrice + labor)` toplamı alınır.
- `Gerçek Metraj (m²) x Toplam Birim Fiyat` yapılarak mekanın o yüzeyi için **TAM BÜTÇE** hesaplanır.
> [!IMPORTANT]
> **Mimari Algoritma (Bütçe Uyarı ve Akıllı Lüks):**
> - Geniş Metrajlı Yüzey x Yüksek Birim Fiyat (Örn: Masif Parke) = `Kritik Bütçe Yükü (Kırmızı İkaz)`
> - Küçük Metrajlı Özel Yüzey x Yüksek Birim Fiyat (Örn: Vurgu Nişi) = `Akıllı Lüks / Smart Luxury (Yeşil Rozet)`
> Böylece 1-4 gibi soyut ölçekler değil, **gerçek TL bütçeleri** üzerinden profesyonel bir finansal yönlendirme yapılır.

---

## Faz 2: UI Değişiklikleri - Malzeme Pasaportu ve Metreler

### 2.1 Malzeme Detay Kartı (Material Passport View)
Kullanıcı bir malzeme atadığı an ekranda sıkıcı bir liste yerine malzemenin "Pasaportu" açılır:
- **İkonlu Teknik Veriler:** `💧 Su Hasassiyeti Yüksek`, `🛠 Düzenli Bakım İster`, `💰💰💰💰 Lüks Seri`.
- **Kısa Not:** *"Islak hacimlerde ve mutfak tezgahlarında asite karşı koruma tabakası şarttır. Zemin uygulamalarında ömür boyu asalet sunar."*

### 2.2 Maliyet Etki Çubuğu (Budget Impact Bar)
Malzeme panelinin altında beliren grafiksel bar:
- Bar ibresi matematiksel sonuca göre hareket eder.
- "Kırmızı" bölgeye girdiğinde *"Uyarı: Bu Lüks malzeme sahnede çok geniş bir alana uygulandığı için bütçeyi oldukça yukarı taşıyacaktır."* yazar.

---

## Faz 3: AI ve Oyunsallaştırılmış Keşif Araçları

### 3.1 "Görünümü Ucuza Elde Et" Butonu (Look for Less)
- Eğer `costLevel` 3 veya 4 hesaplanan doğal bir malzeme (Doğal Meşe, Som Mermer vb) atanırsa, Pasaportun altına parlayan bir **"Muadilini Keşfet"** butonu gelir.
- AI veya mevcut mapping üzerinden, maliyet seviyesi 1 veya 2 olan ama görünüşte aynı hissiyatı veren 2 alternatif ekrana sürülür.
  - Örn: *Büyük Ebatlı Porselen Seramik (Maliyet: $$ | Bakım: Yok)*
- Kullanıcı tek tıkla sahnede bunu test edebilir.

### 3.2 Lokal İlham Çarkı ("Beni Şaşırt" Swipe Kartları)
- Kullanıcı spesifik bir segmente (örn: Duvar) tıkladığında "Sıradışı Alternatifler Ver" butonu olur.
- Bu sadece geleneksel Boya/Duvar kağıdı aramak yerine, arka planda AI'dan 3 tamamen farklı doku (A/B Test / Tinder misali) cevabı alır.
  - Kart 1: *3D Akustik Ahşap Çıta (Dikey Algı)*
  - Kart 2: *Mikroçimento (Endüstriyel His)*
  - Kart 3: *Fluted Sıva Uygulaması*
- Kullanıcı kartı sağa kaydırarak veya "Uygula" diyerek hemen mekanda sınırları aşar.

---

## Faz 4: Boundary ve State Temizliği

Mimarinin stabil ve hatasız çalışması için:
- Bu oyunlaştırılmış Material Mode içerisinde de eski malzeme seçimlerinin üst üste binmemesini sağlamak için `perSegmentMaterialMode` state'i oluşturulur.
- Malzeme hub'ı kapandığında Cache (Önbellek) tutulur ancak sahnede uygulanan doku haricinde UI (Pasaport vs) kirliliği temizlenir.

---

## Doğrulama Adımları (Verification)
1. **Akıllı Lüks Doğrulaması:** Calacatta Mermer (Lüks) çok geniş bir "Zemin" segmentine uygulandığında kırmızı bütçe barının (Bütçe Uyarısı) çıkmasını test edin. Aynı mermer küçük bir Tv Ünitesi arkasına (%10) atandığında ise yeşil renkli "Akıllı Lüks" ikonunun çıktığını doğrulayın.
2. **Look For Less Doğrulaması:** Pahalı malzeme seçildiği an altında "Muadilini Bul" butonunun triggerlandığını (tetiklendiğini) görüntüleyin.
3. **Passport UI:** Malzeme değiştirildiğinde bakım ve dayanıklılık ikonlarının dinamik olarak değiştiğinden (Porselen'de %100 su dayanımı, Halıda %0) emin olun.
