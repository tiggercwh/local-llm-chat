import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// TODO: Error handling
export async function POST(req: Request) {
  const { messages } = await req.json();

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

  const userMessages = messages.map((message) => message.content).join("\n");

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Please analyze this code for bugs and suggest improvements: ${userMessages}`;

  const result = await model.generateContentStream(prompt);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        console.log("text", text);
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });

  // const response = await fetch("https://api.openai.com/v1/chat/completions", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     model: "gpt-4o-mini",
  //     messages: [
  //       {
  //         role: "system",
  //         content:
  //           "You are an AI that analyzes code and returns structured feedback including errors, improvements, and best practices.",
  //       },
  //       ...userMessages,
  //     ],
  //     tool_choice: "required",
  //     tools: [
  //       {
  //         name: "analyze_code",
  //         description:
  //           "Analyzes a code snippet and returns structured feedback.",
  //         parameters: {
  //           type: "object",
  //           properties: {
  //             issues: {
  //               type: "array",
  //               items: { type: "string" },
  //               description: "List of identified issues in the code.",
  //             },
  //             best_practices: {
  //               type: "array",
  //               items: { type: "string" },
  //               description: "Recommended best practices for improvement.",
  //             },
  //             complexity: {
  //               type: "string",
  //               enum: ["low", "medium", "high"],
  //               description: "Complexity level of the code.",
  //             },
  //           },
  //           required: ["issues", "best_practices", "complexity"],
  //         },
  //         type: "function",
  //       },
  //     ],
  //     stream: true,
  //   }),
  // });

  // return new Response(response.body, {
  //   headers: { "Content-Type": "text/event-stream" },
  // });
}
