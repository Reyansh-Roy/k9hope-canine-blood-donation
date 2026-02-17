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
import { Bot, Send, Activity, Sparkles } from "lucide-react";

export default function K9BuddyHospitalPage() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "🏥 Hello! I'm K9 Buddy AI for Veterinary Professionals. I can help with blood request management, donor matching, and DAHD 2025 compliance. What do you need?"
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
            setMessages(prev => [...prev, {
                role: "assistant",
                content: aiResponse
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "😔 Sorry, I encountered an error. Please try again!"
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <ContentLayout title="K9 Buddy AI - Veterinary Assistant">
            <div className="flex flex-col h-[calc(100vh-200px)]">
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Bot className="h-8 w-8" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <CardTitle className="text-2xl">K9 Buddy AI</CardTitle>
                                <p className="text-sm text-green-100">🧠 RIT Chennai AI Engine</p>
                            </div>
                            <Badge className="ml-auto bg-green-500 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Neural Network Active
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
                                                ? "bg-green-600 text-white"
                                                : "bg-gray-100 dark:bg-gray-800"
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {messages.length <= 1 && (
                            <div className="border-t border-b p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
                                <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Try asking:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setInput("Who developed K9Hope?")}
                                        className="text-xs"
                                    >
                                        Who developed K9Hope?
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setInput("What are the donor requirements?")}
                                        className="text-xs"
                                    >
                                        Donor requirements?
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setInput("What is DEA blood type?")}
                                        className="text-xs"
                                    >
                                        DEA blood types?
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="border-t p-4">
                            <div className="flex gap-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && !isTyping && handleSend()}
                                    placeholder="Ask about blood requests, donor matching, DAHD protocols..."
                                    className="flex-1"
                                    disabled={isTyping}
                                />
                                <Button onClick={handleSend} className="bg-green-600" disabled={isTyping}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center gap-1">
                                <Activity className="h-3 w-3" />
                                Powered by K9Hope AI Engine × RIT Chennai
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ContentLayout>
    );
}
