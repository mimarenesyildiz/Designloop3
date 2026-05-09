const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = __dirname;
const ENV = loadEnvFile(path.join(ROOT, ".env"));
const PORT = Number(process.env.PORT || ENV.PORT || 3000);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ENV.GEMINI_API_KEY || "";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_BODY_BYTES = 10 * 1024 * 1024; // 10 MB
const VISION_TAKEOFF_STYLE_PREFIXES = [
  "modern",
  "minimal",
  "minimalist",
  "premium",
  "designer",
  "tasarim",
  "sik",
  "sofistike",
  "contemporary",
  "iskandinav",
  "endustriyel",
  "industrial",
  "klasik",
  "bej",
  "gri",
  "beyaz",
  "siyah",
  "kahverengi",
];
const VISION_TAKEOFF_LOOSE_FURNITURE_PATTERN = /\b(koltuk|sofa|kanape|berjer|puf|sandalye|masa|sehpa|tabure|bench)\b/;
const VISION_TAKEOFF_FIXED_ELEMENT_PATTERN = /\b(sabit|gomme|ankastre|banko|tezgah|panel|dolap|kaplama|zemin|duvar|tavan|armat|aydinlatma|lineer|basamak|platform)\b/;
const VISION_TAKEOFF_DECORATIVE_PATTERN = /\b(aksesuar|dekor|vazo|obje|kitap|yastik|kulp|priz|anahtar|supurgelik|ray|perde rayi|kablo|yan sehpa|orta sehpa|coffee table)\b/;
const VISION_TAKEOFF_DOMINANCE_PATTERN = /\b(baskin|ana|merkezi|odak|buyuk|tum sahne|acikca gorunur|net okunur)\b/;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const server = http.createServer(async (req, res) => {
  // Apply security headers to every response
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.setHeader(k, v));

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      return await handleApiRequest(req, res, url);
    }

    return serveStaticFile(res, url.pathname);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`DesignLoop server running at http://localhost:${PORT}`);
  console.log(GEMINI_API_KEY ? "Gemini API key loaded from backend env." : "Gemini API key not found. Frontend requires a configured key for AI features.");
});

async function handleApiRequest(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/status") {
    return sendJson(res, 200, {
      ok: true,
      geminiConfigured: Boolean(GEMINI_API_KEY),
      backendMode: "server-env",
    });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const body = await parseJsonBody(req);

  if (!resolveRequestApiKey(body)) {
    return sendJson(res, 503, { error: "Gemini API key is not configured on the backend and was not provided by the client." });
  }

  if (url.pathname === "/api/analyze") {
    const result = await analyzeWithGemini(body);
    return sendJson(res, 200, result);
  }

  if (url.pathname === "/api/alternatives") {
    const result = await generateAlternativesWithGemini(body);
    return sendJson(res, 200, result);
  }

  if (url.pathname === "/api/visual-prompt") {
    const result = await generateVisualPromptWithGemini(body);
    return sendJson(res, 200, result);
  }

  if (url.pathname === "/api/generate-image") {
    const result = await generateImageWithGemini(body);
    return sendJson(res, 200, result);
  }

  if (url.pathname === "/api/segment") {
    const result = await segmentWithGemini(body);
    return sendJson(res, 200, result);
  }

  if (url.pathname === "/api/hub-evaluate") {
    const result = await evaluateHubWithGemini(body);
    return sendJson(res, 200, result);
  }

  return sendJson(res, 404, { error: "API route not found" });
}

async function evaluateHubWithGemini(body) {
  const apiKey = resolveRequestApiKey(body);
  const hubType = body.hubType || "material";
  const imageData = body.imageData;
  const selectedRegion = body.selectedRegion || null;
  const takeoffData = body.takeoffData || [];
  const analysisContext = body.analysisContext || "";
  const projectContext = body.projectContext || null;
  const model = resolveModelAlias(body.models?.vision, "vision");

  const hubPrompts = {
    color: buildColorEvalPrompt(selectedRegion, analysisContext),
    material: buildMaterialEvalPrompt(selectedRegion, takeoffData, analysisContext),
    lighting: buildLightingEvalPrompt(selectedRegion, analysisContext),
    plan: buildPlanEvalPrompt(selectedRegion, analysisContext),
    furniture: buildFurnitureEvalPrompt(selectedRegion, analysisContext),
    acoustics: buildAcousticsEvalPrompt(analysisContext),
  };

  const prompt = withProjectContextDirective(hubPrompts[hubType] || hubPrompts.material, projectContext, `${hubType} hub degerlendirmesi`);

  const parts = [{ text: prompt }];
  const imagePart = toInlineDataPart(imageData);
  if (imagePart) parts.push(imagePart);

  const response = await callGeminiGenerateContent({
    apiKey,
    model,
    contents: [{ role: "user", parts }],
    generationConfig: { responseMimeType: "application/json" },
  });

  const parsed = parseJsonResponse(extractTextFromGeminiResponse(response));
  return normalizeHubEvalResponse(parsed, hubType, selectedRegion);
}

