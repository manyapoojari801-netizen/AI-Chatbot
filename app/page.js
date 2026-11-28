
"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    const updatedChat = [
      ...chat,
      { sender: "You", text: userMessage }
    ];

    setChat(updatedChat);
    setMessage("");
    setLoading(true);

    try {
      const messages = updatedChat.map(item => ({
        role: item.sender === "You" ? "user" : "model",
        content: item.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setChat(prev => [
        ...prev,
        { sender: "Bot", text: data.reply }
      ]);

    } catch (error) {
      setChat(prev => [
        ...prev,
        {
          sender: "Bot",
          text: error.message || "Please try again later."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-200">

        <header className="bg-indigo-600 text-white p-5 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            🤖
          </div>

          <div>
            <h1 className="text-xl font-bold">My First AI Chatbot</h1>
            <p className="text-sm text-indigo-100">
              Powered by Google Gemini
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Online
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 chat-scroll bg-slate-50">

          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-slate-800">
                Hello! How can I help you?
              </h2>
              <p className="text-slate-500 mt-2">
                Ask me anything. I am here to help!
              </p>
            </div>
          )}

          {chat.map((item, index) => (
            <div
              key={index}
              className={`flex ${
                item.sender === "You" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-sm ${
                  item.sender === "You"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                }`}
              >
                <p className="text-xs font-semibold mb-2 opacity-70">
                  {item.sender === "You" ? "You" : "AI Assistant"}
                </p>

                {item.sender === "Bot" ? (
                  <div className="text-sm sm:text-base leading-7 break-words prose prose-slate max-w-none">
                    <ReactMarkdown>{item.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-7">
                    {item.text}
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex gap-2 items-center shadow-sm">
                <span className="text-sm text-slate-500">
                  AI is typing
                </span>
                <div className="flex gap-1">
                  <span className="typing-dot w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span className="typing-dot w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span className="typing-dot w-2 h-2 bg-indigo-500 rounded-full"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </section>

        <footer className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Type your message here..."
              value={message}
              disabled={loading}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              className="flex-1 min-w-0 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100"
            />

            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send ➤
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-3">
            Powered by Google Gemini AI
          </p>
        </footer>

      </div>
    </main>
  );
}
