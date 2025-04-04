import { useState } from "react";
import { Form } from "@remix-run/react";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleSend = () => {
    if (!message.trim()) return; 

    const userMessage = message;
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: userMessage }, 
      
      
    ]);
    setMessage("");

    //Simula uma resposta do assistente
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Resposta simulada para: "${userMessage}"`,
        },
      ]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-screen bg-[#202123] text-white">
      <header>
        <div className="p-4 border-b border-gray-400 grid grid-cols-3 items-center">
            <Button
            label="Novo Chat"
            className="p-button-text p-button-plain p-2 border border-gray-400 whitespace-nowrap"
            style={{ fontSize: "0.875rem" }}
            />
        </div>
      </header>

      <main className="flex-1 flex justify-center items-center p-">
      <div className="w-2"></div>
        <div className="w-full max-w-3xl h-full border border-gray-400 rounded-lg p-6 overflow-y-auto">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-md ${
                  msg.role === "user" ? "bg-blue-600" : "bg-[#343541]"
                }`}
                style={{ border: "1px solid var(--surface-border)" }}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-400 bg-[#343541]">
        <div className="w-full max-w-md mx-auto flex justify-between items-center">
            <div className="w-3"></div>
            <Form
            method="post"
            onSubmit={(e) => {
                e.preventDefault();
                handleSend();
            }}
            className="flex-1 flex items-center"
            >
            <div className="flex-1 border border-gray-400 rounded px-2 py-0.1">
                <InputTextarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                autoResize
                className="w-full bg-transparent text-white border border-gray-400 focus:outline-none"

                />
            </div>
            <Button type="submit" label="Enviar" className="ml-2 p-button-success" />
            </Form>
            <div className="w-3"></div>
        </div>
      </footer>

    </div>
  );
}
