"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ModelSelector } from "@/components/model-selector";
import { ChatHistoryArea } from "@/components/chat-history-area";
import { useChat } from "@/app/contexts/ChatContext";

interface LayoutProps {
  children: React.ReactNode;
  currentChatId?: string;
  onSelectChat?: (id: string) => void;
}

export function Layout({ children, currentChatId, onSelectChat }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isLocalModel, setIsLocalModel] = useState<boolean>(false);
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
            onSelectChat={onSelectChat || (() => {})}
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
          <ModelSelector
            isLocalModel={isLocalModel}
            onTypeChange={setIsLocalModel}
          />
        </header>

        {children}
      </div>
    </div>
  );
}
