import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ProviderType = 'gemini' | 'openai' | 'openai-compatible';

export interface ApiConfig {
  provider: ProviderType;
  apiKey: string;
  model?: string;
  baseUrl?: string; // used for openai-compatible
  directClient?: boolean; // directly call provider from browser
}

interface ApiConfigContextValue {
  config: ApiConfig;
  setConfig: (c: ApiConfig) => void;
}

const DEFAULTS: ApiConfig = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-2.5-flash',
  directClient: false,
};

const STORAGE_KEY = 'microbeMapApiConfig';

const ApiConfigContext = createContext<ApiConfigContextValue | undefined>(undefined);

export const ApiConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<ApiConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {}
  }, [config]);

  const setConfig = (c: ApiConfig) => {
    setConfigState({
      provider: c.provider,
      apiKey: c.apiKey,
      model: c.model || (c.provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'),
      baseUrl: c.baseUrl,
      directClient: !!c.directClient,
    });
  };

  const value = useMemo(() => ({ config, setConfig }), [config]);

  return <ApiConfigContext.Provider value={value}>{children}</ApiConfigContext.Provider>;
};

export const useApiConfig = () => {
  const ctx = useContext(ApiConfigContext);
  if (!ctx) throw new Error('useApiConfig must be used within ApiConfigProvider');
  return ctx;
};
