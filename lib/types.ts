export type Message = {
  role: string;
  content: string;
};

export type ChatHistory = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
};

export type ChatResponse = {
  content: string;
  error?: string;
};
