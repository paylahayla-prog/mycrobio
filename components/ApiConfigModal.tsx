import React, { useEffect, useState } from 'react';
import { useApiConfig } from '../contexts/ApiConfigContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { config, setConfig } = useApiConfig();
  const [apiKey, setApiKey] = useState<string>(config.apiKey);
  const [model, setModel] = useState<string>(config.model || 'gemini-2.5-flash');
  const [reportDetail, setReportDetail] = useState<'normal' | 'more'>(config.reportDetail || 'more');

  useEffect(() => {
    if (isOpen) {
      setApiKey(config.apiKey);
      setModel(config.model || 'gemini-2.5-flash');
      setReportDetail((config.reportDetail === 'normal' || config.reportDetail === 'more') ? config.reportDetail : 'more');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onSave = () => {
    setConfig({ apiKey, model, reportDetail });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Gemini API Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Gemini API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Gemini API key"
              className="w-full bg-[#0d1117] border border-[#30363d] text-gray-200 rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Model (optional)</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gemini-2.5-flash"
              className="w-full bg-[#0d1117] border border-[#30363d] text-gray-200 rounded p-2"
            />
          </div>

          <div className="mt-2 p-2 border border-[#30363d] rounded bg-[#0d1117]">
            <label className="flex items-start gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={reportDetail === 'more'}
                onChange={(e) => setReportDetail(e.target.checked ? 'more' : 'normal')}
                className="mt-0.5"
              />
              <span>
                More detailed reporting (expanded pathway evidence, clinical interpretation, and antibiogram correlation).
              </span>
            </label>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] rounded p-3 text-xs text-gray-400">
            <p>Keys are stored locally in your browser (localStorage) and used only from your device.</p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-[#21262d] border border-[#30363d] text-gray-300">Cancel</button>
          <button onClick={onSave} className="px-3 py-1.5 rounded bg-cyan-600 text-white">Save</button>
        </div>
      </div>
    </div>
  );
};
