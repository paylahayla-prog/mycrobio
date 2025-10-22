import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface InputAreaProps {
    onSendMessage: (text: string) => void;
    quickReplies: string[];
    isDisabled: boolean;
}

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" transform="rotate(90)">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, quickReplies, isDisabled }) => {
    const [inputValue, setInputValue] = useState('');
    const { t } = useLanguage();

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    const handleQuickReply = (reply: string) => {
        onSendMessage(reply);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

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
                    onKeyDown={handleKeyDown}
                    className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={isDisabled ? t('input.placeholderDisabled') : t('input.placeholder')}
                    disabled={isDisabled}
                />
                <button
                    onClick={handleSend}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-3 rounded-lg flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDisabled || !inputValue.trim()}
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};
