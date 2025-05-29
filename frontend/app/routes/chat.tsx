import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Card } from "primereact/card";
import { ListBox } from "primereact/listbox";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}
interface Conversation {
  id_conversation: string;
  title: string;
  updated_at: string;
}

// Pegue do seu contexto/autenticação:
const DEFAULT_USER = { id: "julio@teste.com", name: "Julio" }; 

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Buscar/conferir usuário no backend (apenas uma vez ao montar)
  useEffect(() => {
    async function checkUser() {
      try {
        await fetch("http://localhost:8000/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: DEFAULT_USER.id,
            name: DEFAULT_USER.name,
            email: DEFAULT_USER.id,
            created_at: new Date().toISOString(),
          }),
        });
      } catch {}
    }
    checkUser();
  }, []);

  // Buscar conversas do usuário
  async function fetchConversationsAndUpdate(selectedId?: string) {
    const res = await fetch(`http://localhost:8000/users/${DEFAULT_USER.id}/conversations/`);
    const data = await res.json();
    setConversations(Array.isArray(data) ? data : []);
    if (selectedId) {
      const c = (data || []).find((c: Conversation) => c.id_conversation === selectedId);
      setSelectedConversation(c || data[0] || null);
    } else {
      setSelectedConversation(data[0] || null);
    }
  }

  useEffect(() => {
    fetchConversationsAndUpdate();
  }, []);

  // Buscar histórico da conversa selecionada
  useEffect(() => {
    async function fetchHistory() {
      if (!selectedConversation) {
        setChatHistory([]);
        return;
      }
      try {
        const res = await fetch(`http://localhost:8000/conversations/${selectedConversation.id_conversation}`);
        const data = await res.json();
        setChatHistory(
          Array.isArray(data)
            ? data.map((msg: any) => ({
                role: msg.role === "user" ? "user" : "assistant",
                content: msg.content,
                timestamp: msg.timestamp,
              }))
            : []
        );
      } catch {
        setChatHistory([
          {
            role: "assistant",
            content: "Erro ao carregar o histórico da conversa. Tente novamente mais tarde.",
          },
        ]);
      }
    }
    fetchHistory();
  }, [selectedConversation]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Enviar mensagem
  const handleSend = async () => {
    if (!message.trim() || loading || !selectedConversation) return;
    const userMessage = message;
    setMessage("");
    setLoading(true);

    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date().toISOString() },
      { role: "assistant", content: "⏳ Pensando..." },
    ]);

    try {
      const response = await fetch(
        `http://localhost:8000/users/${DEFAULT_USER.id}/conversations/${selectedConversation.id_conversation}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_parent: "",
            role: "user",
            content: userMessage,
            timestamp: new Date().toISOString(),
          }),
        }
      );
      const text = await response.text();
      const [iaMsg] = text.split("<end>");

      setChatHistory((prev) =>
        prev.slice(0, -1).concat({
          role: "assistant",
          content: iaMsg.trim() || "❌ Erro: resposta vazia do assistente.",
        })
      );
      // Atualizar a lista de conversas, marcando a conversa atual como mais recente
      fetchConversationsAndUpdate(selectedConversation.id_conversation);
    } catch {
      setChatHistory((prev) =>
        prev.slice(0, -1).concat({
          role: "assistant",
          content: "❌ Erro ao buscar resposta do assistente.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // Cria nova conversa
  async function handleNewChat() {
    const newId = crypto.randomUUID();
    const newConv: Conversation = {
      id_conversation: newId,
      title: "Nova Conversa",
      updated_at: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setSelectedConversation(newConv);
    setChatHistory([]);
  }

  // Excluir conversa
  async function handleDeleteConversation(convId: string) {
    if (!window.confirm("Tem certeza que deseja excluir esta conversa?")) return;
    try {
      await fetch(
        `http://localhost:8000/users/${DEFAULT_USER.id}/conversations/${convId}`,
        { method: "DELETE" }
      );
      // Remove da lista local e seleciona outra conversa se necessário
      const filtered = conversations.filter((c) => c.id_conversation !== convId);
      setConversations(filtered);
      setSelectedConversation(filtered[0] || null);
      setChatHistory([]);
    } catch {
      alert("Erro ao excluir conversa.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to left, #040016, #040014)", display: "flex" }}>
      {/* Sidebar das conversas */}
      <aside style={{
        minWidth: 260, maxWidth: 320, background: "#191922", color: "#fff", padding: 0, borderRight: "1px solid #292937", height: "100vh", display: "flex", flexDirection: "column"
      }}>
        <div style={{ padding: 24, borderBottom: "1px solid #23233a", fontWeight: 600, fontSize: 18 }}>
          Minhas conversas
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {(conversations || []).map((conv) => (
            <div
              key={conv.id_conversation}
              style={{
                display: "flex", alignItems: "center", padding: "12px 16px",
                background: selectedConversation?.id_conversation === conv.id_conversation ? "#272744" : "transparent",
                cursor: "pointer", borderBottom: "1px solid #23233a"
              }}
              onClick={() => setSelectedConversation(conv)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{conv.title || "Sem título"}</div>
                <div style={{ fontSize: 12, color: "#999" }}>{new Date(conv.updated_at).toLocaleString()}</div>
              </div>
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-text p-button-danger"
                style={{ marginLeft: 12 }}
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteConversation(conv.id_conversation);
                }}
              />
            </div>
          ))}
        </div>
        <Button
          label="Nova Conversa"
          className="p-button-success"
          style={{ margin: 24, width: "calc(100% - 48px)" }}
          onClick={handleNewChat}
        />
      </aside>

      {/* Conteúdo do chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
        <div style={{
          background: "#202123",
          padding: 18,
          borderBottom: "1px solid #393D45",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ fontWeight: 700, fontSize: 22, color: "white" }}>Assistente IA</span>
          <Button
            label="Voltar"
            className="p-button-text p-button-outlined p-button-warning"
            style={{ fontSize: "0.875rem" }}
            onClick={() => navigate("/auth/login")}
          />
        </div>
        {/* Chat body */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center", flex: 1, minHeight: 0
        }}>
          <Card className="w-full" style={{
            maxWidth: 700,
            height: "70vh",
            background: "#171717",
            borderRadius: 18,
            boxShadow: "0 2px 12px 0 rgba(24,24,24,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                height: "60vh",
                maxHeight: "60vh",
              }}>
              {chatHistory.length === 0 && (
                <div style={{ textAlign: "center", color: "#B5B6B7", marginBottom: 12 }}>
                  Nenhuma mensagem ainda. Inicie a conversa!
                </div>
              )}
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                  }}
                >
                  <div
                    style={{
                      padding: "14px 22px",
                      borderRadius: 16,
                      maxWidth: "75%",
                      background: msg.role === "user" ? "#1976D2" : "#26272b",
                      color: msg.role === "user" ? "white" : "#E8EAF6",
                      marginBottom: 6,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                      borderTopRightRadius: msg.role === "user" ? 6 : 16,
                      borderTopLeftRadius: msg.role === "user" ? 16 : 6
                    }}
                  >
                    {msg.content}
                    {msg.timestamp && (
                      <div style={{ fontSize: 10, color: "#B5B6B7", marginTop: 6 }}>
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </Card>
        </div>
        {/* Input */}
        <div style={{ width: "100%", background: "#222234", borderTop: "1px solid #393D45", padding: "18px 0" }}>
          <form
            style={{ maxWidth: 700, margin: "0 auto", display: "flex", gap: 10, padding: "0 18px" }}
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
          >
            <InputTextarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              autoResize={false}
              rows={1}
              style={{
                flex: 1,
                borderRadius: 999,
                background: "#171717",
                color: "white",
                padding: "12px 22px",
                border: "1px solid #393D45",
                minHeight: 44,
                maxHeight: 44,
                resize: "none",
                lineHeight: "20px"
              }}
              disabled={loading}
            />

            <Button
              type="submit"
              label={loading ? "Enviando..." : "Enviar"}
              className="p-button-success"
              style={{ minWidth: "110px", borderRadius: 999 }}
              disabled={loading || !message.trim()}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
