"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/lib/types";
import { Send } from "lucide-react";
import { useModelContext } from "@/contexts/ModelContext";
import { ModelSelector } from "./model-selector";
import { useLLM } from "@/hooks/useLLM";

interface ChatProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}

export function Chat({ setMessages, messages }: ChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLocalLLM, setIsLocalLLM } = useModelContext();

  const { generateResponse, isLoading, streamingContent } = useLLM({
    isLocalLLM,
    onUpdateMessages: setMessages,
  });

  // Handle initial prompt on mount
  useEffect(() => {
    const initialMessage = localStorage.getItem("initialMessage");
    if (initialMessage) {
      const message = JSON.parse(initialMessage);
      generateResponse(message.content, messages);
      localStorage.removeItem("initialMessage");
    }
  }, [generateResponse, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
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
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex mb-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`whitespace-pre-wrap rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white max-w-[80%]"
                      : "bg-gray-200 dark:bg-gray-800 w-full"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {streamingContent && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 whitespace-pre-wrap">
                  {streamingContent}
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim() || isLoading) return;
            generateResponse(input.trim(), messages);
            setInput("");
          }}
          className="flex flex-col space-y-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your code here and ask for a review..."
            className="min-h-[120px] resize-y font-mono"
            disabled={isLoading}
          />
          <div className="flex justify-end space-x-2">
            <ModelSelector
              isLocalModel={isLocalLLM}
              onTypeChange={setIsLocalLLM}
            />
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
