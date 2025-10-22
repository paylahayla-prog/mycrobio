import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getStaticKnowledge } from '../services/knowledgeStatic';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  if (!isOpen) return null;
  const knowledge = getStaticKnowledge(language);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl max-h-[80vh] overflow-hidden bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-[#30363d]">
          <h2 className="text-lg font-semibold text-white">Knowledge Preview ({language.toUpperCase()})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
          <pre className="whitespace-pre-wrap text-sm text-gray-200">{knowledge}</pre>
        </div>
        <div className="p-3 border-t border-[#30363d] text-xs text-gray-400">
          Edit knowledge/en.json or knowledge/fr.json to update this content.
        </div>
      </div>
    </div>
  );
};
