import { useState, useEffect, useRef } from 'react';

const LANGUAGES = [
  { value: 'typescript', label: 'TypeScript', icon: '🔷', color: '#3178c6' },
  { value: 'javascript', label: 'JavaScript', icon: '🟡', color: '#f7df1e' },
  { value: 'python',     label: 'Python',     icon: '🐍', color: '#3572A5' },
  { value: 'java',       label: 'Java',       icon: '☕', color: '#b07219' },
  { value: 'rust',       label: 'Rust',       icon: '🦀', color: '#dea584' },
  { value: 'go',         label: 'Go',         icon: '🐹', color: '#00ADD8' },
  { value: 'cpp',        label: 'C++',        icon: '⚙️', color: '#f34b7d' },
  { value: 'html',       label: 'HTML',       icon: '🌐', color: '#e34c26' },
  { value: 'css',        label: 'CSS',        icon: '🎨', color: '#563d7c' },
  { value: 'sql',        label: 'SQL',        icon: '🗄️', color: '#e38c00' },
  { value: 'bash',       label: 'Bash',       icon: '🖥️', color: '#89e051' },
  { value: 'ruby',       label: 'Ruby',       icon: '💎', color: '#701516' },
];

interface CreateSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    language: string;
    initialCode: string;
    commitMessage: string;
  }) => Promise<void>;
}

