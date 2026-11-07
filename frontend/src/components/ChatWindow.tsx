
import { useEffect, useRef, useState } from "react";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

import { sendMessage } from "../services/ChatService";

import type { ChatMessage as ChatMessageType } from "../types/chat";


const suggestions = [
    "Tell me about Ajil",
    "What projects has he built?",
    "Tell me about SkillSync",
    "What technologies does he know?"
];


export default function ChatWindow() {

    const [messages, setMessages] = useState<ChatMessageType[]>([
        {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
                "Hey! 👋 I'm Ask Ajil, your personal AI assistant. Ask me anything about Ajil's background, projects, skills or experience."
        }
    ]);

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);


    // Automatically scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, isLoading]);


    // Send message to FastAPI
    const handleSend = async (question?: string) => {

        const text = (question ?? input).trim();

        if (!text || isLoading) return;

        const userMessage: ChatMessageType = {
            id: crypto.randomUUID(),
            role: "user",
            content: text
        };

        setMessages((previous) => [
            ...previous,
            userMessage
        ]);

        setInput("");
        setIsLoading(true);

        try {

            const response = await sendMessage(text);

            const assistantMessage: ChatMessageType = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: response.answer,
                sources: response.sources
            };

            setMessages((previous) => [
                ...previous,
                assistantMessage
            ]);

        } catch (error) {

            const errorMessage: ChatMessageType = {
                id: crypto.randomUUID(),
                role: "assistant",
                content:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong. Please try again."
            };

            setMessages((previous) => [
                ...previous,
                errorMessage
            ]);

        } finally {
            setIsLoading(false);
        }
    };


    return (
        <main className="chat-layout">

            {/* Header */}

            <header className="chat-header">

                <div className="brand">
                    <div className="brand-logo">A</div>

                    <div>
                        <h2>ASK AJIL</h2>
                        <p>PERSONAL AI ASSISTANT</p>
                    </div>
                </div>

                <div className="online-status">
                    <span></span>
                    AI ASSISTANT
                </div>

            </header>


            {/* Chat messages */}

            <section className="chat-body">

                <div className="chat-intro">
                    <div className="intro-badge">
                        GET TO KNOW AJIL
                    </div>

                    <h1>
                        Curious about <span>Ajil?</span>
                    </h1>

                    <p>
                        Ask me about his projects, technical skills,
                        education and development journey.
                    </p>
                </div>


                <div className="messages">

                    {messages.map((message) => (
                        <ChatMessage
                            key={message.id}
                            message={message}
                        />
                    ))}

                    {isLoading && (
                        <TypingIndicator
                            message={{
                                id: "typing-indicator",
                                role: "assistant",
                                content: ""
                            }}
                        />
                    )}

                    <div ref={messagesEndRef} />

                </div>


                {/* Suggested questions */}

                {messages.length === 1 && !isLoading && (
                    <div className="suggestions">

                        <p>TRY ASKING</p>

                        <div className="suggestion-list">

                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => handleSend(suggestion)}
                                >
                                    {suggestion} ↗
                                </button>
                            ))}

                        </div>

                    </div>
                )}

            </section>


            {/* Input area */}

            <footer className="chat-footer">

                <ChatInput
                    value={input}
                    onChange={setInput}
                    onSend={() => handleSend()}
                    disabled={isLoading}
                />

                <p>
                    AI responses are generated using
                    information from Ajil's public profile.
                </p>

            </footer>

        </main>
    );
}
