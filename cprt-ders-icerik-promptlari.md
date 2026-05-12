# CPRT Yazı İçerik Promptları

Bu dosya, Claude Projects içinde CPRT / Landreth kaynak dokümanları yüklüyken yalnızca ders metinlerini ve görsel brief'lerini üretmek için hazırlandı.

SVG kodlarını bu promptla ürettirmeyin. Görseller için ayrı prompt:

[cprt-svg-gorsel-promptlari.md](/Users/enesyildiz/Desktop/filial/docs/prompts/cprt-svg-gorsel-promptlari.md)

Kullanım:

1. Claude projesine `Child-Parent-Relationship-Therapy-CPRT-a-10-Session-Filial-Therapy-Model-Garry-L-Landreth-Sue-C-Bratton.pdf` dosyasını ve varsa diğer CPRT / Landreth dokümanlarını yükleyin.
2. Aşağıdaki **Ortak Yazı Prompt Gövdesi** bölümünü kopyalayın.
3. Üretmek istediğiniz dersin **Ders Brief'i** bölümünü aynı mesajın altına ekleyin.
4. Claude'a tek mesaj olarak gönderin.
5. Çıkan markdown içindeki `<!-- ILL: ... -->` satırlarını koruyun; SVG üretimi ikinci promptla yapılacak.

Not: `empati-temelleri` için prompt zaten oluşturulduğu için bu dosyada diğer dersler yer alır.

---

## Ortak Yazı Prompt Gövdesi

~~~text
Filial terapi eğitim uygulamam için aşağıda belirttiğim dersin kart metinlerini ve SVG görsel brief'lerini sıfırdan yazmanı istiyorum.

Referans olarak bu projeye yüklediğim CPRT / Landreth dokümanlarını kullan. Kendi bilginden ekleme yapma. Doldurman gereken bir boşluk varsa açıkça "dokümanda yok" diye işaretle.

Bu aşamada SVG, JSX, React component veya görsel kodu üretme. Sadece kart markdown'u ve `<!-- ILL: ... -->` görsel brief satırları üret.

## Sistem hakkında bilmen gerekenler

Uygulama kartları mobilde gösteriyor. Her kart için kullanılabilir alan yaklaşık 335 x 500 piksel ve İÇ KAYDIRMA YOK; taşma kabul edilmez.

Ders 5-7 dakika tempoda okunabilsin. Toplam 10-14 kart üret. Her kart şu bütçelerden birine uysun:

- Yalın metin kartı: en fazla 400 karakter (başlık + 3-4 kısa paragraf)
- SVG eşlikli kart: en fazla 180 karakter metin + bir görsel notu
- Tek SVG hero kart: 20-40 karakter altyazı + tam ekran görsel notu
- Alıntı (cep notu) kartı: 90 karakteri geçmeyen tek cümle + kaynak
- Do/Don't kartı: Yapma ve Yap her biri 90-140 karakter
- Senaryo mini kartı: 3 satırlık tablo, her satır max 40+60 karakter
- Demo diyalog kartı: 3-5 replik, Durum + Not + replikler, her replik max 70 karakter
- Quiz kartı: soru max 90 karakter, 3 şık her biri 50-80 karakter, kısa açıklama max 180 karakter

## Çıktı formatı - markdown özel işaretçiler

Parser şu kalıpları kart tipine çeviriyor; başka biçim kullanma:

- `## Başlık` yeni bir concept kart başlatır
- `**Yapma:** X  **Yap:** Y` do/don't kartı
- `> "kısa alıntı" — kaynak` cep notu kartı
- `| Durum | Yanıt |` markdown tablo scenario_mini kartı
- `:::demo` ... `:::` bloğu ebeveyn/çocuk diyalog kartı
- Demo bloğunda yalnızca `Durum:`, `Ebeveyn:`, `Çocuk:`, `Not:` satırları kullan
- `{{childName}}` çocuğun adı; en az 3-4 kartta kullan

Quiz ayrı bir JSON blok olarak EN SONDA ver:

```json
{
  "quiz": [
    {
      "q": "Soru metni?",
      "options": [
        { "text": "Şık A", "correct": false },
        { "text": "Şık B", "correct": true },
        { "text": "Şık C", "correct": false }
      ],
      "explanation": "Doğru cevabın neden doğru olduğunu 1-2 cümleyle açıkla."
    }
  ]
}
```

3 quiz sorusu üret. Sorular dersi sıkıştırmak için değil, pekiştirmek için olsun. Ezber değil, küçük bir uygulama kararını test etsin.

## Görsel brief'leri

Görsel istediğin kartlarda, ilgili `## Başlık`ın hemen altına şu formatta tek satırlık yer tutucu yaz:

`<!-- ILL: kisa-slug | kompozisyon tarifi (max 140 karakter) -->`

Mümkün olduğunca görsel yoğun bir ders üret: 10-14 kartın 6-9 tanesinde `ILL` brief'i olsun. Görselli kartlarda metni daha kısa tut; başlık + gövde toplamı 180 karakteri geçmesin.

Her `ILL` slug'ı benzersiz olsun ve ders id'siyle başlasın. Örnek: `duygu-yansitma-firtina-balonu`.

Alıntı, demo ve quiz kartlarına `ILL` koyma. En iyi adaylar kısa concept kartları, hero kartlar, do/don't kartları ve scenario_mini kartlarıdır.

Görsel tarifleri somut olsun: kaç figür, nasıl duruyor, hangi unsur öne çıkıyor. Sade çizgi öner; karmaşık sahneler 335 x 500'e sığmaz.

Ders brief'indeki 2-3 görsel adayı başlangıçtır. Gerekiyorsa aynı ders temasından yeni sade sahneler türet ve görsel sayısını artır.

## Ton ve kurallar

- Türkçe yaz.
- "Siz" formunu kullan.
- Yumuşak, yargılamayan, kısa cümleler kur.
- Klinik jargondan kaçın.
- Paragrafları kısa tut; 2-3 cümleden uzatma.
- "Çocuğunuz" yerine mümkün olduğunda `{{childName}}` kullan.
- "Her zaman" ve "asla" gibi mutlak kalıplardan kaçın.
- "Çoğu zaman", "çoğunlukla", "bu anda" gibi daha esnek ifadeler kullan.
- Kaynakta olmayan iddia, araştırma sonucu, yaş genellemesi veya teknik ekleme yapma.
- Alıntı kullanırsan kısa tut ve kaynağı belirt.
~~~

---

## Ders Brief'leri

### 0.1 - Filial Terapi Nedir?

