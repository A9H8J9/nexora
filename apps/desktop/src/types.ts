export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  title: string;
  projectId: string | null;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  description: string;
  createdAt: number;
  pinned?: boolean;
}
