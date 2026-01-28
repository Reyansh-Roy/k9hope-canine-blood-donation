"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Loader2 } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

import { useUser } from "@/context/UserContext";

export default function K9BuddyAI() {
  const { userId, role, device } = useUser();

  if (!device) {
    return (
      <ContentLayout title="🐾 K9 Buddy AI - Clinical Assistant">
        <div className="flex h-full items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      </ContentLayout>
    );
  }

  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "🐾 **K9 Buddy AI - Clinical Assistant**\n\nHello! I am your K9 Buddy AI clinical assistant. How can I help you and Jillu today?" 
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("/api/chatbot", { message: input });
      setMessages([...newMessages, { sender: "bot", text: response.data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { sender: "bot", text: "Error fetching response." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <ContentLayout title="🐾 K9 Buddy AI - Clinical Assistant">
      <div className="flex flex-col h-full p-4 bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-100 rounded-md border border-gray-200 dark:border-gray-700">
        <ScrollArea className="flex-1 border rounded-md p-4 overflow-auto bg-white dark:bg-gray-50 border-gray-100 dark:border-gray-600">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 my-2 rounded-lg text-sm shadow-md border ${msg.sender === "user"
                  ? "ml-auto bg-blue-600 text-white mr-2 text-left border-blue-700" // user messages aligned to left with gap on right
                  : "mr-auto bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ml-2 text-left border-gray-200 dark:border-slate-600" // bot messages aligned to right with gap on left
                } ${device === "desktop" ? "max-w-[30%]" : "max-w-[80%]"}`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          ))}
          {loading && (
            <div className="p-3 my-3 rounded-lg bg-gray-100 dark:bg-muted text-gray-800 dark:text-gray-200 max-w-xs">
              <Loader2 className="animate-spin inline-block mr-2" /> Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
        <CardContent className="mt-4 flex gap-2 pt-4 bg-white dark:bg-gray-50 border-t border-gray-200 dark:border-gray-600">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about canine blood donation or Jillu's clinical status..."
            className="flex-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-gray-300 dark:border-slate-600"
          />
          <Button onClick={sendMessage} disabled={loading} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? <Loader2 className="animate-spin" /> : "Send"}
          </Button>
        </CardContent>
      </div>
    </ContentLayout>
  );
}