function normalizeProjectContext(projectContext = {}) {
  if (!projectContext || typeof projectContext !== "object") return null;
  return {
    projectName: String(projectContext.projectName || "").trim(),
    client: String(projectContext.client || "").trim(),
    notes: String(projectContext.notes || "").trim(),
    globalPalette: {
      mode: String(projectContext.globalPalette?.mode || "off").trim(),
      harmony: String(projectContext.globalPalette?.harmony || "analogous").trim(),
      colors: Array.isArray(projectContext.globalPalette?.colors) ? projectContext.globalPalette.colors.filter(Boolean).slice(0, 6) : [],
    },
    aiProfile: projectContext.aiProfile || {},
    selectedPresetIds: Array.isArray(projectContext.selectedPresetIds) ? projectContext.selectedPresetIds : [],
    selectedPresets: Array.isArray(projectContext.selectedPresets) ? projectContext.selectedPresets : [],
    spaceName: String(projectContext.spaceName || "").trim(),
    designProfile: projectContext.designProfile || null,
  };
}

function summarizeDesignProfileServer(profile) {
  if (!profile || typeof profile !== "object") return "";
  const hasContent = !!(profile.sector || profile.philosophy || profile.budgetTone || profile.generalNotes
    || profile.colorApproach?.preferredFamily || profile.materialApproach?.priority);
  if (!hasContent) return "";
  const parts = [];
  if (profile.sector) parts.push(`Sektor: ${profile.sector}`);
  if (profile.philosophy) parts.push(`Felsefe: ${profile.philosophy}`);
  if (profile.budgetTone) parts.push(`Butce tonu: ${profile.budgetTone}`);
  if (profile.interventionLevel) parts.push(`Mudahale: ${profile.interventionLevel}`);
  const ca = profile.colorApproach;
  if (ca?.preferredFamily || ca?.notes || ca?.avoidColors?.length) {
    const cp = ["RENK PROFILI:"];
    if (ca.corporateColors?.length) cp.push(`kurumsal renkler: ${ca.corporateColors.join(", ")}`);
    if (ca.preferredFamily) cp.push(`tercih edilen ton ailesi: ${ca.preferredFamily}`);
    if (ca.avoidColors?.length) cp.push(`kacinilacak: ${ca.avoidColors.join(", ")}`);
    if (ca.notes) cp.push(ca.notes);
    parts.push(cp.join(". "));
  }
  const ma = profile.materialApproach;
  if (ma?.priority || ma?.preferredMaterials?.length || ma?.avoidMaterials?.length) {
    const mp = ["MALZEME PROFILI:"];
    if (ma.priority) mp.push(`oncelik: ${ma.priority}`);
    if (ma.preferredMaterials?.length) mp.push(`tercih: ${ma.preferredMaterials.join(", ")}`);
    if (ma.avoidMaterials?.length) mp.push(`kacinilacak: ${ma.avoidMaterials.join(", ")}`);
    if (ma.notes) mp.push(ma.notes);
    parts.push(mp.join(". "));
  }
  const la = profile.lightingApproach;
  if (la?.preference || la?.temperatureRange) {
    const lp = ["AYDINLATMA PROFILI:"];
    if (la.temperatureRange) lp.push(`sicaklik araligi: ${la.temperatureRange}K`);
    if (la.preference) lp.push(`tercih: ${la.preference}`);
    if (la.avoidLighting?.length) lp.push(`kacinilacak: ${la.avoidLighting.join(", ")}`);
    if (la.notes) lp.push(la.notes);
    parts.push(lp.join(". "));
  }
  const fa = profile.furnitureApproach;
  if (fa?.priority || fa?.avoidFurniture?.length) {
    const fp = ["MOBILYA PROFILI:"];
    if (fa.priority) fp.push(`oncelik: ${fa.priority}`);
    if (fa.avoidFurniture?.length) fp.push(`kacinilacak: ${fa.avoidFurniture.join(", ")}`);
    if (fa.notes) fp.push(fa.notes);
    parts.push(fp.join(". "));
  }
  if (profile.generalNotes) parts.push(`GENEL DUYARLILIKLAR: ${profile.generalNotes}`);
  if (profile.sustainability) parts.push("Surdurulebilirlik onceliklidir.");
  return parts.join(" ");
}

function buildProjectContextDirective(projectContext, intent = "") {
  const normalized = normalizeProjectContext(projectContext);
  const profileSummary = summarizeDesignProfileServer(normalized?.designProfile);
  if (!normalized?.projectName && !normalized?.notes && !normalized?.selectedPresets?.length && !profileSummary) return "";
  const paletteColors = normalized.globalPalette.colors.length ? normalized.globalPalette.colors.join(", ") : "yok";
  const selectedPresetSummary = normalized.selectedPresets.length
    ? normalized.selectedPresets
      .map((preset) => [
        String(preset?.name || "").trim(),
        String(preset?.description || "").trim(),
        Array.isArray(preset?.materials) && preset.materials.length ? `malzemeler: ${preset.materials.join(", ")}` : "",
        Array.isArray(preset?.colors) && preset.colors.length ? `renkler: ${preset.colors.join(", ")}` : "",
        Array.isArray(preset?.keywords) && preset.keywords.length ? `sifatlar: ${preset.keywords.join(", ")}` : "",
      ].filter(Boolean).join(" | "))
      .join(" || ")
    : "yok";
  const lines = [
    `[UST PROJE BAGLAMI: Bu mekan "${normalized.projectName || "Adsiz Proje"}" projesi altindadir.`,
    `Mahal: "${normalized.spaceName || "Adsiz Mahal"}".`,
    `Musteri / aidiyet: "${normalized.client || "belirtilmedi"}".`,
    `Kimlik notu: "${normalized.notes || "yok"}".`,
    `Global palet modu: "${normalized.globalPalette.mode || "off"}".`,
    `Global palet renkleri: "${paletteColors}".`,
    `Secili proje presetleri: "${selectedPresetSummary}".`,
  ];
  if (profileSummary) {
    lines.push(`TASARIM PROFILI (ANAYASA): ${profileSummary}`);
    lines.push(`Onerilerini bu profilin sinirlari icinde tut. Profille celisen kararlari acikca isaretle.`);
  }
  lines.push(`${intent ? `${intent} sirasinda` : "Analiz ve uretim kararlarinda"} bu baglami anayasa gibi temel al.]`);
  return lines.join(" ");
}