```text
## Ders bilgisi

Ders: Filial Terapi Nedir?
Müfredat karşılığı: Modül 0, 1. ders
Uygulamadaki lesson id: filial-terapi-nedir
Alt başlık: 10 haftalık yolculuğa giriş

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Filial terapi nedir: ebeveynin terapötik oyun becerilerini öğrendiği, ilişki merkezli bir yaklaşım.
- Köken: Bernard ve Louise Guerney; Landreth ve Bratton'ın CPRT yapısı.
- Ana fikir: Değişimin aracı ilişki; ebeveyn çocuğun hayatındaki güçlü iyileştirici figür.
- CPRT'nin 10 oturum / 10 hafta yapısı ve bu uygulamanın o yola eşlik ettiği.
- Be-With mesajları: Buradayım, seni duyuyorum, anlıyorum, önemsiyorum, seninle olmaktan keyif alıyorum.
- Filial terapinin genel pozitif ebeveynlikten farkı: özel oyun zamanı, non-direktif tutum, seçilmiş oyuncaklar, ACT sınır koyma.
- Ne değildir: hızlı davranış düzeltme, nasihat, öğretme, çocuğun oyununu yönetme, terapi yerine geçen acil destek.
- Günlük hayattan 2-3 somut örnek: oyuncak atma, sarılma isteme, "ne yapayım?" diye sorma.
- Bir mini demo diyalog: {{childName}} oyun sırasında bir şey yapar; ebeveyn öğretmeden ve yönlendirmeden eşlik eder.
- Bir kısa alıntı / cep notu: Landreth, Bratton veya CPRT dokümanlarından.
- Kapanış: Bu yolculuğun teknik öğrenmekten çok ilişki dili kurmak olduğunu hatırlat.

## Görsel adayları

- Göz hizasında yerde oturan ebeveyn ve çocuk, aralarında tek oyuncak, ikisi aynı oyuna bakıyor.
- Beş küçük ikon: kulak, göz, kalp, açık el, gülümseyen yüz; tek çizgide dizili.
- 10 küçük taşlı yol, başta ebeveyn-çocuk figürü, sonda küçük oyun alanı.
```

### 1.2 - Duygu Yansıtma Teknikleri

```text
## Ders bilgisi

Ders: Duygu Yansıtma Teknikleri
Müfredat karşılığı: Modül 1, 2. ders
Uygulamadaki lesson id: duygu-yansitma
Alt başlık: Çocuğunuzun duygusal dilini çözümlemek

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Duygu yansıtma nedir: çocuğun gösterdiği veya söylediği duyguyu kısa ve kabul edici biçimde geri vermek.
- Empatiyle dinlemeden farkı: bu derste duyguya bağlam, ton ve çeşitlilik eklenir.
- Basit yansıtma: "Çok kızgın görünüyorsun" gibi kısa duygu cümlesi.
- Genişletilmiş yansıtma: duygu + tetikleyici olay.
- Metafor kullanımı: küçük çocuk için duyguyu somutlaştıran sade benzetmeler; dokümanda varsa kullan, yoksa "dokümanda yok" diye belirt.
- Olumlu duyguları yansıtma: gurur, heyecan, mutluluk, merak.
- Neden işe yarar: {{childName}} duygusunu tanır, adlandırır, zamanla kendi kendini düzenlemeyi öğrenir.
- Sık hatalar: aynı kelimeyi mekanik tekrarlama, duyguyu büyütme/abartma, hemen çözüm önermeye dönme.
- Do/Don't kartı: "Kızgınsın. Kızgınsın." yerine duygu + bağlam.
- Günlük hayattan 3 satırlık tablo: ayakkabı giymek istememe, yapboz parçası oturmama, bir şeyi başardığında gurur duyma.
- Bir mini demo diyalog: {{childName}} bir şey başaramayınca hüsrana uğrar; ebeveyn duygu + bağlam yansıtır.
- Kapanış: Bugün bir zor, bir olumlu duyguya isim verme pratiği.

## Görsel adayları

- Çocuğun ağzından yağmur bulutu çıkar; ebeveynin balonunda aynı duygu sade kelimeyle aynalanır.
- Üç küçük kart: yüz ifadesi, duygu kelimesi, kısa ebeveyn cümlesi.
- Mutlu çocuk zıplar; ebeveyn yanında gülümseyerek "Heyecanlısın" balonu taşır.
```

### 1.3 - Çocuğun Davranışını Okumak

```text
## Ders bilgisi

Ders: Çocuğun Davranışını Okumak
Müfredat karşılığı: Modül 1, 3. ders
Uygulamadaki lesson id: davranisi-okumak
Alt başlık: Görünenin altındaki mesajı çözmek

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Davranışın iletişim olduğu fikri: çocuk çoğu zaman ihtiyacını sözle değil davranışla anlatır.
- Görünen davranış ile alttaki duygu / ihtiyaç ayrımı.
- Buzdağı metaforu dokümanda geçiyorsa kullan; geçmiyorsa "dokümanda yok" diye işaretle.
- Davranışı "iyi/kötü" diye etiketlemek yerine "Bu bana ne anlatıyor?" sorusu.
- Beden dilini okuma: sıkılmış yumruk, omuzların çökmesi, kaçınma, aşırı hareketlilik gibi kaynakta geçen ipuçları.
- Gelişimsel kapasite: dokümanda küçük çocukların duygu ve dürtü kontrolü hakkında ne deniyorsa yalnızca onu kullan.
- Neden işe yarar: ebeveyn yargıdan meraka geçince {{childName}} daha çabuk duyulmuş hisseder.
- Sık hatalar: "inatçı", "şımarık", "yaramaz" etiketi; sadece davranışı bastırmaya çalışma; ihtiyacı görmeden nasihat.
- Günlük hayattan 3 satırlık tablo: markette ağlama, oyunu bozma, kardeşin oyuncağını çekme.
- Bir mini demo diyalog: {{childName}} gürültülü ortamda oyunu bozar; ebeveyn alttaki ihtiyacı merak eder.
- Kapanış: Davranışa bakmadan önce bir nefes ve "altında ne olabilir?" sorusu.

## Görsel adayları

- Küçük buzdağı: üstte bağıran çocuk simgesi, altta yorgunluk/korku/ilgi ikonları.
- Ebeveyn diz çökmüş, çocuğun sıkılmış yumruğuna ve yüzüne dikkatle bakıyor.
- İki büyüteç: biri davranışa, biri alttaki duygu ikonlarına bakıyor.
```

### 1.4 - Özel Oyun Zamanı'na Bakış

```text
## Ders bilgisi

Ders: Özel Oyun Zamanı'na Bakış
Müfredat karşılığı: Modül 1, 4. ders
Uygulamadaki lesson id: ozel-oyun-zamani-bakis
Alt başlık: Filial terapinin kalbine ilk göz atış

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Özel Oyun Zamanı nedir: haftalık, korumalı, yapılandırılmış ebeveyn-çocuk oyun seansı.
- Bu ders yalnızca önizleme olsun; ayrıntı Modül 4'e bırakılır.
- Non-direktif tutumun özeti: ebeveyn öğretmez, yönlendirmez, yargılamaz; çocuğun liderliğini izler.
- Ebeveynin aktif rolü: gözlemek, yansıtmak, eşlik etmek; pasif bırakmak değildir.
- Filial terapinin genel oyundan farkı: zaman, alan, oyuncak, tek çocuk ve kesintisizlik.
- Şimdilik 2-3 "yapılmayacak": soru sorma, övme, yönlendirme.
- Ana cümle: "Bu oyun zamanında seçim senin; ben yanındayım."
- Günlük hayattan 3 satırlık tablo: blok seçme, bebeği besleme, ebeveyne oyuncak verme.
- Bir mini demo diyalog: {{childName}} oyuncağı seçer; ebeveyn sadece seçimi ve eylemi yansıtır.
- Bir kısa alıntı / cep notu: non-direktif tutum, özel oyun zamanı veya ilişki hakkında kaynaklı.
- Kapanış: "Oyun senin; ben yanındayım" tutumunu hatırlat.

## Görsel adayları

- Küçük oyun halısında ebeveyn kenarda oturur, çocuk oyuncak seçer; ebeveynin eli açık ve bekler.
- Telefon, saat ve kapı üstü çizili üç küçük ikon; ortada sade oyun halısı.
- Çocuk önde lider gibi yürür, ebeveyn bir adım geriden gülümseyerek takip eder.
```

