import { GoogleGenAI, Type } from "@google/genai";
import { GameManual } from '../types';

// 1. SHARED PROMPT LOGIC =================================================

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

const getUserPrompt = (word: string) => `Generate the game manual for the word: "${word}"`;


// 2. PROVIDER INTERFACE =================================================

interface IAiProvider {
  generateGameManual(word: string): Promise<GameManual>;
}


// 3. PROVIDER IMPLEMENTATIONS ==========================================

/**
 * Gemini Provider
 * Uses the official Google GenAI SDK and a specific JSON schema for structured output.
 */
class GeminiProvider implements IAiProvider {
  private ai: GoogleGenAI;
  private schema: object;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("Gemini API key (API_KEY) not found in environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const bilingualStringSchema = {
      type: Type.OBJECT,
      properties: {
        en: { type: Type.STRING, description: "The English text." },
        zh: { type: Type.STRING, description: "The Simplified Chinese translation." },
      },
      required: ['en', 'zh'],
    };

    this.schema = {
      type: Type.OBJECT,
      properties: {
        targetWord: bilingualStringSchema,
        coreGame: { type: Type.OBJECT, properties: { title: bilingualStringSchema, description: bilingualStringSchema }, required: ['title', 'description'] },
        gameBoards: { type: Type.OBJECT, properties: { title: bilingualStringSchema, boardA: { type: Type.OBJECT, properties: { name: bilingualStringSchema, usage: bilingualStringSchema }, required: ['name', 'usage'] }, boardB: { type: Type.OBJECT, properties: { name: bilingualStringSchema, usage: bilingualStringSchema }, required: ['name', 'usage'] } }, required: ['title', 'boardA', 'boardB'] },
        originAndTeardown: { type: Type.OBJECT, properties: { title: bilingualStringSchema, teardown: bilingualStringSchema, story: bilingualStringSchema }, required: ['title', 'teardown', 'story'] },
        foulWarning: { type: Type.OBJECT, properties: { title: bilingualStringSchema, description: bilingualStringSchema }, required: ['title', 'description'] },
        masteryTip: { type: Type.OBJECT, properties: { title: bilingualStringSchema, description: bilingualStringSchema }, required: ['title', 'description'] },
      },
      required: ['targetWord', 'coreGame', 'gameBoards', 'originAndTeardown', 'foulWarning', 'masteryTip'],
    };
  }

  async generateGameManual(word: string): Promise<GameManual> {
    const prompt = `${systemPrompt}\n\nThe user has provided the target word: "${word}"`;
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: this.schema,
        },
      });

      const jsonText = response.text.trim();
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Error generating game manual with Gemini:", error);
      throw new Error("Failed to generate the game manual. The model may be unavailable or the input might be invalid.");
    }
  }
}

/**
 * OpenAI-Compatible Provider
 * A generic class for APIs that follow the OpenAI chat completions format, like OpenAI and DeepSeek.
 * Relies on the model's ability to follow instructions to produce JSON.
 */
class OpenAICompatibleProvider implements IAiProvider {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(apiKey: string, apiUrl: string, model: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.model = model;
  }

  async generateGameManual(word: string): Promise<GameManual> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: getUserPrompt(word) },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Could not parse error response.' } }));
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown API error'}`);
      }
      
      const data = await response.json();
      const jsonText = data.choices[0].message.content;
      return JSON.parse(jsonText);
    } catch (error) {
      console.error(`Error generating game manual with ${this.apiUrl}:`, error);
      throw new Error("Failed to generate the game manual. The model may be unavailable or the input might be invalid.");
    }
  }
}


// 4. FACTORY AND EXPORT ================================================

function createAiProvider(): { provider: IAiProvider; name: string } {
  // Temporarily prioritize DeepSeek for debugging
  if (process.env.DEEPSEEK_API_KEY) {
    console.log("Using DeepSeek provider.");
    return {
        provider: new OpenAICompatibleProvider(
            process.env.DEEPSEEK_API_KEY,
            'https://api.deepseek.com/v1/chat/completions',
            'deepseek-chat'
        ),
        name: 'DeepSeek'
    };
  } else if (process.env.API_KEY) {
    console.log("Using Google Gemini provider.");
    return { provider: new GeminiProvider(), name: 'Gemini' };
  } else if (process.env.OPENAI_API_KEY) {
    console.log("Using OpenAI provider.");
    return {
        provider: new OpenAICompatibleProvider(
            process.env.OPENAI_API_KEY,
            'https://api.openai.com/v1/chat/completions',
            'gpt-4o'
        ),
        name: 'OpenAI'
    };
  }

  throw new Error("No AI provider API key found. Please set API_KEY (for Gemini), OPENAI_API_KEY, or DEEPSEEK_API_KEY in your environment variables.");
}

const { provider, name: providerName } = createAiProvider();

export const generateGameManual = (word: string): Promise<GameManual> => {
  return provider.generateGameManual(word);
};

export const activeProviderName = providerName;