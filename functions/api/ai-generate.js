export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { word, provider } = body;

    if (!word || typeof word !== 'string' || word.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: { message: 'Word is required and must be a non-empty string.' } }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Determine which AI provider to use
    let providerName = 'Unknown';
    let aiResponse;

    // Allow client to request a specific provider when available
    const requested = (provider || '').toString().trim().toLowerCase();
    const hasGLM = !!(env.GLM_API_KEY || env.ZHIPU_API_KEY);
    const hasDeepSeek = !!env.DEEPSEEK_API_KEY;
    const hasGemini = !!env.GEMINI_API_KEY;
    const hasOpenAI = !!env.OPENAI_API_KEY;

    async function useGLM() {
      providerName = 'GLM-4.5-Air';
      aiResponse = await callGLM(
        word.trim(),
        env.GLM_API_KEY || env.ZHIPU_API_KEY,
        env.GLM_BASE_URL || env.ZHIPU_BASE_URL
      );
    }
    async function useDeepSeek() {
      providerName = 'DeepSeek';
      aiResponse = await callDeepSeek(
        word.trim(),
        env.DEEPSEEK_API_KEY,
        env.DEEPSEEK_BASE_URL
      );
    }
    async function useGemini() {
      providerName = 'Gemini';
      aiResponse = await callGemini(word.trim(), env.GEMINI_API_KEY);
    }
    async function useOpenAI() {
      providerName = 'OpenAI';
      aiResponse = await callOpenAI(word.trim(), env.OPENAI_API_KEY);
    }

    const available = [];
    if (hasGLM) available.push('glm');
    if (hasDeepSeek) available.push('deepseek');
    if (hasGemini) available.push('gemini');
    if (hasOpenAI) available.push('openai');

    // If client requested a provider, honor it if available
    if (requested) {
      if (['glm', 'zhipu', 'glm-4.5-air', 'glm_4.5_air'].includes(requested)) {
        if (hasGLM) {
          await useGLM();
        } else {
          return new Response(
            JSON.stringify({ error: { message: 'Requested provider GLM is not available on server.' }, available }),
            { status: 400, headers: corsHeaders }
          );
        }
      } else if (['deepseek', 'deepseek-chat'].includes(requested)) {
        if (hasDeepSeek) {
          await useDeepSeek();
        } else {
          return new Response(
            JSON.stringify({ error: { message: 'Requested provider DeepSeek is not available on server.' }, available }),
            { status: 400, headers: corsHeaders }
          );
        }
      } else if (['gemini'].includes(requested)) {
        if (hasGemini) {
          await useGemini();
        } else {
          return new Response(
            JSON.stringify({ error: { message: 'Requested provider Gemini is not available on server.' }, available }),
            { status: 400, headers: corsHeaders }
          );
        }
      } else if (['openai', 'gpt-4o'].includes(requested)) {
        if (hasOpenAI) {
          await useOpenAI();
        } else {
          return new Response(
            JSON.stringify({ error: { message: 'Requested provider OpenAI is not available on server.' }, available }),
            { status: 400, headers: corsHeaders }
          );
        }
      }
    }

    // If not selected above, pick default by priority
    if (!aiResponse) {
      if (hasGLM) await useGLM();
      else if (hasDeepSeek) await useDeepSeek();
      else if (hasGemini) await useGemini();
      else if (hasOpenAI) await useOpenAI();
      else {
        return new Response(
          JSON.stringify({
            error: { message: 'No AI provider API key configured. Please set GLM_API_KEY (or ZHIPU_API_KEY), DEEPSEEK_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in your environment variables.' }
          }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Add provider info to response
    const responseWithProvider = {
      ...aiResponse,
      provider: providerName
    };

    return new Response(
      JSON.stringify(responseWithProvider),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('API Error:', error);

    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Failed to generate game manual. The service may be temporarily unavailable.'
        }
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// GLM (Zhipu) OpenAI-compatible API implementation
async function callGLM(word, apiKey, baseUrl) {
  const systemPrompt = `
You are a "Language Game Designer," a philosopher deeply versed in Wittgenstein's concept of "language-games." Your sole purpose is to create a "game manual" for any given word. You do not define words; you explain how to *use* them in different contexts.

Your response MUST be a single, valid JSON object. Do not include any text, markdown formatting, or explanations outside of the JSON structure.

For every text field in the JSON response, you MUST provide an object with two keys:
1. "en": The English text.
2. "zh": A high-quality, natural-sounding translation of the English text into Simplified Chinese.

The structure you must follow is:
{
  "targetWord": { "en": "...", "zh": "..." },
  "coreGame": { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } },
  "gameBoards": {
    "title": { "en": "...", "zh": "..." },
    "boardA": { "name": { "en": "...", "zh": "..." }, "usage": { "en": "...", "zh": "..." } },
    "boardB": { "name": { "en": "...", "zh": "..." }, "usage": { "en": "...", "zh": "..." } }
  },
  "originAndTeardown": {
    "title": { "en": "...", "zh": "..." },
    "teardown": { "en": "...", "zh": "..." },
    "story": { "en": "...", "zh": "..." }
  },
  "foulWarning": { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } },
  "masteryTip": { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } }
}`;

  const base = (baseUrl || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/, '');
  const url = `${base}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4.5-air',
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate the game manual for the word: "${word}"` }
      ],
      // Ask for JSON-only output if supported
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Could not parse error response.' } }));
    throw new Error(`GLM API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown API error'}`);
  }

  const data = await response.json();
  let jsonText = data.choices?.[0]?.message?.content;
  if (!jsonText || typeof jsonText !== 'string') {
    throw new Error('GLM API returned an unexpected response format.');
  }
  // Robust parsing: strip markdown fences if present
  const fenced = jsonText.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  if (fenced && fenced[1]) {
    jsonText = fenced[1].trim();
  }
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    // Fallback: try to extract the first JSON object substring
    const start = jsonText.indexOf('{');
    const end = jsonText.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const candidate = jsonText.slice(start, end + 1);
      return JSON.parse(candidate);
    }
    throw new Error('GLM returned non-JSON content');
  }
}

