
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const sleep = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return Response.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    let response;

    // Automatically retry temporary server errors
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: message
        });

        break;

      } catch (error) {
        const temporary =
          error.status === 503 ||
          error.status === 429 ||
          error.status === 500 ||
          String(error.message).includes("503");

        if (!temporary || attempt === 4) {
          throw error;
        }

        console.log(`Retry attempt ${attempt}`);

        await sleep(1000 * Math.pow(2, attempt - 1));
      }
    }

    return Response.json({
      reply: response.text || "No response received."
    });

  } catch (error) {
    console.error("CHATBOT ERROR:", error);

    return Response.json(
      {
        error: error.message || "Gemini service temporarily unavailable."
      },
      { status: 503 }
    );
  }
}
