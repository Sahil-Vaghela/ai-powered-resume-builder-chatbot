import React from 'react';
import { Bot, User, Pencil, Sparkles, FileSpreadsheet } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../engine/conversationEngine';

interface ChatMessageProps {
  message: ChatMessageType;
  onEdit?: (message: ChatMessageType) => void;
}

export const ChatMessageItem: React.FC<ChatMessageProps> = ({ message, onEdit }) => {
  const isBot = message.sender === 'bot';

  return (
    <div
      className={`group flex items-start gap-2.5 sm:gap-3 my-3 min-w-0 ${
        isBot ? 'justify-start' : 'justify-end'
      }`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-xl bg-[#DDF2E8] border border-[#087A50]/20 text-[#087A50] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <FileSpreadsheet className="w-4 h-4 text-[#087A50]" />
        </div>
      )}

      <div
        className={`max-w-[88%] sm:max-w-[80%] flex flex-col min-w-0 ${
          isBot ? 'items-start' : 'items-end'
        }`}
      >
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-semibold text-[#78847D]">
            {isBot ? 'ResumeCraft' : 'You'}
          </span>
          <span className="text-[11px] text-[#78847D] tabular-nums">{message.timestamp}</span>

          {!isBot && message.isEditable && onEdit && (
            <button
              onClick={() => onEdit(message)}
              title="Edit this answer"
              className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-[#78847D] hover:text-[#087A50] p-1 rounded cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>

        <div
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all break-words overflow-hidden ${
            isBot
              ? 'bg-white border border-[#E9EDE9] text-[#202923] shadow-xs'
              : 'bg-[#E5F3EB] border border-[#DDF2E8] text-[#202923] font-normal shadow-xs'
          }`}
        >
          <div className="whitespace-pre-line break-words">{message.text}</div>
        </div>
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-xl bg-[#E5F3EB] border border-[#087A50]/20 text-[#087A50] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <User className="w-4 h-4 text-[#087A50]" />
        </div>
      )}
    </div>
  );
};
