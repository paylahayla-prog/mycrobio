import { getStaticKnowledge } from './knowledgeStatic';
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

export const getAiResponse = async (
  conversationHistory: Array<{ role: Role; parts: { text: string }[] }>,
  language: 'en' | 'fr',
  config: ApiConfig,
): Promise<AIResponse> => {
  if (!config?.apiKey) throw new Error('No API key configured. Open API Settings to add one.');
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const response = await ai.models.generateContent({
    model: config.model || 'gemini-2.5-flash',
    contents: conversationHistory,
    config: {
      systemInstruction: getSystemPrompt(language) + "\n\nKNOWLEDGE_STATIC:\n" + getStaticKnowledge(language),
      responseMimeType: 'application/json',
    },
  });
  const rawText = (response as any).text ?? '';
  return extractJsonOrFallback(rawText);
};

export const getAiHelp = async (
  conversationHistory: Array<{ role: Role; parts: { text: string }[] }>,
  query: string,
  language: 'en' | 'fr',
  config: ApiConfig,
): Promise<string> => {
  if (!config?.apiKey) throw new Error('No API key configured. Open API Settings to add one.');
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const helpConversation = [...conversationHistory, { role: 'user' as Role, parts: [{ text: `HELP_QUERY: ${query}` }] }];
  const response = await ai.models.generateContent({
    model: config.model || 'gemini-2.5-flash',
    contents: helpConversation,
    config: { systemInstruction: getHelpSystemPrompt(language) },
  });
  return (response as any).text ?? '';
};


