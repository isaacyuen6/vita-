const nutritionPrompt = `
You are Vita AI's nutrition estimator for real meals.

Analyze the meal like a careful dietitian:
1. Identify every visible/entered food and drink.
2. Estimate portions in grams, pieces, cups, or common restaurant servings.
3. Account for common hidden calories: frying oil, sauces, rice portions, cheese, sugary drinks, and combo sides.
4. Prefer realistic Malaysia/restaurant portions when the food looks local or fast-food.
5. Return ONLY valid minified JSON. No markdown. No commentary.

Required JSON:
{"items":[{"name":"string","portion":"string","calories":0,"proteinG":0,"carbsG":0,"fatG":0,"confidence":0.75}],"totals":{"calories":0,"proteinG":0,"carbsG":0,"fatG":0},"confidence":0.75,"assumptions":["string"],"notes":"string"}

Rules:
- Numbers must be plain numbers, rounded to whole numbers.
- Totals must equal the sum of listed items.
- If uncertain, split visible foods into multiple items and lower confidence.
- Never claim medical accuracy.
`.trim();

const groqModel = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
const openRouterModel = process.env.OPENROUTER_MODEL || 'openrouter/free';

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };
}

function extractJson(text) {
  const trimmed = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  if (trimmed.startsWith('{')) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  return match ? match[0] : '';
}

function roundMacro(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(Math.round(parsed), 0) : 0;
}

function clampConfidence(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0.35;
  return Math.min(Math.max(parsed, 0), 1);
}

function normalizeEstimate(raw) {
  const items = Array.isArray(raw.items) ? raw.items : [];
  const normalizedItems = items.map((item) => ({
    calories: roundMacro(item.calories),
    carbsG: roundMacro(item.carbsG),
    confidence: clampConfidence(item.confidence),
    fatG: roundMacro(item.fatG),
    name: String(item.name || 'Food item'),
    portion: String(item.portion || 'Visible portion'),
    proteinG: roundMacro(item.proteinG),
  }));
  const summed = normalizedItems.reduce(
    (total, item) => ({
      calories: total.calories + item.calories,
      carbsG: total.carbsG + item.carbsG,
      fatG: total.fatG + item.fatG,
      proteinG: total.proteinG + item.proteinG,
    }),
    { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 },
  );
  return {
    assumptions: Array.isArray(raw.assumptions) ? raw.assumptions.map(String).slice(0, 5) : [],
    confidence: clampConfidence(raw.confidence),
    items: normalizedItems.length ? normalizedItems : [
      { calories: 550, carbsG: 65, confidence: 0.25, fatG: 20, name: 'Meal estimate', portion: '1 serving', proteinG: 25 },
    ],
    notes: String(raw.notes || 'Estimate based on visible foods and approximate portions.'),
    totals: normalizedItems.length ? summed : { calories: 550, carbsG: 65, fatG: 20, proteinG: 25 },
  };
}

function parseEstimate(content) {
  const json = extractJson(content);
  if (!json) throw new Error('Model did not return nutrition JSON');
  const repaired = json
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
  return normalizeEstimate(JSON.parse(repaired));
}

async function callGroq({ base64Image, description }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Groq API key is not configured');
  const content = description
    ? `${nutritionPrompt}\n\nEstimate this typed meal: ${description}`
    : [
        { type: 'text', text: nutritionPrompt },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
      ];
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: groqModel,
      messages: [{ role: 'user', content }],
      temperature: 0.05,
      max_completion_tokens: 900,
      response_format: { type: 'json_object' },
    }),
  });
  if (!response.ok) throw new Error(`Groq failed ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const payload = await response.json();
  return parseEstimate(payload.choices?.[0]?.message?.content || '');
}

async function callOpenRouter({ base64Image, description }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OpenRouter API key is not configured');
  const content = description
    ? `${nutritionPrompt}\n\nEstimate this typed meal: ${description}`
    : [
        { type: 'text', text: nutritionPrompt },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
      ];
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.URL || 'https://vita-ai.netlify.app',
      'X-Title': 'Vita AI',
    },
    body: JSON.stringify({
      model: openRouterModel,
      messages: [{ role: 'user', content }],
      temperature: 0.05,
      max_tokens: 900,
      response_format: { type: 'json_object' },
    }),
  });
  if (!response.ok) throw new Error(`OpenRouter failed ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const payload = await response.json();
  return parseEstimate(payload.choices?.[0]?.message?.content || '');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(204, {});
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });

  try {
    const body = JSON.parse(event.body || '{}');
    const description = String(body.description || '').trim();
    const base64Image = String(body.base64Image || '').trim();
    if (!description && !base64Image) return jsonResponse(400, { error: 'Provide description or base64Image' });

    const errors = [];
    try {
      return jsonResponse(200, { provider: 'groq', estimate: await callGroq({ base64Image, description }) });
    } catch (error) {
      errors.push(error.message);
    }

    try {
      return jsonResponse(200, { provider: 'openrouter', estimate: await callOpenRouter({ base64Image, description }) });
    } catch (error) {
      errors.push(error.message);
    }

    return jsonResponse(502, { error: 'Food analysis failed', details: errors.slice(-2) });
  } catch (error) {
    return jsonResponse(400, { error: error.message || 'Invalid request' });
  }
};
