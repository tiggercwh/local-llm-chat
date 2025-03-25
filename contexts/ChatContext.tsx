"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ChatHistory as ChatHistoryType } from "@/lib/types";

interface ChatContextType {
  chatHistories: ChatHistoryType[];
  addChatHistory: (chatHistory: ChatHistoryType) => void;
  removeChatHistory: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatHistories, setChatHistories] = useState<ChatHistoryType[]>([]);

  // Load chat histories from localStorage on initial render
  useEffect(() => {
    const savedHistories = localStorage.getItem("localllm_chatids");

    if (savedHistories) {
      setChatHistories(JSON.parse(savedHistories));
    }
  }, []);

  const addChatHistory = (chatHistory: ChatHistoryType) => {
    setChatHistories([chatHistory, ...chatHistories]);
    localStorage.setItem(
      "localllm_chatids",
      JSON.stringify([chatHistory, ...chatHistories])
    );
  };

  const removeChatHistory = (id: string) => {
    const filterdHistories = chatHistories.filter(
      (history) => history.id !== id
    );
    setChatHistories(filterdHistories);
    localStorage.setItem("localllm_chatids", JSON.stringify(filterdHistories));
  };

  return (
    <ChatContext.Provider
      value={{ chatHistories, addChatHistory, removeChatHistory }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