### 2.1 - Çocuklar Neden Oynar?

```text
## Ders bilgisi

Ders: Çocuklar Neden Oynar?
Müfredat karşılığı: Modül 2, 1. ders
Uygulamadaki lesson id: cocuklar-neden-oynar
Alt başlık: Oyun onların kelimeleri, oyuncaklar onların dili

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Oyun, çocuğun doğal anlatım dili olarak açıklansın.
- "Oyun onların kelimeleri, oyuncaklar onların dili" ifadesi kaynakta geçtiği biçimiyle kullanılabilir.
- Yetişkinin konuşarak anlattığını çocuğun oyunla gösterebildiği anlatılsın.
- Sembolik ifade: oyuncak, karakter, kurgu veya tekrar eden oyun davranışı duygu anlatabilir.
- Oyun yalnızca eğlence değil; duygu işleme, kontrol kazanma ve ilişki kurma alanıdır.
- Yetişkin oyun anlayışı ile çocuk oyun anlayışı arasındaki fark: amaç, başarı, düzen yerine ifade ve deneyim.
- {{childName}} oyununda garip, tekrar eden veya dağınık görünen şeylerin anlam taşıyabileceği; ancak yorum dayatılmaması.
- Sık hatalar: oyunu hemen öğretici etkinliğe çevirmek, "doğru" oynatmak, oyunu küçümsemek.
- Günlük hayattan 3 satırlık tablo: doktorculuk, blok yıkma, bebeği besleme.
- Bir mini demo diyalog: {{childName}} oyuncak bebeği tekrar tekrar yatırır; ebeveyn anlam yüklemeden izler ve yansıtır.
- Kapanış: Oyuna "boş zaman" değil, {{childName}}'in dili gibi yaklaşma.

## Görsel adayları

- Çocuğun ağzı yerine oyuncaklardan çıkan konuşma balonları; ebeveyn kulak vererek oturur.
- Üç oyuncak yan yana: bebek, blok, doktor çantası; her birinden küçük duygu simgesi çıkar.
- Ebeveyn büyük konuşma balonunu indirir, çocuk küçük oyuncak sahnesini gösterir.
```

### 2.2 - İzleme (Tracking) Becerisi

```text
## Ders bilgisi

Ders: İzleme (Tracking) Becerisi
Müfredat karşılığı: Modül 2, 2. ders
Uygulamadaki lesson id: izleme-tracking-becerisi
Alt başlık: Yorumlamadan, sormadan, yönlendirmeden takip etmek

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Tracking nedir: {{childName}}'in yaptığı şeyi kısa, yorumsuz ve şimdiki zamanda sözle takip etmek.
- Amaç: çocuğa "seni izliyorum, yanındayım, liderliğin sende" mesajı vermek.
- Ana kalıp: fiil + nesne / eylem; "Blokları üst üste koyuyorsun."
- Tracking ile yorum arasındaki fark: "çok güzel kule" değil, "kuleyi yükseltiyorsun."
- Tracking ile soru arasındaki fark: "Ne yapıyorsun?" değil, "arabayı garaja sokuyorsun."
- Tracking ile yönlendirme arasındaki fark: "şunu da koy" değil, "kırmızı parçayı seçtin."
- Ne zaman susulacağı: her saniyeyi anlatmak zorunda olunmadığı, doğal ritim bırakıldığı.
- Sık hatalar: soru yağmuru, öğretme, övgüye kaçma, oyunu anlatırken çocuğun ritmini bozma.
- Do/Don't kartı bu ayrımı net göstersin.
- Günlük hayattan 3 satırlık tablo: blok, resim, arabalar.
- Bir mini demo diyalog: {{childName}} resim yapar; ebeveyn renkleri ve hareketi izler.
- Kapanış: Bugün 3 dakika yalnızca "ne görüyorum?" diliyle pratik.

## Görsel adayları

- Ebeveynin gözünden çıkan ince çizgi çocuğun elindeki bloğa gider; ağız balonunda kısa eylem cümlesi.
- Üç sütun: Soru işareti üstü çizili, yıldız övgü üstü çizili, göz ikonu onaylı.
- Çocuk araba sürer; ebeveyn yanında küçük not balonu: "Arabayı garaja sokuyorsun."
```

### 3.1 - ACT Modeli: Sevgiyle Sınır

```text
## Ders bilgisi

Ders: ACT Modeli: Sevgiyle Sınır
Müfredat karşılığı: Modül 3, 1. ders
Uygulamadaki lesson id: act-modeli-sevgiyle-sinir
Alt başlık: Acknowledge, Communicate, Target adımlarını uygulamak

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- ACT modeli nedir: Acknowledge, Communicate, Target adımları; Türkçe karşılıklarını sade ver.
- A: Duyguyu kabul etmek / görmek.
- C: Sınırı net ve kısa iletmek.
- T: Kabul edilebilir alternatifi göstermek.
- Sınırın sevgi karşıtı olmadığı; ilişki içinde güvenli çerçeve sunduğu.
- ACT'nin ceza, tehdit veya ödül pazarlığından farkı.
- Ana kalıp: "Kızgınsın. Vurmak olmaz. Yastığa vurabilirsin."
- {{childName}} için sınır cümlelerinin kısa, sakin ve tekrar edilebilir olması.
- Sık hatalar: A adımını atlamak, uzun açıklama yapmak, sınırı öfkeyle söylemek, alternatifsiz "hayır" demek.
- Do/Don't kartı: "Kes şunu!" yerine ACT cümlesi.
- Günlük hayattan 3 satırlık tablo: vurma, fırlatma, duvara çizme.
- Bir mini demo diyalog: {{childName}} oyuncağı fırlatır; ebeveyn ACT uygular.
- Bir kısa alıntı / cep notu: sınır koyma veya kabul hakkında kaynaklı.
- Kapanış: Önce duygu, sonra sınır, sonra güvenli seçenek.

## Görsel adayları

- Üç basamak: kalp ikonu, dur işareti, ok işareti; yanında ebeveyn ve çocuk.
- Çocuk yastığa yönelirken ebeveyn sakin durur; yerde fırlatılmayan oyuncak.
- A-C-T harfleri üç küçük kartta, her kartta tek ikon: kulak, el, hedef.
```

### 3.2 - Sınır Ne Zaman Gerekir?

