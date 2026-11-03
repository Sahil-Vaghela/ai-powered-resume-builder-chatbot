import React from 'react';
import {
  Sparkles,
  Bot,
  FileCheck,
  Download,
  ArrowRight,
  Layout,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import welcomeData from '../data/welcome.json';
import templatesData from '../data/templates.json';

interface WelcomeScreenProps {
  onStart: () => void;
  onOpenTemplates: () => void;
  onLoadSample: () => void;
  hasSavedProgress?: boolean;
  onResumeDraft?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  onOpenTemplates,
  onLoadSample,
  hasSavedProgress,
  onResumeDraft,
}) => {
  return (
    <div className="min-h-screen bg-[#E9EAF2] text-[#34364A] flex flex-col font-sans select-none">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-30 bg-[#E9EAF2]/90 backdrop-blur-md border-b border-[#C8CAD4]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center text-[#7776B8] font-black text-sm tracking-wide">
              RC
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#34364A]">
                ResumeCraft
              </span>
              <span className="text-[10px] ml-2.5 px-2 py-0.5 rounded-full neu-inset text-[#7776B8] font-bold">
                Soft UI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenTemplates}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl neu-button-secondary cursor-pointer flex items-center gap-2"
            >
              <Layout className="w-3.5 h-3.5 text-[#7776B8]" />
              <span>Explore Templates</span>
            </button>
            <button
              onClick={onStart}
              className="text-xs font-semibold px-5 py-2.5 rounded-xl neu-button-primary cursor-pointer flex items-center gap-2"
            >
              <span>Start Building Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Hero Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center text-center">
        {/* Saved Draft Notice if available */}
        {hasSavedProgress && onResumeDraft && (
          <div className="mb-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl neu-subtle text-[#6D9B83] text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#6D9B83]" />
            <span>You have an in-progress resume saved in your browser.</span>
            <button
              onClick={onResumeDraft}
              className="underline font-bold text-[#7776B8] hover:text-[#5d5ca0] ml-1 cursor-pointer"
            >
              Resume Draft →
            </button>
          </div>
        )}

        {/* Neumorphic Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full neu-inset text-[#7E8494] text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#7776B8]" />
          <span>Interactive Chatbot • Zero Login • 100% Client-Side</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#34364A] max-w-3xl leading-[1.15]">
          Build Your Professional Resume
        </h1>

        {/* Description */}
        <p className="mt-5 text-base sm:text-lg text-[#7E8494] max-w-2xl leading-relaxed font-normal">
          Create a professional, job-ready resume through a simple guided conversation.
        </p>

        {/* CTA Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl neu-button-primary font-bold text-sm flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Start Building Resume</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenTemplates}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl neu-button-secondary font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Layout className="w-4 h-4 text-[#7776B8]" />
            <span>Explore Templates</span>
          </button>

          <button
            onClick={onLoadSample}
            className="w-full sm:w-auto px-5 py-4 rounded-2xl neu-button-secondary font-medium text-xs text-[#7E8494] hover:text-[#34364A] flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#6D9B83]" />
            <span>Explore with Sample Data</span>
          </button>
        </div>

        {/* Three Specific Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl text-left">
          <div className="p-6 rounded-2xl neu-raised flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl neu-inset flex items-center justify-center mb-4 text-[#7776B8]">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#34364A] mb-1.5">
                Guided Resume Builder
              </h3>
              <p className="text-xs text-[#7E8494] leading-relaxed">
                Step-by-step interactive questions that collect and optimize your experience, education, and skills.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#C8CAD4]/30 flex items-center gap-1.5 text-[11px] font-semibold text-[#7776B8]">
              <span>One Question at a Time</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl neu-raised flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl neu-inset flex items-center justify-center mb-4 text-[#7776B8]">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#34364A] mb-1.5">
                Professional Templates
              </h3>
              <p className="text-xs text-[#7E8494] leading-relaxed">
                Choose from 6 ATS-friendly layouts engineered for recruiters, hiring managers, and automated screening.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#C8CAD4]/30 flex items-center gap-1.5 text-[11px] font-semibold text-[#7776B8]">
              <span>6 Genuine Document Formats</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl neu-raised flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl neu-inset flex items-center justify-center mb-4 text-[#7776B8]">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#34364A] mb-1.5">
                Instant PDF Download
              </h3>
              <p className="text-xs text-[#7E8494] leading-relaxed">
                Export pixel-perfect, client-side A4 resumes ready for submission without watermarks or accounts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#C8CAD4]/30 flex items-center gap-1.5 text-[11px] font-semibold text-[#7776B8]">
              <span>Real A4 Export & Print</span>
            </div>
          </div>
        </div>

        {/* Soft UI Stats Row */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
          {welcomeData.stats.map((stat, i) => (
            <div key={i} className="p-4 rounded-xl neu-subtle text-center">
              <div className="text-xl font-extrabold text-[#34364A] tracking-tight">{stat.value}</div>
              <div className="text-[11px] text-[#7E8494] font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Soft UI Notice */}
        <div className="mt-14 flex items-center justify-center gap-2 text-xs text-[#7E8494]">
          <ShieldCheck className="w-4 h-4 text-[#6D9B83]" />
          <span>No login or account needed. Progress is saved safely in browser LocalStorage.</span>
        </div>
      </main>
    </div>
  );
};
