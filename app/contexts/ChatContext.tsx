"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// import { ChatHistory as ChatHistoryType } from "@/lib/types";

interface ChatContextType {
  chatHistoryIDs: string[];
  addChatHistoryID: (id: string) => void;
  removeChatHistoryID: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatHistoryIDs, setChatHistoryIDs] = useState<string[]>([]);

  // Load chat histories from localStorage on initial render
  useEffect(() => {
    const savedHistories = localStorage.getItem("localllm_chatids");
    if (savedHistories) {
      setChatHistoryIDs(JSON.parse(savedHistories));
    }
  }, []);

  const addChatHistoryID = (id: string) => {
    setChatHistoryIDs([...chatHistoryIDs, id]);
    localStorage.setItem(
      "localllm_chatids",
      JSON.stringify([...chatHistoryIDs, id])
    );
  };

  const removeChatHistoryID = (id: string) => {
    setChatHistoryIDs(chatHistoryIDs.filter((chatId) => chatId !== id));
    localStorage.setItem(
      "localllm_chatids",
      JSON.stringify(chatHistoryIDs.filter((chatId) => chatId !== id))
    );
  };

  return (
    <ChatContext.Provider
      value={{ chatHistoryIDs, addChatHistoryID, removeChatHistoryID }}
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