```text
## Ders bilgisi

Ders: Sınır Ne Zaman Gerekir?
Müfredat karşılığı: Modül 3, 2. ders
Uygulamadaki lesson id: sinir-ne-zaman-gerekir
Alt başlık: Her rahatsızlığın sınır gerektirmediğini ayırt etmek

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Sınırın ne zaman gerekli olduğu: kaynakta geçen kategorileri kullan.
- Müfredat haritasındaki 3 kategori dokümanda varsa işle: kendine zarar, başkasına zarar, değerli mülke zarar.
- Her rahatsız edici davranışın sınır gerektirmeyebileceği.
- Oyun "dağınık", "garip" veya yetişkine göre mantıksız görünse de güvenliyse izlenebilir.
- Sınır ile tercih / rahatsızlık ayrımı.
- Gereksiz sınırın çocuğun liderliğini azaltabileceği.
- Önleyici sınır tuzağı: çocuk daha yapmadan çok fazla uyarı vermek.
- Ne zaman sadece izleme veya duygu yansıtma yeterlidir.
- Do/Don't kartı: "Böyle oynanmaz" yerine "Kamyonu kuma gömüyorsun."
- Günlük hayattan 3 satırlık tablo: boya taşması, yüksek ses, oyuncağı yere dizme.
- Bir mini demo diyalog: {{childName}} oyunu dağıtır ama zarar yoktur; ebeveyn sınır koymadan izler.
- Kapanış: Sınır az ama net olduğunda daha güvenilir olur.

## Görsel adayları

- Üç küçük uyarı üçgeni: kendine, başkasına, eşyaya zarar; yanında nötr oyun alanı.
- Ebeveyn iki kart tutar: "Sınır" ve "İzle"; çocuk güvenli ama dağınık oynar.
- Trafik lambası: kırmızı zarar, sarı dikkat, yeşil güvenli oyun.
```

### 3.3 - Tutarlılık ve Sakinlik

```text
## Ders bilgisi

Ders: Tutarlılık ve Sakinlik
Müfredat karşılığı: Modül 3, 3. ders
Uygulamadaki lesson id: tutarlilik-ve-sakinlik
Alt başlık: Sınırı öfkeyle değil kararlılıkla tekrar etmek

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Tutarlılık nedir: aynı sınırı, aynı sakinlikte ve aynı anlamla tekrar edebilmek.
- Sakinlik nedir: pasiflik değil; ses tonu ve bedenle güvenli çerçeve sunmak.
- Neden işe yarar: {{childName}} sınırın kişisel reddetme değil güvenli düzen olduğunu öğrenir.
- Sınır tekrarının kısa tutulması; uzun açıklama ve tartışmaya girmeme.
- Ebeveynin kendi bedenini fark etmesi: nefes, ses tonu, yüz ifadesi; dokümanda varsa kullan.
- İki ebeveyn / bakım veren arasında aynı dilin önemi.
- "Tek seferde anlasın" tuzağı ve gelişimsel gerçeklik; kaynak ne diyorsa onunla sınırlı kal.
- Sık hatalar: bir gün izin verip ertesi gün patlamak, sınırı tehdit gibi söylemek, çok konuşmak.
- Do/Don't kartı: "Kaç kere söyledim!" yerine kısa tekrar.
- Günlük hayattan 3 satırlık tablo: uyku, ekran, oyuncak fırlatma.
- Bir mini demo diyalog: {{childName}} sınırı tekrar dener; ebeveyn aynı cümleyi sakin tekrarlar.
- Kapanış: Sınır aynı, ton sakin, cümle kısa.

## Görsel adayları

- Ebeveynin ağzından aynı kısa cümle üç küçük balonla çıkar; çocuk farklı tepkiler verir.
- İki bakım veren yan yana aynı küçük kartı tutar: "Vurmak olmaz."
- Sakin yüzlü ebeveyn, göğsünde nefes çizgileri, önünde küçük dur işareti.
```

### 4.1 - 30 Dakika Kuralı

```text
## Ders bilgisi

Ders: 30 Dakika Kuralı
Müfredat karşılığı: Modül 4, 1. ders
Uygulamadaki lesson id: otuz-dakika-kurali
Alt başlık: Korumalı oyun zamanının neden pazarlıksız olduğunu anlamak

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Özel Oyun Zamanı'nın haftalık, aynı çocukla, aynı zamanda, kesintisiz yapılması.
- 30 dakikanın anlamı: yeterince uzun, sınırları belli, güven veren bir ritim; doküman ne diyorsa onu kullan.
- Bu zamanın ödül veya ceza yapılmaması.
- Telefon, ekran, kardeş, ev işi ve kesinti olmadan korunmuş alan.
- Başlama ve bitirme ritüeli: kaynakta geçen ifadeleri kullan; yoksa "dokümanda yok" diye işaretle.
- Seansı iptal / erteleme zorunluysa nasıl korunacağı; dokümanda varsa.
- Neden işe yarar: {{childName}} ilişki içinde özel, duyulmuş ve öngörülebilir bir alan yaşar.
- Sık hatalar: süreyi uzatıp kısaltmak, "iyi davranırsan oynarız" demek, kardeşi dahil etmek.
- Do/Don't kartı: oyun zamanını ödül gibi sunma yerine korumalı ritüel.
- Günlük hayattan 3 satırlık tablo: telefon çalması, kardeş girmesi, süre bitişi.
- Bir mini demo diyalog: süre bitmeden kısa hatırlatma ve bitiş.
- Kapanış: Bu zaman {{childName}}'in performansına değil, ilişkinize ait.

## Görsel adayları

- Oyun halısı üstünde 30 yazılı sade saat; ebeveyn ve çocuk yerde, telefon dışarıda.
- Kapı üstünde küçük "özel oyun zamanı" işareti, dışarıda kardeş ve telefon ikonları.
- Haftalık takvimde aynı gün işaretli; yanında küçük oyuncak kutusu.
```

### 4.2 - Oyuncak Seçimi: Seçilmiş, Toplanmamış

```text
## Ders bilgisi

Ders: Oyuncak Seçimi: Seçilmiş, Toplanmamış
Müfredat karşılığı: Modül 4, 2. ders
Uygulamadaki lesson id: oyuncak-secimi
Alt başlık: Duygusal ifade kapısı açan oyuncak kitini kurmak

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Oyuncak kitinin amacı: {{childName}}'in duygu, ilişki, bakım, güç ve günlük yaşam temalarını ifade etmesine alan açmak.
- Oyuncaklar günlük oyuncak yığını değil; seçilmiş ve özel oyun zamanına ayrılmış olmalı.
- Dokümanda geçen oyuncak kategorilerini kullan: bakım/nurturing, saldırgan/aggressive, yaratıcı/expressive, gerçek hayat gibi kategoriler varsa.
- Her kategori için 2-3 somut oyuncak örneği; yalnızca kaynakta geçen veya kaynakla uyumlu olanlar.
- Kaçınılacak oyuncaklar: elektronik, pille çalışan, yapılandırılmış / tek doğru yolu olan oyuncaklar; dokümanda geçiyorsa.
- Oyuncakların mükemmel veya pahalı olmak zorunda olmadığı; bütçe dostu kurulum kaynakta varsa.
- Neden işe yarar: oyuncaklar {{childName}}'e kelimeler yerine ifade yolu sağlar.
- Sık hatalar: tüm oyuncakları ortaya dökmek, öğretici oyuncak seçmek, kırılmasından korkulan değerli eşyaları koymak.
- Senaryo tablosu: bebek/biberon, kil/boya, oyuncak asker veya güç figürü.
- Bir mini demo diyalog: {{childName}} oyuncak seçer; ebeveyn seçimi yönlendirmez.
- Kapanış: Oyuncak az, amaç net, alan güvenli.

## Görsel adayları

- Dört bölmeli oyuncak kutusu: bebek, boya, kılıç/bop bag, mini mutfak parçası.
- Günlük oyuncak yığını üstü çizili; yanında küçük seçilmiş oyun çantası.
- Çocuk kutudan oyuncak seçer, ebeveyn arkada açık ellerle bekler.
```

