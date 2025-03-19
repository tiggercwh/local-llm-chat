"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatHistoryProps {
  histories: any[]
  currentChatId: string
  onSelectChat: (id: string) => void
}

export function ChatHistory({ histories, currentChatId, onSelectChat }: ChatHistoryProps) {
  const deleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()

    // Remove chat from localStorage
    const savedHistories = localStorage.getItem("chatHistories")
    if (savedHistories) {
      const parsedHistories = JSON.parse(savedHistories)
      const updatedHistories = parsedHistories.filter((chat: any) => chat.id !== id)
      localStorage.setItem("chatHistories", JSON.stringify(updatedHistories))

      // Reload the page to reflect changes
      window.location.reload()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="space-y-2">
        {histories.map((chat) => (
          <div
            key={chat.id}
            className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
              currentChatId === chat.id ? "bg-gray-200 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-900"
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="overflow-hidden">
              <div className="font-medium truncate">{chat.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(chat.createdAt)}</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => deleteChat(e, chat.id)}
              className="opacity-0 group-hover:opacity-100 hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

