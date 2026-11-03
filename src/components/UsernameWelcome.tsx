import React, { useState } from 'react';
import { FileSpreadsheet, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { validateUsername } from '../engine/storageEngine';

interface UsernameWelcomeProps {
  onComplete: (username: string) => void;
}

export const UsernameWelcome: React.FC<UsernameWelcomeProps> = ({ onComplete }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateUsername(usernameInput);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid username.');
      return;
    }
    setError(null);
    onComplete(usernameInput.trim());
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAF8] flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E9EDE9] shadow-xl p-6 sm:p-10 animate-fadeIn relative overflow-hidden">
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#DDF2E8]/40 to-transparent rounded-bl-full pointer-events-none" />

        {/* Top Logo Badge */}
        <div className="w-12 h-12 rounded-2xl bg-[#DDF2E8] border border-[#087A50]/20 flex items-center justify-center text-[#087A50] mb-5 shadow-xs">
          <FileSpreadsheet className="w-6 h-6 text-[#087A50]" />
        </div>

        {/* Heading & Subheading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight mb-1">
          Welcome to ResumeCraft 👋
        </h1>
        <div className="text-base sm:text-lg font-bold text-[#087A50] mb-3">
          Let's get started.
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#78847D] leading-relaxed mb-6">
          ResumeCraft is open and free for everyone. Just set your username and start chatting to build your professional resume.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username-input"
              className="block text-xs font-bold text-[#202923] mb-1.5"
            >
              What should we call you?
            </label>
            <input
              id="username-input"
              type="text"
              autoFocus
              value={usernameInput}
              onChange={(e) => {
                setUsernameInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter your username"
              maxLength={30}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-[#202923] placeholder:text-[#78847D] bg-[#FAFAF8] focus:bg-white transition-all focus:outline-none ${
                error
                  ? 'border-[#C77D86] ring-2 ring-[#C77D86]/15'
                  : 'border-[#E9EDE9] focus:border-[#087A50] focus:ring-2 focus:ring-[#087A50]/15'
              }`}
            />
            {error && (
              <p className="text-xs text-[#C77D86] font-semibold mt-1.5 animate-fadeIn">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-xl bg-[#087A50] hover:bg-[#065F46] active:bg-[#054835] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-xs active:scale-[0.99]"
          >
            <span>Start Chatting</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Small Footer Text */}
        <div className="mt-8 pt-5 border-t border-[#E9EDE9] text-center">
          <p className="text-[11px] sm:text-xs text-[#78847D] flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#087A50]" />
            <span>No password. No registration. Completely free.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