### 4.3 - Oyun Zamanında Yapılmaması Gerekenler

```text
## Ders bilgisi

Ders: Oyun Zamanında Yapılmaması Gerekenler
Müfredat karşılığı: Modül 4, 3. ders
Uygulamadaki lesson id: oyun-zamaninda-yapilmamasi-gerekenler
Alt başlık: Soru, öğretme, övgü ve yönlendirmeyi askıya almak

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Özel oyun zamanında askıya alınacak ebeveyn refleksleri.
- Soru sormamak: "Ne yapıyorsun?" yerine tracking.
- Öğretmemek: "Böyle yapılır" yerine çocuğun denemesine alan açmak.
- Övmemek / yargılamamak: "Harika" yerine gözleme dayalı cesaretlendirme veya tracking.
- Yönlendirmemek: "Hadi ev yapalım" yerine çocuğun liderliğini izlemek.
- Düzeltmemek: oyun gerçekçi veya doğru olmak zorunda değil.
- Telefon, dikkat dağınıklığı ve başka iş yapmanın ilişki mesajını zayıflatması.
- Neden işe yarar: {{childName}} bu alanda yönetilmeden görülür.
- Do/Don't kartı mutlaka olsun: dört yasak refleks ve karşılığı.
- Günlük hayattan 3 satırlık tablo: yanlış renk, devrilen kule, yardım isteme.
- Bir mini demo diyalog: {{childName}} "sen de yap" der; ebeveyn liderliği çocuğa bırakır.
- Kapanış: "Ben sadece yanındayım; oyun senin."

## Görsel adayları

- Dört küçük ikon üstü çizili: soru işareti, öğretmen parmağı, yıldız, yön oku.
- Çocuk oyun halısında önde; ebeveynin ağzında kısa tracking balonu.
- Ebeveyn telefonu kapalı kutuya koyar, sonra çocukla göz hizasına iner.
```

### 5.1 - Övgü vs. Cesaretlendirme

```text
## Ders bilgisi

Ders: Övgü vs. Cesaretlendirme
Müfredat karşılığı: Modül 5, 1. ders
Uygulamadaki lesson id: ovgu-vs-cesaretlendirme
Alt başlık: Aferin refleksini sürece odaklı dile çevirmek

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Övgü ile cesaretlendirme arasındaki fark: sonuç/yargı yerine süreç/çaba/farkındalık.
- "Aferin", "çok güzel" gibi reflekslerin neden dikkatli kullanılacağı; kaynak ne diyorsa onunla sınırlı kal.
- Cesaretlendirme {{childName}}'in kendi yeterliliğini fark etmesine yardım eder.
- Ana kalıp: "Buna çok emek verdin." / "Kendin buldun."
- Sonucu değil süreci, çabayı, seçimi, kararlılığı ve duyguyu adlandırmak.
- Dış değerlendirme yerine içsel sahiplenme.
- Övgüyü tamamen yasaklayan mutlak bir dil kullanma; dokümanda nasıl geçiyorsa öyle yaz.
- Sık hatalar: abartılı övgü, kıyaslama, "en iyi", "mükemmel", sürekli onay verme.
- Do/Don't kartı: "Harikasın!" yerine sürece odaklı cümle.
- Senaryo tablosu: resim gösterme, kule yapma, yapbozu bitirme.
- Bir mini demo diyalog: {{childName}} "güzel mi?" diye sorar; ebeveyn sürece döner.
- Kapanış: Çocuğun gözünü sizin notunuza değil, kendi emeğine çevirin.

## Görsel adayları

- İki konuşma balonu: biri yıldızlı "Harika!", diğeri büyüteçli "Çok uğraştın."
- Çocuk resim tutar; ebeveyn resimdeki süreci gösteren küçük çizgilere bakar.
- Merdiven basamakları: deneme, uğraş, bulma; en üstte çocuk gülümser.
```

### 5.2 - Çocuğun Yeterliliğine İnanmak

```text
## Ders bilgisi

Ders: Çocuğun Yeterliliğine İnanmak
Müfredat karşılığı: Modül 5, 2. ders
Uygulamadaki lesson id: cocugun-yeterliligine-inanmak
Alt başlık: Aşırı yardım etmeden yanında kalmak

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Yeterlilik mesajı nedir: {{childName}}'in yapabileceğine güvenmek ve yanında kalmak.
- Yardım etmek ile çocuğun yerine yapmak arasındaki fark.
- Ebeveynin sabırsızlık, kaygı veya kurtarma refleksiyle aşırı müdahale edebileceği.
- Ana kalıp: "Zor görünüyor. Sen deniyorsun. Yanındayım."
- Çocuğun deneme, hata yapma ve çözüm bulma alanı.
- Başarısızlığı hemen düzeltmeden taşımasına yardım etmek.
- Ne zaman güvenlik için müdahale gerektiği; kaynakta varsa sınırı belirt.
- Sık hatalar: hemen yapmak, fazla ipucu vermek, "dur ben yapayım" demek, çocuğun hızını yetişkin hızına çekmek.
- Do/Don't kartı: "Ver, ben yapayım" yerine yeterlilik ve eşlik.
- Senaryo tablosu: fermuar, yapboz, oyuncak kutusu açma.
- Bir mini demo diyalog: {{childName}} yardım ister; ebeveyn problemi tamamen çözmeden yanında kalır.
- Kapanış: Güvenen bekleyiş de bir ebeveyn becerisidir.

## Görsel adayları

- Çocuk yapboz parçası dener; ebeveyn ellerini dizinde tutup göz hizasında bekler.
- İki el: biri çocuğun işini kapıyor üstü çizili, diğeri yanında açık bekliyor.
- Küçük dağ tırmanışı: çocuk önde, ebeveyn arkada güvenli mesafede.
```

### 6.1 - Temel Seçenek Sunma

```text
## Ders bilgisi

Ders: Temel Seçenek Sunma
Müfredat karşılığı: Modül 6, 1. ders
Uygulamadaki lesson id: temel-secenek-sunma
Alt başlık: A mı B mi yapısıyla kontrol ihtiyacını karşılamak

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Seçenek sunma nedir: ebeveynin kabul edebileceği iki seçenekle {{childName}}'e sınırlı kontrol alanı vermesi.
- Neden işe yarar: güç mücadelesi azalır, çocuk kendini etkili hisseder.
- Ana kalıp: "A mı, B mi istersin?"
- İki seçenek kuralı: fazla seçenek bunaltabilir; doküman ne diyorsa onu kullan.
- Her iki seçeneğin de ebeveyn için kabul edilebilir olması.
- Sahte seçenek vermemek: "Şimdi giyinecek misin?" gibi cevabı açık ama sınırı kapalı sorulara dikkat.
- Günlük rutinlerde kullanım: kıyafet, yemek, çıkış, diş fırçalama.
- Duyguyu kabul + seçenek kombinasyonu.
- Sık hatalar: çok seçenek vermek, kabul edilemeyecek seçenek sunmak, tehdidi seçenek gibi göstermek.
- Do/Don't kartı: "Hemen giyin!" yerine iki kabul edilebilir seçenek.
- Senaryo tablosu: tişört, elma, park bitişi.
- Bir mini demo diyalog: {{childName}} giyinmek istemez; ebeveyn iki seçenek sunar.
- Kapanış: Seçenek küçük olabilir; kontrol hissi büyük olabilir.

## Görsel adayları

- Ebeveyn iki kart tutar: kırmızı tişört ve mavi tişört; çocuk birine uzanır.
- Yol ikiye ayrılır: A ve B okları; ikisi de aynı güvenli hedefe çıkar.
- Çocuk diş fırçası ve pijama kartları arasında seçim yapar.
```

