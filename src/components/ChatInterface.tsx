import React, { useRef, useEffect } from 'react';
import {
  Menu,
  Layout,
  FileText,
  FilePlus2,
  GraduationCap,
  Briefcase,
  Eye,
  PanelLeft,
  FileSpreadsheet,
} from 'lucide-react';
import { ChatMessageItem } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatMessage } from '../engine/conversationEngine';
import { QuestionDef } from '../engine/questionEngine';
import { ResumeData } from '../engine/resumeEngine';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  currentQuestion: QuestionDef;
  resume: ResumeData;
  isTyping: boolean;
  onAnswer: (answer: any) => void;
  onSkip: () => void;
  onPrevious?: () => void;
  onEditMessage: (message: ChatMessage) => void;
  onOpenTemplates: () => void;
  onOpenPreview: () => void;
  onStartNewResume: () => void;
  onContinuePrevious: () => void;
  hasStarted: boolean;
  setHasStarted: (val: boolean) => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentQuestion,
  resume,
  isTyping,
  onAnswer,
  onSkip,
  onPrevious,
  onEditMessage,
  onOpenTemplates,
  onOpenPreview,
  onStartNewResume,
  onContinuePrevious,
  hasStarted,
  setHasStarted,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileMenu,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasStarted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, currentQuestion.id, hasStarted]);

  // Handler for action cards
  const handleActionClick = (action: string) => {
    if (action === 'new') {
      onStartNewResume();
      setHasStarted(true);
    } else if (action === 'fresher') {
      onStartNewResume();
      setHasStarted(true);
      setTimeout(() => {
        onAnswer("I am a fresher and want to build my entry-level resume");
      }, 50);
    } else if (action === 'experienced') {
      onStartNewResume();
      setHasStarted(true);
      setTimeout(() => {
        onAnswer("I am an experienced professional looking to highlight my career");
      }, 50);
    } else if (action === 'templates') {
      onOpenTemplates();
    }
  };

  return (
    <div className="flex flex-col h-full w-full min-w-0 bg-[#FAFAF8] overflow-hidden relative">
      {/* Top Header */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 bg-white border-b border-[#E9EDE9] flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={onOpenMobileMenu}
            title="Open menu"
            className="flex md:hidden p-2 rounded-xl border border-[#E9EDE9] text-[#4B5750] hover:text-[#087A50] hover:bg-[#FAFAF8] cursor-pointer shrink-0 min-h-[38px] min-w-[38px] items-center justify-center transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop/Tablet collapse button toggle */}
          {isSidebarCollapsed && (
            <button
              onClick={onToggleSidebar}
              title="Expand sidebar"
              className="hidden md:flex p-2 rounded-xl border border-[#E9EDE9] text-[#78847D] hover:text-[#202923] hover:bg-[#FAFAF8] cursor-pointer shrink-0 transition"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-bold text-[#202923] tracking-tight truncate">
              ResumeCraft Assistant
            </span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {hasStarted && (
            <button
              onClick={onOpenPreview}
              title="View full resume document"
              className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#DDF2E8] hover:bg-[#c9ead9] text-[#087A50] border border-[#087A50]/20 flex items-center gap-1.5 cursor-pointer min-h-[36px] transition shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#087A50]" />
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={onOpenTemplates}
            title="Browse resume templates"
            className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#E9EDE9] bg-white text-[#4B5750] hover:text-[#087A50] hover:bg-[#FAFAF8] flex items-center gap-1.5 cursor-pointer min-h-[36px] transition"
          >
            <Layout className="w-3.5 h-3.5 text-[#087A50]" />
            <span className="hidden xs:inline">Templates</span>
          </button>
        </div>
      </header>

      {/* Main Center Area */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0 w-full min-w-0">
        {!hasStarted ? (
          /* Welcome Screen (Emerald and white SaaS center view) */
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center max-w-4xl mx-auto my-auto animate-fadeIn select-none w-full min-w-0">
            {/* Logo Icon */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#DDF2E8] border border-[#087A50]/20 flex items-center justify-center text-[#087A50] mb-5 shrink-0 shadow-xs">
              <FileSpreadsheet className="w-8 h-8 text-[#087A50]" />
            </div>

            {/* Responsive Heading */}
            <h1 className="text-clamp-heading font-extrabold text-[#202923] tracking-tight mb-2.5 max-w-2xl px-2">
              How can I help you build your resume today?
            </h1>

            {/* Subtitle */}
            <p className="text-clamp-subheading text-[#78847D] max-w-lg mb-8 sm:mb-10 px-3 font-normal">
              Create your professional resume through a simple guided conversation.
            </p>

            {/* 4 Quick Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 w-full max-w-4xl px-2">
              <button
                onClick={() => handleActionClick('new')}
                className="p-4 rounded-2xl bg-white border border-[#E9EDE9] hover:border-[#087A50]/40 hover:shadow-md transition-all text-left cursor-pointer group flex flex-col justify-between min-h-[110px]"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#DDF2E8] text-[#087A50] flex items-center justify-center shrink-0">
                    <FilePlus2 className="w-4 h-4 text-[#087A50]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#202923] group-hover:text-[#087A50] transition leading-tight">
                    Create a New Resume
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#78847D] pl-10 leading-snug">
                  Start fresh with guided questions for your experience.
                </p>
              </button>

              <button
                onClick={() => handleActionClick('fresher')}
                className="p-4 rounded-2xl bg-white border border-[#E9EDE9] hover:border-[#087A50]/40 hover:shadow-md transition-all text-left cursor-pointer group flex flex-col justify-between min-h-[110px]"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#DDF2E8] text-[#087A50] flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-[#087A50]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#202923] group-hover:text-[#087A50] transition leading-tight">
                    Build a Fresher Resume
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#78847D] pl-10 leading-snug">
                  Tailored for students and entry-level job seekers.
                </p>
              </button>

              <button
                onClick={() => handleActionClick('experienced')}
                className="p-4 rounded-2xl bg-white border border-[#E9EDE9] hover:border-[#087A50]/40 hover:shadow-md transition-all text-left cursor-pointer group flex flex-col justify-between min-h-[110px]"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#DDF2E8] text-[#087A50] flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-[#087A50]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#202923] group-hover:text-[#087A50] transition leading-tight">
                    Build an Experienced Resume
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#78847D] pl-10 leading-snug">
                  Highlight career milestones, skills, and impact.
                </p>
              </button>

              <button
                onClick={() => handleActionClick('templates')}
                className="p-4 rounded-2xl bg-white border border-[#E9EDE9] hover:border-[#087A50]/40 hover:shadow-md transition-all text-left cursor-pointer group flex flex-col justify-between min-h-[110px]"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#DDF2E8] text-[#087A50] flex items-center justify-center shrink-0">
                    <Layout className="w-4 h-4 text-[#087A50]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#202923] group-hover:text-[#087A50] transition leading-tight">
                    Explore Templates
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#78847D] pl-10 leading-snug">
                  Browse ATS-optimized professional designs.
                </p>
              </button>
            </div>
          </div>
        ) : (
          /* Chat Mode: Conversation Messages */
          <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-4 min-w-0">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} onEdit={onEditMessage} />
            ))}

            {/* Current Active Bot Question */}
            {!isTyping && currentQuestion && (
              <div className="flex items-start gap-2.5 sm:gap-3 my-3 justify-start animate-fadeIn min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#DDF2E8] border border-[#087A50]/20 text-[#087A50] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <FileSpreadsheet className="w-4 h-4 text-[#087A50]" />
                </div>

                <div className="max-w-[88%] sm:max-w-[80%] flex flex-col items-start min-w-0">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-[#78847D]">
                      ResumeCraft
                    </span>
                  </div>

                  <div className="px-4 py-3 rounded-2xl bg-white border border-[#E9EDE9] text-xs sm:text-sm leading-relaxed text-[#202923] break-words overflow-hidden w-full shadow-xs">
                    <div className="font-medium whitespace-pre-line text-[#202923]">
                      {currentQuestion.question}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#78847D] py-2 animate-fadeIn">
                <div className="w-8 h-8 rounded-xl bg-[#DDF2E8] border border-[#087A50]/20 text-[#087A50] flex items-center justify-center shrink-0 shadow-xs">
                  <FileSpreadsheet className="w-4 h-4 text-[#087A50]" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-[#E9EDE9] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#087A50] animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-[#087A50] animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-[#087A50] animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Chat Input Container with safe area support */}
      <div className="shrink-0 w-full safe-pb">
        <ChatInput
          question={hasStarted ? currentQuestion : undefined}
          resume={resume}
          onSubmit={(answer) => {
            if (!hasStarted) {
              setHasStarted(true);
            }
            onAnswer(answer);
          }}
          onSkip={hasStarted && currentQuestion?.skipAllowed ? onSkip : undefined}
          onPrevious={hasStarted ? onPrevious : undefined}
          isSubmitting={isTyping}
        />
      </div>
    </div>
  );
};
