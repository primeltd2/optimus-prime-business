import { contextBridge, ipcRenderer } from "electron";

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

contextBridge.exposeInMainWorld("optimus", {
  getMessages: (): Promise<ChatMessage[]> => ipcRenderer.invoke("chat:getMessages"),
  sendMessage: (
    content: string,
    attachments: Attachment[]
  ): Promise<{ ok: boolean; messages: ChatMessage[]; error?: string }> =>
    ipcRenderer.invoke("chat:send", { content, attachments }),
  clearMessages: (): Promise<ChatMessage[]> => ipcRenderer.invoke("chat:clear"),
  pickFiles: (): Promise<Attachment[]> => ipcRenderer.invoke("files:pick"),
  exportMarkdown: (content: string): Promise<{ ok: boolean; filePath?: string }> =>
    ipcRenderer.invoke("files:exportMarkdown", content)
});
