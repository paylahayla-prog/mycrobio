import React, { useEffect, useMemo, useState } from 'react';
import { useApiConfig, ProviderType } from '../contexts/ApiConfigContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Preset = {
  id: string;
  label: string;
  baseUrl: string;
  modelHint: string;
};

const OPENAI_COMPAT_PRESETS: Preset[] = [
  { id: 'openai', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', modelHint: 'gpt-4o-mini' },
  { id: 'openrouter', label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', modelHint: 'openrouter/auto' },
  { id: 'groq', label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', modelHint: 'llama-3.1-70b-versatile' },
  { id: 'together', label: 'Together AI', baseUrl: 'https://api.together.xyz/v1', modelHint: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo' },
  { id: 'mistral', label: 'Mistral', baseUrl: 'https://api.mistral.ai/v1', modelHint: 'open-mixtral-8x7b' },
  { id: 'fireworks', label: 'Fireworks', baseUrl: 'https://api.fireworks.ai/inference/v1', modelHint: 'accounts/fireworks/models/llama-v3p1-70b-instruct' },
  { id: 'perplexity', label: 'Perplexity', baseUrl: 'https://api.perplexity.ai', modelHint: 'sonar' },
  { id: 'deepseek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com', modelHint: 'deepseek-chat' },
];

export const ApiConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { config, setConfig } = useApiConfig();
  const [provider, setProvider] = useState<ProviderType>(config.provider);
  const [apiKey, setApiKey] = useState<string>(config.apiKey);
  const [model, setModel] = useState<string>(config.model || '');
  const [baseUrl, setBaseUrl] = useState<string>(config.baseUrl || '');
  const [directClient, setDirectClient] = useState<boolean>(!!config.directClient);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setProvider(config.provider);
      setApiKey(config.apiKey);
      setModel(config.model || '');
      setBaseUrl(config.baseUrl || '');
      setDirectClient(!!config.directClient);
      setSelectedPreset('');
    }
  }, [isOpen]);

  const isOpenAIStyle = provider !== 'gemini';

  const currentModelPlaceholder = useMemo(() => {
    if (provider === 'gemini') return 'gemini-2.5-flash';
    const preset = OPENAI_COMPAT_PRESETS.find((p) => p.id === selectedPreset);
    return preset?.modelHint || 'gpt-4o-mini';
  }, [provider, selectedPreset]);

  if (!isOpen) return null;

  const applyPreset = (preset: Preset) => {
    setSelectedPreset(preset.id);
    setBaseUrl(preset.baseUrl);
    if (!model) setModel(preset.modelHint);
  };

  const onSave = () => {
    setConfig({ provider, apiKey, model, baseUrl, directClient });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">API Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ProviderType)}
              className="w-full bg-[#0d1117] border border-[#30363d] text-gray-200 rounded p-2"
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="openai-compatible">OpenAI-compatible (custom base URL)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key"
              className="w-full bg-[#0d1117] border border-[#30363d] text-gray-200 rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={currentModelPlaceholder}
              className="w-full bg-[#0d1117] border border-[#30363d] text-gray-200 rounded p-2"
            />
          </div>

          {isOpenAIStyle && (
            <>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Base URL (OpenAI-compatible)</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={provider === 'openai' ? 'https://api.openai.com/v1 (default)' : 'https://api.yourprovider.com/v1'}
                  className="w-full bg-[#0d1117] border border-[#30363d] text-gray-200 rounded p-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-gray-300">Quick Presets</label>
                  <span className="text-xs text-gray-500">Fills Base URL and model hint</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {OPENAI_COMPAT_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`px-2 py-1 rounded text-xs border ${selectedPreset === p.id ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-[#0d1117] text-gray-200 border-[#30363d] hover:border-gray-500'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2 p-2 border border-[#30363d] rounded bg-[#0d1117]">
                <label className="flex items-start gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={directClient} onChange={(e) => setDirectClient(e.target.checked)} className="mt-0.5" />
                  <span>
                    Direct client mode (browser). Calls the provider from your browser instead of the built-in proxy. This exposes your API key and may be blocked by CORS unless the provider explicitly supports browser use (e.g., OpenRouter browser keys, Cohere client tokens).
                  </span>
                </label>
              </div>
            </>
          )}

          <div className="bg-[#0d1117] border border-[#30363d] rounded p-3 text-xs text-gray-400">
            <p>Keys are stored locally in your browser (localStorage) and used only from your device. Do not use secrets you cannot expose client-side.</p>
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



