
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const generateLoveContent = async (recipient: string, sender: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Write a beautiful, romantic, and slightly poetic Valentine's Day proposal message for ${recipient} from ${sender}. 
  The message should be heartfelt and sincere. Include a short 4-line poem. 
  Format the response as a JSON object with two fields: 'poem' (the 4-line poem) and 'message' (a longer romantic letter).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            poem: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["poem", "message"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return {
      poem: "Roses are red, violets are blue,\nLife is just better when I'm with you.",
      message: `My dearest ${recipient}, words can't describe how much you mean to me. Will you be mine forever? Love, ${sender}.`
    };
  }
};
