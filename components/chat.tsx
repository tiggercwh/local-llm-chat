"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/lib/types";
import { Send } from "lucide-react";
import { useLocalLLM } from "@/hooks/useLocalLLM";

interface ChatProps {
  messages: Message[];
  onUpdateMessages: (messages: Message[]) => void;
  isLocalModel: boolean;
}

export function Chat({ messages, onUpdateMessages, isLocalModel }: ChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { generateResponse, isLoading } = useLocalLLM(); // Use local LLM hook

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    onUpdateMessages(updatedMessages);
    setInput("");

    if (isLocalModel) {
      // Use Local LLM
      generateResponse(
        updatedMessages,
        (updatedContent) => {
          // Streaming updates
          const assistantMessage: Message = {
            role: "assistant",
            content: updatedContent,
          };
          onUpdateMessages([...updatedMessages, assistantMessage]);
        },
        (finalMessage) => {
          // Final completion
          const assistantMessage: Message = {
            role: "assistant",
            content: finalMessage,
          };
          onUpdateMessages([...updatedMessages, assistantMessage]);
        }
      );
    } else {
      // Call OpenAI API
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        });

        if (!response.ok) throw new Error("Failed to send message");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;

        let result = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          result += chunk;
        }

        const assistantMessage: Message = {
          role: "assistant",
          content: result,
        };
        onUpdateMessages([...updatedMessages, assistantMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: Message = {
          role: "assistant",
          content: "Sorry, there was an error.",
        };
        onUpdateMessages([...updatedMessages, errorMessage]);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                Welcome to Code Review Assistant
              </h2>
              <p className="max-w-md">
                Paste your code and ask for a review. The assistant will analyze
                your code and provide feedback.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your code here and ask for a review..."
            className="min-h-[120px] resize-y font-mono"
            disabled={isLoading}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? "Processing..." : "Send"}
              {!isLoading && <Send className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
