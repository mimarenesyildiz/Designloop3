const COST_DATABASE_DATA = [
  { "id": "db-1", "category": "Yıkım & Kaba İşler", "name": "Mevcut seramik/fayans sökümü", "unit": "m²", "unitPrice": 0, "labor": 120, "supplierNote": "Hafriyat atımı dahil değildir." },
  { "id": "db-2", "category": "Yıkım & Kaba İşler", "name": "Mevcut parke sökümü", "unit": "m²", "unitPrice": 0, "labor": 45, "supplierNote": "Süpürgelik sökümü dahildir." },
  { "id": "db-3", "category": "Yıkım & Kaba İşler", "name": "Alçıpan asma tavan sökümü", "unit": "m²", "unitPrice": 0, "labor": 85, "supplierNote": "Taşıyıcı profil sökümü dahildir." },
  { "id": "db-4", "category": "Yıkım & Kaba İşler", "name": "Hafriyat atımı (Çuval başı)", "unit": "adet", "unitPrice": 0, "labor": 40, "supplierNote": "Nakliye aracı dahil." },
  { "id": "db-5", "category": "Yıkım & Kaba İşler", "name": "Kendiliğinden yayılan tesviye şapı (Akıllı şap)", "unit": "m²", "unitPrice": 180, "labor": 90, "supplierNote": "3-5 mm kalınlık." },
  
  { "id": "db-20", "category": "Zemin Kaplamaları", "name": "Laminat Parke (8mm, 32. Sınıf)", "unit": "m²", "unitPrice": 380, "labor": 80, "supplierNote": "Yerli üretim, şilte dahil." },
  { "id": "db-21", "category": "Zemin Kaplamaları", "name": "Lamine Parke (14mm Meşe, Fırçalı)", "unit": "m²", "unitPrice": 1450, "labor": 150, "supplierNote": "1. Sınıf meşe katman, yapıştırma veya yüzer sistem." },
  { "id": "db-22", "category": "Zemin Kaplamaları", "name": "Masif Parke (Meşe)", "unit": "m²", "unitPrice": 2200, "labor": 350, "supplierNote": "Sistre ve cila işçiliği dahildir." },
  { "id": "db-23", "category": "Zemin Kaplamaları", "name": "Seramik Karo (60x60cm, Mat)", "unit": "m²", "unitPrice": 450, "labor": 250, "supplierNote": "Standart yapıştırıcı ve derz dahil." },
  { "id": "db-24", "category": "Zemin Kaplamaları", "name": "Porselen Seramik (60x120cm, Mermer Görünümlü)", "unit": "m²", "unitPrice": 850, "labor": 350, "supplierNote": "Rektifiyeli, flex yapıştırıcı dahil." },
  { "id": "db-25", "category": "Zemin Kaplamaları", "name": "LVT (Luxury Vinyl Tile) Zemin Kaplaması", "unit": "m²", "unitPrice": 650, "labor": 120, "supplierNote": "Geçmeli sistem (click)." },
  { "id": "db-26", "category": "Zemin Kaplamaları", "name": "Epoksi Zemin Kaplama", "unit": "m²", "unitPrice": 520, "labor": 280, "supplierNote": "Astar ve 2 kat son kat, solventsiz." },
  { "id": "db-27", "category": "Zemin Kaplamaları", "name": "Karo Halı (Ofis Tipi, 50x50cm)", "unit": "m²", "unitPrice": 480, "labor": 75, "supplierNote": "Alev almaz, antistatik." },
  { "id": "db-28", "category": "Zemin Kaplamaları", "name": "Mikrosement (Endüstriyel Beton Görünümlü)", "unit": "m²", "unitPrice": 850, "labor": 600, "supplierNote": "Poliüretan son kat koruyucu dahil." },

  { "id": "db-40", "category": "Duvar Uygulamaları", "name": "Alçı Sıva (Saten yüzey hazır)", "unit": "m²", "unitPrice": 45, "labor": 160, "supplierNote": "Brüt beton veya tuğla üzeri." },
  { "id": "db-41", "category": "Duvar Uygulamaları", "name": "Su Bazlı Silikonlu İç Cephe Boyası", "unit": "m²", "unitPrice": 35, "labor": 85, "supplierNote": "Astar ve 2 kat boya, Jotun/Filli Boya standart renkler." },
  { "id": "db-42", "category": "Duvar Uygulamaları", "name": "İtalyan Boya (Dekoratif Efektli)", "unit": "m²", "unitPrice": 350, "labor": 450, "supplierNote": "Özel takım çantası ile el işçiliği." },
  { "id": "db-43", "category": "Duvar Uygulamaları", "name": "Vinil Duvar Kağıdı (Standart desenli)", "unit": "m²", "unitPrice": 180, "labor": 70, "supplierNote": "Tutkal dahildir. Rulo firesi hesaplanmalıdır." },
  { "id": "db-44", "category": "Duvar Uygulamaları", "name": "Tekstil Tabanlı / Hasır Duvar Kağıdı", "unit": "m²", "unitPrice": 650, "labor": 120, "supplierNote": "Premium ürün, ustalık gerektirir." },
  { "id": "db-45", "category": "Duvar Uygulamaları", "name": "Ahşap Çıta Uygulaması (Boyanabilir Poliüretan)", "unit": "m", "unitPrice": 85, "labor": 65, "supplierNote": "Duvar panolaması için, boya hariç." },
  { "id": "db-46", "category": "Duvar Uygulamaları", "name": "Doğal Ahşap Kaplamalı MDF Duvar Paneli", "unit": "m²", "unitPrice": 2400, "labor": 600, "supplierNote": "Gizli karkaslı, cila dahil." },
  { "id": "db-47", "category": "Duvar Uygulamaları", "name": "Akustik Kumaş Kaplı Duvar Paneli", "unit": "m²", "unitPrice": 1600, "labor": 250, "supplierNote": "Taş yünü dolgulu, alev geciktirici kumaş." },

  { "id": "db-60", "category": "Tavan Uygulamaları", "name": "Alçıpan Asma Tavan (Tek kat karkaslı)", "unit": "m²", "unitPrice": 220, "labor": 280, "supplierNote": "Bant armatür boşlukları hariç." },
  { "id": "db-61", "category": "Tavan Uygulamaları", "name": "Yeşil Alçıpan Asma Tavan (Neme dayanıklı)", "unit": "m²", "unitPrice": 260, "labor": 280, "supplierNote": "Islak hacimler için." },
  { "id": "db-62", "category": "Tavan Uygulamaları", "name": "Gizli Işık Bandı Yapılması", "unit": "m", "unitPrice": 180, "labor": 240, "supplierNote": "Alçıpan ile alından kapama." },
  { "id": "db-63", "category": "Tavan Uygulamaları", "name": "Taşyünü Asma Tavan (60x60cm Modüler)", "unit": "m²", "unitPrice": 280, "labor": 120, "supplierNote": "T24 taşıyıcı sistem dahil." },
  { "id": "db-64", "category": "Tavan Uygulamaları", "name": "Metal Asma Tavan (Clip-in, 60x60cm)", "unit": "m²", "unitPrice": 450, "labor": 140, "supplierNote": "Alüminyum veya fırın boyalı sac." },
  { "id": "db-65", "category": "Tavan Uygulamaları", "name": "Ahşap Baffle Tavan (MDF üzeri Doğal Kaplama)", "unit": "m²", "unitPrice": 3200, "labor": 850, "supplierNote": "Lineer sistem, taşıyıcı ve askı tijleri dahil." },
  { "id": "db-66", "category": "Tavan Uygulamaları", "name": "Akustik Keçe Baffle Tavan (PET)", "unit": "m²", "unitPrice": 1850, "labor": 350, "supplierNote": "Yangın dayanımlı, ses emici." },
  { "id": "db-67", "category": "Tavan Uygulamaları", "name": "Açık Tavan (Brüt) Tesisat/Tavan Siyah Boyanması", "unit": "m²", "unitPrice": 60, "labor": 110, "supplierNote": "Püskürtme boya ile Endüstriyel görünüm." },

  { "id": "db-80", "category": "Sabit Mobilya", "name": "Mutfak / Banyo Dolabı Gövdesi (MDF Lam)", "unit": "m²", "unitPrice": 1400, "labor": 400, "supplierNote": "Gövde metrekare fiyatı, kapak hariç." },
  { "id": "db-81", "category": "Sabit Mobilya", "name": "Dolap Kapağı (Mat Lake MDF)", "unit": "m²", "unitPrice": 3800, "labor": 450, "supplierNote": "Kenar pahları ve astar+son kat cila." },
  { "id": "db-82", "category": "Sabit Mobilya", "name": "Dolap Kapağı (Membran / PVC Kaplı MDF)", "unit": "m²", "unitPrice": 1600, "labor": 200, "supplierNote": "CNC işlemeli olabilir." },
  { "id": "db-83", "category": "Sabit Mobilya", "name": "Mutfak Tezgahı (Akrilik / Corian)", "unit": "m", "unitPrice": 5500, "labor": 800, "supplierNote": "Dikişsiz görünüm, standart 60cm derinlik." },
  { "id": "db-84", "category": "Sabit Mobilya", "name": "Mutfak Tezgahı (Çimstone / Kuvars)", "unit": "m", "unitPrice": 4200, "labor": 600, "supplierNote": "Montaj, evye yeri açımı dahil." },
  { "id": "db-85", "category": "Sabit Mobilya", "name": "İç Kapı (Ahşap Kaplamalı, Amerikan Cila)", "unit": "adet", "unitPrice": 8500, "labor": 1200, "supplierNote": "Kasa, pervaz, standart kilit ve menteşe dahil." },
  { "id": "db-86", "category": "Sabit Mobilya", "name": "İç Kapı (Mat Lake Göbekli/Model)", "unit": "adet", "unitPrice": 9500, "labor": 1200, "supplierNote": "1. sınıf işçilikli lake." },
  { "id": "db-87", "category": "Sabit Mobilya", "name": "Süpürgelik (MDF Lam 8 cm)", "unit": "m", "unitPrice": 65, "labor": 45, "supplierNote": "Düz kesim." },
  { "id": "db-88", "category": "Sabit Mobilya", "name": "Süpürgelik (Lake MDF 12 cm)", "unit": "m", "unitPrice": 220, "labor": 60, "supplierNote": "Klasik profil veya düz." },
  { "id": "db-89", "category": "Sabit Mobilya", "name": "Özel Tasarım Resepsiyon Bankosu", "unit": "adet", "unitPrice": 45000, "labor": 8000, "supplierNote": "Lake, doğal taş ve gizli aydınlatma karması kompleks ünite." },

  { "id": "db-100", "category": "Aydınlatma / Elektrik", "name": "Sıva Altı LED Spot (10W Downlight)", "unit": "adet", "unitPrice": 250, "labor": 120, "supplierNote": "Osram/Philips LED çipli." },
  { "id": "db-101", "category": "Aydınlatma / Elektrik", "name": "Sıva Üstü Ray Spot (Trifaze, 15W)", "unit": "adet", "unitPrice": 480, "labor": 90, "supplierNote": "Ray bedeli hariç." },
  { "id": "db-102", "category": "Aydınlatma / Elektrik", "name": "Trifaze Spot Rayı (Siyah/Beyaz)", "unit": "m", "unitPrice": 350, "labor": 100, "supplierNote": "Tij ile asma veya sıva üstü." },
  { "id": "db-103", "category": "Aydınlatma / Elektrik", "name": "Lineer LED Aydınlatma (Sıva Altı/Yüzey)", "unit": "m", "unitPrice": 1200, "labor": 250, "supplierNote": "Alüminyum profil ve difüzör pleksi." },
  { "id": "db-104", "category": "Aydınlatma / Elektrik", "name": "Dekoratif Sarkıt / Aplik", "unit": "adet", "unitPrice": 3500, "labor": 250, "supplierNote": "Yerli butik üretim veya standart ithal (Ortalama)." },
  { "id": "db-105", "category": "Aydınlatma / Elektrik", "name": "Gizli Işık LED Şerit (24V, 14.4W)", "unit": "m", "unitPrice": 140, "labor": 40, "supplierNote": "Trafo dahil değildir." },
  { "id": "db-106", "category": "Aydınlatma / Elektrik", "name": "Standart Priz / Anahtar Modülü (Viko/Makel)", "unit": "adet", "unitPrice": 110, "labor": 90, "supplierNote": "Mekanizma ve kapak takım." },
  { "id": "db-107", "category": "Aydınlatma / Elektrik", "name": "Lüks Serisi Priz / Anahtar (Camsı/Metal)", "unit": "adet", "unitPrice": 450, "labor": 90, "supplierNote": "Legrand Salto, Viko Artline vb." },
  { "id": "db-108", "category": "Aydınlatma / Elektrik", "name": "Mekanik-Elektrik Tesisat Revizyonu Cihaz Başı", "unit": "LumpSum", "unitPrice": 1200, "labor": 2500, "supplierNote": "Ortalama hat çekimi, kırma dökme hesabı." },

  { "id": "db-120", "category": "Vitrifiye & Islak Hacim", "name": "Asma Klozet Seti (Gömme Rezervuar Dahil)", "unit": "takım", "unitPrice": 7500, "labor": 1800, "supplierNote": "VitrA/ECA orta segment, kumanda paneli ve kapak dahil." },
  { "id": "db-121", "category": "Vitrifiye & Islak Hacim", "name": "Çanak Lavabo (Seramik)", "unit": "adet", "unitPrice": 2200, "labor": 450, "supplierNote": "Sifon seti hariç." },
  { "id": "db-122", "category": "Vitrifiye & Islak Hacim", "name": "Ankastre / Çanak Lavabo Bataryası", "unit": "adet", "unitPrice": 3400, "labor": 350, "supplierNote": "Siyah veya pirinç bitişli seri." },
  { "id": "db-123", "category": "Vitrifiye & Islak Hacim", "name": "Ankastre Duş Sistemi (Tepe ve El duşlu)", "unit": "takım", "unitPrice": 9500, "labor": 1200, "supplierNote": "İç takım montajı seramik öncesi." },
  { "id": "db-124", "category": "Vitrifiye & Islak Hacim", "name": "Temperli Cam Duşakabin", "unit": "m²", "unitPrice": 2800, "labor": 600, "supplierNote": "6-8mm rodajlı cam, siyah alüminyum profil." },

  { "id": "db-150", "category": "Dekoratif Öğeler & Hareketli", "name": "Stor / Zebra Perde", "unit": "m²", "unitPrice": 450, "labor": 100, "supplierNote": "Blackout mekanizmalı manuel." },
  { "id": "db-151", "category": "Dekoratif Öğeler & Hareketli", "name": "Kumaş Fon Perde (Soft kadife/keten)", "unit": "m", "unitPrice": 900, "labor": 80, "supplierNote": "Pili payı dahil genişlik hesabı." },
  { "id": "db-152", "category": "Dekoratif Öğeler & Hareketli", "name": "Motorlu Akıllı Perde Sistemi Rayı", "unit": "m", "unitPrice": 3200, "labor": 400, "supplierNote": "Somfy vb. Wifi entegrasyonlu mekanizma." }
];

