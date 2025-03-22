"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/lib/types";
import { Send } from "lucide-react";
import { useLocalLLM } from "@/hooks/useLocalLLM";
import { useRouter } from "next/navigation";

interface ChatProps {
  messages: Message[];
  onUpdateMessages: (messages: Message[]) => void;
  isLocalModel: boolean;
  chatId?: string;
  initialPrompt?: string | null;
}

export function Chat({
  messages,
  isLocalModel,
  chatId,
  initialPrompt,
}: ChatProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { generateResponse, isLoading: isLocalLoading } = useLocalLLM();
  const isLoading = isLocalModel ? isLocalLoading : isStreaming;

  const handleSubmit = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isStreaming) return;

      const userMessage: Message = {
        role: "user",
        content: prompt.trim(),
      };

      const updatedMessages = [...messages, userMessage];
      onUpdateMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);
      setStreamingContent("");

      try {
        if (isLocalModel) {
          generateResponse(
            updatedMessages,
            (chunk) => {
              setStreamingContent(chunk);
            },
            (finalContent) => {
              const assistantMessage: Message = {
                role: "assistant",
                content: finalContent,
              };
              onUpdateMessages([...updatedMessages, assistantMessage]);
              setStreamingContent("");
              if (!chatId) {
                router.push(`/chat/${Date.now()}`);
              }
            }
          );
        } else {
          const response = await fetch("/api/mock-stream", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: updatedMessages,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch response");
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("No reader available");
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  const assistantMessage: Message = {
                    role: "assistant",
                    content: streamingContent,
                  };
                  onUpdateMessages([...updatedMessages, assistantMessage]);
                  setIsStreaming(false);
                  setStreamingContent("");
                  if (!chatId) {
                    router.push(`/chat/${Date.now()}`);
                  }
                } else {
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices?.[0]?.delta?.content) {
                      setStreamingContent(
                        (prev) => prev + parsed.choices[0].delta.content
                      );
                    }
                  } catch (e) {
                    console.error("Error parsing chunk:", e);
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [isLocalModel, chatId, router, onUpdateMessages]
  );
  // Handle initial prompt on mount
  useEffect(() => {
    if (messages.length === 1) {
      handleSubmit(messages[0].content);
    }
  }, [handleSubmit, messages]);

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
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-800"
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
            handleSubmit(input.trim());
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
