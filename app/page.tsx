"use client";

import { useState, useEffect } from "react";
import { Chat } from "@/components/chat";
import { ModelSelector } from "@/components/model-selector";
import { ChatHistory } from "@/components/chat-history";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Message, ChatHistory as ChatHistoryType } from "@/lib/types";

export default function Home() {
  const [isLocalModel, setIsLocalModel] = useState<boolean>(false);
  const [chatHistories, setChatHistories] = useState<ChatHistoryType[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Load chat histories from localStorage on initial render
  useEffect(() => {
    const savedHistories = localStorage.getItem("chatHistories");
    if (savedHistories) {
      setChatHistories(JSON.parse(savedHistories));
    }

    // Create a new chat if none exists
    if (!currentChatId) {
      createNewChat();
    }
  }, [currentChatId]);

  // Save chat histories to localStorage whenever they change
  useEffect(() => {
    if (chatHistories.length > 0) {
      localStorage.setItem("chatHistories", JSON.stringify(chatHistories));
    }
  }, [chatHistories]);

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat: ChatHistoryType = {
      id: newChatId,
      title: "New Code Review",
      messages: [],
      createdAt: new Date().toISOString(),
    };

    setChatHistories((prev) => [newChat, ...prev]);
    setCurrentChatId(newChatId);
  };

  const updateChatMessages = (chatId: string, messages: Message[]) => {
    setChatHistories((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages,
              title:
                messages.length > 0 && messages[0].content.length > 30
                  ? messages[0].content.substring(0, 30) + "..."
                  : chat.title,
            }
          : chat
      )
    );
  };

  const currentChat = chatHistories.find(
    (chat) => chat.id === currentChatId
  ) || { messages: [] };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar for chat history */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950`}
      >
        <div className="p-4">
          <Button
            onClick={createNewChat}
            className="w-full mb-4"
            variant="outline"
          >
            New Code Review
          </Button>
          <ChatHistory
            histories={chatHistories}
            currentChatId={currentChatId}
            onSelectChat={setCurrentChatId}
          />
        </div>
      </div>

      {/* Main chat area */}
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
            <h1 className="ml-4 text-xl font-semibold">
              Code Review Assistant
            </h1>
          </div>
          <ModelSelector
            isLocalModel={isLocalModel}
            onTypeChange={setIsLocalModel}
          />
        </header>

        <Chat
          messages={currentChat.messages}
          onUpdateMessages={(messages) =>
            updateChatMessages(currentChatId, messages)
          }
          isLocalModel={isLocalModel}
        />
      </div>
    </div>
  );
}
