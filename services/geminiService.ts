import { GoogleGenAI } from "@google/genai";
import type { AIResponse } from '../types';
import type { Role } from '../types';
import { systemPromptEN, systemPromptFR, helpSystemPromptEN, helpSystemPromptFR } from './prompts';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemPrompt = (language: 'en' | 'fr'): string => {
    return language === 'fr' ? systemPromptFR : systemPromptEN;
};

const getHelpSystemPrompt = (language: 'en' | 'fr'): string => {
    return language === 'fr' ? helpSystemPromptFR : helpSystemPromptEN;
}

export const getAiResponse = async (conversationHistory: Array<{role: Role, parts: {text: string}[]}>, language: 'en' | 'fr'): Promise<AIResponse> => {
    let rawText = '';
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: conversationHistory,
            config: {
                systemInstruction: getSystemPrompt(language),
                responseMimeType: 'application/json',
            },
        });
        
        rawText = response.text;

        if (!rawText || rawText.trim() === '') {
            console.error("Gemini API returned an empty response.");
            throw new Error("AI returned an empty response.");
        }
        
        // Attempt to extract a valid JSON object from the raw text.
        // This is more robust than just checking for markdown fences.
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace > firstBrace) {
            const jsonString = rawText.substring(firstBrace, lastBrace + 1);
            try {
                const parsedResponse: AIResponse = JSON.parse(jsonString);
                return parsedResponse;
            } catch (jsonParseError) {
                // The extracted string was not valid JSON. Log it and fall through to the fallback.
                 console.warn("Extracted JSON-like string failed to parse. Will return raw text.", {
                    error: jsonParseError,
                    extractedString: jsonString,
                });
            }
        }

        // Fallback for any case where JSON is not found or fails to parse.
        console.warn("Could not find or parse a valid JSON object in the AI response. Returning raw text as a fallback.", {
            rawText: rawText,
        });

        // Return the raw text in a standard response format.
        // This prevents the app from showing a harsh error message to the user.
        return {
            thought: "Fallback due to response format error. The model's response was not valid JSON.",
            responseText: rawText,
            isFinalReport: false,
            isSensitivityReport: false,
            isAntibioticInfoReport: false,
            quickReplies: [],
        };

    } catch (error) {
        // This outer catch will handle API call errors.
        console.error("Error in getAiResponse:", error);
        if (rawText) {
             console.error("Raw text from API on error:", rawText);
        }
        // Re-throw a more generic error for the UI to handle
        throw new Error("Failed to get response from AI.");
    }
};

export const getAiHelp = async (conversationHistory: Array<{role: Role, parts: {text: string}[]}>, query: string, language: 'en' | 'fr'): Promise<string> => {
    const helpConversation = [...conversationHistory, { role: "user" as Role, parts: [{ text: `HELP_QUERY: ${query}` }] }];
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: helpConversation,
            config: {
                systemInstruction: getHelpSystemPrompt(language),
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for help:", error);
        throw new Error("Failed to get help from AI.");
    }
};