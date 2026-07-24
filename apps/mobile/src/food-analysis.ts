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

const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const groqVisionModel = 'qwen/qwen3.6-27b';
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
  return Boolean(groqApiKey);
}

function extractJson(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  if (trimmed.startsWith('{')) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('The model did not return nutrition JSON.');
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

function parseEstimate(content: string) {
  try {
    return normalizeEstimate(JSON.parse(extractJson(content)) as FoodPhotoEstimate);
  } catch {
    const repaired = extractJson(content)
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");
    return normalizeEstimate(JSON.parse(repaired) as FoodPhotoEstimate);
  }
}

export async function estimateFoodPhoto(
  base64Image: string,
  overrideApiKey?: string,
): Promise<FoodPhotoEstimate> {
  const apiKey = overrideApiKey?.trim() || groqApiKey;
  if (!apiKey) {
    throw new Error('Add a Groq API key before scanning meals.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    body: JSON.stringify({
      max_completion_tokens: 900,
      messages: [
        {
          content: [
            {
              text: nutritionPrompt,
              type: 'text',
            },
            {
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
              type: 'image_url',
            },
          ],
          role: 'user',
        },
      ],
      model: groqVisionModel,
      temperature: 0.2,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq food analysis failed (${response.status}): ${errorText.slice(0, 180)}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq did not return a food estimate.');
  return parseEstimate(content);
}
