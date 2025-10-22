
import React, { useState } from 'react';
import type { ChatMessage, FinalReportData, SensitivityReportData, AntibioticInfoReportData } from '../types';
import { MessageType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// --- ICONS ---
const LightbulbIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 w-5 h-5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> );
const UserIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> );
const AIIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m10 13-1.5 2 1.5 2"></path><path d="m14 13 1.5 2-1.5 2"></path></svg> );
const PathwayIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M2 12h2"/><path d="M20 12h2"/><path d="M12 2v2"/><path d="M12 20v2"/><circle cx="12" cy="12" r="2"/><path d="M12 8a2 2 0 0 0-2 2h4a2 2 0 0 0-2-2Z"/><path d="M8.5 15.5a2 2 0 0 0-2 2h4a2 2 0 0 0-2-2Z"/><path d="m14.2 3.8 1.4 1.4"/><path d="m3.8 18.8 1.4 1.4"/><path d="M18.8 3.8 17.4 5.2"/><path d="M5.2 17.4 3.8 18.8"/><path d="m14.2 20.2 1.4-1.4"/><path d="m3.8 5.2 1.4-1.4"/><path d="M18.8 20.2 17.4 18.8"/><path d="m5.2 6.6 1.4 1.4"/></svg> );
const ConfirmationIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"></path><path d="m9 12 2 2 4-4"></path></svg> );
const CopyIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> );
const CheckIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> );

// --- HELPERS ---
const formatText = (text: string) => {
    if (!text) return { __html: '' };
    const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/^- (.*$)/gm, '<ul class="list-outside"><li class="ml-4 list-disc">$1</li></ul>').replace(/<\/ul>\s*<ul>/g, '').replace(/(\r\n|\n|\r)/g, '<br>');
    return { __html: formatted };
};

