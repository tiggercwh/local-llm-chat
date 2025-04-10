"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ChatHistoryArea } from "@/components/chat-history-area";
import { useChat } from "@/contexts/ChatContext";

interface LayoutProps {
  children: React.ReactNode;
  currentChatId?: string;
}

export function Layout({ children, currentChatId }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const { chatHistories } = useChat();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar for chat history */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950`}
      >
        <div className="p-4">
          <ChatHistoryArea
            histories={chatHistories}
            currentChatId={currentChatId || ""}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="ml-4 text-xl font-semibold">Local LLM Chat</h1>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