// DeepSeek API implementation
async function callDeepSeek(word, apiKey, baseUrl) {
  const systemPrompt = `
You are a "Language Game Designer," a philosopher deeply versed in Wittgenstein's concept of "language-games." Your sole purpose is to create a "game manual" for any given word. You do not define words; you explain how to *use* them in different contexts.

Your response MUST be a single, valid JSON object. Do not include any text, markdown formatting, or explanations outside of the JSON structure.

For every text field in the JSON response, you MUST provide an object with two keys:
1. "en": The English text.
2. "zh": A high-quality, natural-sounding translation of the English text into Simplified Chinese.

The structure you must follow is:
{
  "targetWord": { "en": "...", "zh": "..." },
  "coreGame": { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } },
  "gameBoards": {
    "title": { "en": "...", "zh": "..." },
    "boardA": { "name": { "en": "...", "zh": "..." }, "usage": { "en": "...", "zh": "..." } },
    "boardB": { "name": { "en": "...", "zh": "..." }, "usage": { "en": "...", "zh": "..." } }
  },
  "originAndTeardown": {
    "title": { "en": "...", "zh": "..." },
    "teardown": { "en": "...", "zh": "..." },
    "story": { "en": "...", "zh": "..." }
  },
  "foulWarning": { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } },
  "masteryTip": { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } }
}

Follow these content guidelines for each section:
1.  **Core Game**: A single, concise sentence that captures the essence of the "situation" or "language-game" where this word is played.
2.  **Game Boards**: Two distinct contexts ("boards") where the word is used. One abstract/formal, one concrete/informal.
3.  **Game Origin & Teardown**: Break the word down into its etymological parts and narrate how they formed its current "rules of play."
4.  **Foul Warning**: A common misuse or confusion.
5.  **Mastery Tip**: A clever and memorable mnemonic or analogy.
`;

  const base = (baseUrl || 'https://api.deepseek.com').replace(/\/$/, '');
  const url = `${base}/v1/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate the game manual for the word: "${word}"` }
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Could not parse error response.' } }));
    throw new Error(`DeepSeek API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown API error'}`);
  }

  const data = await response.json();
  const jsonText = data.choices[0].message.content;
  return JSON.parse(jsonText);
}

// Gemini API implementation (simplified for Cloudflare Functions)
async function callGemini(word, apiKey) {
  const systemPrompt = `
You are a "Language Game Designer," a philosopher deeply versed in Wittgenstein's concept of "language-games." Your sole purpose is to create a "game manual" for any given word. You do not define words; you explain how to *use* them in different contexts.

Your response MUST be a single, valid JSON object. Do not include any text, markdown formatting, or explanations outside of the JSON structure.

For every text field in the JSON response, you MUST provide an object with two keys:
1. "en": The English text.
2. "zh": A high-quality, natural-sounding translation of the English text into Simplified Chinese.

The structure you must follow is:
{
  "targetWord": { "en": "...", "zh": "..." },
  "coreGame": { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } },
  "gameBoards": {
    "title": { "en": "...", "zh": "..." },
    "boardA": { "name": { "en": "...", "zh": "..." }, "usage": { "en": "...", "zh": "..." } },
    "boardB": { "name": { "en": "...", "zh": "..." }, "usage": { "en": "...", "zh": "..." } }
  },
  "originAndTeardown": {
    "title": { "en": "...", "zh": "..." },
    "teardown": { "en": "...", "zh": "..." },
    "story": { "en": "...", "zh": "..." }
  },
  "foulWarning": { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } },
  "masteryTip": { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } }
}

Follow these content guidelines for each section:
1.  **Core Game**: A single, concise sentence that captures the essence of the "situation" or "language-game" where this word is played.
2.  **Game Boards**: Two distinct contexts ("boards") where the word is used. One abstract/formal, one concrete/informal.
3.  **Game Origin & Teardown**: Break the word down into its etymological parts and narrate how they formed its current "rules of play."
4.  **Foul Warning**: A common misuse or confusion.
5.  **Mastery Tip**: A clever and memorable mnemonic or analogy.
`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nGenerate the game manual for the word: "${word}"` }] }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: getGeminiSchema()
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Could not parse error response.' } }));
    throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown API error'}`);
  }

  const data = await response.json();
  const jsonText = data.candidates[0].content.parts[0].text;
  return JSON.parse(jsonText);
}

