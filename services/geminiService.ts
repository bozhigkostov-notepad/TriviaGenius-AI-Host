
import { GoogleGenAI, Type } from "@google/genai";
import { HostPersonality, TriviaQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateQuestions(category: string, count: number = 5): Promise<TriviaQuestion[]> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate ${count} unique and challenging trivia questions about ${category}. Return them as a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              category: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswer", "category", "difficulty", "explanation"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Failed to parse trivia questions", e);
      return [];
    }
  },

  async getHostCommentary(
    personality: HostPersonality, 
    context: string, 
    score: number, 
    streak: number
  ): Promise<{ message: string; expression: string }> {
    const prompt = `
      You are a trivia game host with the personality: ${personality}.
      Current Player Stats: Score ${score}, Streak ${streak}.
      Context: ${context}
      
      Respond to the player's recent action (correct/incorrect/start/end). 
      Keep it short (1-2 sentences). 
      Return a JSON object with 'message' and 'expression' (one of: idle, happy, thinking, shocked, roast).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            expression: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text);
  },

  async speakMessage(message: string): Promise<Uint8Array | null> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: message }] }],
        config: {
          responseModalities: ["AUDIO" as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return this.decodeBase64(base64Audio);
      }
      return null;
    } catch (error) {
      console.error("TTS failed", error);
      return null;
    }
  },

  decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
};
