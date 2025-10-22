import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface InputAreaProps {
    onSendMessage: (text: string) => void;
    quickReplies: string[];
    isDisabled: boolean;
    uiMode?: 'classic' | 'modern';
}

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" transform="rotate(90)">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, quickReplies, isDisabled, uiMode = 'modern' }) => {
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const { t } = useLanguage();

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
            // Reset textarea height after sending
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleQuickReply = (reply: string) => {
        onSendMessage(reply);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        const max = 5 * 24; // ~5 lines at 24px line-height
        const next = Math.min(el.scrollHeight, max);
        el.style.height = `${next}px`;
    };

    useEffect(() => {
        autoResize();
    }, [inputValue]);

    if (uiMode === 'classic') {
        return (
            <div className="p-4 border-t border-[#30363d]">
                <div className="flex flex-wrap gap-2 mb-3">
                    {quickReplies.map((reply, index) => (
                        <button
                            key={index}
                            onClick={() => handleQuickReply(reply)}
                            className="transition-all duration-200 ease-in-out bg-[#21262d] border border-[#30363d] text-sm text-gray-300 py-1 px-3 rounded-full hover:bg-[#30363d] hover:border-[#8b949e] disabled:opacity-50"
                            disabled={isDisabled}
                        >
                            {reply}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDownInput}
                        className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={isDisabled ? t('input.placeholderDisabled') : t('input.placeholder')}
                        disabled={isDisabled}
                    />
                    <button
                        onClick={handleSend}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-3 rounded-lg flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDisabled || !inputValue.trim()}
                        aria-label="Send"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="sticky bottom-0 z-30 bg-[#0d1117] p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-4 border-t border-[#30363d]">
            <div className="flex gap-2 mb-3 overflow-x-auto flex-nowrap sm:flex-wrap sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0">
                {quickReplies.map((reply, index) => (
                    <button
                        key={index}
                        onClick={() => handleQuickReply(reply)}
                        className="transition-all duration-200 ease-in-out bg-[#21262d] border border-[#30363d] text-sm text-gray-300 py-2 px-3 rounded-full hover:bg-[#30363d] hover:border-[#8b949e] disabled:opacity-50 flex-shrink-0"
                        disabled={isDisabled}
                    >
                        {reply}
                    </button>
                ))}
            </div>
            <div className="flex gap-2 items-end">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onInput={autoResize}
                    onKeyDown={handleKeyDown}
                    enterKeyHint="send"
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed resize-none leading-6 max-h-40"
                    placeholder={isDisabled ? t('input.placeholderDisabled') : t('input.placeholder')}
                    disabled={isDisabled}
                />
                <button
                    onClick={handleSend}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-3 rounded-lg flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
                    disabled={isDisabled || !inputValue.trim()}
                    aria-label="Send"
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};
