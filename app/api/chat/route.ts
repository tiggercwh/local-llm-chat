import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { messages, isLocalModel } = await req.json()

    // System message for code review
    const systemMessage = `
      You are a code review assistant. Your primary role is to review code and provide constructive feedback.
      Focus on:
      1. Code quality and best practices
      2. Potential bugs or edge cases
      3. Performance improvements
      4. Security concerns
      5. Readability and maintainability
      
      Format your responses using Markdown. Use code blocks with appropriate syntax highlighting.
      Be specific in your feedback and provide examples of how to improve the code when possible.
    `

    let response

    if (isLocalModel) {
      // Handle local model inference
      // This is a placeholder - you would need to implement actual local model inference
      response = {
        message: {
          role: "assistant",
          content: `[Local Model] This is a placeholder response for local model inference. In a real implementation, you would connect to a locally running model server.`,
        },
      }
    } else {
      // Use OpenAI API via AI SDK
      const result = await generateText({
        model: openai("gpt-4o"), // Default to gpt-4o for API model
        system: systemMessage,
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
      })

      response = {
        message: {
          role: "assistant",
          content: result.text,
        },
      }
    }

    return Response.json(response)
  } catch (error) {
    console.error("Error in chat API:", error)
    return Response.json({ error: "Failed to process request" }, { status: 500 })
  }
}

