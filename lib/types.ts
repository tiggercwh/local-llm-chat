// link with Chat history id
export type Message = {
  role: string;
  content: string;
};

export type ChatHistory = {
  id: string;
  title: string;
  createdAt: string;
};

export type ChatResponse = {
  content: string;
  error?: string;
};
