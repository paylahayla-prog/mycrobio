import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface ApiConfig {
  apiKey: string;
  model?: string;
  reportDetail?: 'normal' | 'more';
}

interface ApiConfigContextValue {
  config: ApiConfig;
  setConfig: (c: ApiConfig) => void;
}

const DEFAULTS: ApiConfig = {
  apiKey: '',
  model: 'gemini-2.5-flash',
  reportDetail: 'more',
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
      apiKey: c.apiKey,
      model: c.model || 'gemini-2.5-flash',
      reportDetail: (c.reportDetail === 'normal' || c.reportDetail === 'more') ? c.reportDetail : 'more',
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

