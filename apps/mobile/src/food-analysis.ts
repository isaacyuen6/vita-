export interface FoodItemEstimate {
  calories: number;
  carbsG: number;
  confidence: number;
  fatG: number;
  name: string;
  portion: string;
  proteinG: number;
}

export interface FoodPhotoEstimate {
  assumptions: string[];
  confidence: number;
  items: FoodItemEstimate[];
  notes: string;
  totals: {
    calories: number;
    carbsG: number;
    fatG: number;
    proteinG: number;
  };
}

const aiProxyUrl = process.env.EXPO_PUBLIC_AI_PROXY_URL ?? '/.netlify/functions/food-analysis';
const nutritionPrompt = `
You are Vita AI's food photo nutrition estimator.

Analyze the visible meal and estimate practical nutrition from the image.
Return ONLY valid minified JSON. Do not use markdown. Do not add commentary.

Required JSON shape:
{"items":[{"name":"string","portion":"string","calories":0,"proteinG":0,"carbsG":0,"fatG":0,"confidence":0.75}],"totals":{"calories":0,"proteinG":0,"carbsG":0,"fatG":0},"confidence":0.75,"assumptions":["string"],"notes":"string"}

Rules:
- Use realistic everyday serving sizes from what is visible.
- If a food is uncertain, name the likely food and lower confidence.
- Keep all numbers as plain numbers, not strings.
- Calories and macros must be approximate, rounded to whole numbers.
- Totals must equal the sum of the listed items.
- Mention hidden oil, sauces, drinks, or portion uncertainty in assumptions when relevant.
- Never claim medical accuracy.
`.trim();

export function hasGroqFoodApiKey() {
  return Boolean(aiProxyUrl);
}

function extractJson(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  if (trimmed.startsWith('{')) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) return '';
  return match[0];
}

function roundMacro(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(Math.round(parsed), 0) : 0;
}

function clampConfidence(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(Math.max(parsed, 0), 1);
}

function normalizeEstimate(raw: FoodPhotoEstimate): FoodPhotoEstimate {
  const items = Array.isArray(raw.items) ? raw.items : [];
  const totals = raw.totals ?? { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 };
  return {
    assumptions: Array.isArray(raw.assumptions) ? raw.assumptions : [],
    confidence: clampConfidence(raw.confidence),
    items: items.map((item) => ({
      calories: roundMacro(item.calories),
      carbsG: roundMacro(item.carbsG),
      confidence: clampConfidence(item.confidence),
      fatG: roundMacro(item.fatG),
      name: String(item.name || 'Food item'),
      portion: String(item.portion || 'Visible portion'),
      proteinG: roundMacro(item.proteinG),
    })),
    notes: raw.notes || 'Estimate based on visible foods and approximate portions.',
    totals: {
      calories: roundMacro(totals.calories),
      carbsG: roundMacro(totals.carbsG),
      fatG: roundMacro(totals.fatG),
      proteinG: roundMacro(totals.proteinG),
    },
  };
}

