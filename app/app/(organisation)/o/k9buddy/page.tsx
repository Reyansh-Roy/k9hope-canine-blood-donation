// @ts-nocheck
"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Bot, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function K9BuddyOrgPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "🐾 Hello! I'm K9 Buddy AI for Organisations. I can help with camp management, volunteer coordination, and inventory oversight. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", content: input }]);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I've noted that down. You can manage upcoming camps in the 'Camps & Events' section or check volunteer status in the 'Volunteers' tab."
      }]);
    }, 1000);

    setInput("");
  };

  return (
    <ContentLayout title="K9 Buddy AI - Organisation Assistant">
      <div className="flex flex-col h-[calc(100vh-200px)]">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">K9 Buddy AI</CardTitle>
                <p className="text-sm text-orange-100">Organisation Assistant</p>
              </div>
              <Badge className="ml-auto bg-green-500">
                <Sparkles className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user"
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800"
                        }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about camps, volunteers, inventory..."
                  className="flex-1"
                />
                <Button onClick={handleSend} className="bg-orange-600">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                K9 Buddy AI is powered by RIT Chennai CSE × Madras Veterinary College
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
