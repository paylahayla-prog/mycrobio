
import React, { useEffect, useRef } from 'react';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage } from '../types';

interface ChatWindowProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
    const chatWindowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div ref={chatWindowRef} className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col gap-6">
            {messages.map((msg, index) => (
                <Message key={index} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
        </div>
    );
};
