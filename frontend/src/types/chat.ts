export interface ChatRequest {
    question: string;
}

export interface ChatResponse {
    question: string;
    answer: string;
    sources: string[];
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: string[];
}