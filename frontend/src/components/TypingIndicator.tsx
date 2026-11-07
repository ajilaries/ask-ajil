
import type { ChatMessage as ChatMessageType } from "../types/chat";

interface Props {
    message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {

    const isAssistant = message.role === "assistant";

    return (
        <div className={`message-row ${message.role}`}>

            {isAssistant && (
                <div className="avatar assistant-avatar">
                    A
                </div>
            )}

            <div className="message-content">

                <div className="message-label">
                    {isAssistant ? "ASK AJIL" : "YOU"}
                </div>

                <div className={`message-bubble ${message.role}`}>
                    {message.content}
                </div>

                {isAssistant && message.sources?.length ? (
                    <div className="sources">
                        <span>Sources:</span>

                        {message.sources.map((source) => (
                            <span className="source-tag" key={source}>
                                {source}
                            </span>
                        ))}
                    </div>
                ) : null}

            </div>

            {!isAssistant && (
                <div className="avatar user-avatar">
                    U
                </div>
            )}

        </div>
    );
}