function withProjectContextDirective(prompt, projectContext, intent = "") {
  const directive = buildProjectContextDirective(projectContext, intent);
  return directive ? `${directive}\n\n${prompt}` : prompt;
}

function buildMaterialEvalPrompt(selectedRegion, takeoffData, analysisContext) {
  const regionCtx = selectedRegion
    ? `Secili bolge: "${selectedRegion.label}" (kategori: ${selectedRegion.category}, malzeme: ${selectedRegion.detectedMaterial}). Bu bolgeye odaklan.`
    : "Genel malzeme degerlendirmesi yap.";
  return [
    "Bir ic mimari malzeme danismani olarak calis. Gorseldeki ic mekani analiz et.",
    regionCtx,
    analysisContext ? `Ek bilgi: ${analysisContext}` : "",
    `Metraj: ${JSON.stringify(takeoffData)}.`,
    "Degerlendirme kriterleri: doku dili, yuzey hiyerarsisi, malzeme uyumu, maliyet/uygulama dengesi, finish kalitesi.",
    "Sadece JSON don. Turkce yaz.",
    'JSON: {"score":"7.0","kicker":"Malzeme Skoru","summary":"...","positiveTitle":"Guclu Yonler","positives":["..."],"negativeTitle":"Dikkat Edilecekler","negatives":["..."],"recommendations":[{"title":"...","body":"..."}],"metrics":[{"label":"...","value":"8/10","percent":"80","comment":"..."}]}',
  ].filter(Boolean).join(" ");
}

function buildColorEvalPrompt(selectedRegion, analysisContext) {
  const regionCtx = selectedRegion
    ? `Secili bolge: "${selectedRegion.label}" (kategori: ${selectedRegion.category}, malzeme: ${selectedRegion.detectedMaterial}). Bu yuzeye odaklan.`
    : "Genel renk degerlendirmesi yap.";
  return [
    "Bir ic mimari renk danismani olarak calis. Gorseldeki mekanı renk dengesi ve yuzey uyumu acisindan analiz et.",
    regionCtx,
    analysisContext ? `Ek bilgi: ${analysisContext}` : "",
    "Renk karari olarak dusun; fotograf filtresi gibi degil, yuzey ve mekan dili olarak yorumla.",
    "Sadece renk motorunun gercekten uygulayabilecegi degisimleri oner: targetColor, strength ve lightness.",
    "Metalik, parlaklik, doku, desen, finish ya da malzeme degisimi iddiasi kurma.",
    "Her surfaceAdjustments elemaninda targetColor (#RRGGBB), strength (0.35-0.9), lightness (-20..20) kullan.",
    "Sadece JSON don. Turkce yaz.",
    'JSON: {"score":"7.0","kicker":"Renk Karari Skoru","summary":"...","positiveTitle":"Guclu Kararlar","positives":["..."],"negativeTitle":"Dikkat Edilecekler","negatives":["..."],"recommendations":[{"title":"...","body":"..."}],"metrics":[{"label":"...","value":"8/10","percent":"80","comment":"..."}],"colorAlternatives":[{"id":"sicak-bej-1","title":"...","summary":"...","rationale":"...","surfaceAdjustments":[{"surfaceKey":"target-2","targetIndex":2,"surface":"Koltuk","category":"mobilya","material":"kumas","targetColor":"#D8C4A8","strength":0.6,"lightness":12,"reason":"..."}]}]}',
  ].filter(Boolean).join(" ");
}

function buildPlanEvalPrompt(selectedRegion, analysisContext) {
  const regionCtx = selectedRegion
    ? `Secili bolge: "${selectedRegion.label}". Bu elemanin plan organizasyonundaki rolune odaklan.`
    : "Genel plan organizasyonu degerlendirmesi yap.";
  return [
    "Bir mekansal planlama danismani olarak calis. Gorseldeki mekani sirkulasyon, ergonomi ve gorsel hiyerarsi acisindan degerlendir.",
    regionCtx,
    analysisContext ? `Ek bilgi: ${analysisContext}` : "",
    "Degerlendirme kriterleri: sirkulasyon akisi, gorus hatti, zonlama netliĝi, ergonomi, esneklik, giris deneyimi.",
    "Sadece JSON don. Turkce yaz.",
    'JSON: {"score":"7.0","kicker":"Plan Organizasyon Skoru","summary":"...","positiveTitle":"Guclu Kararlar","positives":["..."],"negativeTitle":"Riskli Alanlar","negatives":["..."],"recommendations":[{"title":"...","body":"..."}],"metrics":[{"label":"...","value":"8/10","percent":"80","comment":"..."}]}',
  ].filter(Boolean).join(" ");
}

