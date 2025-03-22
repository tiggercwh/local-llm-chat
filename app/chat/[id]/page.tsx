"use client";

import { useRouter } from "next/navigation";
import { Chat } from "@/components/chat";
import { Layout } from "@/components/layout";
import { Message, ChatHistory } from "@/lib/types";
import { useChat } from "@/app/contexts/ChatContext";

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { chatHistories, setChatHistories } = useChat();

  const handleUpdateMessages = (messages: Message[]) => {
    if (messages.length === 0) return;

    // Check if this is a new chat
    const existingChat = chatHistories.find((chat) => chat.id === params.id);
    if (!existingChat) {
      // Create a new chat
      const newChat = {
        id: params.id,
        title:
          messages[0].content.length > 30
            ? messages[0].content.substring(0, 30) + "..."
            : messages[0].content,
        messages,
        createdAt: new Date().toISOString(),
      };

      // Update localStorage with the new chat
      const updatedHistories = [newChat, ...chatHistories];
      setChatHistories(updatedHistories);
      localStorage.setItem("chatHistories", JSON.stringify(updatedHistories));
    } else {
      // Update existing chat
      const updatedHistories = chatHistories.map((chat: ChatHistory) =>
        chat.id === params.id
          ? {
              ...chat,
              messages,
              title:
                messages.length > 0 && messages[0].content.length > 30
                  ? messages[0].content.substring(0, 30) + "..."
                  : chat.title,
            }
          : chat
      );
      setChatHistories(updatedHistories);
    }
  };

  const currentChat = chatHistories.find((chat) => chat.id === params.id) || {
    messages: [],
  };

  return (
    <Layout
      currentChatId={params.id}
      onSelectChat={(id) => router.push(`/chat/${id}`)}
    >
      <Chat
        messages={currentChat.messages}
        onUpdateMessages={handleUpdateMessages}
        isLocalModel={false}
        chatId={params.id}
      />
    </Layout>
  );
}
