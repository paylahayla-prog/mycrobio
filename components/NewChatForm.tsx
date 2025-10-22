import React, { useState } from 'react';
import type { PrelevementInfo } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NewChatFormProps {
    onStart: (info: PrelevementInfo) => void;
}

export const NewChatForm: React.FC<NewChatFormProps> = ({ onStart }) => {
    const [id, setId] = useState('');
    const [type, setType] = useState('');
    const [count, setCount] = useState('');
    const { t } = useLanguage();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (id.trim() && type.trim()) {
            onStart({
                id: id.trim(),
                type: type.trim(),
                count: count.trim() || undefined,
            });
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0d1117]">
            <div className="w-full max-w-md bg-[#161b22] p-8 rounded-lg border border-[#30363d] shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('newChat.title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="prelevement-id" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('newChat.idLabel')}
                        </label>
                        <input
                            id="prelevement-id"
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                            placeholder={t('newChat.idPlaceholder')}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="prelevement-type" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('newChat.typeLabel')}
                        </label>
                        <input
                            id="prelevement-type"
                            type="text"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                            placeholder={t('newChat.typePlaceholder')}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="colony-count" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('newChat.countLabel')}
                        </label>
                        <input
                            id="colony-count"
                            type="text"
                            value={count}
                            onChange={(e) => setCount(e.target.value)}
                            className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                            placeholder={t('newChat.countPlaceholder')}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-3 rounded-lg transition-colors disabled:opacity-50"
                        disabled={!id.trim() || !type.trim()}
                    >
                        {t('newChat.startButton')}
                    </button>
                </form>
            </div>
        </div>
    );
};
