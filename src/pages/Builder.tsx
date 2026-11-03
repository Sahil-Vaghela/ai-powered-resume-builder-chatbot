import React, { useState, useEffect, useRef } from 'react';
import { ProgressSidebar } from '../components/ProgressSidebar';
import { ChatInterface } from '../components/ChatInterface';
import { ResumePreview } from '../components/ResumePreview';
import { TemplateSelector } from '../components/TemplateSelector';
import { ResumeEditor } from '../components/ResumeEditor';
import {
  ResumeData,
  INITIAL_RESUME_DATA,
} from '../engine/resumeEngine';
import {
  ChatMessage,
  getInitialQuestionId,
  processAnswer,
} from '../engine/conversationEngine';
import {
  getQuestionById,
  formatQuestionPrompt,
  QuestionDef,
} from '../engine/questionEngine';
import {
  ChatSession,
  ChatHistoryStore,
  loadChatHistory,
  saveChatHistory,
  getActiveChat,
  createNewChatSession,
  renameChatInStore,
  deleteChatFromStore,
  generateChatTitle,
  getStoredUsername,
  saveStoredUsername,
  clearAllLocalData,
} from '../engine/storageEngine';
import { UsernameWelcome } from '../components/UsernameWelcome';
import sectionsData from '../data/resume-sections.json';
import chatbotResponses from '../data/chatbot-responses.json';
import { X } from 'lucide-react';

interface BuilderProps {
  onBackToHome?: () => void;
  initialResumeData?: ResumeData;
}

