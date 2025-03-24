import { useRef, useState } from "react";
import * as webllm from "@mlc-ai/web-llm";
import { Message } from "@/lib/types";

export function useLocalLLM() {
  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
  const generateResponse = async (
    messages: Message[],
    onUpdate: (msg: string) => void,
    onFinish: (msg: string) => void
  ) => {
    setIsLoading(true);
    if (!engineRef.current) {
      await initWebLLM();
    }
    let curMessage = "";

    try {
      const completion = await engineRef?.current?.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a code assistant. You only return modified code snippets, not explanations. When given code, your job is to return an updated version based on the request.",
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
        const curDelta = chunk.choices[0]?.delta.content;
        if (curDelta) {
          curMessage += curDelta;
          onUpdate(curMessage);
        }
      }
      onFinish(curMessage);
    } catch (error) {
      console.error("Error generating response:", error);
      onFinish("Error: Failed to generate response.");
    } finally {
      setIsLoading(false);
    }
  };

  return { generateResponse, isLoading };
}
