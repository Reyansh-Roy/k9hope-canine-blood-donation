// @ts-nocheck
"use client";

import { findBestResponse } from "@/lib/k9buddy/knowledgeBase";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

export default function K9BuddyDonorPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "🐕 Woof! I'm K9 Buddy AI, your intelligent canine blood donation assistant.\n\nI can answer questions about:\n• How to become a donor\n• Blood types (DEA system)\n• Eligibility requirements\n• Finding dogs in need\n• The K9Hope team\n\nWhat would you like to know?"
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
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="h-8 w-8" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <CardTitle className="text-2xl">K9 Buddy AI</CardTitle>
                <p className="text-sm text-blue-100">🧠 Intelligent Veterinary Assistant</p>
              </div>
              <Badge className="ml-auto bg-purple-500">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Online
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
                      className={`max-w-[80%] rounded-lg p-3 whitespace-pre-wrap ${msg.role === "user"
                          ? "bg-blue-600 text-white"
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
                  placeholder="Ask about K9Hope..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button onClick={handleSend} className="bg-blue-600" disabled={isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                K9 Buddy AI - Developed by RIT Chennai CSE Department
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
