
import React from 'react';
import type { ChatSession } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HistorySidebarProps {
    isSidebarOpen: boolean;
    chats: Record<string, ChatSession>;
    activeChatId: string | null;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
    onDeleteChat: (id: string) => void;
}

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const TrashIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ isSidebarOpen, chats, activeChatId, onSelectChat, onNewChat, onDeleteChat }) => {
    const { t } = useLanguage();
    const chatList = Object.values(chats).sort((a: ChatSession, b: ChatSession) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const formatTimeAgo = (isoString?: string): string => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return t('time.yearsAgo', { count: Math.floor(interval) });
        interval = seconds / 2592000;
        if (interval > 1) return t('time.monthsAgo', { count: Math.floor(interval) });
        interval = seconds / 86400;
        if (interval > 1) return t('time.daysAgo', { count: Math.floor(interval) });
        interval = seconds / 3600;
        if (interval > 1) return t('time.hoursAgo', { count: Math.floor(interval) });
        interval = seconds / 60;
        if (interval > 1) return t('time.minutesAgo', { count: Math.floor(interval) });
        return t('time.justNow');
    };


    return (
        <aside className={`
            flex-shrink-0 bg-[#010409] border-r border-[#30363d]
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'w-64 p-0' : 'w-0 border-r-0'}
            overflow-hidden
        `}>
            <div className="w-64 h-full flex flex-col">
                 <div className="p-4 border-b border-[#30363d]">
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-2 rounded-lg transition-colors"
                    >
                        <PlusIcon />
                        {t('sidebar.newCase')}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <h3 className="p-4 text-sm font-semibold text-gray-400">{t('sidebar.caseHistory')}</h3>
                    <nav className="flex flex-col gap-1 px-2">
                        {chatList.length === 0 ? (
                             <p className="px-2 text-sm text-gray-500">{t('sidebar.noCases')}</p>
                        ) : (
                            chatList.map((chat: ChatSession) => (
                                <div key={chat.info.id} className={`group relative flex items-start justify-between p-2 rounded-md cursor-pointer ${activeChatId === chat.info.id ? 'bg-gray-700' : 'hover:bg-gray-800'}`} onClick={() => onSelectChat(chat.info.id)}>
                                    <div className="flex-1 overflow-hidden pr-8">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${chat.isFinished ? 'bg-green-400' : 'bg-cyan-400'}`} title={chat.isFinished ? t('header.statusCompleted') : t('header.statusInProgress')}></span>
                                            <p className="text-sm font-semibold text-white truncate">{chat.info.id}</p>
                                        </div>
                                        <p className="text-xs text-gray-400 truncate pl-4">{chat.info.type}</p>
                                        <p className="text-xs text-gray-500 pl-4 mt-1">{formatTimeAgo(chat.createdAt)}</p>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(t('sidebar.deleteConfirm', {id: chat.info.id}))) {
                                                onDeleteChat(chat.info.id);
                                            }
                                        }}
                                        className="absolute top-2 right-2 p-1 text-gray-500 rounded hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label={`Delete case ${chat.info.id}`}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))
                        )}
                    </nav>
                </div>
            </div>
        </aside>
    );
};
