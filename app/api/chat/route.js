
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return Response.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: message
    });

    return Response.json({
      reply: response.text || "No response received."
    });

  } catch (error) {
    console.error("CHATBOT ERROR:", error);

    const status = error.status || error.statusCode;

    if (status === 429) {
      return Response.json(
        {
          error: "I've reached my current API usage limit. Please try again later."
        },
        { status: 429 }
      );
    }

    return Response.json(
      {
        error: "Sorry, something went wrong. Please try again later."
      },
      { status: 500 }
    );
  }
}
