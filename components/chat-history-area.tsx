"use client";

import type React from "react";

import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHistory as ChatHistoryType } from "@/lib/types";

interface ChatHistoryProps {
  histories: ChatHistoryType[];
  currentChatId: string;
  onSelectChat: (id: string) => void;
}

export function ChatHistoryArea({
  histories,
  currentChatId,
  onSelectChat,
}: ChatHistoryProps) {
  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="space-y-2">
        {histories.map((chat) => (
          <Button
            key={chat.id}
            variant={chat.id === currentChatId ? "secondary" : "ghost"}
            className="w-full justify-start text-left"
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="flex flex-col items-start">
              <span className="truncate max-w-[200px]">{chat.title}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(chat.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
