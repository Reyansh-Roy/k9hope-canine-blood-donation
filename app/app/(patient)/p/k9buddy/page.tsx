// @ts-nocheck
"use client";

import { findBestResponse } from "@/lib/k9buddy/knowledgeBase";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Bot, Send } from "lucide-react";

export default function K9BuddyPatientPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "🐕 Hello! I'm K9 Buddy AI, your smart assistant for pet parents.\n\nI can help you with:\n-  Requesting blood for your dog\n-  Understanding canine blood types\n-  Finding eligible donors\n-  Emergency procedures\n-  Who built K9Hope\n\nHow can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsTyping(true);

    try {
      const aiResponse = await findBestResponse(userMessage);
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "😔 Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ContentLayout title="K9 Buddy AI">
      <div className="flex flex-col h-[calc(100vh-200px)]">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">K9 Buddy AI</CardTitle>
                <p className="text-sm text-red-100">🧠 Your Smart Pet Care Assistant</p>
              </div>
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
                      className={`max-w-[80%] rounded-lg p-3 whitespace-pre-wrap ${msg.role === "user"
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800"
                        }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-xs text-gray-500">
                      K9 Buddy is thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isTyping && handleSend()}
                  placeholder="Ask K9 Buddy about blood donation..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button onClick={handleSend} className="bg-red-600" disabled={isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Powered by K9Hope Neural Network
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
