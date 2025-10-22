import { KnowledgeModal } from './KnowledgeModal';
import React, { useState } from 'react';
import type { PrelevementInfo } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ApiConfigModal } from './ApiConfigModal';
interface HeaderProps {
    info?: PrelevementInfo;
    isFinished?: boolean;
    onToggleSidebar: () => void;
}

const FileCodeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="m10 13-1.5 2 1.5 2"></path>
        <path d="m14 13 1.5 2-1.5 2"></path>
    </svg>
);

const MenuIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const toggleLanguage = () => setLanguage(language === 'en' ? 'fr' : 'en');
    return (
        <button
            onClick={toggleLanguage}
            className="text-xs font-bold bg-[#21262d] border border-[#30363d] text-gray-300 py-1 px-3 rounded-md hover:bg-[#30363d] transition-colors"
            aria-label="Switch language"
        >
            {language.toUpperCase()}
        </button>
    );
};

export const Header: React.FC<HeaderProps> = ({ info, isFinished, onToggleSidebar }) => {
    const { t } = useLanguage();
    const [showApi, setShowApi] = useState(false);
    const [showKb, setShowKb] = useState(false);
    return (
        <header className="bg-[#161b22] p-4 rounded-t-lg flex items-center gap-4 border-b border-[#30363d] flex-shrink-0">
            <button
                onClick={onToggleSidebar}
                className="p-1 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Toggle sidebar"
            >
                <MenuIcon />
            </button>
            <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <FileCodeIcon />
            </div>
            <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white truncate">{t('header.title')}</h1>
                {info ? (
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-gray-400 truncate">
                            {t('header.caseId')}: <span className="font-semibold text-gray-300">{info.id}</span> | {t('header.type')}: <span className="font-semibold text-gray-300">{info.type}</span>
                        </p>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${isFinished ? 'bg-green-500/20 text-green-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                            <span className={`w-2 h-2 rounded-full ${isFinished ? 'bg-green-400' : 'bg-cyan-400'}`}></span>
                            {isFinished ? t('header.statusCompleted') : t('header.statusInProgress')}
                        </span>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">{t('header.ready')}</p>
                )}
            </div>
            <button onClick={() => setShowKb(true)} className="text-xs font-bold bg-[#21262d] border border-[#30363d] text-gray-300 py-1 px-3 rounded-md hover:bg-[#30363d] transition-colors">KB</button>
            <button onClick={() => setShowApi(true)} className="text-xs font-bold bg-[#21262d] border border-[#30363d] text-gray-300 py-1 px-3 rounded-md hover:bg-[#30363d] transition-colors">API</button>
            <LanguageSwitcher />
            <ApiConfigModal isOpen={showApi} onClose={() => setShowApi(false)} />
            <KnowledgeModal isOpen={showKb} onClose={() => setShowKb(false)} />
        </header>
    );
};

