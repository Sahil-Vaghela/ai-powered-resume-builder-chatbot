import React, { useState, useEffect } from 'react';
import { Send, ArrowLeft, Plus, Check } from 'lucide-react';
import { QuestionDef, getSuggestionsForQuestion, getOptionsForQuestion, getSummarySuggestions } from '../engine/questionEngine';
import { validateInput } from '../engine/validationEngine';
import skillsData from '../data/skills.json';
import templatesData from '../data/templates.json';
import { ResumeData } from '../engine/resumeEngine';

interface ChatInputProps {
  question?: QuestionDef;
  resume: ResumeData;
  onSubmit: (answer: any) => void;
  onSkip?: () => void;
  onPrevious?: () => void;
  isSubmitting?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  question,
  resume,
  onSubmit,
  onSkip,
  onPrevious,
  isSubmitting = false,
}) => {
  const [textValue, setTextValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Skill selector state
  const [selectedSkills, setSelectedSkills] = useState<Record<string, string[]>>({
    programmingLanguages: [],
    frontend: [],
    backend: [],
    databases: [],
    frameworks: [],
    tools: [],
    other: [],
  });
  const [activeSkillCategory, setActiveSkillCategory] = useState<string>('programmingLanguages');
  const [customSkillInput, setCustomSkillInput] = useState<string>('');

  // Multi-tag selector state (languages, interests)
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  useEffect(() => {
    setTextValue('');
    setError(null);
    setCustomSkillInput('');
    setCustomTagInput('');

    if (question?.type === 'skill_selector') {
      setSelectedSkills(resume.skills || {
        programmingLanguages: [],
        frontend: [],
        backend: [],
        databases: [],
        frameworks: [],
        tools: [],
        other: [],
      });
    } else if (question?.type === 'multi_tag_selector') {
      const existing = (resume as any)[question.field || ''] || [];
      setTags(Array.isArray(existing) ? existing : []);
    } else if (question?.type === 'summary_generator') {
      setTextValue(resume.career.summary || '');
    }
  }, [question?.id]);

  const suggestions = question ? getSuggestionsForQuestion(question, resume) : [];
  const options = question ? getOptionsForQuestion(question) : [];

  const handleSend = (overrideValue?: any) => {
    let valueToValidate: any = overrideValue !== undefined ? overrideValue : textValue;

    if (question?.type === 'skill_selector') {
      valueToValidate = selectedSkills;
      const totalCount = Object.values(selectedSkills).reduce((acc, arr) => acc + arr.length, 0);
      if (question.required && totalCount === 0) {
        setError('Please select at least 3 skills to continue.');
        return;
      }
      setError(null);
      onSubmit(selectedSkills);
      return;
    }

    if (question?.type === 'multi_tag_selector') {
      valueToValidate = tags;
      if (question.required && tags.length === 0) {
        setError('Please select or add at least one item.');
        return;
      }
      setError(null);
      onSubmit(tags);
      return;
    }

    if (typeof valueToValidate === 'string') {
      if (!valueToValidate.trim()) return;
    }

    setError(null);
    onSubmit(valueToValidate);
    setTextValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) return;
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSkill = (category: string, skill: string) => {
    setSelectedSkills((prev) => {
      const currentList = prev[category] || [];
      const updated = currentList.includes(skill)
        ? currentList.filter((s) => s !== skill)
        : [...currentList, skill];
      return { ...prev, [category]: updated };
    });
  };

  const addCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const skill = customSkillInput.trim();
    setSelectedSkills((prev) => {
      const currentList = prev[activeSkillCategory] || [];
      if (!currentList.includes(skill)) {
        return { ...prev, [activeSkillCategory]: [...currentList, skill] };
      }
      return prev;
    });
    setCustomSkillInput('');
  };

  const toggleTag = (item: string) => {
    setTags((prev) => (prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]));
  };

  const addCustomTag = () => {
    if (!customTagInput.trim()) return;
    const tag = customTagInput.trim();
    if (!tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setCustomTagInput('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-5 pt-2">
      {/* Validation Error Message */}
      {error && (
        <div className="mb-2 text-xs font-semibold text-[#C77D86] bg-[#FFF5F5] border border-[#FED7D7] px-3.5 py-1.5 rounded-xl animate-fadeIn text-center shadow-xs">
          {error}
        </div>
      )}

      {/* 1. Skill Selector Overlay */}
      {question?.type === 'skill_selector' && (
        <div className="mb-3 p-4 rounded-2xl bg-white border border-[#E9EDE9] shadow-sm space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {skillsData.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveSkillCategory(cat.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  activeSkillCategory === cat.id
                    ? 'bg-[#087A50] text-white font-bold shadow-xs'
                    : 'bg-[#FAFAF8] text-[#4B5750] border border-[#E9EDE9] hover:bg-[#DDF2E8] hover:text-[#087A50]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {(() => {
            const currentCat = skillsData.categories.find((c) => c.id === activeSkillCategory);
            const currentSkills = currentCat ? currentCat.skills : [];
            const selectedInCat = selectedSkills[activeSkillCategory] || [];
            return (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {currentSkills.map((sk) => {
                    const isSelected = selectedInCat.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleSkill(activeSkillCategory, sk)}
                        className={`text-xs px-2.5 py-1.5 rounded-xl transition cursor-pointer font-medium flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#DDF2E8] text-[#087A50] border border-[#087A50] font-semibold'
                            : 'bg-white text-[#4B5750] border border-[#E9EDE9] hover:border-[#087A50]/40'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#087A50]" />}
                        <span>{sk}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-[#E9EDE9]">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                    placeholder={`+ Add custom skill to ${currentCat?.name || 'category'}...`}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#E9EDE9] focus:outline-none focus:border-[#087A50]"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="text-xs px-3 py-2 bg-white border border-[#E9EDE9] text-[#087A50] hover:bg-[#DDF2E8] rounded-xl font-semibold cursor-pointer transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#78847D]">
              Selected:{' '}
              <strong className="text-[#202923] font-bold tabular-nums">
                {Object.values(selectedSkills).reduce((acc, arr) => acc + arr.length, 0)}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => handleSend()}
              className="text-xs px-4 py-2 bg-[#087A50] hover:bg-[#065F46] text-white rounded-xl font-bold cursor-pointer transition shadow-xs"
            >
              Confirm Skills
            </button>
          </div>
        </div>
      )}

      {/* 2. Options Chips for radio/boolean choice */}
      {question && (question.type === 'radio_cards' || question.type === 'boolean_choice') && (
        <div className="mb-2.5 flex flex-wrap gap-2 justify-center">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSend(opt.value)}
              className="text-xs px-4 py-2 rounded-xl bg-white border border-[#E9EDE9] hover:border-[#087A50] hover:bg-[#DDF2E8] hover:text-[#087A50] text-[#202923] font-semibold cursor-pointer transition shadow-xs"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* 3. Predefined Suggestion Chips */}
      {suggestions.length > 0 && question?.type !== 'skill_selector' && (
        <div className="mb-2 flex flex-wrap gap-1.5 justify-center max-h-20 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTextValue(s)}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-white border border-[#E9EDE9] hover:border-[#087A50] hover:bg-[#DDF2E8] text-[#4B5750] hover:text-[#087A50] cursor-pointer transition shadow-xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 4. Multi-tag Chips (Languages, Interests) */}
      {question?.type === 'multi_tag_selector' && (
        <div className="mb-2.5 p-3.5 rounded-2xl bg-white border border-[#E9EDE9] shadow-sm space-y-2">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-[#DDF2E8] text-[#087A50] border border-[#087A50]/20 font-medium"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="text-[#087A50] hover:text-[#C77D86] cursor-pointer text-sm font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              placeholder="Type and add or pick suggestions above..."
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#E9EDE9] focus:outline-none focus:border-[#087A50]"
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="text-xs px-3 py-2 bg-white border border-[#E9EDE9] text-[#087A50] hover:bg-[#DDF2E8] rounded-xl font-semibold cursor-pointer transition"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => handleSend()}
              className="text-xs px-3.5 py-2 bg-[#087A50] hover:bg-[#065F46] text-white rounded-xl font-bold cursor-pointer transition shadow-xs"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* 5. Summary Generator Options */}
      {question?.type === 'summary_generator' && (
        <div className="mb-2.5 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {getSummarySuggestions(resume.career?.experienceLevel, resume.personal?.professionalTitle).map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setTextValue(tpl.text)}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-white border border-[#E9EDE9] text-[#4B5750] hover:text-[#087A50] hover:border-[#087A50] hover:bg-[#DDF2E8] text-left line-clamp-1 cursor-pointer transition shadow-xs"
            >
              ✦ {tpl.category}
            </button>
          ))}
        </div>
      )}

      {/* ChatGPT-Style Chat Input Box */}
      {question?.type !== 'skill_selector' && (
        <div className="relative flex items-center rounded-2xl bg-white border border-[#E9EDE9] shadow-sm focus-within:border-[#087A50] focus-within:ring-2 focus-within:ring-[#087A50]/15 p-1.5 pl-4 transition-all min-w-0">
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={question?.placeholder || "Tell me more or provide additional details..."}
            className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-[#202923] placeholder:text-[#78847D] focus:outline-none pr-2 py-2 sm:py-2.5"
            autoFocus
          />

          <div className="flex items-center gap-1.5 pr-1 shrink-0">
            {question?.skipAllowed && onSkip && (
              <button
                type="button"
                onClick={onSkip}
                title="Skip optional question"
                className="text-[11px] sm:text-xs text-[#78847D] hover:text-[#202923] px-2.5 py-1.5 rounded-xl hover:bg-[#FAFAF8] transition cursor-pointer min-h-[36px] flex items-center font-medium"
              >
                Skip
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isSubmitting || (question?.required && !textValue.trim())}
              className="w-9 h-9 rounded-xl bg-[#087A50] hover:bg-[#065F46] active:bg-[#054835] text-white disabled:opacity-40 flex items-center justify-center cursor-pointer transition shrink-0 min-h-[36px] min-w-[36px] shadow-xs active:scale-95"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