### 6.2 - İleri Seçenek: Sonuç Bağlantılı

```text
## Ders bilgisi

Ders: İleri Seçenek: Sonuç Bağlantılı
Müfredat karşılığı: Modül 6, 2. ders
Uygulamadaki lesson id: ileri-secenek-sonuc-baglantili
Alt başlık: Sınır ihlalinde sonucu seçenekle ilişkilendirmek

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Sonuç bağlantılı seçenek nedir: sınır ihlalinde iki yol ve doğal/mantıklı sonuç sunmak.
- Ana kalıp: "Nazikçe kullanabilirsin ya da rafa koyarız. Sen seç."
- ACT ile ilişkisi: önce duygu ve sınır, sonra kabul edilebilir seçenek.
- Sonucun davranışla bağlantılı olması; ceza gibi kopuk olmaması.
- Ebeveynin öfke değil çerçeve üzerinden konuşması.
- Çocuğun seçiminin sonucunu sahiplenmesine alan açmak.
- Uyarıyı uzun pazarlığa çevirmemek.
- Sık hatalar: tehdit, utandırma, sonucu aşırı büyütme, uygulanmayacak seçenek söyleme.
- Do/Don't kartı: "Bir daha yaparsan görürsün" yerine bağlantılı seçenek.
- Senaryo tablosu: oyuncağı atma, suyu dökme, kapıyı çarpma.
- Bir mini demo diyalog: {{childName}} kalemi duvara sürer; ebeveyn sonuç bağlantılı seçenek verir.
- Kapanış: Seçenek, sınırı yumuşatmaz; çocuğa sorumluluk yolu açar.

## Görsel adayları

- İki yol kartı: "nazikçe kullan" ve "rafa koy"; ortada çocuk oyuncak tutar.
- Ebeveyn sakin durur, yanında raf ve yerde güvenli oyun alanı çizilir.
- ACT basamaklarının sonuna iki seçenekli küçük ok eklenmiş şema.
```

### 7.1 - Problemi Çocuğa Bırakmak

```text
## Ders bilgisi

Ders: Problemi Çocuğa Bırakmak
Müfredat karşılığı: Modül 7, 1. ders
Uygulamadaki lesson id: problemi-cocuga-birakmak
Alt başlık: Çocuğun kendi çözümünü bulmasına alan açmak

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Sorumluluğu iade etmek nedir: {{childName}}'in çözebileceği problemi hemen ebeveynin üstlenmemesi.
- Amaç: çocuğun kendi kaynaklarını, kararını ve çözüm denemesini fark etmesi.
- Ana kalıp: "Bunu nasıl yapmak istiyorsun?" / kaynakta geçen kalıp varsa onu kullan.
- Ebeveynin rolü: yanında kalmak, duyguyu yansıtmak, problemi tamamen çözmemek.
- Hangi problemler çocuğa bırakılabilir; güvenlik veya kapasite sınırı kaynakta varsa belirt.
- Yardım isteme anında önce yansıtma, sonra sorumluluğu geri verme.
- "Bilmiyorum" veya "yapamıyorum" cümlesini taşıma.
- Sık hatalar: otomatik çözmek, çocuğu küçümsemek, alay etmek, fazla ipucu vermek.
- Do/Don't kartı: "Ben yapayım" yerine "Sen nasıl denemek istersin?"
- Senaryo tablosu: kutu açma, parça bulma, kule yıkılması.
- Bir mini demo diyalog: {{childName}} "yapamıyorum" der; ebeveyn çözümü geri verir.
- Kapanış: Bazen en büyük yardım, çözümü çocuğun elinde bırakmaktır.

## Görsel adayları

- Çocuk kapalı kutuyla uğraşır; ebeveyn yanında çömelmiş ama kutuya dokunmaz.
- Top ebeveynden çocuğa geri döner; üzerinde küçük "problem" etiketi.
- Çocuğun başında ampul, ebeveynin balonunda kısa destek cümlesi.
```

### 7.2 - Doğal ve Mantıksal Sonuçlar

```text
## Ders bilgisi

Ders: Doğal ve Mantıksal Sonuçlar
Müfredat karşılığı: Modül 7, 2. ders
Uygulamadaki lesson id: dogal-ve-mantiksal-sonuclar
Alt başlık: Sonuç ile cezayı birbirinden ayırmak

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Sonuç ile ceza arasındaki fark: sonuç davranışla bağlantılıdır; ceza çoğu zaman ilişkiyi güç mücadelesine çeker.
- Doğal sonuç nedir: ebeveynin eklemediği, durumun kendinden doğan sonuç.
- Mantıksal sonuç nedir: ebeveynin koyduğu ama davranışla bağlantılı ve ölçülü sonuç.
- Ana kalıp: kaynakta geçen örnekleri kullan; yoksa "dokümanda yok" diye belirt.
- Sonucun güvenli, saygılı ve uygulanabilir olması.
- Duyguyu kabul etmenin sonucu kaldırmak anlamına gelmediği.
- {{childName}} sonuca üzülürse empatiyle eşlik etmek.
- Sık hatalar: sonucu tehdit gibi kullanmak, alakasız ceza vermek, öfkeyle büyütmek, utandırmak.
- Do/Don't kartı: "Bir hafta oyuncak yok" yerine davranışla bağlantılı sonuç.
- Senaryo tablosu: oyuncak kırma, mont giymeme, suyu dökme.
- Bir mini demo diyalog: {{childName}} oyuncağı sert kullanır; oyuncak bir süre kaldırılır.
- Kapanış: Sonuç öğretir; ceza çoğu zaman savunma doğurur.

## Görsel adayları

- İki kart: doğal sonuçta yağmur ve ıslanan kol, mantıksal sonuçta kırılan oyuncak ve raf.
- Terazi: bir tarafta davranış, diğer tarafta bağlantılı sonuç; alakasız ceza dışarıda.
- Ebeveyn diz çökmüş, üzgün çocuğa empati gösterirken oyuncak rafında durur.
```

### 8.1 - Öfke Nöbeti (Tantrum)

