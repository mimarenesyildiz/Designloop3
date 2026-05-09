(function attachMaterialEngine(global) {
  function normalizeMaterialText(value) {
    return String(value || "")
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ş/g, "s")
      .replace(/ç/g, "c")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .trim();
  }

  function shallowMerge(base, extra) {
    return { ...(base || {}), ...(extra || {}) };
  }

  const CATEGORY_KEYWORDS = [
    { test: /(tavan|baffle|asma tavan|gizli isik)/, category: "Tavan Uygulamaları" },
    { test: /(duvar|boya|kagit|cita|panel)/, category: "Duvar Uygulamaları" },
    { test: /(zemin|parke|karo|seramik|mikrosement|microcement|hali|laminat|lvt|vinil|vinyl|epoksi|porselen|slab)/, category: "Zemin Kaplamaları" },
    { test: /(dolap|kapak|tezgah|kapi|supurgelik|banko|sabit mobilya)/, category: "Sabit Mobilya" },
    { test: /(spot|ray|led|aplik|priz|anahtar|aydinlatma|elektrik)/, category: "Aydınlatma / Elektrik" },
    { test: /(lavabo|klozet|batarya|dus|dusakabin|vitrifiye)/, category: "Vitrifiye & Islak Hacim" },
    { test: /(perde|dekoratif|hareketli|stor|zebra)/, category: "Dekoratif Öğeler & Hareketli" },
    { test: /(yikim|sokum|hafriyat|sap)/, category: "Yıkım & Kaba İşler" },
  ];

  const CATEGORY_ZONE_FALLBACKS = {
    "Zemin Kaplamaları": ["salon", "ofis", "koridor"],
    "Duvar Uygulamaları": ["salon", "ofis", "koridor", "bekleme"],
    "Tavan Uygulamaları": ["salon", "ofis", "koridor", "konferans"],
    "Sabit Mobilya": ["mutfak", "banyo", "ofis", "salon"],
    "Aydınlatma / Elektrik": ["tum-hacimler"],
    "Vitrifiye & Islak Hacim": ["banyo", "wc"],
    "Dekoratif Öğeler & Hareketli": ["salon", "yatak-odasi", "ofis", "konferans"],
    "Yıkım & Kaba İşler": ["tum-hacimler"],
  };

  function getItems() {
    return Array.isArray(global.COST_DATABASE_DATA) ? global.COST_DATABASE_DATA : [];
  }

  class BudgetImpactCalculator {
    static classifyBudgetPosture(areaM2, perUnit, total) {
      const safeArea = Number(areaM2 || 0);
      const safePerUnit = Number(perUnit || 0);
      if (safeArea > 30 && safePerUnit > 1500) return "critical";
      if (safeArea <= 10 && safePerUnit > 1500) return "smart-luxury";
      return "balanced";
    }

    static formatBudgetDisplay(total) {
      const safeTotal = Number(total || 0);
      return safeTotal.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
    }
  }

  class CrossSpaceIntelligence {
    static queryProjectMaterialUsage(project, category, dbItemId) {
      const usage = Array.isArray(project?.materialUsage) ? project.materialUsage : [];
      return usage.filter((entry) => {
        if (dbItemId && entry.dbItemId !== dbItemId) return false;
        if (category && normalizeMaterialText(entry.category) !== normalizeMaterialText(category)) return false;
        return true;
      });
    }
  }

  class MaterialEngine {
    static getAll() {
      return getItems();
    }

    static getById(id) {
      return getItems().find((item) => item.id === id) || null;
    }

    static getByName(name) {
      const normalized = normalizeMaterialText(name);
      return getItems().find((item) => normalizeMaterialText(item.name) === normalized) || null;
    }

    static inferDatabaseCategory(input) {
      const parts = typeof input === "string"
        ? [input]
        : [input?.category || "", input?.label || "", input?.detectedMaterial || ""];
      for (const part of parts) {
        const normalized = normalizeMaterialText(part);
        if (!normalized) continue;
        const hit = CATEGORY_KEYWORDS.find((entry) => entry.test.test(normalized));
        if (hit?.category) return hit.category;
      }
      const normalized = normalizeMaterialText(parts.join(" "));
      const hit = CATEGORY_KEYWORDS.find((entry) => entry.test.test(normalized));
      return hit?.category || "Duvar Uygulamaları";
    }

    static getCategoryItems(categoryOrRegion) {
      const category = this.inferDatabaseCategory(categoryOrRegion);
      return getItems().filter((item) => item.category === category);
    }

    static getProfile(dbItemId) {
      return this.getById(dbItemId)?.profile || null;
    }

    static getConstraints(dbItemId) {
      return this.getById(dbItemId)?.constraints || null;
    }

    static calculateBudgetImpact(dbItemId, areaM2) {
      const item = this.getById(dbItemId);
      if (!item) return null;
      const safeArea = Math.max(0, Number(areaM2 || 0));
      const perUnit = Number(item.unitPrice || 0) + Number(item.labor || 0);
      const total = Math.round(perUnit * safeArea);
      const budgetPosture = BudgetImpactCalculator.classifyBudgetPosture(safeArea, perUnit, total);
      return {
        perUnit,
        total,
        budgetPosture,
        areaM2: safeArea,
        totalLabel: BudgetImpactCalculator.formatBudgetDisplay(total),
      };
    }

    static findLookForLess(dbItemId) {
      const item = this.getById(dbItemId);
      if (!item?.alternatives?.lookForLessId) return null;
      const candidate = this.getById(item.alternatives.lookForLessId);
      if (!candidate) return null;
      if (Number(candidate.unitPrice || 0) > Number(item.unitPrice || 0)) return null;
      return candidate;
    }

    static findUpgrade(dbItemId) {
      const item = this.getById(dbItemId);
      if (!item?.alternatives?.upgradeToId) return null;
      return this.getById(item.alternatives.upgradeToId);
    }

    static findPairs(dbItemId) {
      const ids = this.getById(dbItemId)?.alternatives?.pairsWith || [];
      return ids.map((id) => this.getById(id)).filter(Boolean);
    }

    static inferTargetZone(region, state) {
      const source = normalizeMaterialText(`${region?.label || ""} ${region?.category || ""} ${state?.name || ""}`);
      if (/banyo|wc|lavabo|islak/.test(source)) return "islak-hacim";
      if (/mutfak|tezgah/.test(source)) return "mutfak";
      if (/ofis|calisma/.test(source)) return "ofis";
      if (/konferans|toplanti|seminer/.test(source)) return "konferans";
      if (/koridor|giris/.test(source)) return "koridor";
      if (/yatak/.test(source)) return "yatak-odasi";
      return "salon";
    }

    static checkEligibility(dbItemId, targetZone) {
      const item = this.getById(dbItemId);
      if (!item) return { eligible: false, warnings: [{ type: "critical", message: "Malzeme veritabaninda bulunamadi.", animation: "shake" }] };
      const constraints = item.constraints || {};
      const warnings = [];
      const zone = normalizeMaterialText(targetZone || "");
      if ((constraints.avoidZones || []).map(normalizeMaterialText).includes(zone)) {
        warnings.push({
          type: "critical",
          message: constraints.warningNote || `Bu urun ${targetZone} icin onerilmiyor.`,
          animation: "shake",
        });
      }
      (constraints.requiresPrior || []).forEach((prior) => {
        warnings.push({
          type: "info",
          message: `On gereksinim: ${prior}`,
          animation: null,
        });
      });
      return { eligible: !warnings.some((item) => item.type === "critical"), warnings };
    }

    static buildMaterialPromptAffix(dbItemId) {
      const item = this.getById(dbItemId);
      if (!item) return "";
      const category = normalizeMaterialText(item.category || "");
      const surface = category.includes("zemin")
        ? "floor"
        : category.includes("duvar")
          ? "wall"
          : category.includes("tavan")
            ? "ceiling"
            : category.includes("aydinlatma")
              ? "lighting"
              : category.includes("sabit")
                ? "built-in furniture"
                : "";
      return [
        item.profile?.materialFamily || "",
        surface,
        item.profile?.note || "",
        item.constraints?.warningNote || "",
      ].filter(Boolean).join(", ");
    }

    static getBudgetRangeItems(categoryOrRegion, range = { min: 1, max: 3 }) {
      const items = this.getCategoryItems(categoryOrRegion);
      const min = Number(range?.min ?? 1);
      const max = Number(range?.max ?? 3);
      const tiers = ["economy", "mid", "premium", "luxury"];
      return items
        .filter((item) => {
          const tier = item.profile?.tier || "mid";
          const index = tiers.indexOf(tier);
          if (max <= 1) return index <= 1;
          if (min >= 4) return index >= 2;
          return true;
        })
        .sort((a, b) => (Number(a.unitPrice || 0) + Number(a.labor || 0)) - (Number(b.unitPrice || 0) + Number(b.labor || 0)));
    }

    static buildCategorySummary(categoryOrRegion) {
      const items = this.getCategoryItems(categoryOrRegion);
      const category = this.inferDatabaseCategory(categoryOrRegion);
      return {
        category,
        count: items.length,
        zones: CATEGORY_ZONE_FALLBACKS[category] || ["salon"],
      };
    }

    static createPassport(dbItemId) {
      const item = this.getById(dbItemId);
      if (!item) return null;
      const profile = item.profile || {};
      const constraints = item.constraints || {};
      const sustainability = profile.materialFamily === "wood"
        ? "Dogru kaynakla yenilenebilir ancak nem ve bakim takibi ister."
        : profile.materialFamily === "ceramic" || profile.materialFamily === "stone"
          ? "Uzun omurlu ve dusuk degisim ihtiyacli; tasimada agir karbon etkisi olabilir."
          : profile.materialFamily === "fabric"
            ? "Yuzey konforu yuksek; bakim ve leke direnci secime gore degisir."
            : "Kategoriye gore dengeli performans sunar.";
      const moisture = (constraints.avoidZones || []).some((zone) => /islak|banyo|wc/.test(normalizeMaterialText(zone)))
        ? "Dusuk"
        : "Orta";
      return {
        maintenance: profile.maintenance || "medium",
        lifespan: profile.lifespan || "medium",
        installComplexity: profile.installComplexity || "standard",
        materialFamily: profile.materialFamily || "system",
        moistureResistance: moisture,
        sustainability,
        suitableZones: constraints.suitableZones || [],
        avoidZones: constraints.avoidZones || [],
        warningNote: constraints.warningNote || "",
        note: profile.note || "",
      };
    }
  }

  global.BudgetImpactCalculator = BudgetImpactCalculator;
  global.CrossSpaceIntelligence = CrossSpaceIntelligence;
  global.MaterialEngine = MaterialEngine;
})(window);
