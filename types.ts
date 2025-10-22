export enum MessageType {
  USER = 'user',
  AI = 'ai',
  ASSISTANT_HELP = 'assistant-help',
  FINAL_REPORT = 'final-report',
  SENSITIVITY_REPORT = 'sensitivity-report',
  ANTIBIOTIC_INFO_REPORT = 'antibiotic-info-report',
  ERROR = 'error',
}

export interface ChatMessage {
  content: string;
  type: MessageType;
  data?: any;
  timestamp: string;
}

export type Role = 'user' | 'model';

export interface UserMessage {
  role: 'user';
  parts: { text: string }[];
}

export interface AIMessage {
  role: 'model';
  parts: { text: string }[];
}

export interface IdentificationPossibility {
  bacteriumName: string;
  possibility: number;
}

export interface FinalReportData {
  identifications: IdentificationPossibility[];
  pathwaySummary: string;
  confirmation: string;
  clinicalInterpretation: string;
}

export interface SensitivityReportData {
  antibioticName: string;
  antibioticFamily: string;
  diameter?: number;
  mic?: string;
  sensitivity: 'Sensitive' | 'Intermediate' | 'Resistant';
  naturalResistance: string;
  correlation: string;
  recommendation: string;
}

export interface AntibioticInfo {
  name: string;
  family: string;
  purpose: string;
  naturalResistance: string;
}

export interface AntibioticInfoReportData {
  bacteriumName: string;
  antibiotics: AntibioticInfo[];
}

export interface AIResponse {
  thought: string;
  responseText: string;
  isFinalReport: boolean;
  finalReport?: FinalReportData;
  isSensitivityReport?: boolean;
  sensitivityReport?: SensitivityReportData;
  isAntibioticInfoReport?: boolean;
  antibioticInfoReport?: AntibioticInfoReportData;
  quickReplies: string[] | null;
}

export interface PrelevementInfo {
  id: string;
  type: string;
  count?: string;
}

export interface ChatSession {
  info: PrelevementInfo;
  messages: ChatMessage[];
  conversationHistory: Array<{ role: Role; parts: { text: string }[] }>;
  isFinished: boolean;
  createdAt: string;
}
