import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const dummyChunks = [
    "Analyzing your code...\n",
    "Line 1 looks good.\n",
    "Line 2 could use some error handling.\n",
    "Consider renaming function `foo` to something more descriptive.\n",
    "Review complete ✅",
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of dummyChunks) {
        controller.enqueue(encoder.encode(chunk));
        console.log("chunk", chunk);
        await new Promise((r) => setTimeout(r, 500)); // Simulate delay
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
}
