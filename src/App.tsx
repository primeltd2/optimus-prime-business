import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Download, Eraser, FilePlus2, Paperclip, Send, Sparkles, UserRound, X } from "lucide-react";

const starterMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Salut, je suis Optimus Prime Business. Mon job: comprendre ton business, trouver le blocage principal, puis t'aider a avancer avec des actions concretes. Dis-moi ou tu en es aujourd'hui.",
    createdAt: new Date().toISOString()
  }
];

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const hasUserMessages = useMemo(() => messages.some((message) => message.role === "user"), [messages]);

  useEffect(() => {
    window.optimus?.getMessages().then((savedMessages) => {
      if (savedMessages.length > 0) setMessages(savedMessages);
    });
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    setError(null);
    setInput("");
    setIsSending(true);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content, createdAt: new Date().toISOString() }
    ]);

    const sentAttachments = attachments;
    setAttachments([]);
    if (!window.optimus?.sendMessage) {
      setIsSending(false);
      setError("Le moteur IA local n'est pas disponible dans cette execution. Lance l'application desktop pour discuter avec l'API.");
      return;
    }

    const result = await window.optimus.sendMessage(content, sentAttachments);
    setIsSending(false);

    if (result.ok) {
      setMessages(result.messages);
    } else {
      setError(result.error || "Une erreur est survenue.");
      setMessages(result.messages.length > 0 ? result.messages : messages);
    }
  }

  async function clearMessages() {
    const cleared = await window.optimus?.clearMessages();
    if (!cleared) {
      setMessages(starterMessages);
      return;
    }
    setMessages(cleared.length > 0 ? cleared : starterMessages);
    setError(null);
  }

  async function pickFiles() {
    setError(null);
    if (!window.optimus?.pickFiles) {
      setError("La selection de fichiers est disponible dans l'application desktop. La version Android utilisera le selecteur natif Capacitor.");
      return;
    }
    try {
      const picked = await window.optimus.pickFiles();
      setAttachments((current) => [...current, ...picked]);
    } catch (eventError) {
      setError(eventError instanceof Error ? eventError.message : "Impossible de charger les fichiers.");
    }
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
  }

  async function exportLastAnswer() {
    const lastAnswer = [...messages].reverse().find((message) => message.role === "assistant");
    if (!lastAnswer || !window.optimus?.exportMarkdown) return;
    await window.optimus.exportMarkdown(lastAnswer.content);
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="eyebrow">Desktop AI</p>
            <h1>Optimus Prime Business</h1>
          </div>
        </div>

        <section className="panel">
          <p className="panelLabel">Mission</p>
          <p>
            Piloter ton business avec un diagnostic clair, une priorite a la fois, et des livrables que tu peux utiliser
            tout de suite.
          </p>
        </section>

        <section className="statusGrid">
          <div>
            <span>Corpus BOS</span>
            <strong>Actif</strong>
          </div>
          <div>
            <span>API</span>
            <strong>Pollinations</strong>
          </div>
          <div>
            <span>Mode</span>
            <strong>{hasUserMessages ? "Session" : "Accueil"}</strong>
          </div>
        </section>

        <button className="secondaryButton" type="button" onClick={clearMessages}>
          <Eraser size={18} />
          Nouvelle conversation
        </button>
        <button className="secondaryButton" type="button" onClick={exportLastAnswer}>
          <Download size={18} />
          Exporter la reponse
        </button>
      </aside>

      <section className="chatArea">
        <header className="chatHeader">
          <div>
            <p className="eyebrow">Assistant business</p>
            <h2>Conversation</h2>
          </div>
        </header>

        <div className="messages" ref={listRef}>
          {messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <div className="avatar">{message.role === "assistant" ? <Bot size={20} /> : <UserRound size={20} />}</div>
              <div className="bubble">
                <p>{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="messageFiles">
                    {message.attachments.map((attachment) => (
                      <span key={attachment.id}>
                        <Paperclip size={14} />
                        {attachment.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
          {isSending && (
            <article className="message assistant">
              <div className="avatar">
                <Bot size={20} />
              </div>
              <div className="bubble typing">Optimus Prime Business reflechit...</div>
            </article>
          )}
        </div>

        {error && <div className="errorBox">{error}</div>}

        {attachments.length > 0 && (
          <div className="attachmentTray">
            {attachments.map((attachment) => (
              <div className="attachmentChip" key={attachment.id}>
                <Paperclip size={14} />
                <span>{attachment.name}</span>
                <button type="button" onClick={() => removeAttachment(attachment.id)} aria-label="Retirer le fichier">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form className="composer" onSubmit={handleSubmit}>
          <button className="fileButton" type="button" onClick={pickFiles} aria-label="Ajouter des fichiers">
            <FilePlus2 size={20} />
          </button>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Explique ta situation, ton offre, tes chiffres, ou le blocage du moment..."
            rows={3}
          />
          <button className="sendButton" type="submit" disabled={(!input.trim() && attachments.length === 0) || isSending} aria-label="Envoyer">
            <Send size={20} />
          </button>
        </form>
      </section>
    </main>
  );
}