export const Builder: React.FC<BuilderProps> = ({ initialResumeData }) => {
  // 1. Chat History Store State
  const [chatStore, setChatStore] = useState<ChatHistoryStore>(() => {
    const loaded = loadChatHistory();
    if (initialResumeData && loaded.chats.length > 0) {
      // If sample data was explicitly passed, apply to active chat
      const active = getActiveChat(loaded);
      if (active) {
        active.resumeData = initialResumeData;
      }
    }
    return loaded;
  });

  // Current active chat session reference
  const activeChat = getActiveChat(chatStore);

  // 2. Active Chat's Local States
  const [resume, setResume] = useState<ResumeData>(() => {
    return activeChat ? activeChat.resumeData : INITIAL_RESUME_DATA;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return activeChat ? activeChat.messages : [];
  });

  const [currentQuestionId, setCurrentQuestionId] = useState<string>(() => {
    return activeChat?.conversationState?.currentQuestionId || getInitialQuestionId();
  });

  const [currentRecord, setCurrentRecord] = useState<any>(() => {
    return activeChat?.conversationState?.currentRecord || {};
  });

  const [questionHistory, setQuestionHistory] = useState<string[]>(() => {
    return activeChat?.conversationState?.questionHistory || [];
  });

  // Has started chat state: whether welcome screen or active chat is showing
  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    if (!activeChat) return false;
    const hasUserMsg = activeChat.messages.some((m) => m.sender === 'user');
    const hasName = Boolean(activeChat.resumeData?.personal?.fullName);
    return hasUserMsg || hasName;
  });

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);

  // Open Access Username State
  const [username, setUsername] = useState<string | null>(() => getStoredUsername());

  const handleUsernameComplete = (newUsername: string) => {
    saveStoredUsername(newUsername);
    setUsername(newUsername);
  };

  const handleChangeUsername = (newName: string) => {
    saveStoredUsername(newName);
    setUsername(newName);
  };

  const handleClearLocalData = () => {
    clearAllLocalData();
    const freshChat = createNewChatSession();
    const freshStore: ChatHistoryStore = {
      chats: [freshChat],
      activeChatId: freshChat.id,
    };
    saveChatHistory(freshStore);
    setChatStore(freshStore);
    setResume(freshChat.resumeData);
    setMessages(freshChat.messages);
    setCurrentQuestionId(freshChat.conversationState.currentQuestionId);
    setCurrentRecord({});
    setQuestionHistory([]);
    setHasStarted(false);
    setShowResumeModal(false);
    setShowTemplatesModal(false);
    setShowEditorModal(false);
    setUsername(null);
  };

  // Keep a ref to activeChat to avoid stale closures in effects
  const activeChatIdRef = useRef<string | null>(chatStore.activeChatId);
  useEffect(() => {
    activeChatIdRef.current = chatStore.activeChatId;
  }, [chatStore.activeChatId]);

  // Sync active chat's state into the ChatHistoryStore and LocalStorage
  const persistCurrentChatState = (
    updatedResume: ResumeData,
    updatedMessages: ChatMessage[],
    updatedQuestionId: string,
    updatedRecord: any,
    updatedHistory: string[],
    newTitle?: string
  ) => {
    if (!activeChatIdRef.current) return;

    setChatStore((prevStore) => {
      const updatedChats = prevStore.chats.map((c) => {
        if (c.id === activeChatIdRef.current) {
          const now = new Date().toISOString();
          return {
            ...c,
            title: newTitle || c.title,
            updatedAt: now,
            messages: updatedMessages,
            resumeData: updatedResume,
            conversationState: {
              currentQuestionId: updatedQuestionId,
              currentRecord: updatedRecord,
              questionHistory: updatedHistory,
            },
          };
        }
        return c;
      });

      // Sort by updatedAt descending
      updatedChats.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      const newStore = { ...prevStore, chats: updatedChats };
      saveChatHistory(newStore);
      return newStore;
    });
  };

  const currentQuestionRaw = getQuestionById(currentQuestionId) || getQuestionById('full_name')!;
  const activeQuestionPrompt = formatQuestionPrompt(currentQuestionRaw, resume, currentRecord);
  const currentQuestion: QuestionDef = {
    ...currentQuestionRaw,
    question: activeQuestionPrompt,
  };

  const hasResumeData = Boolean(
    resume.personal?.fullName ||
    resume.career?.summary ||
    resume.education?.length > 0 ||
    resume.experience?.length > 0
  );

  // Switch to an existing chat session
  const handleSelectChatSession = (chatId: string) => {
    if (chatId === chatStore.activeChatId) {
      setShowResumeModal(false);
      return;
    }

    const targetChat = chatStore.chats.find((c) => c.id === chatId);
    if (!targetChat) return;

    // First save current chat
    persistCurrentChatState(
      resume,
      messages,
      currentQuestionId,
      currentRecord,
      questionHistory
    );

    // Switch active chat in store
    const updatedStore: ChatHistoryStore = {
      ...chatStore,
      activeChatId: chatId,
    };
    saveChatHistory(updatedStore);
    setChatStore(updatedStore);

    // Load target chat into active state
    setResume(targetChat.resumeData || INITIAL_RESUME_DATA);
    setMessages(targetChat.messages || []);
    setCurrentQuestionId(targetChat.conversationState?.currentQuestionId || getInitialQuestionId());
    setCurrentRecord(targetChat.conversationState?.currentRecord || {});
    setQuestionHistory(targetChat.conversationState?.questionHistory || []);

    const hasUserMsg = (targetChat.messages || []).some((m) => m.sender === 'user');
    const hasName = Boolean(targetChat.resumeData?.personal?.fullName);
    setHasStarted(hasUserMsg || hasName);
    setShowResumeModal(false);
  };

  // Create a brand new chat session
  const handleStartNewResume = () => {
    // Save current chat state first
    if (activeChatIdRef.current) {
      persistCurrentChatState(
        resume,
        messages,
        currentQuestionId,
        currentRecord,
        questionHistory
      );
    }

    const newChat = createNewChatSession();
    const updatedStore: ChatHistoryStore = {
      chats: [newChat, ...chatStore.chats],
      activeChatId: newChat.id,
    };
    saveChatHistory(updatedStore);
    setChatStore(updatedStore);

    // Reset local view state for fresh chat
    setResume(newChat.resumeData);
    setMessages(newChat.messages);
    setCurrentQuestionId(newChat.conversationState.currentQuestionId);
    setCurrentRecord(newChat.conversationState.currentRecord);
    setQuestionHistory([]);
    setHasStarted(false);
    setShowResumeModal(false);
  };

  // Rename a chat
  const handleRenameChat = (chatId: string, newTitle: string) => {
    const updated = renameChatInStore(chatStore, chatId, newTitle);
    setChatStore(updated);
  };

  // Delete a chat
  const handleDeleteChat = (chatId: string) => {
    const { store: updatedStore, nextActiveChat } = deleteChatFromStore(chatStore, chatId);
    setChatStore(updatedStore);

    if (nextActiveChat) {
      setResume(nextActiveChat.resumeData || INITIAL_RESUME_DATA);
      setMessages(nextActiveChat.messages || []);
      setCurrentQuestionId(nextActiveChat.conversationState?.currentQuestionId || getInitialQuestionId());
      setCurrentRecord(nextActiveChat.conversationState?.currentRecord || {});
      setQuestionHistory(nextActiveChat.conversationState?.questionHistory || []);

      const hasUserMsg = (nextActiveChat.messages || []).some((m) => m.sender === 'user');
      const hasName = Boolean(nextActiveChat.resumeData?.personal?.fullName);
      setHasStarted(hasUserMsg || hasName);
    } else {
      // No conversations left -> create a clean conversation and show welcome screen
      const freshChat = createNewChatSession();
      const freshStore: ChatHistoryStore = {
        chats: [freshChat],
        activeChatId: freshChat.id,
      };
      saveChatHistory(freshStore);
      setChatStore(freshStore);

      setResume(freshChat.resumeData);
      setMessages(freshChat.messages);
      setCurrentQuestionId(freshChat.conversationState.currentQuestionId);
      setCurrentRecord({});
      setQuestionHistory([]);
      setHasStarted(false);
    }
  };

  // User submits an answer
  const handleAnswer = (answer: any) => {
    setIsTyping(true);
    const newHistory = [...questionHistory, currentQuestionId];
    setQuestionHistory(newHistory);

    // Automatic naming on user's first meaningful message
    let autoTitle: string | undefined = undefined;
    const currentChat = chatStore.chats.find((c) => c.id === chatStore.activeChatId);
    const isFirstUserMessage = !messages.some((m) => m.sender === 'user');

    if (
      isFirstUserMessage &&
      currentChat &&
      !currentChat.isManuallyRenamed &&
      (currentChat.title === 'New Chat' || currentChat.title === 'New Resume')
    ) {
      autoTitle = generateChatTitle(String(answer));
    }

    const result = processAnswer(
      currentQuestion,
      answer,
      resume,
      currentRecord,
      messages
    );

    setResume(result.updatedResume);
    setMessages(result.updatedMessages);
    setCurrentRecord(result.updatedCurrentRecord);

    persistCurrentChatState(
      result.updatedResume,
      result.updatedMessages,
      result.nextQuestionId || 'review_complete',
      result.updatedCurrentRecord,
      newHistory,
      autoTitle
    );

    setTimeout(() => {
      setIsTyping(false);

      if (result.nextQuestionId) {
        setCurrentQuestionId(result.nextQuestionId);

        const nextQ = getQuestionById(result.nextQuestionId);
        if (nextQ && nextQ.section !== currentQuestion.section && result.nextQuestionId !== currentQuestion.id) {
          const transitionText =
            (chatbotResponses.sectionTransitions as any)[nextQ.section] ||
            chatbotResponses.encouragements[0];

          const withTransition = [
            ...result.updatedMessages,
            {
              id: `msg-trans-${Date.now()}`,
              sender: 'bot' as const,
              text: transitionText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ];

          setMessages(withTransition);
          persistCurrentChatState(
            result.updatedResume,
            withTransition,
            result.nextQuestionId,
            result.updatedCurrentRecord,
            newHistory,
            autoTitle
          );
        }
      } else {
        setCurrentQuestionId('review_complete');
        const doneMessages = [
          ...result.updatedMessages,
          {
            id: `msg-done-${Date.now()}`,
            sender: 'bot' as const,
            text: chatbotResponses.allDone,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
        setMessages(doneMessages);
        persistCurrentChatState(
          result.updatedResume,
          doneMessages,
          'review_complete',
          result.updatedCurrentRecord,
          newHistory,
          autoTitle
        );
        setShowResumeModal(true);
      }
    }, 350);
  };

  // User skips an optional question
  const handleSkip = () => {
    const newHistory = [...questionHistory, currentQuestionId];
    setQuestionHistory(newHistory);

    const skippedMessage: ChatMessage = {
      id: `msg-user-skip-${Date.now()}`,
      sender: 'user',
      text: 'Skipped this step',
      questionId: currentQuestion.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setIsTyping(true);
    const updatedMessages = [...messages, skippedMessage];
    setMessages(updatedMessages);

    setTimeout(() => {
      setIsTyping(false);

      const result = processAnswer(
        currentQuestion,
        '',
        resume,
        currentRecord,
        messages
      );

      setResume(result.updatedResume);
      const nextId = result.nextQuestionId || 'review_complete';
      setCurrentQuestionId(nextId);

      persistCurrentChatState(
        result.updatedResume,
        updatedMessages,
        nextId,
        currentRecord,
        newHistory
      );
    }, 250);
  };

  // Previous button
  const handlePrevious = () => {
    if (questionHistory.length === 0) return;
    const prevHistory = [...questionHistory];
    const prevQId = prevHistory.pop();
    setQuestionHistory(prevHistory);

    if (prevQId) {
      setCurrentQuestionId(prevQId);
      persistCurrentChatState(
        resume,
        messages,
        prevQId,
        currentRecord,
        prevHistory
      );
    }
  };

  // Edit previous message
  const handleEditMessage = (message: ChatMessage) => {
    if (message.questionId) {
      setCurrentQuestionId(message.questionId);
      const withPrompt = [
        ...messages,
        {
          id: `msg-bot-edit-${Date.now()}`,
          sender: 'bot' as const,
          text: `Let's update that answer. Please type or select your correction below:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      setMessages(withPrompt);
      persistCurrentChatState(
        resume,
        withPrompt,
        message.questionId,
        currentRecord,
        questionHistory
      );
    }
  };

  // Continue previous resume action from welcome card
  const handleContinuePrevious = () => {
    setHasStarted(true);
  };

  // If no username exists, show the First-Time Welcome Screen
  if (!username) {
    return <UsernameWelcome onComplete={handleUsernameComplete} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAF8] font-sans">
      {/* 1. LEFT SIDEBAR WITH CHAT HISTORY */}
      <ProgressSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onNewResume={handleStartNewResume}
        onSelectChat={() => setShowResumeModal(false)}
        onOpenTemplates={() => setShowTemplatesModal(true)}
        onOpenMyResumes={() => setShowResumeModal(true)}
        activeTab={showResumeModal ? 'resumes' : 'chat'}
        hasResumeData={hasResumeData}
        chats={chatStore.chats}
        activeChatId={chatStore.activeChatId}
        onSelectChatSession={handleSelectChatSession}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        username={username}
        onChangeUsername={handleChangeUsername}
        onClearLocalData={handleClearLocalData}
      />

      {/* 2. MAIN CHATGPT-STYLE WORKSPACE */}
      <main className="flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative">
        <ChatInterface
          messages={messages}
          currentQuestion={currentQuestion}
          resume={resume}
          isTyping={isTyping}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
          onPrevious={questionHistory.length > 0 ? handlePrevious : undefined}
          onEditMessage={handleEditMessage}
          onOpenTemplates={() => setShowTemplatesModal(true)}
          onOpenPreview={() => setShowResumeModal(true)}
          onStartNewResume={handleStartNewResume}
          onContinuePrevious={handleContinuePrevious}
          hasStarted={hasStarted}
          setHasStarted={setHasStarted}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      </main>

      {/* Templates Selector Modal */}
      {showTemplatesModal && (
        <TemplateSelector
          currentTemplateId={resume.template}
          onSelect={(tplId) => {
            const updated = { ...resume, template: tplId };
            setResume(updated);
            persistCurrentChatState(
              updated,
              messages,
              currentQuestionId,
              currentRecord,
              questionHistory
            );
            setShowTemplatesModal(false);
          }}
          onClose={() => setShowTemplatesModal(false)}
        />
      )}

      {/* My Resumes / View Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-[#202923]/40 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-5xl h-full sm:h-[92vh] sm:rounded-3xl flex flex-col overflow-hidden border-0 sm:border border-[#E9EDE9] shadow-2xl">
            {/* Modal Top Bar */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-[#E9EDE9] flex items-center justify-between shrink-0 select-none bg-white">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="font-bold text-xs sm:text-sm text-[#202923]">Resume Document</span>
                <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-[#DDF2E8] text-[#087A50] font-bold uppercase tracking-wider">
                  {resume.template}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowEditorModal(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#E9EDE9] bg-white text-[#202923] hover:text-[#087A50] hover:bg-[#FAFAF8] cursor-pointer transition shadow-xs"
                >
                  Edit Data
                </button>

                <button
                  onClick={() => setShowResumeModal(false)}
                  title="Close resume view"
                  className="p-1.5 rounded-xl border border-[#E9EDE9] text-[#78847D] hover:text-[#202923] hover:bg-[#FAFAF8] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Resume Document & Export Tools */}
            <div className="flex-1 overflow-hidden bg-[#FAFAF8]">
              <ResumePreview
                resume={resume}
                onSelectTemplate={(tplId) => {
                  const updated = { ...resume, template: tplId };
                  setResume(updated);
                  persistCurrentChatState(
                    updated,
                    messages,
                    currentQuestionId,
                    currentRecord,
                    questionHistory
                  );
                }}
                onOpenEditor={() => setShowEditorModal(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Direct Resume Editor Modal */}
      {showEditorModal && (
        <ResumeEditor
          resume={resume}
          onSave={(updated) => {
            setResume(updated);
            persistCurrentChatState(
              updated,
              messages,
              currentQuestionId,
              currentRecord,
              questionHistory
            );
          }}
          onClose={() => setShowEditorModal(false)}
        />
      )}
    </div>
  );
};
