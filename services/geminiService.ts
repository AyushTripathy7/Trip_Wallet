
import { GoogleGenAI, Type } from "@google/genai";
import { Trip, ExpenseCategory } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper function to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const scanReceipt = async (file: File): Promise<{ title: string, amount: number, date: string }> => {
    const imagePart = await fileToGenerativePart(file);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                imagePart,
                { text: 'Analyze this receipt and extract the store name or main purchase item as "title", the total amount as "amount", and the date as "date". Provide the date in YYYY-MM-DD format.' },
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" }
                },
                required: ["title", "amount", "date"]
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


export const getAIResponse = async (prompt: string, tripData: Trip): Promise<string> => {
    const systemInstruction = `You are a helpful travel assistant integrated into a trip management app.
    Your goal is to provide concise, relevant, and useful information to the user based on their trip data.
    Current trip context:
    - Trip Name: ${tripData.name}
    - Members: ${tripData.members.map(m => m.name).join(', ')}
    - Luggage items packed: ${tripData.luggage.length}
    - Expenses recorded: ${tripData.expenses.length}
    - Total money collected: ${tripData.contributions.reduce((s, c) => s + c.amount, 0)}
    - Total money spent: ${tripData.expenses.reduce((s, e) => s + e.amount, 0)}
    
    When asked to suggest an expense category, choose from: ${Object.values(ExpenseCategory).join(', ')}.
    Be friendly and helpful.
    `;
    
    const model = (prompt.toLowerCase().includes('budget') || prompt.toLowerCase().includes('estimate')) ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const config = model === 'gemini-2.5-pro' ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            ...config,
            systemInstruction,
        }
    });

    return response.text;
};
