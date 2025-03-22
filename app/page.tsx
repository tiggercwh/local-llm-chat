"use client";

import { Message } from "@/lib/types";
import { Layout } from "@/components/layout";
import { Chat } from "@/components/chat";
import { useRouter } from "next/navigation";

export default function Home() {
  // const router = useRouter();

  // const handleNewChat = (messages: Message[]) => {
  //   if (messages.length === 0) return;

  //   const newChatId = Date.now().toString();

  //   // Store the initial prompt in localStorage
  //   localStorage.setItem("initialPrompt", messages[0].content);

  //   router.push(`/chat/${newChatId}`);
  // };

  return (
    <Layout>
      <Chat
        messages={[]}
        // onUpdateMessages={handleNewChat}
        isLocalModel={false}
      />
    </Layout>
  );
}