function buildFurnitureEvalPrompt(selectedRegion, analysisContext) {
  const regionCtx = selectedRegion
    ? `Secili bolge: "${selectedRegion.label}". Bu mobilya grubuna odaklan.`
    : "Genel mobilya ve ergonomi degerlendirmesi yap.";
  return [
    "Bir mobilya ve ergonomi danismani olarak calis. Gorseldeki mekandaki oturum elemanlarini, yerlesim ritmini ve kullanim rahatligini analiz et.",
    regionCtx,
    analysisContext ? `Ek bilgi: ${analysisContext}` : "",
    "Degerlendirme kriterleri: oturum konforu, gruplandirma ritmi, mekansal nefes, ergonomi, estetik butunluk, dayanim.",
    "Sadece JSON don. Turkce yaz.",
    'JSON: {"score":"7.0","kicker":"Mobilya Skoru","summary":"...","positiveTitle":"Guclu Yonler","positives":["..."],"negativeTitle":"Dikkat Edilecekler","negatives":["..."],"recommendations":[{"title":"...","body":"..."}],"metrics":[{"label":"...","value":"8/10","percent":"80","comment":"..."}]}',
  ].filter(Boolean).join(" ");
}

function buildAcousticsEvalPrompt(analysisContext) {
  return [
    "Bir akustik danismani olarak calis. Gorseldeki ic mekanin akustik performansini analiz et.",
    "Yuzey malzemelerini tani, ses emme katsayilarini tahmin et, RT60 ve konusma anlasirligi degerlendirmesi yap.",
    analysisContext ? "Ek bilgi: " + analysisContext : "",
    "Degerlendirme kriterleri: reverberasyon suresi (RT60), konusma anlasirligi (STI), ses emici/yansitici yuzey orani, akustik konfor.",
    "Sadece JSON don. Turkce yaz.",
    'JSON: {"score":"5.5","kicker":"Akustik Performans","summary":"...","positiveTitle":"Iyi Durum","positives":["..."],"negativeTitle":"Kritik","negatives":["..."],"recommendations":[{"title":"...","body":"..."}],"metrics":[{"label":"...","value":"0.8 sn","percent":"40","comment":"..."}]}',
  ].filter(Boolean).join(" ");
}

function buildLightingEvalPrompt(selectedRegion, analysisContext) {
  const regionCtx = selectedRegion
    ? `Secili bolge: "${selectedRegion.label}". Bu bolgenin aydinlatma karakterine odaklan.`
    : "Genel aydinlatma degerlendirmesi yap.";
  return [
    "Bir aydinlatma tasarim danismani olarak calis. Gorseldeki ic mekanin isik kalitesini analiz et.",
    regionCtx,
    analysisContext ? `Ek bilgi: ${analysisContext}` : "",
    "Degerlendirme kriterleri: katmanlama (genel/vurgu/atmosfer), isik sicakligi, vurgu dagilimi, golge kalitesi, armatür uyumu.",
    "Sahneye ozel, uygulanabilir 3 farkli aydinlatma onerisi uret. Bunlar genel isimler degil, bu renderdaki mevcut zayifliklara dogrudan cevap veren oneriler olsun.",
    "Her oneride image-to-image icin kullanilabilecek net bir prompt ver. Prompt; kamera acisini, geometriyi, malzemeyi, mobilyalari ve genel kompozisyonu koruyup sadece aydinlatma atmosferini degistirsin.",
    "Oneriler sahnedeki mevcut eksikleri dogrudan cevaplasin; ornegin odak eksikse vurgu kur, tekduzelik varsa katman farki kur, fazla flat ise derinlik veren isik kurgusu oner.",
    "Sadece JSON don. Turkce yaz.",
    'JSON: {"score":"7.0","kicker":"Aydinlatma Skoru","summary":"...","positiveTitle":"Guclu Isik Kararlari","positives":["..."],"negativeTitle":"Iyilestirme Alanlari","negatives":["..."],"recommendations":[{"title":"...","body":"..."}],"metrics":[{"label":"...","value":"8/10","percent":"80","comment":"..."}],"lightingScenarios":[{"title":"...","summary":"...","rationale":"...","prompt":"..."}]}',
  ].filter(Boolean).join(" ");
}

function normalizeHubEvalResponse(parsed, hubType, selectedRegion) {
  const normalized = {
    score: String(parsed.score || "6.0"),
    kicker: parsed.kicker || `${hubType} Skoru`,
    summary: parsed.summary || "Degerlendirme tamamlandi.",
    positiveTitle: parsed.positiveTitle || "Guclu Yonler",
    positives: Array.isArray(parsed.positives) ? parsed.positives : ["Genel yaklasim tutarli."],
    negativeTitle: parsed.negativeTitle || "Dikkat Edilecekler",
    negatives: Array.isArray(parsed.negatives) ? parsed.negatives : ["Detay kararlari tekrar okunmali."],
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    cards: [{
      title: hubType,
      subtitle: "",
      color: "#c97918",
      icon: "",
      score: String(parsed.score || "6.0"),
      rows: Array.isArray(parsed.metrics) ? parsed.metrics.map((m) => ({
        label: m.label || "",
        value: m.value || "0/10",
        percent: String(m.percent || "50"),
        comment: m.comment || "",
      })) : [],
    }],
    lightingScenarios: [],
    modeLabel: "AI Degerlendirme",
    modeBadge: "success",
  };

  if (hubType === "color") {
    normalized.colorAlternatives = Array.isArray(parsed.colorAlternatives) ? parsed.colorAlternatives : [];
  }

  if (Array.isArray(parsed.lightingScenarios)) {
    normalized.lightingScenarios = parsed.lightingScenarios
      .map((item) => ({
        title: String(item?.title || "").trim(),
        summary: String(item?.summary || "").trim(),
        rationale: String(item?.rationale || "").trim(),
        prompt: String(item?.prompt || "").trim(),
      }))
      .filter((item) => item.title && item.prompt);
  }

  return normalized;
}

