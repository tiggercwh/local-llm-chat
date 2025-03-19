"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface MessageProps {
  message: {
    role: string
    content: string
  }
}

export function Message({ message }: MessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`mb-4 ${message.role === "user" ? "ml-auto max-w-3xl" : "mr-auto max-w-3xl"}`}>
      <div className="flex items-start gap-2">
        <div className={`p-1 rounded-full ${message.role === "user" ? "bg-blue-500" : "bg-green-500"}`}>
          <div className="w-8 h-8 flex items-center justify-center text-white font-semibold">
            {message.role === "user" ? "U" : "A"}
          </div>
        </div>

        <Card
          className={`p-4 ${message.role === "user" ? "bg-blue-50 dark:bg-blue-950" : "bg-white dark:bg-gray-900"}`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold">{message.role === "user" ? "You" : "Assistant"}</div>

            <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-6 w-6">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </Card>
      </div>
    </div>
  )
}

