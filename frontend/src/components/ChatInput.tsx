
import type { KeyboardEvent } from "react";

interface Props {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled: boolean;
}

export default function ChatInput({
    value,
    onChange,
    onSend,
    disabled
}: Props) {

    const handleKeyDown = (
        event: KeyboardEvent<HTMLTextAreaElement>
    ) => {

        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
        }
    };

    return (
        <div className="chat-input-wrapper">

            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask something about Ajil..."
                disabled={disabled}
                rows={1}
            />

            <button
                className="send-button"
                onClick={onSend}
                disabled={disabled || !value.trim()}
                aria-label="Send message"
            >
                ↑
            </button>

        </div>
    );
}
