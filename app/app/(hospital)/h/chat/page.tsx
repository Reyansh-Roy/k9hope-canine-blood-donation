"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Loader2 } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

import { useUser } from "@/context/UserContext";

export default function K9BuddyAIPage() {
    const { userId, role, device } = useUser();

    if (!device) {
        return (
            <ContentLayout title="K9 Buddy AI">
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin" />
                </div>
            </ContentLayout>
        );
    }

    const [messages, setMessages] = useState([
        { sender: "bot", text: "🐕 **K9 Buddy AI**\n\nHello! I am your intelligent veterinary assistant. I can help with blood donation protocols, inventory management, and patient-donor matching. How can I assist you?" },
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
            // Assuming api/chatbot handles the system prompt context on the server side
            // If not, we might need to send context here, but keeping it simple for now.
            const response = await axios.post("/api/chatbot", { message: input });
            setMessages([...newMessages, { sender: "bot", text: response.data.reply }]);
        } catch (error) {
            setMessages([...newMessages, { sender: "bot", text: "I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleKeyPress = (e: any) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <ContentLayout title="K9 Buddy AI">
            <div className="mb-4">
                <h1 className="text-2xl font-bold">🐕 K9 Buddy AI Assistant</h1>
                <p className="text-gray-600">
                    Your intelligent veterinary blood bank assistant with knowledge base integration
                </p>
            </div>

            <div className="flex flex-col h-[calc(100vh-200px)] p-4 bg-background text-foreground rounded-md border shadow-sm">
                <ScrollArea className="flex-1 rounded-md p-4 overflow-auto bg-muted/30">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-3 my-2 rounded-lg text-sm shadow-sm ${msg.sender === "user"
                                ? "ml-auto bg-blue-600 text-white mr-2 text-left"
                                : "mr-auto bg-white dark:bg-gray-800 border text-gray-800 dark:text-gray-200 ml-2 text-left"
                                } ${device === "desktop" ? "max-w-[50%]" : "max-w-[85%]"}`}
                        >
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    ))}
                    {loading && (
                        <div className="p-3 my-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 max-w-xs flex items-center">
                            <Loader2 className="animate-spin inline-block mr-2 h-4 w-4" /> Thinking...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </ScrollArea>
                <CardContent className="mt-4 flex gap-2 pt-0 px-0">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask about blood types, donor eligibility, or inventory..."
                        className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={loading} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white">
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Send"}
                    </Button>
                </CardContent>
            </div>
        </ContentLayout>
    );
}
