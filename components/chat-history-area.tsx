"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHistory as ChatHistoryType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";

interface ChatHistoryProps {
  histories: ChatHistoryType[];
  currentChatId: string;
}

export function ChatHistoryArea({
  histories,
  currentChatId,
}: ChatHistoryProps) {
  const router = useRouter();
  const { removeChatHistory } = useChat();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeChatHistory(id);

    // If we're deleting the current chat, navigate to home
    if (id === currentChatId) {
      router.push("/");
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="space-y-2">
        <Button
          variant="default"
          className="w-full justify-start text-left mb-4"
          onClick={() => router.push("/")}
        >
          <div className="flex items-center gap-2">
            <span>Create New Chat</span>
          </div>
        </Button>
        {histories.map((chat) => (
          <div key={chat.id} className="relative group">
            <Button
              variant={chat.id === currentChatId ? "secondary" : "ghost"}
              className="w-full justify-start text-left pr-8"
              onClick={() => router.push(`/chat/${chat.id}`)}
            >
              <div className="flex flex-col items-start">
                <span className="truncate max-w-[200px]">{chat.title}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(chat.createdAt).toLocaleString()}
                </span>
              </div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
              onClick={(e) => handleDelete(e, chat.id)}
              title="Delete chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
