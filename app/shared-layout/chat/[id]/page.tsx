"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Chat } from "@/components/chat";
import { Message } from "@/lib/types";

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load messages from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem(`messages_${id}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      // Check for initial message from home page
      const initialMessage = localStorage.getItem("initialMessage");
      if (initialMessage) {
        const message = JSON.parse(initialMessage);
        setMessages([message]);
        // Store the message with the chat-specific key
        localStorage.setItem(`messages_${id}`, JSON.stringify([message]));
        // Clear the initial message from localStorage
        localStorage.removeItem("initialMessage");
      }
    }
  }, [id]);

  // Update localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`messages_${id}`, JSON.stringify(messages));
    }
  }, [messages, id]);

  const handleSetMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  return <Chat messages={messages} setMessages={handleSetMessages} />;
}