const CATEGORY_DEFAULTS = {
  "Yıkım & Kaba İşler": {
    profile: {
      tier: "economy",
      materialFamily: "system",
      lifespan: "short",
      maintenance: "zero",
      installComplexity: "standard",
      impactScale: "hidden",
      uiColor: "#8B8F97",
      note: "Dogru altyapi hazirligi sonraki katmanlarin kalitesini belirler.",
    },
    constraints: {
      suitableZones: ["tum-hacimler"],
      avoidZones: [],
      warningNote: null,
      requiresPrior: [],
    },
  },
  "Zemin Kaplamaları": {
    profile: {
      tier: "mid",
      materialFamily: "composite",
      lifespan: "long",
      maintenance: "medium",
      installComplexity: "standard",
      impactScale: "dominant",
      uiColor: "#8E6B4B",
      note: "Genis alan etkisi yuzunden zemin kararinin butce ve mekan algisi etkisi yuksektir.",
    },
    constraints: {
      suitableZones: ["salon", "ofis", "koridor", "bekleme"],
      avoidZones: [],
      warningNote: null,
      requiresPrior: ["tesviye-sap"],
    },
  },
  "Duvar Uygulamaları": {
    profile: {
      tier: "mid",
      materialFamily: "paint",
      lifespan: "medium",
      maintenance: "low",
      installComplexity: "standard",
      impactScale: "dominant",
      uiColor: "#A5836C",
      note: "Duvar malzemesi mekan karakterini hizli degistirir; komsu yuzeylerle birlikte okunmalidir.",
    },
    constraints: {
      suitableZones: ["salon", "ofis", "koridor", "bekleme", "konferans"],
      avoidZones: [],
      warningNote: null,
      requiresPrior: ["duvar-duzeltme"],
    },
  },
  "Tavan Uygulamaları": {
    profile: {
      tier: "mid",
      materialFamily: "system",
      lifespan: "long",
      maintenance: "low",
      installComplexity: "expert",
      impactScale: "subtle",
      uiColor: "#C7B9A8",
      note: "Tavan sistemleri isik, akustik ve teknik altyapiyla birlikte karar verilmelidir.",
    },
    constraints: {
      suitableZones: ["salon", "ofis", "konferans", "koridor"],
      avoidZones: [],
      warningNote: null,
      requiresPrior: ["asma-tavan-altyapisi"],
    },
  },
  "Sabit Mobilya": {
    profile: {
      tier: "premium",
      materialFamily: "wood",
      lifespan: "long",
      maintenance: "medium",
      installComplexity: "expert",
      impactScale: "accent",
      uiColor: "#8A6344",
      note: "Sabit mobilyada detay cozumu ve saha olculeri toplam kaliteyi belirler.",
    },
    constraints: {
      suitableZones: ["salon", "ofis", "mutfak", "banyo"],
      avoidZones: [],
      warningNote: null,
      requiresPrior: ["olcu-alimi", "detay-projesi"],
    },
  },
  "Aydınlatma / Elektrik": {
    profile: {
      tier: "mid",
      materialFamily: "system",
      lifespan: "long",
      maintenance: "zero",
      installComplexity: "standard",
      impactScale: "subtle",
      uiColor: "#DCCF9A",
      note: "Aydinlatma urunleri atmosfer kadar bakim ve erisim kolayligini da etkiler.",
    },
    constraints: {
      suitableZones: ["tum-hacimler"],
      avoidZones: [],
      warningNote: null,
      requiresPrior: ["elektrik-hatti"],
    },
  },
  "Vitrifiye & Islak Hacim": {
    profile: {
      tier: "mid",
      materialFamily: "ceramic",
      lifespan: "long",
      maintenance: "low",
      installComplexity: "expert",
      impactScale: "accent",
      uiColor: "#E4E2DA",
      note: "Islak hacim urunlerinde servis erisimi ve tesisat koordinasyonu esastir.",
    },
    constraints: {
      suitableZones: ["banyo", "wc", "islak-hacim"],
      avoidZones: [],
      warningNote: null,
      requiresPrior: ["tesisat-kaba"],
    },
  },
  "Dekoratif Öğeler & Hareketli": {
    profile: {
      tier: "mid",
      materialFamily: "fabric",
      lifespan: "medium",
      maintenance: "medium",
      installComplexity: "standard",
      impactScale: "accent",
      uiColor: "#9A8378",
      note: "Hareketli ve dekoratif elemanlar akilli luks ve hizli atmosfer degisimi icin idealdir.",
    },
    constraints: {
      suitableZones: ["salon", "yatak-odasi", "ofis", "konferans"],
      avoidZones: [],
      warningNote: null,
      requiresPrior: [],
    },
  },
};