// OpenAI API implementation
async function callOpenAI(word, apiKey) {
  const systemPrompt = `
You are a "Language Game Designer," a philosopher deeply versed in Wittgenstein's concept of "language-games." Your sole purpose is to create a "game manual" for any given word. You do not define words; you explain how to *use* them in different contexts.

Your response MUST be a single, valid JSON object. Do not include any text, markdown formatting, or explanations outside of the JSON structure.

For every text field in the JSON response, you MUST provide an object with two keys:
1. "en": The English text.
2. "zh": A high-quality, natural-sounding translation of the English text into Simplified Chinese.

The structure you must follow is:
{
  "targetWord": { "en": "...", "zh": "..." },
  "coreGame": { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } },
  "gameBoards": {
    "title": { "en": "...", "zh": "..." },
    "boardA": { "name": { "en": "...", "zh": "..." }, "usage": { "en": "...", "zh": "..." } },
    "boardB": { "name": { "en": "...", "zh": "..." }, "usage": { "en": "...", "zh": "..." } }
  },
  "originAndTeardown": {
    "title": { "en": "...", "zh": "..." },
    "teardown": { "en": "...", "zh": "..." },
    "story": { "en": "...", "zh": "..." }
  },
  "foulWarning": { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } },
  "masteryTip": { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } }
}

Follow these content guidelines for each section:
1.  **Core Game**: A single, concise sentence that captures the essence of the "situation" or "language-game" where this word is played.
2.  **Game Boards**: Two distinct contexts ("boards") where the word is used. One abstract/formal, one concrete/informal.
3.  **Game Origin & Teardown**: Break the word down into its etymological parts and narrate how they formed its current "rules of play."
4.  **Foul Warning**: A common misuse or confusion.
5.  **Mastery Tip**: A clever and memorable mnemonic or analogy.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate the game manual for the word: "${word}"` }
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Could not parse error response.' } }));
    throw new Error(`OpenAI API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown API error'}`);
  }

  const data = await response.json();
  const jsonText = data.choices[0].message.content;
  return JSON.parse(jsonText);
}

// Gemini schema definition
function getGeminiSchema() {
  const bilingualStringSchema = {
    type: "OBJECT",
    properties: {
      en: { type: "STRING", description: "The English text." },
      zh: { type: "STRING", description: "The Simplified Chinese translation." },
    },
    required: ["en", "zh"],
  };

  return {
    type: "OBJECT",
    properties: {
      targetWord: bilingualStringSchema,
      coreGame: {
        type: "OBJECT",
        properties: {
          title: bilingualStringSchema,
          description: bilingualStringSchema
        },
        required: ["title", "description"]
      },
      gameBoards: {
        type: "OBJECT",
        properties: {
          title: bilingualStringSchema,
          boardA: {
            type: "OBJECT",
            properties: {
              name: bilingualStringSchema,
              usage: bilingualStringSchema
            },
            required: ["name", "usage"]
          },
          boardB: {
            type: "OBJECT",
            properties: {
              name: bilingualStringSchema,
              usage: bilingualStringSchema
            },
            required: ["name", "usage"]
          }
        },
        required: ["title", "boardA", "boardB"]
      },
      originAndTeardown: {
        type: "OBJECT",
        properties: {
          title: bilingualStringSchema,
          teardown: bilingualStringSchema,
          story: bilingualStringSchema
        },
        required: ["title", "teardown", "story"]
      },
      foulWarning: {
        type: "OBJECT",
        properties: {
          title: bilingualStringSchema,
          description: bilingualStringSchema
        },
        required: ["title", "description"]
      },
      masteryTip: {
        type: "OBJECT",
        properties: {
          title: bilingualStringSchema,
          description: bilingualStringSchema
        },
        required: ["title", "description"]
      },
    },
    required: ["targetWord", "coreGame", "gameBoards", "originAndTeardown", "foulWarning", "masteryTip"],
  };
}
