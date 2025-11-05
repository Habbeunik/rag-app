"use client";

import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, Bot, User } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MessageFormatter } from "@/components/MessageFormatter";

interface ChatPageProps {
  documentId: string;
  files: File[];
  onStartOver: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage({
  documentId,
  files,
  onStartOver,
}: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hi! I'm ready to answer questions about **${files[0]?.name}**. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const getAnswer = async (query: string) => {
    const url = new URL("/api/process-pdf", window.location.origin);
    url.searchParams.set("q", query);
    if (documentId) {
      url.searchParams.set("documentIds", documentId);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Failed to get answer");
    }
    const data = await response.json();
    return {
      answer: data.answer || "I couldn't generate an answer. Please try again.",
      sources: data.sources || [],
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const { answer } = await getAnswer(currentInput);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting answer:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm sorry, I encountered an error while processing your question. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 dark:text-white truncate text-sm sm:text-base">
                {files[0]?.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <button
              onClick={onStartOver}
              className="
                flex items-center gap-2 px-4 py-2 rounded-xl
                bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700
                text-slate-700 dark:text-slate-300 font-medium text-sm
                transition-all duration-200 hover:scale-105 active:scale-95
              "
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">New Doc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <div
                className={`
                  max-w-[80%] sm:max-w-[70%] rounded-2xl px-5 py-4 shadow-sm
                  ${
                    message.role === "user"
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                  }
                `}
              >
                <MessageFormatter 
                  content={message.content} 
                  isUser={message.role === "user"}
                />
              </div>
              {message.role === "user" && (
                <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="max-w-[80%] sm:max-w-[70%] rounded-2xl px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <span className="text-[15px] text-slate-600 dark:text-slate-400">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question about the document..."
              className="
                flex-1 min-h-[56px] max-h-[200px] resize-none rounded-xl px-5 py-4
                bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
              disabled={isLoading}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="
                shrink-0 h-[56px] w-[56px] rounded-xl
                bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                text-white shadow-lg shadow-blue-500/30
                flex items-center justify-center
                transition-all duration-200 hover:scale-105 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                focus:outline-none focus:ring-4 focus:ring-blue-500/50
              "
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
            Press{" "}
            <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">
              Enter
            </kbd>{" "}
            to send •{" "}
            <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">
              Shift+Enter
            </kbd>{" "}
            for new line
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Built by{" "}
            <a
              href="https://abbeykumapayi.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Abbey Kumapayi
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
