/// <reference types="vite/client" />

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  attachments?: Attachment[];
};

type Attachment = {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  kind: "text" | "image" | "binary";
  extractedText?: string;
  dataUrl?: string;
};

interface Window {
  optimus?: {
    getMessages: () => Promise<ChatMessage[]>;
    sendMessage: (
      content: string,
      attachments: Attachment[]
    ) => Promise<{ ok: boolean; messages: ChatMessage[]; error?: string }>;
    clearMessages: () => Promise<ChatMessage[]>;
    pickFiles: () => Promise<Attachment[]>;
    exportMarkdown: (content: string) => Promise<{ ok: boolean; filePath?: string }>;
  };
}
