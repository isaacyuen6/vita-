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

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('The model did not return nutrition JSON.');
  return match[0];
}

function normalizeEstimate(raw: FoodPhotoEstimate): FoodPhotoEstimate {
  const items = Array.isArray(raw.items) ? raw.items : [];
  const totals = raw.totals ?? { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 };
  return {
    assumptions: Array.isArray(raw.assumptions) ? raw.assumptions : [],
    confidence: Number(raw.confidence) || 0,
    items: items.map((item) => ({
      calories: Math.round(Number(item.calories) || 0),
      carbsG: Math.round(Number(item.carbsG) || 0),
      confidence: Number(item.confidence) || 0,
      fatG: Math.round(Number(item.fatG) || 0),
      name: String(item.name || 'Food item'),
      portion: String(item.portion || 'Visible portion'),
      proteinG: Math.round(Number(item.proteinG) || 0),
    })),
    notes: raw.notes || 'Estimate based on visible foods and approximate portions.',
    totals: {
      calories: Math.round(Number(totals.calories) || 0),
      carbsG: Math.round(Number(totals.carbsG) || 0),
      fatG: Math.round(Number(totals.fatG) || 0),
      proteinG: Math.round(Number(totals.proteinG) || 0),
    },
  };
}

export async function estimateFoodPhoto(base64Image: string): Promise<FoodPhotoEstimate> {
  if (!groqApiKey) {
    throw new Error('Missing EXPO_PUBLIC_GROQ_API_KEY. Add it to your local environment before scanning meals.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    body: JSON.stringify({
      max_completion_tokens: 900,
      messages: [
        {
          content: [
            {
              text:
                'Estimate nutrition for the visible food. Return only JSON with this exact shape: {"items":[{"name":"string","portion":"string","calories":0,"proteinG":0,"carbsG":0,"fatG":0,"confidence":0.0}],"totals":{"calories":0,"proteinG":0,"carbsG":0,"fatG":0},"confidence":0.0,"assumptions":["string"],"notes":"string"}. Use realistic portions from the photo, label uncertainty, and do not claim medical accuracy.',
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
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
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
  return normalizeEstimate(JSON.parse(extractJson(content)) as FoodPhotoEstimate);
}