const COST_ITEM_OVERRIDES = {
  "db-21": {
    profile: { tier: "premium", materialFamily: "wood", note: "Dogal damari yuksek algi degeri uretir; bakim dengesi gerekir." },
    alternatives: { lookForLessId: "db-25", upgradeToId: "db-22", pairsWith: ["db-87", "db-88"] },
  },
  "db-22": {
    profile: { tier: "premium", materialFamily: "wood", maintenance: "high", installComplexity: "expert", uiColor: "#9C6B30", note: "Nemli alanlardan uzak tutulmalidir." },
    constraints: { suitableZones: ["salon", "yatak-odasi", "ofis"], avoidZones: ["islak-hacim"], warningNote: "Su ile temas halinde sisme ve bozulma riski tasir.", requiresPrior: ["tesviye-sap", "nem-bariyeri"] },
    alternatives: { lookForLessId: "db-25", upgradeToId: null, pairsWith: ["db-87", "db-88"] },
  },
  "db-23": {
    profile: { tier: "economy", materialFamily: "ceramic", maintenance: "low", uiColor: "#C6C6C2" },
    constraints: { suitableZones: ["mutfak", "koridor", "banyo", "ofis"], avoidZones: [], warningNote: null, requiresPrior: ["tesviye-sap"] },
    alternatives: { lookForLessId: null, upgradeToId: "db-24", pairsWith: [] },
  },
  "db-24": {
    profile: { tier: "premium", materialFamily: "ceramic", note: "Dogal tas hissini daha kontrollu bakimla verir." },
    alternatives: { lookForLessId: "db-23", upgradeToId: null, pairsWith: [] },
  },
  "db-25": {
    profile: { tier: "mid", materialFamily: "polymer", maintenance: "low", installComplexity: "standard", uiColor: "#A88E71", note: "Dogal ahsap etkisini daha dusuk bakimla taklit eder." },
    constraints: { suitableZones: ["salon", "ofis", "koridor"], avoidZones: ["islak-hacim"], warningNote: "Surekli suya maruz kalan alanlarda ek detay cozumu gerekir.", requiresPrior: ["tesviye-sap"] },
    alternatives: { lookForLessId: "db-20", upgradeToId: "db-21", pairsWith: ["db-87"] },
  },
  "db-27": {
    profile: { tier: "mid", materialFamily: "fabric", maintenance: "medium", impactScale: "dominant", note: "Akustik konfor ve kolay degisebilir parcali kurgu sunar." },
    alternatives: { lookForLessId: null, upgradeToId: null, pairsWith: [] },
  },
  "db-28": {
    profile: { tier: "premium", materialFamily: "composite", maintenance: "medium", installComplexity: "expert", uiColor: "#8E8177", note: "Monolitik ve rafine gorunum verir; uygulama ekibi kalitesi kritiktir." },
    alternatives: { lookForLessId: "db-23", upgradeToId: null, pairsWith: [] },
  },
  "db-41": {
    profile: { tier: "economy", materialFamily: "paint", maintenance: "low", uiColor: "#D5D0C8", note: "Hizli uygulanabilir ve genis alanlarda ekonomik bir taban sunar." },
    alternatives: { lookForLessId: null, upgradeToId: "db-42", pairsWith: [] },
  },
  "db-42": {
    profile: { tier: "premium", materialFamily: "paint", maintenance: "medium", installComplexity: "expert", impactScale: "accent", uiColor: "#B39072", note: "El isciligi nedeniyle numune onayi ve uygulama kalitesi kritiktir." },
    alternatives: { lookForLessId: "db-41", upgradeToId: null, pairsWith: [] },
  },
  "db-43": {
    profile: { tier: "mid", materialFamily: "polymer", maintenance: "medium", impactScale: "accent" },
    alternatives: { lookForLessId: null, upgradeToId: "db-44", pairsWith: [] },
  },
  "db-44": {
    profile: { tier: "premium", materialFamily: "fabric", maintenance: "high", impactScale: "accent", uiColor: "#A67958" },
    constraints: { suitableZones: ["salon", "yatak-odasi", "bekleme"], avoidZones: ["islak-hacim", "mutfak-tezgah-arkasi"], warningNote: "Nemli veya sik silinen yuzeylerde performansi hizla dusur.", requiresPrior: ["duvar-duzeltme"] },
    alternatives: { lookForLessId: "db-43", upgradeToId: null, pairsWith: [] },
  },
  "db-46": {
    profile: { tier: "premium", materialFamily: "wood", maintenance: "medium", installComplexity: "expert", impactScale: "dominant" },
    constraints: { suitableZones: ["salon", "ofis", "konferans"], avoidZones: ["islak-hacim"], warningNote: "Nemli alanlarda kaplama davranisi bozulabilir.", requiresPrior: ["alt-karkas"] },
    alternatives: { lookForLessId: "db-45", upgradeToId: null, pairsWith: ["db-87"] },
  },
  "db-47": {
    profile: { tier: "premium", materialFamily: "fabric", lifespan: "long", maintenance: "medium", impactScale: "dominant", uiColor: "#8E7C6A", note: "Akustik ve yumusaklik bir arada sunar." },
    constraints: { suitableZones: ["konferans", "toplanti", "ofis", "bekleme"], avoidZones: ["islak-hacim"], warningNote: "Nemli alanlarda performans dususune aciktir.", requiresPrior: ["alt-karkas"] },
    alternatives: { lookForLessId: "db-43", upgradeToId: null, pairsWith: [] },
  },
  "db-63": {
    profile: { tier: "economy", materialFamily: "system", maintenance: "low", impactScale: "subtle" },
    alternatives: { lookForLessId: null, upgradeToId: "db-66", pairsWith: [] },
  },
  "db-65": {
    profile: { tier: "luxury", materialFamily: "wood", maintenance: "medium", installComplexity: "expert", impactScale: "dominant", uiColor: "#8B623A", note: "Gorunur tavan kararlarinda premium algiyi hizla yukari tasir." },
    constraints: { suitableZones: ["konferans", "bekleme", "lobi", "ofis"], avoidZones: ["islak-hacim"], warningNote: "Geniş alanlarda maliyet etkisi hizla buyur.", requiresPrior: ["asma-tavan-altyapisi", "koordinasyon"] },
    alternatives: { lookForLessId: "db-66", upgradeToId: null, pairsWith: ["db-103"] },
  },
  "db-66": {
    profile: { tier: "premium", materialFamily: "fabric", maintenance: "low", installComplexity: "standard", impactScale: "subtle", uiColor: "#A38E74" },
    alternatives: { lookForLessId: "db-63", upgradeToId: "db-65", pairsWith: ["db-103"] },
  },
  "db-67": {
    profile: { tier: "economy", materialFamily: "paint", maintenance: "low", impactScale: "subtle" },
    alternatives: { lookForLessId: null, upgradeToId: "db-65", pairsWith: ["db-101", "db-103"] },
  },
  "db-81": {
    profile: { tier: "premium", materialFamily: "wood", maintenance: "medium", installComplexity: "expert", impactScale: "accent" },
    alternatives: { lookForLessId: "db-82", upgradeToId: null, pairsWith: ["db-80"] },
  },
  "db-82": {
    profile: { tier: "mid", materialFamily: "polymer", maintenance: "low", impactScale: "accent" },
    alternatives: { lookForLessId: null, upgradeToId: "db-81", pairsWith: ["db-80"] },
  },
  "db-84": {
    profile: { tier: "premium", materialFamily: "composite", maintenance: "low", installComplexity: "expert", impactScale: "accent", uiColor: "#D1D0CC", note: "Mutfakta gorsel kalite ve performans dengesini iyi kurar." },
    constraints: { suitableZones: ["mutfak", "banyo"], avoidZones: [], warningNote: null, requiresPrior: ["olcu-alimi", "tezgah-altyapisi"] },
    alternatives: { lookForLessId: null, upgradeToId: "db-83", pairsWith: ["db-80", "db-81", "db-82"] },
  },
  "db-85": {
    profile: { tier: "premium", materialFamily: "wood", maintenance: "medium", impactScale: "accent" },
    alternatives: { lookForLessId: null, upgradeToId: "db-86", pairsWith: [] },
  },
  "db-86": {
    profile: { tier: "premium", materialFamily: "wood", maintenance: "medium", impactScale: "accent" },
    alternatives: { lookForLessId: "db-85", upgradeToId: null, pairsWith: [] },
  },
  "db-89": {
    profile: { tier: "luxury", materialFamily: "composite", maintenance: "medium", installComplexity: "expert", impactScale: "dominant", uiColor: "#7E5A44", note: "Karsilama alanlarinda temsil etkisi yuksek, maliyet etkisi de belirgindir." },
    alternatives: { lookForLessId: null, upgradeToId: null, pairsWith: ["db-103", "db-107"] },
  },
  "db-100": {
    profile: { tier: "mid", materialFamily: "system", maintenance: "zero", installComplexity: "standard", impactScale: "subtle", uiColor: "#E8E0D0", note: "50.000 saat omur." },
    constraints: { suitableZones: ["tum-hacimler"], avoidZones: [], warningNote: null, requiresPrior: ["elektrik-hatti", "asma-tavan"] },
    alternatives: { lookForLessId: null, upgradeToId: "db-101", pairsWith: [] },
  },
  "db-101": {
    profile: { tier: "premium", materialFamily: "system", maintenance: "zero", impactScale: "accent" },
    alternatives: { lookForLessId: "db-100", upgradeToId: null, pairsWith: ["db-102"] },
  },
  "db-103": {
    profile: { tier: "premium", materialFamily: "system", impactScale: "accent", uiColor: "#D6C7AF" },
    alternatives: { lookForLessId: "db-105", upgradeToId: null, pairsWith: [] },
  },
  "db-104": {
    profile: { tier: "premium", materialFamily: "metal", impactScale: "accent", maintenance: "medium", uiColor: "#B78A58" },
    alternatives: { lookForLessId: null, upgradeToId: null, pairsWith: [] },
  },
  "db-107": {
    profile: { tier: "premium", materialFamily: "metal", impactScale: "accent", maintenance: "low" },
    alternatives: { lookForLessId: "db-106", upgradeToId: null, pairsWith: [] },
  },
  "db-120": {
    profile: { tier: "mid", materialFamily: "ceramic", maintenance: "low", installComplexity: "expert", impactScale: "accent", uiColor: "#F5F5F0", note: "Gomme rezervuar duvar icine saklanir." },
    constraints: { suitableZones: ["banyo", "wc"], avoidZones: [], warningNote: null, requiresPrior: ["tesisat-kaba", "duvar-orgu"] },
    alternatives: { lookForLessId: null, upgradeToId: null, pairsWith: ["db-121", "db-122"] },
  },
  "db-124": {
    profile: { tier: "premium", materialFamily: "glass", maintenance: "medium", installComplexity: "expert", impactScale: "accent" },
    constraints: { suitableZones: ["banyo", "islak-hacim"], avoidZones: [], warningNote: null, requiresPrior: ["zemin-egimi"] },
    alternatives: { lookForLessId: null, upgradeToId: null, pairsWith: [] },
  },
  "db-150": {
    profile: { tier: "mid", materialFamily: "fabric", maintenance: "medium", impactScale: "accent" },
    alternatives: { lookForLessId: null, upgradeToId: "db-152", pairsWith: [] },
  },
  "db-151": {
    profile: { tier: "premium", materialFamily: "fabric", maintenance: "high", impactScale: "accent", uiColor: "#8E6A60" },
    alternatives: { lookForLessId: "db-150", upgradeToId: null, pairsWith: ["db-152"] },
  },
  "db-152": {
    profile: { tier: "luxury", materialFamily: "system", maintenance: "medium", installComplexity: "expert", impactScale: "subtle", uiColor: "#9A8B7B" },
    alternatives: { lookForLessId: "db-150", upgradeToId: null, pairsWith: ["db-151"] },
  },
};

