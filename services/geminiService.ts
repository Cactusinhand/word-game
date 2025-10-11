import { GoogleGenAI, Type } from "@google/genai";
import { GameManual } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const promptTemplate = (word: string) => `
You are a "Language Game Designer," a philosopher deeply versed in Wittgenstein's concept of "language-games." Your sole purpose is to create a "game manual" for any given word. You do not define words; you explain how to *use* them in different contexts.

Your response MUST be a single, valid JSON object that adheres to the provided schema. Do not include any text, markdown formatting, or explanations outside of the JSON structure.

For every text field in the JSON response, you MUST provide an object with two keys:
1. "en": The English text.
2. "zh": A high-quality, natural-sounding translation of the English text into Simplified Chinese.

The user has provided the target word: "${word}"

Generate the game manual for this word, following this exact structure and tone:

1.  **Core Game**: A single, concise sentence that captures the essence of the "situation" or "language-game" where this word is played.
    Example for "Ephemeral": "The core game is capturing and lamenting the beauty of things that are fleeting."

2.  **Game Boards**: Two distinct contexts ("boards") where the word is used.
    -   **Board A (The Speculative Arena)**: Show its use in an abstract, formal, or philosophical context.
    -   **Board B (The Everyday Arena)**: Show its use in a concrete, informal, or daily-life context.

3.  **Game Origin & Teardown**:
    -   **Card Teardown**: Break the word down into its etymological parts (prefix-root-suffix) and state their core meanings.
    -   **Assembly Story**: Briefly narrate how these parts came together to form the word's current "rules of play."

4.  **Foul Warning**: A common misuse or confusion (e.g., with a similar-sounding word) and a one-sentence tip on how to avoid it.

5.  **Mastery Tip**: A clever and memorable mnemonic or analogy to lock in the word's primary use-case.
`;

const bilingualStringSchema = {
    type: Type.OBJECT,
    properties: {
        en: { type: Type.STRING, description: "The English text." },
        zh: { type: Type.STRING, description: "The Simplified Chinese translation." },
    },
    required: ['en', 'zh'],
};

const schema = {
  type: Type.OBJECT,
  properties: {
    targetWord: bilingualStringSchema,
    coreGame: {
      type: Type.OBJECT,
      properties: {
        title: bilingualStringSchema,
        description: bilingualStringSchema,
      },
      required: ['title', 'description'],
    },
    gameBoards: {
      type: Type.OBJECT,
      properties: {
        title: bilingualStringSchema,
        boardA: {
          type: Type.OBJECT,
          properties: {
            name: bilingualStringSchema,
            usage: bilingualStringSchema,
          },
          required: ['name', 'usage'],
        },
        boardB: {
          type: Type.OBJECT,
          properties: {
            name: bilingualStringSchema,
            usage: bilingualStringSchema,
          },
          required: ['name', 'usage'],
        },
      },
      required: ['title', 'boardA', 'boardB'],
    },
    originAndTeardown: {
      type: Type.OBJECT,
      properties: {
        title: bilingualStringSchema,
        teardown: bilingualStringSchema,
        story: bilingualStringSchema,
      },
      required: ['title', 'teardown', 'story'],
    },
    foulWarning: {
      type: Type.OBJECT,
      properties: {
        title: bilingualStringSchema,
        description: bilingualStringSchema,
      },
      required: ['title', 'description'],
    },
    masteryTip: {
      type: Type.OBJECT,
      properties: {
        title: bilingualStringSchema,
        description: bilingualStringSchema,
      },
      required: ['title', 'description'],
    },
  },
  required: ['targetWord', 'coreGame', 'gameBoards', 'originAndTeardown', 'foulWarning', 'masteryTip'],
};


export const generateGameManual = async (word: string): Promise<GameManual> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptTemplate(word),
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const manualData: GameManual = JSON.parse(jsonText);
    return manualData;
  } catch (error) {
    console.error("Error generating game manual:", error);
    throw new Error("Failed to generate the game manual. The model may be unavailable or the input might be invalid.");
  }
};