```text
## Ders bilgisi

Ders: Öfke Nöbeti (Tantrum)
Müfredat karşılığı: Modül 8, 1. ders
Uygulamadaki lesson id: ofke-nobeti-tantrum
Alt başlık: Fırtınayı bastırmadan birlikte geçirmek

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Öfke nöbetini bastırılacak kötü davranış olarak değil, yoğun duygu anı olarak ele al.
- Co-regülasyon / birlikte düzenleme kavramı dokümanda varsa sade Türkçeyle anlat; yoksa "dokümanda yok" diye belirt.
- Öncelik güvenlik: kendine, başkasına veya eşyaya zarar varsa sınır.
- Ebeveynin yakın, sakin, kısa cümleli ve bedenen güvenli durması.
- Duyguyu yansıtma + sınır gerektiğinde ACT.
- Tantrum sırasında mantık, nasihat, uzun açıklama ve soru sormanın çoğu zaman işe yaramayabileceği; kaynakla sınırlı kal.
- Sonrasında onarım: sakinleşince kısa bağ kurma, utandırmama.
- Sık hatalar: bağırmak, tehdit, terk etmek, duyguyu küçümsemek, kalabalıkta utandırmak.
- Do/Don't kartı: "Kes ağlamayı" yerine güvenli ve kısa eşlik.
- Senaryo tablosu: market, oyuncak fırlatma, yere yatma.
- Bir mini demo diyalog: {{childName}} yere yatar ve bağırır; ebeveyn kısa yansıtır ve güvenliği korur.
- Kapanış: Fırtınayı yönetmek, fırtınayı susturmak değildir.

## Görsel adayları

- Çocuk yerde öfkeli, çevresinde dalga çizgileri; ebeveyn yakın ama sakin, açık el gösterir.
- Küçük fırtına bulutu ve yanında sağlam bir şemsiye gibi duran ebeveyn figürü.
- Üç adım ikon: güvenlik, duygu, kısa sınır.
```

### 8.2 - Ayrılık Kaygısı

```text
## Ders bilgisi

Ders: Ayrılık Kaygısı
Müfredat karşılığı: Modül 8, 2. ders
Uygulamadaki lesson id: ayrilik-kaygisi
Alt başlık: Tutarlı veda ritüeliyle kaygıyı taşımak

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Ayrılık kaygısını yargılamadan, bağ ve güven ihtiyacı olarak ele al.
- Tutarlı veda ritüelinin önemi: kısa, öngörülebilir, tekrar eden.
- Ana kalıp: "Hoşça kal diyoruz, sonra geri geleceğim." Kaynakta varsa gerçek kalıbı kullan.
- Kaygıyı kabul etmek ile vedayı uzatmak arasındaki fark.
- Kaçamak veda / gizlice gitme tuzağı; dokümanda geçiyorsa işle.
- Ebeveynin kendi kaygısının çocuğa geçebileceği; kaynakla sınırlı kal.
- Kreş, okul, uyku veya bakıcı geçişlerine uyarlanabilir örnekler.
- {{childName}} ağlasa bile ebeveynin sıcak ve net kalması.
- Sık hatalar: uzun pazarlık, geri dönüp tekrar tekrar veda, "ağlama" demek, gizlice kaçmak.
- Do/Don't kartı: belirsiz veda yerine kısa ritüel.
- Senaryo tablosu: kreş kapısı, uyku zamanı, bakıcıya bırakma.
- Bir mini demo diyalog: {{childName}} bacağınıza sarılır; ebeveyn duyguyu duyar ve ritüeli korur.
- Kapanış: Tutarlı veda, kaygıyı yok saymaz; taşınabilir hale getirir.

## Görsel adayları

- Kapıda ebeveyn diz çökmüş, çocuk elini tutuyor; arkada küçük okul çantası.
- Üç küçük ritüel ikonu: sarılma, kısa cümle, el sallama.
- Ebeveynin ayak izi kapıdan çıkar; çocuğun kalp balonu bağlı kalır.
```

### 8.3 - Kardeş Çatışması

```text
## Ders bilgisi

Ders: Kardeş Çatışması
Müfredat karşılığı: Modül 8, 3. ders
Uygulamadaki lesson id: kardes-catismasi
Alt başlık: Hakemlik yapmadan iki çocuğu da duymak

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Kardeş çatışmasında ebeveynin ilk işi hakemlik değil güvenlik ve duyguları duymaktır.
- İki çocuğun da duygusunu ayrı ayrı yansıtmak.
- Taraf tutma, suçlu bulma ve hızlı hüküm verme tuzakları.
- Güvenlik varsa ACT sınırı: vurma, itme, zarar verme kabul edilmez.
- Adalet ile eşitlik ayrımı dokümanda varsa kullan; yoksa "dokümanda yok" diye belirt.
- Özel oyun zamanının her çocukla ayrı yapılmasının önleyici etkisi; kaynakta geçtiği ölçüde.
- Ana kalıp: "İkiniz de çok kızgınsınız; ikinizi de duyuyorum."
- Çözümü hemen ebeveynin bulmaması; çocuklara sorumluluk iade etme.
- Sık hatalar: "büyük olan sensin", "hemen özür dile", "kim başlattı?" soruşturması.
- Do/Don't kartı: suçlama yerine iki tarafı duyma.
- Senaryo tablosu: oyuncak paylaşımı, sıra kavgası, biri diğerini iter.
- Bir mini demo diyalog: {{childName}} kardeşiyle oyuncağı çeker; ebeveyn önce güvenlik sonra iki duygu.
- Kapanış: İki çocuğu da duymak, sınırı gevşetmek değildir.

## Görsel adayları

- İki çocuk aynı oyuncağı tutar; ebeveyn ortada aşağı eğilmiş, iki yana da kulak simgesi.
- Terazi değil iki kalp: her çocuğun yanında ayrı duygu balonu.
- Oyuncak yerde güvenli alana alınmış; ebeveyn iki çocuğa açık ellerle bakar.
```

### 9.1 - Oyun Dışı Anlarda CPRT

```text
## Ders bilgisi

Ders: Oyun Dışı Anlarda CPRT
Müfredat karşılığı: Modül 9, 1. ders
Uygulamadaki lesson id: oyun-disi-anlarda-cprt
Alt başlık: Aynı çocuk, aynı dil; farklı sahneler

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- CPRT becerilerinin yalnızca özel oyun zamanında kalmayıp günlük rutine taşınabileceği.
- Aynı temel dil: empatiyle dinleme, tracking, duygu yansıtma, ACT, seçenek sunma.
- Özel oyun zamanının kuralları ile günlük hayatın farkı: günlük hayatta daha çok sınır, zaman ve rutin vardır.
- Rutin geçişlerde empati + seçenek kombinasyonu.
- Sofra, banyo, araba, park, ekran bitişi gibi somut alanlar.
- Tracking'in oyun dışı sade hali: "Ayakkabını eline aldın" gibi.
- {{childName}} zorlandığında önce duygu, sonra gerekiyorsa sınır veya seçenek.
- Sık hatalar: tüm teknikleri aynı anda kullanmaya çalışmak, uzun konuşmak, özel oyun zamanını günlük disipline çevirmek.
- Do/Don't kartı: rutin anında nasihat yerine kısa CPRT dili.
- Senaryo tablosu: ekran bitişi, banyoya geçiş, arabaya binme.
- Bir mini demo diyalog: {{childName}} ekrandan ayrılmak istemez; ebeveyn empati + seçenek kullanır.
- Kapanış: Sahne değişir; ilişki dili aynı kalır.

## Görsel adayları

- Dört küçük günlük sahne: masa, banyo, araba, park; hepsinde aynı kulak-kalp ikonu.
- Ebeveyn elinde küçük araç kutusu taşır: duygu, sınır, seçenek ikonları.
- Ekran kapanır, çocuk üzgün; ebeveyn iki seçenek kartı gösterir.
```

