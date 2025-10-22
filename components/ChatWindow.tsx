
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage } from '../types';

interface ChatWindowProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
    const chatWindowRef = useRef<HTMLDivElement>(null);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const itemsWithSeparators = useMemo(() => {
        const out: Array<{ type: 'separator'; label: string } | { type: 'msg'; index: number }> = [];
        let lastDate: string | null = null;
        messages.forEach((m, idx) => {
            if (m.timestamp) {
                const d = new Date(m.timestamp);
                const dayKey = d.toDateString();
                if (dayKey !== lastDate) {
                    lastDate = dayKey;
                    const now = new Date();
                    const todayKey = now.toDateString();
                    const yesterday = new Date(now);
                    yesterday.setDate(now.getDate() - 1);
                    const yKey = yesterday.toDateString();
                    const label = dayKey === todayKey ? 'Today' : dayKey === yKey ? 'Yesterday' : d.toLocaleDateString();
                    out.push({ type: 'separator', label });
                }
            }
            out.push({ type: 'msg', index: idx });
        });
        return out;
    }, [messages]);

    useEffect(() => {
        const el = chatWindowRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [messages, isLoading]);

    useEffect(() => {
        const el = chatWindowRef.current;
        if (!el) return;
        const onScroll = () => {
            const threshold = 80; // px from bottom
            const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
            setShowScrollDown(!atBottom);
        };
        el.addEventListener('scroll', onScroll);
        onScroll();
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToBottom = () => {
        const el = chatWindowRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    };

    const ArrowDownIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14"></path>
            <path d="m19 12-7 7-7-7"></path>
        </svg>
    );

    return (
        <div ref={chatWindowRef} className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col gap-6">
            {itemsWithSeparators.map((item, i) => (
                item.type === 'separator' ? (
                    <div key={`sep-${i}`} className="sticky top-2 z-10 self-center text-xs text-gray-400 bg-[#0d1117] border border-[#30363d] rounded-full px-3 py-0.5 shadow-sm">
                        {item.label}
                    </div>
                ) : (
                    <Message key={`msg-${i}`} message={messages[item.index]} />
                )
            ))}
            {isLoading && <TypingIndicator />}
            {showScrollDown && (
                <button
                    onClick={scrollToBottom}
                    className="fixed right-4 bottom-28 md:bottom-24 bg-[#21262d]/90 border border-[#30363d] text-gray-200 rounded-full shadow-lg p-3 backdrop-blur hover:bg-[#30363d] transition-colors"
                    aria-label="Scroll to latest message"
                >
                    <ArrowDownIcon />
                </button>
            )}
        </div>
    );
};
