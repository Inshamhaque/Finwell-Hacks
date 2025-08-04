import React, { useState, useEffect, useRef, useMemo } from "react";
import { SendHorizonal, Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BACKEND_URL } from "../config";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi, I'm FinBot! How can I assist with your finances today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useState({ name: "Loading..." });
  const [contextLoading, setContextLoading] = useState(true);
  const [contextError, setContextError] = useState(null);
  const chatEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const accountId = localStorage.getItem("selectedAccountId");
  const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!accountId || !token) {
      setContextError("Missing account or authentication token.");
      setContextLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchContext = async () => {
      setContextLoading(true);
      setContextError(null);
      try {
        const res = await axios.post(
          `${BACKEND_URL}/user/getAll`,
          { accountId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        const userData = res.data?.userData || {};
        const account = Array.isArray(res.data?.result)
          ? res.data.result[0]
          : null;

        if (!account) {
          setContextError("Selected account not found.");
          setContextLoading(false);
          return;
        }

        setUserContext({
          name: userData.name,
          budgetPerMonth: userData.budgetPerMonth,
          account,
          accounts: userData.accounts,
        });
      } catch (err) {
        console.error("Context fetch error:", err);
        setContextError("Failed to load account context.");
      } finally {
        setContextLoading(false);
      }
    };

    fetchContext();
    return () => controller.abort();
  }, [accountId, token]);

  const buildContext = useMemo(() => {
    const acct = userContext.account || {};
    const txs = (acct.transactions || [])
      .map((t) => `${t.category}: ₹${t.amount} on ${t.date}`)
      .join(", ");
    return `
User name: ${userContext.name || "N/A"}
Monthly Budget: ₹${userContext.budgetPerMonth || "N/A"}
Account Balance: ₹${acct.balance || "N/A"}
Recent Transactions: ${txs || "None"}
    `.trim();
  }, [userContext]);

  const sendMessage = async () => {
    if (!input.trim() || contextLoading) return;
    setLoading(true);
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    const question = input;
    setInput("");

    try {
      if (!OPENAI_KEY) throw new Error("Missing OpenAI key");

      const systemPrompt = `
You are FinBot, a helpful financial assistant.
Use the following user context to inform your answers:
${buildContext}
Answer concisely and give actionable suggestions.
      `.trim();

      const payload = {
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.65,
        max_tokens: 500,
      };

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("OpenAI API error:", errText);
        throw new Error("OpenAI error");
      }

      const data = await response.json();
      const botReply =
        data?.choices?.[0]?.message?.content || "⚠️ No response from OpenAI.";

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error("Chat send error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❗ Something went wrong while fetching the response.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f172a] rounded-2xl overflow-hidden max-h-[600px] flex flex-col w-full">
      <div
        className="w-full max-w-5xl flex flex-col rounded-2xl overflow-hidden h-full"
        style={{
          background: "#1f2e50",
          boxShadow: "0 30px 60px -10px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white/10">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FinBot</h1>
              <p className="text-xs text-indigo-100 mt-0.5">
                Personal finance assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {contextLoading && (
              <div className="inline-flex items-center gap-2 text-yellow-300">
                <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin" />
                Loading context
              </div>
            )}
            {contextError && (
              <div className="text-red-300 font-medium">{contextError}</div>
            )}
            {!contextLoading && !contextError && (
              <div className="flex items-center gap-2 text-white">
                <User className="w-4 h-4" />
                <span className="capitalize">{userContext.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#1b2746]">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] flex items-start gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  {msg.sender === "bot" ? (
                    <div className="p-2 rounded-full bg-green-400/10">
                      <Bot className="w-5 h-5 text-green-300" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-indigo-400/10">
                      <User className="w-5 h-5 text-indigo-300" />
                    </div>
                  )}
                </div>
                <div
                  className={`rounded-2xl px-5 py-3 text-sm leading-relaxed break-words ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-[#2f3d70] text-white rounded-bl-none"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {msg.sender === "bot" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, children, ...props }) {
                          return inline ? (
                            <code
                              className="bg-[#0f1f3f] px-1 py-[2px] rounded font-mono text-xs"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <pre
                              className="bg-[#0f1f3f] rounded p-3 overflow-x-auto text-xs"
                              {...props}
                            >
                              <code>{children}</code>
                            </pre>
                          );
                        },
                        a({ href, children, ...props }) {
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-300 underline break-words"
                              {...props}
                            >
                              {children}
                            </a>
                          );
                        },
                        strong({ children }) {
                          return (
                            <strong className="font-semibold">
                              {children}
                            </strong>
                          );
                        },
                        em({ children }) {
                          return <em className="italic">{children}</em>;
                        },
                        ul({ children }) {
                          return (
                            <ul className="list-disc pl-6 space-y-1 text-white">
                              {children}
                            </ul>
                          );
                        },
                        ol({ children }) {
                          return (
                            <ol className="list-decimal pl-6 space-y-1 text-white">
                              {children}
                            </ol>
                          );
                        },
                        li({ children }) {
                          return <li className="ml-1">{children}</li>;
                        },
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <div>{msg.text}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 bg-[#121f44] border-t border-[#2a3865]">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
              placeholder="Ask something like: How can I reduce my food spending?"
              className="flex-1 rounded-full bg-[#1f2e50] placeholder:text-gray-400 text-sm px-4 py-3 focus:outline-none text-white"
              disabled={loading || contextLoading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim() || contextLoading}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50"
              style={{ minWidth: 100 }}
            >
              <SendHorizonal size={16} />
              <span>{loading ? "Sending..." : "Send"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
