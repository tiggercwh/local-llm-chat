import { useEffect, useRef, useState } from "react";
import * as webllm from "@mlc-ai/web-llm";
import { Message } from "@/lib/types";

export function useLocalLLM() {
  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize WebLLM on mount
  useEffect(() => {
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
    initWebLLM();
  }, []);

  // Function to generate response using local LLM
  const generateResponse = async (
    messages: Message[],
    onUpdate: (msg: string) => void,
    onFinish: (msg: string) => void
  ) => {
    setIsLoading(true);
    let curMessage = "";

    try {
      const completion = await engineRef?.current?.chat.completions.create({
        stream: true,
        messages,
        temperature: 0.7,
        top_p: 0.95,
        logit_bias: { "14444": -100 },
        repetition_penalty: 1.2,
        frequency_penalty: 0.5,
      });

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