function estimateFromWords(description: string): FoodPhotoEstimate {
  const text = description.toLowerCase();
  const foods = [
    { keys: ['chicken rice', 'nasi ayam'], name: 'Chicken rice', calories: 620, proteinG: 36, carbsG: 72, fatG: 18 },
    { keys: ['fried rice', 'nasi goreng'], name: 'Fried rice', calories: 650, proteinG: 22, carbsG: 85, fatG: 22 },
    { keys: ['rice'], name: 'Cooked rice', calories: 260, proteinG: 5, carbsG: 56, fatG: 1 },
    { keys: ['chicken breast', 'grilled chicken'], name: 'Chicken breast', calories: 280, proteinG: 52, carbsG: 0, fatG: 6 },
    { keys: ['egg'], name: 'Egg', calories: 80, proteinG: 6, carbsG: 1, fatG: 5 },
    { keys: ['oat', 'oats'], name: 'Oats', calories: 300, proteinG: 10, carbsG: 54, fatG: 6 },
    { keys: ['banana'], name: 'Banana', calories: 105, proteinG: 1, carbsG: 27, fatG: 0 },
    { keys: ['beef'], name: 'Beef serving', calories: 330, proteinG: 32, carbsG: 0, fatG: 21 },
    { keys: ['salmon'], name: 'Salmon serving', calories: 360, proteinG: 34, carbsG: 0, fatG: 22 },
    { keys: ['sandwich'], name: 'Sandwich', calories: 430, proteinG: 24, carbsG: 42, fatG: 16 },
    { keys: ['pasta'], name: 'Pasta serving', calories: 520, proteinG: 20, carbsG: 78, fatG: 14 },
    { keys: ['burger'], name: 'Burger', calories: 650, proteinG: 30, carbsG: 45, fatG: 38 },
    { keys: ['pizza'], name: 'Pizza slices', calories: 560, proteinG: 24, carbsG: 64, fatG: 22 },
    { keys: ['protein shake', 'whey'], name: 'Protein shake', calories: 160, proteinG: 25, carbsG: 8, fatG: 3 },
    { keys: ['salad'], name: 'Salad bowl', calories: 280, proteinG: 12, carbsG: 22, fatG: 16 },
  ];
  const matched = foods.filter((food) => food.keys.some((key) => text.includes(key)));
  const items =
    matched.length > 0
      ? matched.map((food) => ({
          calories: food.calories,
          carbsG: food.carbsG,
          confidence: 0.45,
          fatG: food.fatG,
          name: food.name,
          portion: 'Typical visible/entered serving',
          proteinG: food.proteinG,
        }))
      : [
          {
            calories: 450,
            carbsG: 45,
            confidence: 0.25,
            fatG: 18,
            name: description.trim() || 'Meal estimate',
            portion: 'Generic meal serving',
            proteinG: 25,
          },
        ];
  return normalizeEstimate({
    assumptions: ['Fallback estimate used because AI returned invalid nutrition JSON'],
    confidence: matched.length > 0 ? 0.45 : 0.25,
    items,
    notes: 'Estimate is conservative. Edit/confirm if portion size is different.',
    totals: {
      calories: items.reduce((sum, item) => sum + item.calories, 0),
      carbsG: items.reduce((sum, item) => sum + item.carbsG, 0),
      fatG: items.reduce((sum, item) => sum + item.fatG, 0),
      proteinG: items.reduce((sum, item) => sum + item.proteinG, 0),
    },
  });
}

function parseEstimate(content: string, fallbackDescription: string) {
  try {
    const json = extractJson(content);
    if (!json) return estimateFromWords(fallbackDescription || content);
    return normalizeEstimate(JSON.parse(json) as FoodPhotoEstimate);
  } catch {
    const extracted = extractJson(content);
    if (!extracted) return estimateFromWords(fallbackDescription || content);
    const repaired = extracted
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");
    try {
      return normalizeEstimate(JSON.parse(repaired) as FoodPhotoEstimate);
    } catch {
      return estimateFromWords(fallbackDescription || content);
    }
  }
}

async function estimateViaProxy(payload: { base64Image?: string; description?: string }) {
  if (!aiProxyUrl || typeof window === 'undefined') return null;
  const response = await fetch(aiProxyUrl, {
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { estimate?: FoodPhotoEstimate };
  return data.estimate ? normalizeEstimate(data.estimate) : null;
}

export async function estimateFoodPhoto(
  base64Image: string,
  _overrideApiKey?: string,
): Promise<FoodPhotoEstimate> {
  const proxyEstimate = await estimateViaProxy({ base64Image });
  if (proxyEstimate) return proxyEstimate;
  return estimateFromWords('Food photo');
}

export async function estimateFoodText(
  mealDescription: string,
  _overrideApiKey?: string,
): Promise<FoodPhotoEstimate> {
  const proxyEstimate = await estimateViaProxy({ description: mealDescription });
  if (proxyEstimate) return proxyEstimate;
  return estimateFromWords(mealDescription);
}
