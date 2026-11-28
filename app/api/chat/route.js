
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// System prompt
const SYSTEM_PROMPT = `
You are a helpful general-purpose AI assistant.

Your responsibilities:
1. Answer questions from different topics.
2. Give clear, accurate and useful information.
3. Explain difficult topics using simple language.
4. Be friendly, polite and respectful.
5. Use Markdown formatting for better readability.
6. Use headings, bullet points and numbered lists when useful.
7. If you do not know an answer, say so honestly.
8. Remember previous messages in the current conversation.
`;

// Handle chatbot requests
export async function POST(request) {
  try {
    const { messages } = await request.json();

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    // Convert messages into Gemini format
    const contents = messages
      .filter(
        (item) =>
          ["user", "model"].includes(item.role) &&
          typeof item.content === "string" &&
          item.content.trim()
      )
      .slice(-20)
      .map((item) => ({
        role: item.role,
        parts: [{ text: item.content }]
      }));

    // Validate the latest message
    if (
      contents.length === 0 ||
      contents[contents.length - 1].role !== "user"
    ) {
      return Response.json(
        { error: "Please enter a valid message." },
        { status: 400 }
      );
    }

    // Generate AI response using Gemini
    const response = await ai.models.generateContent({
      model:  "gemini-3.5-flash-lite",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7
      }
    });

    // Return Gemini response
    return Response.json({
      reply: response.text || "No response received."
    });

  } catch (error) {
    console.error("CHATBOT ERROR:", error);

    const status = error.status || error.statusCode;
    const errorMessage = String(error.message || "").toLowerCase();

    // API quota limit
    if (
      status === 429 ||
      errorMessage.includes("quota") ||
      errorMessage.includes("rate limit")
    ) {
      return Response.json(
        {
          error: "Gemini API usage limit reached. Please try again later."
        },
        { status: 429 }
      );
    }

    // Gemini server temporarily unavailable
    if (status === 503 || status === 502 || status === 504) {
      return Response.json(
        {
          error: "Gemini is currently busy. Please try again in a few moments."
        },
        { status: 503 }
      );
    }

    // Network connection error
    if (
      errorMessage.includes("fetch failed") ||
      errorMessage.includes("econnreset")
    ) {
      return Response.json(
        {
          error: "Unable to connect to Gemini. Please check your internet connection and try again."
        },
        { status: 503 }
      );
    }

    // Other errors
    return Response.json(
      {
        error: "Something went wrong. Please try again later."
      },
      { status: 500 }
    );
  }
}