async function segmentWithGemini(body) {
  const imageData = body.imageData;
  const analysisContext = body.analysisContext || "";
  const segmentationTargets = Array.isArray(body.segmentationTargets) ? body.segmentationTargets : [];
  const model = resolveModelAlias(body.models?.vision, "vision");

  if (!imageData) {
    throw new Error("imageData is required for segmentation.");
  }

  const targetList = segmentationTargets.length
    ? segmentationTargets
      .map((item, index) => `${index}. ${String(item?.label || "").trim()} | category=${String(item?.category || "diger").trim()} | key=${String(item?.key || "").trim()}`)
      .join("\n")
    : "";

  const segPrompt = `You are an interior design segmentation expert. Analyze the provided interior design render image and identify distinct architectural and design regions.

For each region, provide:
- id: a unique snake_case identifier (e.g., "wall_left", "ceiling_main", "floor_main", "furniture_sofa", "window_main", "lighting_pendant")
- label: a human-readable Turkish label
- category: one of [duvar, tavan, zemin, mobilya, pencere, kapi, aydinlatma, aksesuar, diger]
- detectedMaterial: the material you detect in this region (e.g., "boya", "ahsap", "mermer", "kumas")
- confidence: your confidence level 0-1
- polygonPoints: an array of [x, y] coordinate pairs (normalized 0-1, where 0,0 is top-left and 1,1 is bottom-right). These points form a closed polygon that outlines the region boundary. Use 4-8 points for simple rectangular regions, more for complex shapes.
${segmentationTargets.length ? "- targetIndex: exact integer index of the matched takeoff target" : ""}
${segmentationTargets.length ? "- targetKey: exact target key of the matched takeoff target" : ""}

${analysisContext ? `Additional context about this space: ${analysisContext}` : ""}
${segmentationTargets.length ? `Visible takeoff targets to segment:\n${targetList}` : ""}

IMPORTANT:
- Analyze the provided reference image itself. Do not re-imagine, redesign, or substitute another scene.
- Keep camera angle, geometry, and object positions tied to the uploaded reference image.
- Cover only regions that are actually visible in the provided image.
- Polygon points must be normalized between 0 and 1
- Ensure polygons don't overlap significantly
- Label in Turkish
- ${segmentationTargets.length ? "If takeoff targets are provided, segment strictly against that list and do not invent regions outside it. Use the exact target label/category when matched." : "Return visible architectural and design regions."}
- Return valid JSON only

Return JSON in this exact format:
{
  "sceneSummary": "Brief Turkish description of the space",
  "regions": [
    {
      "id": "string",
      "label": "string",
      "category": "string",
      "detectedMaterial": "string",
      "confidence": 0.0,
      ${segmentationTargets.length ? '"targetIndex": 0,' : ""}
      ${segmentationTargets.length ? '"targetKey": "seg_1",' : ""}
      "polygonPoints": [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]]
    }
  ]
}`;

  const response = await callGeminiGenerateContent({
    model,
    contents: [{
      role: "user",
      parts: [
        { text: segPrompt },
        toInlineDataPart(imageData),
      ].filter(Boolean),
    }],
    generationConfig: { responseMimeType: "application/json" },
  });

  const parsed = parseJsonResponse(extractTextFromGeminiResponse(response));
  return {
    sceneSummary: parsed.sceneSummary || "Mekan analizi tamamlandi.",
    regions: (parsed.regions || []).map((r) => ({
      id: r.id || `region_${Math.random().toString(36).slice(2, 8)}`,
      label: r.label || "Bilinmeyen Bolge",
      category: r.category || "diger",
      detectedMaterial: r.detectedMaterial || "",
      confidence: Number(r.confidence || 0.5),
      targetIndex: Number.isInteger(Number(r.targetIndex)) ? Number(r.targetIndex) : -1,
      targetKey: String(r.targetKey || "").trim(),
      polygonPoints: Array.isArray(r.polygonPoints) ? r.polygonPoints : [],
      colorAdjustments: { h: 0, s: 0, l: 0 },
      materialDecision: null,
      lightingDecision: null,
      furnitureDecision: null,
    })),
  };
}

