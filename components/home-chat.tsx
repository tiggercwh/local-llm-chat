"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/lib/types";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChat } from "@/contexts/ChatContext";
import { v4 as uuidv4 } from "uuid";
import { ModelSelector } from "./model-selector";
import { useModelContext } from "@/contexts/ModelContext";

export function HomeChat() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const { addChatHistory } = useChat();
  const { isLocalLLM, setIsLocalLLM } = useModelContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (prompt: string) => {
    const userMessage: Message = {
      role: "user",
      content: prompt.trim(),
    };
    setInput("");

    // Store the initial message in localStorage
    localStorage.setItem("initialMessage", JSON.stringify(userMessage));
    const chatId = uuidv4();
    addChatHistory({
      id: chatId,
      title: "New Chat",
      createdAt: Date.now(),
    });

    // Redirect to new chat page
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
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
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(input.trim());
          }}
          className="flex flex-col space-y-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your code here and ask for a review..."
            className="min-h-[120px] resize-y font-mono"
          />
          <div className="flex justify-end space-x-2">
            <ModelSelector
              isLocalModel={isLocalLLM}
              onTypeChange={setIsLocalLLM}
            />
            <Button type="submit" disabled={!input.trim()}>
              Review
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
