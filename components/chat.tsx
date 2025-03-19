"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Message } from "@/components/message"
import { Send } from "lucide-react"

interface ChatProps {
  messages: any[]
  onUpdateMessages: (messages: any[]) => void
  isLocalModel: boolean
}

export function Chat({ messages, onUpdateMessages, isLocalModel }: ChatProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage = { role: "user", content: input }
    const updatedMessages = [...messages, userMessage]
    onUpdateMessages(updatedMessages)

    setInput("")
    setIsLoading(true)

    try {
      // Call API to get response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          isLocalModel,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Add assistant message
      onUpdateMessages([...updatedMessages, data.message])
    } catch (error) {
      console.error("Error:", error)
      // Add error message
      onUpdateMessages([
        ...updatedMessages,
        { role: "assistant", content: "Sorry, there was an error processing your request." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to Code Review Assistant</h2>
              <p className="max-w-md">
                Paste your code and ask for a review. The assistant will analyze your code and provide feedback.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => <Message key={index} message={message} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
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
  )
}