// --- REPORT COMPONENTS ---
const FinalReport: React.FC<{ data: FinalReportData }> = ({ data }) => {
    const { t } = useLanguage();
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        const reportText = `
${t('message.finalReportTitle')}
---------------------------
${t('message.identification')}(s):
${data.identifications.map(id => `- ${id.bacteriumName} (${id.possibility}%)`).join('\n')}

${t('message.pathway')} Summary:
${data.pathwaySummary}

${t('message.confirmation')}:
${data.confirmation}

${t('message.clinicalInterpretation')}:
${data.clinicalInterpretation}
`;
        navigator.clipboard.writeText(reportText.trim()).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    
    return (
    <div className="bg-[#161b22] p-4 rounded-lg shadow-md border border-cyan-500 w-full">
        <div className="flex justify-between items-center mb-3 border-b border-[#30363d] pb-2">
            <h2 className="text-lg font-bold text-cyan-300">{t('message.finalReportTitle')}</h2>
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-md transition-colors bg-[#21262d] text-gray-300 hover:bg-[#30363d] border border-[#30363d]"
                aria-label="Copy report to clipboard"
            >
                {isCopied ? <CheckIcon /> : <CopyIcon />}
                {isCopied ? t('message.copied') : t('message.copy')}
            </button>
        </div>
        <div className="space-y-4">
            <div>
                <span className="font-semibold text-cyan-400 self-start pt-1">🆔 {t('message.identification')}:</span>
                <div className="mt-1">
                    {data.identifications && data.identifications.map((id, index) => (
                        <div key={index} className={`flex items-center gap-3 ${index < data.identifications.length - 1 ? 'mb-2' : ''}`}>
                            <span className="font-bold text-lg text-white">{id.bacteriumName}</span>
                            <span className="text-sm font-semibold bg-cyan-800 text-cyan-200 px-2 py-0.5 rounded-full">{id.possibility}%</span>
                        </div>
                    ))}
                </div>
            </div>
             <div className="flex items-start gap-3"><PathwayIcon /><div className="flex-1"><span className="font-semibold text-cyan-400">{t('message.pathway')}</span><div className="text-sm mt-1" dangerouslySetInnerHTML={formatText(data.pathwaySummary || '')} /></div></div>
             <div className="flex items-start gap-3"><ConfirmationIcon /><div className="flex-1"><span className="font-semibold text-cyan-400">{t('message.confirmation')}</span><div className="text-sm text-gray-300 mt-1" dangerouslySetInnerHTML={formatText(data.confirmation || "Confirm with a commercial biochemical panel (e.g., API, VITEK).")} /></div></div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-yellow-500/30">
                 <div className="flex items-center gap-3 mb-2">
                    <LightbulbIcon />
                    <h3 className="font-bold text-md text-yellow-300">{t('message.clinicalInterpretation')}</h3>
                </div>
                <div className="text-gray-300 pl-8 text-sm" dangerouslySetInnerHTML={formatText(data.clinicalInterpretation || '')} />
            </div>
        </div>
    </div>
)};


const SensitivityReport: React.FC<{ data: SensitivityReportData }> = ({ data }) => {
    const { t } = useLanguage();
    const getSensitivityClass = (sensitivity: string) => {
        switch (sensitivity?.toLowerCase()) {
            case 'resistant': return 'bg-red-500 text-white';
            case 'intermediate': return 'bg-yellow-500 text-gray-900';
            case 'sensitive': return 'bg-green-500 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };
    return ( <div className="bg-[#161b22] p-4 rounded-lg shadow-md border border-green-500 w-full"><h2 className="text-lg font-bold mb-3 border-b border-[#30363d] pb-2 text-green-300">{t('message.sensitivityReportTitle')}</h2><div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-start text-sm"><span className="font-semibold text-green-400">💊 {t('message.antibiotic')}:</span><span className="text-white">{data.antibioticName} ({data.antibioticFamily})</span><span className="font-semibold text-green-400">📏 {t('message.input')}:</span><span className="text-white">{data.diameter !== undefined ? `${data.diameter} mm` : data.mic !== undefined ? `${data.mic} mg/L` : 'Qualitative'}</span><span className="font-semibold text-green-400">🎯 {t('message.sensitivity')}:</span><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getSensitivityClass(data.sensitivity)}`}>{data.sensitivity}</span><span className="font-semibold text-green-400 align-top">🧬 {t('message.naturalResistance')}:</span><div className="text-gray-300" dangerouslySetInnerHTML={formatText(data.naturalResistance)} /><span className="font-semibold text-green-400 align-top">🔄 {t('message.correlation')}:</span><div className="text-gray-300" dangerouslySetInnerHTML={formatText(data.correlation)} /><span className="font-semibold text-green-400 align-top">✍️ {t('message.recommendation')}:</span><div className="text-gray-300" dangerouslySetInnerHTML={formatText(data.recommendation)} /></div></div> );
};

const AntibioticInfoReport: React.FC<{ data: AntibioticInfoReportData }> = ({ data }) => {
    const { t } = useLanguage();
    return ( <div className="bg-[#161b22] p-4 rounded-lg shadow-md border border-indigo-500 w-full"><h2 className="text-lg font-bold mb-3 border-b border-[#30363d] pb-2 text-indigo-300">{t('message.antibioticInfoTitle')} <em className="text-white">{data.bacteriumName}</em></h2><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-[#21262d] text-xs text-gray-300 uppercase"><tr><th scope="col" className="px-4 py-2">{t('message.antibioticInfo.antibiotic')}</th><th scope="col" className="px-4 py-2">{t('message.antibioticInfo.family')}</th><th scope="col" className="px-4 py-2">{t('message.antibioticInfo.purpose')}</th><th scope="col" className="px-4 py-2">{t('message.antibioticInfo.naturalResistance')}</th></tr></thead><tbody>{data.antibiotics.map((ab, index) => ( <tr key={index} className="border-b border-[#30363d]"><td className="px-4 py-2 font-medium text-white">{ab.name}</td><td className="px-4 py-2 text-gray-400">{ab.family}</td><td className="px-4 py-2 text-gray-400">{ab.purpose}</td><td className="px-4 py-2 font-semibold text-gray-300">{ab.naturalResistance}</td></tr> ))}</tbody></table></div></div> );
}

// --- MAIN MESSAGE COMPONENT ---
export const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const { t } = useLanguage();
    const isUser = message.type === MessageType.USER;
    const isReport = [MessageType.FINAL_REPORT, MessageType.SENSITIVITY_REPORT, MessageType.ANTIBIOTIC_INFO_REPORT].includes(message.type);

    const getMessageStyle = () => {
        switch (message.type) {
            case MessageType.USER: return 'bg-blue-600 text-white';
            case MessageType.AI: return 'bg-[#161b22] border border-[#30363d]';
            case MessageType.ASSISTANT_HELP: return 'bg-[#1c2128] border border-[#444c56] border-l-4 border-l-purple-500';
            case MessageType.ERROR: return 'bg-[#2e2418] border border-[#78552b] text-yellow-300';
            default: return 'bg-gray-700';
        }
    };
    
    const renderContent = () => {
        switch (message.type) {
            case MessageType.FINAL_REPORT: return <FinalReport data={message.data} />;
            case MessageType.SENSITIVITY_REPORT: return <SensitivityReport data={message.data} />;
            case MessageType.ANTIBIOTIC_INFO_REPORT: return <AntibioticInfoReport data={message.data} />;
            case MessageType.ASSISTANT_HELP: return <div className="p-3" dangerouslySetInnerHTML={formatText(`<strong>${t('message.aiAssistant')}:</strong><br>${message.content}`)} />;
            default: return <div className="p-3" dangerouslySetInnerHTML={formatText(message.content)} />;
        }
    };

    if (isReport) {
        return <div className="w-full">{renderContent()}</div>;
    }

    const formatTimestamp = (isoString: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`group relative flex items-start gap-3 w-full ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isUser ? 'bg-blue-600' : 'bg-[#21262d] border border-[#30363d]'}`}>
                {isUser ? <UserIcon /> : <AIIcon />}
            </div>
            <div className="flex-1 max-w-[85%] sm:max-w-md">
                <div className={`relative rounded-lg shadow-md ${getMessageStyle()}`}>
                    {renderContent()}
                </div>
            </div>
            <div className="absolute -bottom-5 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                style={isUser ? { right: '2.75rem' } : { left: '2.75rem' }}>
                 {formatTimestamp(message.timestamp)}
            </div>
        </div>
    );
};
