import { useRef, useState } from "react";
import * as webllm from "@mlc-ai/web-llm";
import { Message } from "@/lib/types";

interface UseLLMProps {
  isLocalLLM: boolean;
  onUpdateMessages: (messages: Message[]) => void;
}

export function useLLM({ isLocalLLM, onUpdateMessages }: UseLLMProps) {
  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const abortGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsModelLoading(false);
      setIsStreaming(false);
    }
  };

  // Initialize WebLLM
  async function initWebLLM() {
    try {
      console.log("Initializing WebLLM...");
      engineRef.current = await webllm.CreateMLCEngine("TinySwallow-1.5B", {
        appConfig: {
          model_list: [
            {
              model:
                "https://huggingface.co/SakanaAI/TinySwallow-1.5B-Instruct-q4f32_1-MLC",
              model_id: "TinySwallow-1.5B",
              model_lib:
                webllm.modelLibURLPrefix +
                webllm.modelVersion +
                "/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
            },
          ],
        },
      });
      console.log("WebLLM model loaded successfully!");
    } catch (error) {
      console.error("Error initializing WebLLM:", error);
    }
  }

  // Function to generate response using local LLM
  const generateLocalResponse = async (messages: Message[]) => {
    if (!engineRef.current) {
      await initWebLLM();
    }
    let curMessage = "";
    let hasStartedStreaming = false;
    abortControllerRef.current = new AbortController();

    try {
      const completion = await engineRef?.current?.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a code reviewer. Please analyze this code for bugs and suggest improvements:",
          },
          ...messages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        ],
        temperature: 0.7,
        top_p: 0.95,
        stream: true,
      });

      if (!completion) {
        throw new Error("Failed to create completion");
      }

      for await (const chunk of completion) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Generation aborted");
        }

        const curDelta = chunk.choices[0]?.delta.content;
        if (curDelta) {
          if (!hasStartedStreaming) {
            setIsStreaming(true);
            hasStartedStreaming = true;
          }
          curMessage += curDelta;
          setStreamingContent(curMessage);
        }
      }
      return curMessage;
    } catch (error) {
      if (error instanceof Error && error.message === "Generation aborted") {
        console.log("Generation was aborted");
        return `${curMessage}\n\nGeneration was aborted`;
      }
      console.error("Error generating response:", error);
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Function to generate response using API
  const generateAPIResponse = async (messages: Message[]) => {
    abortControllerRef.current = new AbortController();
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: abortControllerRef.current.signal,
    });

    if (!response.ok) throw new Error("Failed to fetch response");

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const decoder = new TextDecoder();
    let accumulatedContent = "";

    try {
      setIsStreaming(true);
      while (true) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Generation aborted");
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedContent += chunk;
        setStreamingContent(accumulatedContent);
      }

      return accumulatedContent;
    } catch (error) {
      if (error instanceof Error && error.message === "Generation aborted") {
        console.log("Generation was aborted");
        return accumulatedContent;
      }
      throw error;
    } finally {
      reader.releaseLock();
      abortControllerRef.current = null;
    }
  };

  const generateResponse = async (prompt: string, messages: Message[]) => {
    if (!prompt.trim() || isStreaming) return;

    const userMessage: Message = {
      role: "user",
      content: prompt.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    onUpdateMessages(updatedMessages);

    setIsModelLoading(true);
    setStreamingContent("");

    try {
      const finalContent = await (isLocalLLM
        ? generateLocalResponse(updatedMessages)
        : generateAPIResponse(updatedMessages));

      const assistantMessage: Message = {
        role: "assistant",
        content: finalContent,
      };

      onUpdateMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsModelLoading(false);
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  return {
    generateResponse,
    abortGeneration,
    isModelLoading,
    isStreaming,
    streamingContent,
  };
}