export default function CreateSnippetModal({ isOpen, onClose, onSubmit }: CreateSnippetModalProps) {
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage]       = useState('typescript');
  const [initialCode, setInitialCode] = useState('');
  const [commitMessage, setCommitMessage] = useState('Initial commit');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [errors, setErrors]               = useState<Record<string, string>>({});
  const [step, setStep]                   = useState<1 | 2>(1);
  const titleRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setLanguage('typescript');
      setInitialCode('');
      setCommitMessage('Initial commit');
      setErrors({});
      setStep(1);
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Escape key closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!title.trim())    errs.title    = 'Title is required';
    if (title.trim().length > 200) errs.title = 'Title must be under 200 characters';
    if (!language)        errs.language  = 'Please select a language';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!initialCode.trim()) errs.initialCode = 'Initial code is required';
    if (!commitMessage.trim()) errs.commitMessage = 'Commit message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), language, initialCode, commitMessage: commitMessage.trim() });
      onClose();
    } catch {
      setErrors({ submit: 'Failed to create snippet. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLang = LANGUAGES.find(l => l.value === language);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-xl glass-card"
        style={{ animation: 'command-palette-enter 0.25s cubic-bezier(0.16,1,0.3,1) forwards' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Gradient header accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, #58a6ff, #bc8cff, #3fb950)' }} />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(88,166,255,0.2), rgba(188,140,255,0.15))', border: '1px solid rgba(88,166,255,0.25)' }}>
              <svg className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="#58a6ff" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-semibold text-dark-100">New Snippet</h2>
              <p className="text-xs text-dark-500">Step {step} of 2 — {step === 1 ? 'Details' : 'Initial Code'}</p>
            </div>
          </div>
          <button id="close-create-modal" onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1.5 px-5 pt-4">
          {[1, 2].map(s => (
            <div key={s} className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ background: s <= step ? '#58a6ff' : '#30363d' }} />
          ))}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {step === 1 ? (
            <>
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1.5">
                  Snippet Title <span className="text-accent-red">*</span>
                </label>
                <input
                  id="snippet-title"
                  ref={titleRef}
                  value={title}
                  onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleNext(); }}
                  className="input-field"
                  placeholder="e.g. React useDebounce Hook"
                  maxLength={200}
                />
                {errors.title && <p className="text-xs text-accent-red mt-1">{errors.title}</p>}
                <p className="text-xs text-dark-600 mt-1 text-right">{title.length}/200</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1.5">Description <span className="text-dark-600">(optional)</span></label>
                <textarea
                  id="snippet-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="What does this snippet do?"
                />
              </div>

              {/* Language picker */}
              <div>
                <label className="block text-xs font-medium text-dark-300 mb-2">
                  Language <span className="text-accent-red">*</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.value}
                      id={`lang-${lang.value}`}
                      type="button"
                      onClick={() => { setLanguage(lang.value); setErrors(p => ({ ...p, language: '' })); }}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all duration-200"
                      style={{
                        background: language === lang.value ? `rgba(${hexToRgb(lang.color)},0.18)` : 'rgba(33,38,45,0.6)',
                        border: language === lang.value ? `1.5px solid ${lang.color}60` : '1.5px solid #30363d',
                        color: language === lang.value ? lang.color : '#8b949e',
                        transform: language === lang.value ? 'scale(1.04)' : 'scale(1)',
                      }}
                    >
                      <span className="text-base leading-none">{lang.icon}</span>
                      <span className="font-medium truncate w-full text-center">{lang.label}</span>
                    </button>
                  ))}
                </div>
                {errors.language && <p className="text-xs text-accent-red mt-1">{errors.language}</p>}
              </div>
            </>
          ) : (
            <>
              {/* Selected language badge */}
              <div className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(33,38,45,0.6)', border: '1px solid #30363d' }}>
                <span className="text-lg">{selectedLang?.icon}</span>
                <div>
                  <p className="text-sm font-medium text-dark-200">{title}</p>
                  <p className="text-xs" style={{ color: selectedLang?.color }}>{selectedLang?.label}</p>
                </div>
              </div>

              {/* Initial Code */}
              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1.5">
                  Initial Code <span className="text-accent-red">*</span>
                  <span className="ml-2 text-dark-600 font-normal">— this becomes version 1</span>
                </label>
                <textarea
                  id="snippet-initial-code"
                  value={initialCode}
                  onChange={e => { setInitialCode(e.target.value); setErrors(p => ({ ...p, initialCode: '' })); }}
                  className="input-field resize-none font-mono text-xs leading-relaxed"
                  rows={9}
                  placeholder={getPlaceholder(language)}
                  spellCheck={false}
                  style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
                />
                {errors.initialCode && <p className="text-xs text-accent-red mt-1">{errors.initialCode}</p>}
              </div>

              {/* Commit message */}
              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1.5">
                  Commit Message <span className="text-accent-red">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  </span>
                  <input
                    id="snippet-commit-msg"
                    value={commitMessage}
                    onChange={e => { setCommitMessage(e.target.value); setErrors(p => ({ ...p, commitMessage: '' })); }}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                    className="input-field pl-9"
                    placeholder="Initial commit"
                    maxLength={500}
                  />
                </div>
                {errors.commitMessage && <p className="text-xs text-accent-red mt-1">{errors.commitMessage}</p>}
              </div>

              {errors.submit && (
                <div className="text-xs text-accent-red bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {errors.submit}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 pb-5 gap-3">
          <button
            id="modal-back-btn"
            onClick={() => step === 1 ? onClose() : setStep(1)}
            className="btn-ghost text-sm"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          <div className="flex items-center gap-2">
            {step === 1 ? (
              <button
                id="modal-next-btn"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2"
              >
                Next — Add Code
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : (
              <button
                id="modal-create-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2"
                style={{
                  background: isSubmitting ? undefined : 'linear-gradient(135deg, rgba(63,185,80,0.2), rgba(63,185,80,0.1))',
                  borderColor: isSubmitting ? undefined : 'rgba(63,185,80,0.4)',
                  color: isSubmitting ? undefined : '#3fb950',
                }}
              >
                {isSubmitting ? (
                  <><div className="spinner" style={{ width: 14, height: 14 }} /> Creating…</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Create Snippet</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function getPlaceholder(lang: string): string {
  const map: Record<string, string> = {
    typescript:  '// Your TypeScript code here...\nexport function myFunction() {\n  \n}',
    javascript:  '// Your JavaScript code here...\nfunction myFunction() {\n  \n}',
    python:      '# Your Python code here\ndef my_function():\n    pass',
    java:        '// Your Java code here\npublic class MyClass {\n    \n}',
    rust:        '// Your Rust code here\nfn main() {\n    \n}',
    go:          '// Your Go code here\npackage main\n\nfunc main() {\n}',
    cpp:         '// Your C++ code here\n#include <iostream>\n\nint main() {\n    return 0;\n}',
    html:        '<!-- Your HTML here -->\n<!DOCTYPE html>\n<html lang="en">\n</html>',
    css:         '/* Your CSS here */\n.container {\n  \n}',
    sql:         '-- Your SQL here\nSELECT *\nFROM table_name\nWHERE condition;',
    bash:        '#!/bin/bash\n# Your script here',
    ruby:        '# Your Ruby code here\ndef my_method\n\nend',
  };
  return map[lang] || '// Your code here...';
}
