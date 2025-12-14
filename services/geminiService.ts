import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "../types";

// NOTE: in a real production app, you might proxy this through a backend to keep the key secret.
// For this demo, we assume the environment variable is available or the user is prompted (simulated).
const API_KEY = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

interface ParsedItem {
  name: string;
  category: Category;
  quantity: number;
  expiryDateOffsetDays: number; // Suggested days until expiry
}

export const parseFoodItemsFromText = async (text: string): Promise<ParsedItem[]> => {
  if (!ai) {
    console.warn("AI not initialized, missing API key");
    return [];
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Extract food items from the following text: "${text}".
      For each item, determine the best fitting category from this list: [Dairy, Vegetables, Fruits, Meat, Pantry, Beverages, Snacks, Other].
      Also estimate a conservative number of days until it expires based on general food safety knowledge (e.g., Milk ~7 days, Canned beans ~365 days).
      If quantity is not specified, assume 1.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING, enum: Object.values(Category) },
              quantity: { type: Type.NUMBER },
              expiryDateOffsetDays: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as ParsedItem[];
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
