import React, { useState, useEffect, useRef } from "react";
import { SendHorizonal, Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const GEMINI_API_KEY = ""; // 🔐 Replace with your API key

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi, I'm FinBot powered by Gemini! How can I assist with your finances today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Simulated user data to pass for context/RAG
  const userContext = {
    name: "Kuldeep",
    budgetPerMonth: 2000,
    accounts: [
      {
        id: "acct-001",
        balance: 1200,
        transactions: [
          { category: "FOOD", amount: 150, date: "2024-08-01" },
          { category: "SHOPPING", amount: 220, date: "2024-08-02" },
          { category: "TRANSPORT", amount: 90, date: "2024-08-03" },
        ],
      },
    ],
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContext = () => {
    const txs = userContext.accounts[0]?.transactions
      .map((t) => `${t.category}: ₹${t.amount} on ${t.date}`)
      .join(", ");

    return `

User name: ${userContext.name}
Monthly Budget: ₹${userContext.budgetPerMonth}
Account Balance: ₹${userContext.accounts[0]?.balance}
Recent Transactions: ${txs}
`.trim();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${buildContext()}\n\nUser asked: ${input}`,
                },
              ],
            },
          ],
        }
      );

      const botReply =
        res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ No response from Gemini.";

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error("Gemini Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❗ Failed to get a response from Gemini. Please check your API key or network.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#111827] text-white">
      <header className="p-6 text-center border-b border-gray-700">
        <h1 className="text-4xl font-bold text-indigo-400">💬 FinBot</h1>
        <p className="text-sm text-gray-400">
          Your financial assistant powered by Gemini
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="max-w-[70%] flex items-end gap-2">
              {msg.sender === "bot" && (
                <Bot className="text-green-400 w-5 h-5 mb-1" />
              )}
              <div
                className={`rounded-2xl px-4 py-3 text-sm shadow-md ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-700 text-white rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && (
                <User className="text-indigo-400 w-5 h-5 mb-1" />
              )}
            </div>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-4 border-t border-gray-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
            placeholder="Ask me anything about your finances..."
            className="flex-1 px-5 py-3 rounded-full bg-[#1e293b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 p-3 rounded-full text-white disabled:opacity-50"
          >
            <SendHorizonal size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatBot;
