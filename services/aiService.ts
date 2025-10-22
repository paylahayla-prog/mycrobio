import { GoogleGenAI } from '@google/genai';
import type { AIResponse, Role } from '../types';
import { systemPromptEN, systemPromptFR, helpSystemPromptEN, helpSystemPromptFR } from './prompts';
import type { ApiConfig } from '../contexts/ApiConfigContext';

const getSystemPrompt = (language: 'en' | 'fr'): string => (language === 'fr' ? systemPromptFR : systemPromptEN);
const getHelpSystemPrompt = (language: 'en' | 'fr'): string => (language === 'fr' ? helpSystemPromptFR : helpSystemPromptEN);

const extractJsonOrFallback = (rawText: string): AIResponse => {
  if (!rawText || rawText.trim() === '') {
    throw new Error('AI returned an empty response.');
  }
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonString = rawText.substring(firstBrace, lastBrace + 1);
    try {
      const parsed: AIResponse = JSON.parse(jsonString);
      return parsed;
    } catch {}
  }
  return {
    thought: "Fallback due to response format error. The model's response was not valid JSON.",
    responseText: rawText,
    isFinalReport: false,
    isSensitivityReport: false,
    isAntibioticInfoReport: false,
    quickReplies: [],
  };
};

const toOpenAIMessages = (
  conversationHistory: Array<{ role: Role; parts: { text: string }[] }>,
  language: 'en' | 'fr'
) => {
  const sys = getSystemPrompt(language);
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: sys },
  ];
  for (const item of conversationHistory) {
    const content = item.parts.map((p) => p.text).join('\n');
    if (item.role === 'user') messages.push({ role: 'user', content });
    if (item.role === 'model') messages.push({ role: 'assistant', content });
  }
  return messages;
};

const callGemini = async (
  conversationHistory: Array<{ role: Role; parts: { text: string }[] }>,
  language: 'en' | 'fr',
  apiKey: string,
  model: string,
): Promise<AIResponse> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: model || 'gemini-2.5-flash',
    contents: conversationHistory,
    config: {
      systemInstruction: getSystemPrompt(language),
      responseMimeType: 'application/json',
    },
  });
  const rawText = (response as any).text ?? '';
  return extractJsonOrFallback(rawText);
};

const callOpenAICompatibleViaProxy = async (
  conversationHistory: Array<{ role: Role; parts: { text: string }[] }>,
  language: 'en' | 'fr',
  apiKey: string,
  model: string,
  baseUrl?: string,
): Promise<AIResponse> => {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({
      baseUrl: baseUrl && baseUrl.trim().length > 0 ? baseUrl : undefined,
      model: model || 'gpt-4o-mini',
      messages: toOpenAIMessages(conversationHistory, language),
      temperature: 0.2,
    }),
  });
  if (!resp.ok) {
    const t = await resp.text().catch(() => '');
    throw new Error(`Provider error: ${resp.status} ${t}`);
  }
  const data = await resp.json();
  const content: string = data?.choices?.[0]?.message?.content ?? '';
  return extractJsonOrFallback(content);
};

const callOpenAICompatibleDirect = async (
  conversationHistory: Array<{ role: Role; parts: { text: string }[] }>,
  language: 'en' | 'fr',
  apiKey: string,
  model: string,
  baseUrl?: string,
): Promise<AIResponse> => {
  const urlBase = baseUrl && baseUrl.trim().length > 0 ? baseUrl.replace(/\/$/, '') : 'https://api.openai.com/v1';
  const extraHeaders: Record<string, string> = {};
  try {
    if (urlBase.includes('openrouter.ai')) {
      extraHeaders['Referer'] = (typeof window !== 'undefined' ? window.location.origin : '');
      extraHeaders['X-Title'] = 'MicrobeMap AI';
    }
  } catch {}
  const resp = await fetch(`${urlBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: toOpenAIMessages(conversationHistory, language),
      temperature: 0.2,
    }),
  });
  if (!resp.ok) {
    const t = await resp.text().catch(() => '');
    throw new Error(`Provider error: ${resp.status} ${t}`);
  }
  const data = await resp.json();
  const content: string = data?.choices?.[0]?.message?.content ?? '';
  return extractJsonOrFallback(content);
};

export const getAiResponse = async (
  conversationHistory: Array<{ role: Role; parts: { text: string }[] }>,
  language: 'en' | 'fr',
  config: ApiConfig,
): Promise<AIResponse> => {
  if (!config?.apiKey) throw new Error('No API key configured. Open API Settings to add one.');
  if (config.provider === 'gemini') {
    return await callGemini(conversationHistory, language, config.apiKey, config.model || 'gemini-2.5-flash');
  }
  if (config.directClient) {
    return await callOpenAICompatibleDirect(
      conversationHistory,
      language,
      config.apiKey,
      config.model || 'gpt-4o-mini',
      config.provider === 'openai' ? 'https://api.openai.com/v1' : config.baseUrl,
    );
  }
  return await callOpenAICompatibleViaProxy(
    conversationHistory,
    language,
    config.apiKey,
    config.model || 'gpt-4o-mini',
    config.provider === 'openai' ? 'https://api.openai.com/v1' : config.baseUrl,
  );
};

export const getAiHelp = async (
  conversationHistory: Array<{ role: Role; parts: { text: string }[] }>,
  query: string,
  language: 'en' | 'fr',
  config: ApiConfig,
): Promise<string> => {
  if (!config?.apiKey) throw new Error('No API key configured. Open API Settings to add one.');

  if (config.provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const helpConversation = [...conversationHistory, { role: 'user' as Role, parts: [{ text: `HELP_QUERY: ${query}` }] }];
    const response = await ai.models.generateContent({
      model: config.model || 'gemini-2.5-flash',
      contents: helpConversation,
      config: { systemInstruction: getHelpSystemPrompt(language) },
    });
    return (response as any).text ?? '';
  }

  const messages = [
    { role: 'system', content: getHelpSystemPrompt(language) },
    ...toOpenAIMessages(conversationHistory, language).filter((m) => m.role !== 'system'),
    { role: 'user', content: `HELP_QUERY: ${query}` },
  ];

  if (config.directClient) {
    const urlBase = config.provider === 'openai' ? 'https://api.openai.com/v1' : (config.baseUrl || '').replace(/\/$/, '');
    const extraHeaders: Record<string, string> = {};
    try {
      if ((urlBase || '').includes('openrouter.ai')) {
        extraHeaders['Referer'] = (typeof window !== 'undefined' ? window.location.origin : '');
        extraHeaders['X-Title'] = 'MicrobeMap AI';
      }
    } catch {}

    const resp = await fetch(`${urlBase || 'https://api.openai.com/v1'}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}`, ...extraHeaders },
      body: JSON.stringify({ model: config.model || 'gpt-4o-mini', messages, temperature: 0.2 }),
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => '');
      throw new Error(`Provider error: ${resp.status} ${t}`);
    }
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content ?? '';
  }

  const helpResp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': config.apiKey },
    body: JSON.stringify({ baseUrl: config.provider === 'openai' ? 'https://api.openai.com/v1' : (config.baseUrl || undefined), model: config.model || 'gpt-4o-mini', messages, temperature: 0.2 }),
  });
  if (!helpResp.ok) {
    const t2 = await helpResp.text().catch(() => '');
    throw new Error(`Provider error: ${helpResp.status} ${t2}`);
  }
  const data = await helpResp.json();
  return data?.choices?.[0]?.message?.content ?? '';
};