### 9.2 - Diğer Yetişkinlerle İlişki

```text
## Ders bilgisi

Ders: Diğer Yetişkinlerle İlişki
Müfredat karşılığı: Modül 9, 2. ders
Uygulamadaki lesson id: diger-yetiskinlerle-iliski
Alt başlık: Açıklamak, savunmadan tutarlılığı korumak

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- CPRT becerilerini uygularken diğer yetişkinlerle farklı ebeveynlik dili çatışması yaşanabileceği.
- Büyükanne, dede, bakıcı, öğretmen veya diğer ebeveynle kısa ve sakin açıklama.
- Savunmaya geçmeden tutarlı kalmak.
- Ana kalıp: "Önce duygusunu duyup sonra sınırı söylüyoruz." Kaynakta varsa gerçek kalıbı kullan.
- Çevreye uzun eğitim vermek yerine 1-2 cümlelik pratik açıklama.
- {{childName}} önünde yetişkinler arası tartışmayı büyütmeme.
- Bakıcı / öğretmen için kısa brief: çocuğun duygu dili, sınır cümlesi, seçenek dili.
- Dokümanda bu konu yoksa ilgili kartta "dokümanda yok" diye işaretle; kendi aile sistemi bilgisinden genişletme.
- Sık hatalar: savunma, eleştiren yetişkini utandırma, çocuğun önünde yöntem tartışma, tutarsız kalma.
- Do/Don't kartı: "siz anlamıyorsunuz" yerine kısa açıklama.
- Senaryo tablosu: büyükanne "şımarıyor" der, öğretmen bilgi ister, eş farklı tepki verir.
- Bir mini demo diyalog: bir yetişkin "Ağlamasına izin verme" der; ebeveyn kısa açıklar ve {{childName}}'e döner.
- Kapanış: Tutarlılık, herkesi ikna etmekten önce sizin dilinizde başlar.

## Görsel adayları

- Ebeveyn iki yetişkine küçük kart gösterir: "Duygu -> sınır -> seçenek".
- Çocuk arkada oynar; iki yetişkin ön planda sakin konuşma balonlarıyla durur.
- Kısa not kağıdı: duygu cümlesi, sınır cümlesi, seçenek cümlesi.
```

### 10.1 - Kendi Tetikleyicilerinizi Tanıyın

```text
## Ders bilgisi

Ders: Kendi Tetikleyicilerinizi Tanıyın
Müfredat karşılığı: Modül 10, 1. ders
Uygulamadaki lesson id: kendi-tetikleyicilerinizi-taniyin
Alt başlık: Bu öfke benim mi, şu anki olaya mı ait?

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Ebeveynin kendi tepkisini fark etmesinin CPRT uygulamasındaki yeri.
- Tetikleyici nedir: {{childName}}'in davranışıyla ebeveynde hızlı ve yoğun tepki doğuran an.
- Otomatik tepki ile bilinçli yanıt arasındaki fark.
- Ana kalıp: "Bu öfke benim mi, şu anki olaya mı ait?" Kaynakta varsa gerçek ifadeyi kullan.
- Beden sinyalleri: ses yükselmesi, sıkışma, hızlanma gibi dokümanda geçenler varsa.
- Duraklama: kısa nefes, bir an bekleme, sonra çocuğa dönme; kaynakla sınırlı kal.
- Kendi çocukluk deneyimleriyle bağlantı dokümanda geçiyorsa çok dikkatli ve kısa işle; terapi yapma.
- Neden işe yarar: ebeveyn sakinleştiğinde {{childName}} daha güvenli çerçeve hisseder.
- Sık hatalar: tepkiyi çocuğa yüklemek, utançla donmak, "ben kötü ebeveynim" genellemesi.
- Do/Don't kartı: otomatik bağırma yerine kısa duraklama.
- Senaryo tablosu: dağınıklık, saygısız söz, ağlama sesi.
- Bir mini demo diyalog: {{childName}} inatlaşır; ebeveyn önce kendini fark eder, sonra kısa yanıt verir.
- Kapanış: Kendinizi fark etmek, çocuğunuzu daha iyi duymanın kapısıdır.

## Görsel adayları

- Ebeveyn elini göğsüne koymuş, yanında küçük duraklama işareti; çocuk uzakta bekler.
- İki balon: eski otomatik tepki ve yeni bilinçli yanıt; ebeveyn ortada nefes alır.
- Göğüste küçük dalga çizgileri, ağızda sakinleşen konuşma balonu.
```

### 10.2 - Yeterince İyi Ebeveynlik

```text
## Ders bilgisi

Ders: Yeterince İyi Ebeveynlik
Müfredat karşılığı: Modül 10, 2. ders
Uygulamadaki lesson id: yeterince-iyi-ebeveynlik
Alt başlık: Hata yapmak ilişkiyi bitirmez; onarım güçlendirir

## İçerik kapsaması

Dokümanlara dayanarak şu noktaların hepsi ders içinde geçsin:

- Yeterince iyi ebeveynlik fikri dokümanda geçiyorsa kullan; geçmiyorsa "dokümanda yok" diye işaretle.
- CPRT yolculuğunda amaç mükemmel olmak değil, ilişkiyi tekrar tekrar onarabilmek.
- Hata, kopuş ve onarım döngüsü: kısa, sade ve suçluluk büyütmeden anlat.
- Ana kalıp: "Az önce sesim yükseldi. Bu senin suçun değil. Yeniden deneyelim."
- Onarımın unsurları: sorumluluk almak, duyguyu kabul etmek, kısa açıklama, yeniden bağ kurma; kaynakla sınırlı kal.
- {{childName}}'e uzun yetişkin açıklamaları yüklememek.
- Ebeveynin kendine şefkati: kaynakta varsa kullan; yoksa ekleme yapma.
- 10 modül sonunda sürdürülebilir plan: özel oyun zamanı, kısa beceri pratiği, gerektiğinde destek.
- Sık hatalar: mükemmel olmaya çalışma, hatayı inkâr etme, çocuktan teselli bekleme, uzun özür konuşması.
- Do/Don't kartı: "Beni sen kızdırdın" yerine sorumluluk alan onarım.
- Senaryo tablosu: bağırma sonrası, sözünü kesme, sınırı sert söyleme.
- Bir mini demo diyalog: ebeveyn dün bağırdığı bir an için {{childName}} ile kısa onarım yapar.
- Kapanış: İlişki, hatasızlıkla değil onarımla güçlenir.

## Görsel adayları

- Kırılmış küçük kalp iki bantla onarılır; yanında ebeveyn ve çocuk diz dize oturur.
- Ebeveyn kısa konuşma balonu söyler, çocuk yanında oyuncak tutar; sahne sade ve yakın.
- 10 taşlı yolun sonunda ebeveyn-çocuk küçük oyun halısında tekrar buluşur.
```
