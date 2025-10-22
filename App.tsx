import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { InputArea } from './components/InputArea';
import { getAiResponse, getAiHelp } from './services/aiService';
import type { ChatSession, Role, PrelevementInfo, ChatMessage } from './types';
import { MessageType } from './types';
import { NewChatForm } from './components/NewChatForm';
import { HistorySidebar } from './components/HistorySidebar';
import { useLanguage } from './contexts/LanguageContext';
import { useApiConfig } from './contexts/ApiConfigContext';

const App: React.FC = () => {
  const { language } = useLanguage();
  const { config } = useApiConfig();

  const [chats, setChats] = useState<Record<string, ChatSession>>(() => {
    try {
      const savedChats = localStorage.getItem('microbeMapChats');
      return savedChats ? JSON.parse(savedChats) : {};
    } catch (error) {
      return {};
    }
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const savedId = localStorage.getItem('microbeMapActiveChatId');
    return savedId || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const activeChat = activeChatId ? chats[activeChatId] : null;

  useEffect(() => {
    try {
      localStorage.setItem('microbeMapChats', JSON.stringify(chats));
      if (activeChatId) {
        localStorage.setItem('microbeMapActiveChatId', activeChatId);
      } else {
        localStorage.removeItem('microbeMapActiveChatId');
      }
    } catch (error) {
      console.error('Failed to save chats to localStorage:', error);
    }
  }, [chats, activeChatId]);

  const updateActiveChat = (updater: (chat: ChatSession) => ChatSession) => {
    if (!activeChatId) return;
    setChats((prev) => ({
      ...prev,
      [activeChatId]: updater(prev[activeChatId]),
    }));
  };

  const handleStartChat = useCallback(
    async (info: PrelevementInfo) => {
      if (chats[info.id]) {
        alert('A case with this Prelevement ID already exists.');
        return;
      }
      setIsLoading(true);
      setQuickReplies([]);

      const initialMessageContent = `Start identification for Prelevement ID: ${info.id}, Type: ${info.type}${info.count ? `, Colony Count: ${info.count}` : ''}.`;

      const newChat: ChatSession = {
        info,
        messages: [],
        conversationHistory: [{ role: 'user', parts: [{ text: initialMessageContent }] }],
        isFinished: false,
        createdAt: new Date().toISOString(),
      };

      setChats((prev) => ({ ...prev, [info.id]: newChat }));
      setActiveChatId(info.id);
      if (!isSidebarOpen) setIsSidebarOpen(true);

      try {
        const response = await getAiResponse(newChat.conversationHistory, language, config);
        const aiTimestamp = new Date().toISOString();

        const updatedChat: ChatSession = {
          ...newChat,
          messages: [{ content: response.responseText, type: MessageType.AI, timestamp: aiTimestamp }],
          conversationHistory: [...newChat.conversationHistory, { role: 'model', parts: [{ text: JSON.stringify(response) }] }],
        };

        setChats((prev) => ({ ...prev, [info.id]: updatedChat }));
        setQuickReplies(response.quickReplies || []);
      } catch (error) {
        console.error('Failed to get initial AI response:', error);
        const errorTimestamp = new Date().toISOString();
        const errorChat: ChatSession = {
          ...newChat,
          messages: [{ content: 'Error: Could not start the session.', type: MessageType.ERROR, timestamp: errorTimestamp }],
          conversationHistory: newChat.conversationHistory,
          isFinished: newChat.isFinished,
          createdAt: newChat.createdAt,
        };
        setChats((prev) => ({ ...prev, [info.id]: errorChat }));
      } finally {
        setIsLoading(false);
      }
    },
    [chats, isSidebarOpen, language, config]
  );

  const handleSendMessage = useCallback(
    async (textInput: string) => {
      if (!textInput || isLoading || !activeChat) return;

      const newUserMessage: ChatMessage = {
        content: textInput,
        type: MessageType.USER,
        timestamp: new Date().toISOString(),
      };
      updateActiveChat((chat) => ({ ...chat, messages: [...chat.messages, newUserMessage] }));

      if (textInput.toLowerCase().startsWith('/ai ')) {
        const query = textInput.substring(4).trim();
        setIsLoading(true);
        try {
          const helpText = await getAiHelp(activeChat.conversationHistory, query, language, config);
          const helpTimestamp = new Date().toISOString();
          updateActiveChat((chat) => ({
            ...chat,
            messages: [...chat.messages, { content: helpText, type: MessageType.ASSISTANT_HELP, timestamp: helpTimestamp }],
          }));
        } catch (error) {
          console.error('Failed to get AI help:', error);
          const errorTimestamp = new Date().toISOString();
          updateActiveChat((chat) => ({
            ...chat,
            messages: [...chat.messages, { content: 'Failed to get help from AI.', type: MessageType.ERROR, timestamp: errorTimestamp }],
          }));
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Regular chat flow
      const userMessage = { role: 'user' as Role, parts: [{ text: textInput }] };
      const updatedHistory = [...activeChat.conversationHistory, userMessage];
      updateActiveChat((chat) => ({ ...chat, conversationHistory: updatedHistory }));

      try {
        const response = await getAiResponse(updatedHistory, language, config);
        const aiTimestamp = new Date().toISOString();

        updateActiveChat((chat) => ({
          ...chat,
          conversationHistory: [...updatedHistory, { role: 'model', parts: [{ text: JSON.stringify(response) }] }],
          messages: [
            ...chat.messages,
            ...(response.isFinalReport
              ? [
                  { content: response.responseText, type: MessageType.AI, timestamp: aiTimestamp },
                  { content: 'Final Report', type: MessageType.FINAL_REPORT, data: response.finalReport, timestamp: aiTimestamp },
                ]
              : []),
            ...(response.isSensitivityReport
              ? [
                  ...(response.sensitivityReport
                    ? [
                        { content: 'Sensitivity Report', type: MessageType.SENSITIVITY_REPORT, data: response.sensitivityReport, timestamp: aiTimestamp },
                      ]
                    : []),
                  { content: response.responseText, type: MessageType.AI, timestamp: aiTimestamp },
                ]
              : []),
            ...(response.isAntibioticInfoReport
              ? [
                  { content: response.responseText, type: MessageType.AI, timestamp: aiTimestamp },
                  { content: 'Antibiotic Info', type: MessageType.ANTIBIOTIC_INFO_REPORT, data: response.antibioticInfoReport, timestamp: aiTimestamp },
                ]
              : []),
            ...(!response.isFinalReport && !response.isSensitivityReport && !response.isAntibioticInfoReport
              ? [{ content: response.responseText, type: MessageType.AI, timestamp: aiTimestamp }]
              : []),
          ],
        }));

        setQuickReplies(response.quickReplies || []);
      } catch (error) {
        console.error('Failed to process user input:', error);
        const errorTimestamp = new Date().toISOString();
        updateActiveChat((chat) => ({
          ...chat,
          messages: [
            ...chat.messages,
            {
              content: "There was an issue interpreting the AI's response. Please try again.",
              type: MessageType.ERROR,
              timestamp: errorTimestamp,
            },
          ],
          conversationHistory: activeChat.conversationHistory, // Revert history on error
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, activeChat, language, config]
  );

  const handleNewChat = () => setActiveChatId(null);
  const handleSelectChat = (id: string) => setActiveChatId(id);
  const handleDeleteChat = (id: string) => {
    const sortedChatIds = Object.values(chats)
      .sort((a: ChatSession, b: ChatSession) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((c: ChatSession) => c.info.id);
    const deletedIndex = sortedChatIds.indexOf(id);

    setChats((prev) => {
      const newChats = { ...prev };
      delete newChats[id];
      return newChats;
    });

    if (activeChatId === id) {
      const remainingIds = sortedChatIds.filter((chatId) => chatId !== id);
      if (remainingIds.length > 0) {
        const newIndex = Math.min(deletedIndex, remainingIds.length - 1);
        setActiveChatId(remainingIds[newIndex]);
      } else {
        setActiveChatId(null);
      }
    }
  };

  return (
    <div className="text-gray-300 flex items-center justify-center h-screen bg-[#0d1117]">
      <div className="w-full h-full max-w-6xl mx-auto flex bg-[#0d1117] border border-[#30363d] rounded-lg shadow-2xl overflow-hidden">
        <HistorySidebar
          isSidebarOpen={isSidebarOpen}
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
        />
        <div className="flex-1 flex flex-col h-full min-w-0">
          <Header
            info={activeChat?.info}
            isFinished={activeChat?.isFinished}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />
          {!activeChat ? (
            <NewChatForm onStart={handleStartChat} />
          ) : (
            <>
              <ChatWindow messages={activeChat.messages} isLoading={isLoading} />
              <InputArea onSendMessage={handleSendMessage} quickReplies={quickReplies} isDisabled={isLoading || activeChat.isFinished} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