function mergeMetaBlock(defaults, overrides, fallback) {
  return {
    ...(fallback || {}),
    ...(defaults || {}),
    ...(overrides || {}),
  };
}

function enrichCostDatabaseEntry(item) {
  const categoryDefaults = CATEGORY_DEFAULTS[item.category] || { profile: {}, constraints: {} };
  const overrides = COST_ITEM_OVERRIDES[item.id] || {};
  return {
    ...item,
    profile: mergeMetaBlock(categoryDefaults.profile, overrides.profile, {
      tier: "mid",
      materialFamily: "system",
      lifespan: "medium",
      maintenance: "medium",
      installComplexity: "standard",
      impactScale: "accent",
      uiColor: "#A28B7A",
      note: item.supplierNote || "",
    }),
    constraints: mergeMetaBlock(categoryDefaults.constraints, overrides.constraints, {
      suitableZones: ["salon"],
      avoidZones: [],
      warningNote: null,
      requiresPrior: [],
    }),
    alternatives: mergeMetaBlock({
      lookForLessId: null,
      upgradeToId: null,
      pairsWith: [],
    }, overrides.alternatives),
  };
}

for (let i = 0; i < COST_DATABASE_DATA.length; i += 1) {
  COST_DATABASE_DATA[i] = enrichCostDatabaseEntry(COST_DATABASE_DATA[i]);
}

if (typeof window !== "undefined") {
  window.COST_DATABASE_DATA = COST_DATABASE_DATA;
}