async function analyzeWithGemini(body) {
  const apiKey = resolveRequestApiKey(body);
  const files = Array.isArray(body.files) ? body.files : [];
  const planFile = body.planFile || null;
  const projectContext = body.projectContext || null;
  const model = resolveModelAlias(body.models?.vision, "vision");
  const quantityPrompt = buildVisionAnalysisPrompt(files, planFile);
  const critiquePrompt = withProjectContextDirective(
    buildVisionAnalysisCritiquePrompt(files, planFile),
    projectContext,
    "vision tasarim kritigi",
  );
  const renderParts = files.slice(0, 4).map(toInlineDataPart).filter(Boolean);
  const critiqueParts = [...renderParts, toInlineDataPart(planFile)].filter(Boolean);

  const qtyParts = [...renderParts, toInlineDataPart(planFile)].filter(Boolean);

  const [qtyResponse, critiqueResponse] = await Promise.all([
    callGeminiGenerateContent({
      apiKey,
      model,
      contents: [{
        role: "user",
        parts: [{ text: quantityPrompt }, ...qtyParts],
      }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    }),
    callGeminiGenerateContent({
      apiKey,
      model,
      contents: [{
        role: "user",
        parts: [{ text: critiquePrompt }, ...critiqueParts],
      }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  ]);

  const parsed = parseJsonResponse(extractTextFromGeminiResponse(qtyResponse));
  const parsedCritique = parseJsonResponse(extractTextFromGeminiResponse(critiqueResponse));
  const quantityTakeoff = sanitizeVisionTakeoffItems(parsed.quantityTakeoff);
  return {
    summary: {
      changeableItems: parsed.changeableItems || ["Duvar yüzeyleri", "Tavan katmanı", "Aydınlatma omurgası"],
      detectedSurfaces: parsed.detectedSurfaces || [`Plan referansı: ${planFile?.name || "yok"}`],
      briefOptionPools: parsedCritique.briefOptionPools || {},
      confidenceNote: parsed.confidenceNote || "Gemini analizi tamamlandı. Kullanıcı doğrulaması önerilir.",
      userReviewRecommendation: parsed.userReviewRecommendation || "Sabit mobilya adetleri ve plan sınırlarını gözden geçirin.",
      analysisNotes: parsed.analysisNotes || `${files.length} render işlendi.`,
      designCritique: parsedCritique.designCritique || null,
      mode: "api",
    },
    quantityTakeoff: quantityTakeoff.map((item) => ({
      element: item.element,
      unit: item.unit,
      quantity: Number(item.quantity || 0),
      editable: true,
      location: String(item.location || "").trim(),
      note: item.note || "Gemini vision tahmini.",
      confidence: Number(item.confidence ?? item.visionConfidence ?? 0.68),
      includeInSegmentation: typeof item.includeInSegmentation === "boolean" ? item.includeInSegmentation : true,
      visibleInRenderIndices: Array.isArray(item.visibleInRenderIndices) ? item.visibleInRenderIndices : [],
      segmentationReason: item.segmentationReason || "auto",
    })),
    recommendedScopeSelections: normalizeScopeSelections(parsed.recommendedScopeSelections),
    geminiConfigured: true,
  };
}

async function generateAlternativesWithGemini(body) {
  const apiKey = resolveRequestApiKey(body);
  const model = resolveModelAlias(body.models?.llm, "llm");
  const prompt = withProjectContextDirective(
    buildAlternativeGenerationPrompt(body.prompt, body.quantityData, body.scopeSelections, body.alternativeCount),
    body.projectContext,
    "tasarim alternatifi uretimi",
  );
  const response = await callGeminiGenerateContent({
    apiKey,
    model,
    contents: [{
      role: "user",
      parts: [{
        text: prompt,
      }],
    }],
    generationConfig: { responseMimeType: "application/json" },
  });

  const parsed = parseJsonResponse(extractTextFromGeminiResponse(response));
  return {
    alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
    geminiConfigured: true,
  };
}

async function generateVisualPromptWithGemini(body) {
  const apiKey = resolveRequestApiKey(body);
  const model = resolveModelAlias(body.models?.llm, "llm");
  const prompt = withProjectContextDirective(
    buildVisualPromptGenerationPrompt(body.alternative, body.revisionPrompt, body.preserveGeometry),
    body.projectContext,
    "gorsel prompt uretimi",
  );
  const response = await callGeminiGenerateContent({
    apiKey,
    model,
    contents: [{
      role: "user",
      parts: [{
        text: prompt,
      }],
    }],
  });

  return {
    mode: "api",
    prompt: extractTextFromGeminiResponse(response).trim(),
    geminiConfigured: true,
  };
}

async function generateImageWithGemini(body) {
  const apiKey = resolveRequestApiKey(body);
  const model = resolveModelAlias(body.models?.image, "image");
  const parts = [{ text: body.visualPrompt }];
  const reference = toInlineDataPart(body.referenceImage);
  if (reference && body.preserveGeometry) {
    parts.push(reference);
  }

  const response = await callGeminiGenerateContent({
    apiKey,
    model,
    contents: [{ role: "user", parts }],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
  });

  const image = extractImageFromGeminiResponse(response);
  if (!image) {
    throw new Error("Image model did not return inline image data.");
  }

  return {
    mode: "api",
    seed: Math.floor(Math.random() * 5000),
    url: `data:${image.mimeType};base64,${image.data}`,
    geminiConfigured: true,
  };
}

function resolveRequestApiKey(body = {}) {
  return String(body?.apiKey || body?.apiKeys?.primary || GEMINI_API_KEY || "").trim();
}

async function callGeminiGenerateContent({ apiKey, model, contents, generationConfig }) {
  const resolvedApiKey = String(apiKey || GEMINI_API_KEY || "").trim();
  if (!resolvedApiKey) {
    throw new Error("Gemini API key is missing for this request.");
  }
  const response = await fetch(`${GEMINI_BASE_URL}/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": resolvedApiKey,
    },
    body: JSON.stringify({ contents, generationConfig }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

function buildVisionAnalysisPrompt(files, planFile) {
  const renderIndexList = files
    .slice(0, 4)
    .map((file, index) => `${index}: ${file?.name || `render_${index + 1}`}`)
    .join(" | ");
  return [
    "Sen uzman bir ic mimari metraj (quantity takeoff) ve plan analiz asistanisin.",
    "GOREV: Kat plani ve render gorsellerini çapraz sorgulayarak profesyonel bir metraj listesi cikar.",
    "",
    "### ADIM 1: KAT PLANI ANALIZI (PRIMARY DATA SOURCE FOR QUANTITIES)",
    "1. Plandaki tum yazilari oku (OCR). Mahal isimlerini ve yanlarindaki 'm2' degerlerini tespit et.",
    "2. Ornegin 'YEMEKHANE 291.48 m2' yaziyorsa, o mahalin zemin ve tavan alanini 291.48 m2 olarak baz al.",
    "3. Plandaki mobilya sembollerini say (sandalye, masa, koltuk vb.).",
    "4. Plandaki duvar hatlarini incele; eger olcek varsa uzunluk cikar, yoksa mahal buyuklugunden çevre (perimeter) tahmini yap.",
    "",
    "### ADIM 2: RENDER ANALIZI (PRIMARY DATA SOURCE FOR MATERIALS/MODELS)",
    "1. Render gorsellerindeki malzeme tiplerini tespit et (Orn: 'Asma Tavan' ama tipi 'Akustik Panel' mi 'Ahsap' mi?).",
    "2. Render'daki mobilya modellerini ve aydinlatma armaturlerini tanimla.",
    "",
    "### ADIM 3: CAPRAZ ESLESTIRME (CONSOLIDATION)",
    "- ZEMIN/TAVAN: Plandaki m2 degerini, render'da gordugun malzeme adiyla birlestir. (Miktar asla '1' olamaz.)",
    "- DUVAR ALANI: Plandaki mahal cevresini ortalama 3.00m kat yuksekligi ile carparak m2 hesapla.",
    "- MOBILYA: Plandaki sembol sayisini, render'daki mobilya tipiyle eslestir.",
    "- AYDINLATMA: Hem plan hem render'dan sayim yap.",
    "",
    "### KURALLAR",
    "- Zemin, tavan ve duvarlar icin miktar ASLA '1' olamaz. Plandaki m2 degerini kullan.",
    "- 'm2' yazmayan alanlar icin plandaki geometriden (orn: 10mx20m) alan tahmini yap.",
    "- Stil sifati kullanma. Sadece JSON don.",
    "",
    `Render sayisi: ${files.length}. Render indeksleri: ${renderIndexList || "0: referans render"}. Plan dosyasi: ${planFile?.name || "yok"}.`,
    'JSON yapisi: {"quantityTakeoff":[{"element":"","unit":"","quantity":0,"location":"","visibleInRenderIndices":[0],"note":"","confidence":0.82,"inScope":true,"includeInSegmentation":true,"segmentationReason":"auto"}],"changeableItems":[],"detectedSurfaces":[],"confidenceNote":"","userReviewRecommendation":"","recommendedScopeSelections":{"Tavan":false,"Zemin":false,"Duvar":false,"Sabit Mobilya":false,"Aydinlatma":false,"Dekoratif Ogeler":false}}',
  ].join("\n");
}

function buildVisionAnalysisCritiquePrompt(files, planFile) {
  return [
    "Sen uzman bir ic mimari tasarim elestirmeni ve brief danismanisin.",
    "Yuklenen render gorsellerine odaklanarak mekanin estetik, islevsel ve teknik kalitesini degerlendir.",
    "Plan dosyasini mekansal organizasyon ve sirkulasyon yorumu icin destekleyici kaynak olarak kullan.",
    "Sadece JSON don.",
    `Render sayisi: ${files.length}. Plan dosyasi: ${planFile?.name || "yok"}.`,
    '{"briefOptionPools":{"designDirection":[{"value":"controlled-refresh","label":"Kontrollu Yenileme"}],"spatialProblem":[{"value":"too-plain","label":"Fazla Sade / Karaktersiz"}],"palette":[{"value":"warm-neutral","label":"Sicak Notr"}],"styleGoal":[{"value":"calm-corporate","label":"Sakin ve Kurumsal"}]},"designCritique":{"skorlar":{"mekansalOrganizasyon":{"puan":0,"yorum":""},"ergonomiEsneklik":{"puan":0,"yorum":""},"isikPerformansi":{"puan":0,"yorum":""},"malzemeDoku":{"puan":0,"yorum":""},"gorselKompozisyon":{"puan":0,"yorum":""},"konseptUyumu":{"puan":0,"yorum":""},"uretilebilirlik":{"puan":0,"yorum":""},"butceVerimliligi":{"puan":0,"yorum":""}},"gucluYonler":[],"zayifYonler":[],"genelDegerlendirme":""}}',
  ].join(" ");
}

function buildAlternativeGenerationPrompt(prompt, quantityData, scopeSelections, alternativeCount) {
  return [
    "Bir ic mimari konsept ve maliyet prototipleme asistani olarak calis.",
    `Kullanici promptu: ${prompt}`,
    `Alternatif sayisi: ${alternativeCount}.`,
    `Metraj verisi: ${JSON.stringify(quantityData)}.`,
    `Kapsam secimleri: ${JSON.stringify(scopeSelections)}.`,
    "Sadece JSON don.",
    'JSON yapisi: {"alternatives":[{"title":"","concept":"","changedItems":[],"preservedItems":[],"statusLabel":"","materials":[{"name":"","quantity":0}]}]}',
  ].join(" ");
}

function buildVisualPromptGenerationPrompt(alternative, revisionPrompt, preserveGeometry) {
  return [
    "Bir interior visualization prompt optimizer olarak calis.",
    "Tek satirlik, net ve detayli bir prompt yaz.",
    `Alternatif basligi: ${alternative?.title || ""}.`,
    `Konsept: ${alternative?.concept || ""}.`,
    `Malzemeler: ${(alternative?.materials || []).map((material) => material.name).join(", ")}.`,
    `Geometri koruma: ${preserveGeometry ? "evet" : "hayir"}.`,
    `Revizyon notu: ${revisionPrompt || "yok"}.`,
    "Cevap olarak sadece prompt metnini don.",
  ].join(" ");
}

function extractTextFromGeminiResponse(response) {
  return (response?.candidates || [])
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part?.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}

function extractImageFromGeminiResponse(response) {
  const part = (response?.candidates || [])
    .flatMap((candidate) => candidate?.content?.parts || [])
    .find((entry) => entry?.inlineData?.data);
  return part?.inlineData || null;
}

function parseJsonResponse(text) {
  const cleaned = String(text || "").trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
  return JSON.parse(cleaned);
}

function sanitizeVisionTakeoffItems(quantityTakeoff = []) {
  const items = Array.isArray(quantityTakeoff) ? quantityTakeoff : [];
  const deduped = new Map();
  items.forEach((rawItem) => {
    const item = { ...(rawItem || {}) };
    const cleaned = sanitizeVisionTakeoffElementName(item.element);
    const normalizedElement = normalizeName(cleaned.name);
    const normalizedUnit = normalizeName(item.unit || "adet");
    const confidence = normalizeVisionConfidence(item.confidence ?? item.visionConfidence);
    const quantity = Number(item.quantity || 0);
    const isDecorative = VISION_TAKEOFF_DECORATIVE_PATTERN.test(normalizedElement);

    if (!normalizedElement || !Number.isFinite(quantity) || quantity <= 0) return;
    if (isDecorative) return;

    item.element = cleaned.name;
    item.location = String(item.location || "").trim();
    item.visibleInRenderIndices = Array.isArray(item.visibleInRenderIndices)
      ? item.visibleInRenderIndices.map((value) => Number(value)).filter(Number.isInteger)
      : [];
    if (cleaned.changed && !/sadelestir/i.test(item.note || "")) {
      item.note = [String(item.note || "").trim(), "Kalem adi gorsel tipolojiye gore sadelestirildi."].filter(Boolean).join(" ");
    }

    const key = `${normalizedElement}|${normalizedUnit}`;
    const existing = deduped.get(key);
    if (!existing) {
      deduped.set(key, item);
      return;
    }
    const existingConfidence = normalizeVisionConfidence(existing.confidence ?? existing.visionConfidence);
    if (confidence > existingConfidence || (confidence === existingConfidence && quantity > Number(existing.quantity || 0))) {
      deduped.set(key, item);
    }
  });
  return Array.from(deduped.values());
}

function sanitizeVisionTakeoffElementName(value = "") {
  const original = String(value || "").trim();
  let cleaned = original
    .replace(/\((sofa|couch|table|chair|armchair|desk|coffee table)\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const tokens = cleaned.split(" ").filter(Boolean);
  let changed = cleaned !== original;
  let strippedStyle = false;
  while (tokens.length > 1 && VISION_TAKEOFF_STYLE_PREFIXES.includes(normalizeName(tokens[0]))) {
    tokens.shift();
    strippedStyle = true;
    changed = true;
  }
  cleaned = tokens.join(" ").replace(/\s+/g, " ").trim();
  return {
    name: cleaned || original,
    changed,
    strippedStyle,
  };
}

function normalizeScopeSelections(selectionMap) {
  const base = {
    Tavan: true,
    Zemin: false,
    Duvar: true,
    "Sabit Mobilya": false,
    Aydınlatma: true,
    "Dekoratif Öğeler": true,
  };
  if (!selectionMap || typeof selectionMap !== "object") return base;
  Object.keys(base).forEach((key) => {
    if (typeof selectionMap[key] === "boolean") base[key] = selectionMap[key];
  });
  return base;
}

function normalizeVisionConfidence(value, fallback = 0.68) {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return Math.min(0.99, Math.max(0, numeric));
  return fallback;
}

function normalizeName(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/\s+/g, " ").trim();
}

function toInlineDataPart(file) {
  if (!file?.preview || typeof file.preview !== "string" || !file.preview.startsWith("data:")) return null;
  const match = file.preview.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    inlineData: {
      mimeType: match[1],
      data: match[2],
    },
  };
}

function resolveModelAlias(input, capability) {
  const value = String(input || "").trim().toLowerCase();
  const aliases = {
    "gemini-flash": "gemini-2.5-flash",
    "flash": "gemini-2.5-flash",
    "gemini-2.5-flash": "gemini-2.5-flash",
    "nano-banana": "gemini-2.5-flash-image",
    "gemini-nano-banana": "gemini-2.5-flash-image",
    "flash-image": "gemini-2.5-flash-image",
    "gemini-2.5-flash-image": "gemini-2.5-flash-image",
  };
  if (aliases[value]) return aliases[value];
  if (value.startsWith("gemini-")) return value;
  if (capability === "image") return "gemini-2.5-flash-image";
  return "gemini-2.5-flash";
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

async function parseJsonBody(req) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_BODY_BYTES) {
      req.destroy();
      throw new Error("Request body too large");
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function serveStaticFile(res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const requested = path.normalize(path.join(ROOT, safePath));
  if (!requested.startsWith(ROOT)) {
    return sendJson(res, 403, { error: "Forbidden" });
  }

  fs.readFile(requested, (error, data) => {
    if (error) {
      if (safePath !== "/index.html") {
        return serveStaticFile(res, "/index.html");
      }
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const contentType = MIME_TYPES[path.extname(requested).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  const content = fs.readFileSync(filePath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) return;
    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim();
    env[key] = value;
  });
  return env;
}
