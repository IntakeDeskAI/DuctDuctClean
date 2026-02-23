"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ArrowRight } from "lucide-react";
import Link from "next/link";
import ChatMessage from "./ChatMessage";
import { streamFetch } from "@/lib/ai/stream-client";
import { trackChatOpen, trackChatMessage } from "@/lib/analytics";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi there! I'm DuctDuctClean's virtual assistant. I can help with questions about our services, pricing, scheduling, and more. How can I help you today?",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);
    trackChatMessage();

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const chatMessages = updatedMessages
        .filter((m) => m !== WELCOME_MESSAGE)
        .map((m) => ({ role: m.role, content: m.content }));

      await streamFetch(
        "/api/chat",
        { messages: chatMessages },
        (chunk) => {
          assistantMessage.content += chunk;
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { ...assistantMessage },
          ]);
        }
      );
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble right now. Please call us at (208) 555-DUCT or visit our contact page.",
        },
      ]);
    }

    setIsStreaming(false);
  }

  return (
    <>
      {/* Floating bubble */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            trackChatOpen();
          }}
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition-all hover:scale-105 flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: "min(520px, calc(100vh - 6rem))" }}
        >
          {/* Header */}
          <div className="bg-brand-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  DuctDuctClean
                </p>
                <p className="text-xs text-white/70">Ask us anything</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                role={msg.role}
                content={msg.content}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* CTA */}
          <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0">
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
            >
              Get a Free Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={isStreaming}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="rounded-lg bg-brand-600 px-3 py-2 text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
