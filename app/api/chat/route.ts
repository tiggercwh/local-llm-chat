import { NextResponse } from "next/server";
import { ChatResponse } from "@/lib/types";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { messages, isLocalModel } = await req.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages must be an array" },
        { status: 400 }
      );
    }

    // Validate each message has the required fields
    for (const message of messages) {
      if (!message.role || !message.content) {
        return NextResponse.json(
          { error: "Each message must have a role and content" },
          { status: 400 }
        );
      }
    }

    // System message for code review
    const systemPrompt = `You are a helpful code review assistant. Your task is to review code and provide constructive feedback.
    Focus on:
    1. Code quality and best practices
    2. Potential bugs or issues
    3. Performance considerations
    4. Security concerns
    5. Suggestions for improvement
    
    Be specific and provide examples when possible.`;

    let response: ChatResponse;

    if (isLocalModel) {
      // Handle local model inference
      // This is a placeholder - you would need to implement actual local model inference
      response = {
        content:
          "This is a placeholder response. Local model integration coming soon.",
      };
    } else {
      // Use OpenAI for code review
      const result = await generateText({
        model: openai("gpt-4"),
        system: systemPrompt,
        messages: messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        temperature: 0.7,
      });

      response = {
        content: result.text,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
