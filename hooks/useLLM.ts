import { useRef, useState, useEffect, useCallback } from "react";
import * as webllm from "@mlc-ai/web-llm";
import { Message } from "@/lib/types";

interface UseLLMProps {
  isLocalLLM: boolean;
  onUpdateMessages: (messages: Message[]) => void;
}

interface LLMState {
  isModelLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  loadingState: string;
}

const initialState: LLMState = {
  isModelLoading: false,
  isStreaming: false,
  streamingContent: "",
  error: null,
  loadingState: "",
};

export function useLLM({ isLocalLLM, onUpdateMessages }: UseLLMProps) {
  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const [llmState, setLLMState] = useState<LLMState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abortGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLLMState((prevState) => ({
        ...prevState,
        isModelLoading: false,
        isStreaming: false,
        streamingContent: "Generation aborted.",
        loadingState: "",
      }));
    }
  }, []);

  // Initialize WebLLM
  const initWebLLM = useCallback(async () => {
    try {
      console.log("Initializing WebLLM...");
      engineRef.current = await webllm.CreateMLCEngine("TinySwallow-1.5B", {
        //Consider modelConfig
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
        initProgressCallback: (initProgress) => {
          console.log(initProgress);
          setLLMState((prevState) => ({
            ...prevState,
            loadingState: initProgress.text,
          }));
        },
      });
      console.log("WebLLM model loaded successfully!");
    } catch (error) {
      console.error("Error initializing WebLLM:", error);
      setLLMState((prevState) => ({
        ...prevState,
        error: "Failed to initialize WebLLM",
      }));
    }
  }, []);

  const handleGenerationError = useCallback((error: Error) => {
    console.error("Error generating response:", error);
    if (error instanceof Error && error.message === "Generation aborted") {
      console.log("Generation was aborted");
    }
    setLLMState((prevState) => ({ ...prevState, error: "Generation failed." }));
    //Centralized error reporting or UI update can be done here.
  }, []);

  // Function to generate response using local LLM
  const generateLocalResponse = useCallback(
    async (messages: Message[]) => {
      if (!engineRef.current) {
        await initWebLLM();
      }

      if (!engineRef.current || !engineRef.current.chat?.completions) {
        handleGenerationError(
          new Error("LLM Engine not initialized correctly")
        );
        return "";
      }

      let curMessage = "";
      let hasStartedStreaming = false;
      abortControllerRef.current = new AbortController();

      try {
        const completion = await engineRef.current.chat.completions.create({
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
              setLLMState((prevState) => ({ ...prevState, isStreaming: true }));
              hasStartedStreaming = true;
            }
            curMessage += curDelta;
            setLLMState((prevState) => ({
              ...prevState,
              streamingContent: curMessage,
            }));
          }
        }
        return curMessage;
      } catch (error) {
        handleGenerationError(error as Error);
        return curMessage; //Or handle partial message return if needed.
      } finally {
        abortControllerRef.current = null;
      }
    },
    [initWebLLM, handleGenerationError]
  );

  // Function to generate response using API
  const generateAPIResponse = useCallback(
    async (messages: Message[]) => {
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
        setLLMState((prevState) => ({ ...prevState, isStreaming: true }));
        while (true) {
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error("Generation aborted");
          }

          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          accumulatedContent += chunk;
          setLLMState((prevState) => ({
            ...prevState,
            streamingContent: accumulatedContent,
          }));
        }

        return accumulatedContent;
      } catch (error) {
        handleGenerationError(error as Error);
        return accumulatedContent; //Or handle partial message return if needed
      } finally {
        reader.releaseLock();
        abortControllerRef.current = null;
      }
    },
    [handleGenerationError]
  );

  const generateResponse = useCallback(
    async (prompt: string, messages: Message[]) => {
      if (!prompt.trim() || llmState.isStreaming) return;

      const userMessage: Message = {
        role: "user",
        content: prompt.trim(),
      };

      const updatedMessages = [...messages, userMessage];
      onUpdateMessages(updatedMessages);

      setLLMState((prevState) => ({
        ...prevState,
        isModelLoading: true,
        streamingContent: "",
      }));

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
        console.error("Error:", error); //already handled in generate functions, this might be redundant.
      } finally {
        setLLMState((prevState) => ({
          ...prevState,
          isModelLoading: false,
          isStreaming: false,
          streamingContent: "",
          loadingState: "",
        }));
      }
    },
    [
      isLocalLLM,
      generateLocalResponse,
      generateAPIResponse,
      onUpdateMessages,
      llmState.isStreaming,
    ]
  );

  useEffect(() => {
    return () => {
      abortGeneration(); // Cleanup on unmount.
    };
  }, [abortGeneration]);

  return {
    generateResponse,
    abortGeneration,
    isModelLoading: llmState.isModelLoading,
    isStreaming: llmState.isStreaming,
    streamingContent: llmState.streamingContent,
    error: llmState.error,
    loadingState: llmState.loadingState,
  };
}
