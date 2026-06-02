import { useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import CommitTimeline from './CommitTimeline';
import CommitForm from './CommitForm';
import { SkeletonTimeline } from '../ui/SkeletonCard';
import { useNavigate } from 'react-router-dom';

export default function CodeWorkbench() {
  const {
    selectedSnippet,
    versions,
    selectedVersion,
    editorCode,
    setEditorCode,
    isLoadingVersions,
  } = useStore();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState({ lines: 0, chars: 0 });

  useEffect(() => {
    if (!selectedSnippet) {
      navigate('/dashboard');
    }
  }, [selectedSnippet, navigate]);

  useEffect(() => {
    if (editorCode) {
      setWordCount({
        lines: editorCode.split('\n').length,
        chars: editorCode.length,
      });
    }
  }, [editorCode]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editorCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = editorCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [editorCode]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  if (!selectedSnippet) return null;

  const languageMap: Record<string, string> = {
    typescript: 'typescript', javascript: 'javascript', python: 'python',
    java: 'java', rust: 'rust', go: 'go', cpp: 'cpp',
    html: 'html', css: 'css', sql: 'sql',
  };

  const monacoLanguage = languageMap[selectedSnippet.language] || 'plaintext';

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'bg-dark-900' : ''}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-800/90 border-b border-dark-600 backdrop-blur-sm">
        <div className="flex items-center gap-3 fade-in-up">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-ghost p-1.5 rounded-lg hover:bg-dark-700/50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-sm font-semibold text-dark-100 flex items-center gap-2">
              {selectedSnippet.title}
              <span className="text-[10px] font-mono text-dark-500 bg-dark-700 px-1.5 py-0.5 rounded">
                {selectedSnippet.language}
              </span>
            </h2>
            <p className="text-[11px] text-dark-500">{selectedSnippet.description}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Word count */}
          <span className="text-[10px] text-dark-500 font-mono mr-2 hidden sm:block">
            {wordCount.lines} lines &middot; {wordCount.chars.toLocaleString()} chars
          </span>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`btn-ghost p-2 rounded-lg transition-all ${copied ? 'text-accent-green' : ''}`}
            title="Copy code"
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="btn-ghost p-2 rounded-lg"
            title="Toggle fullscreen"
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          {/* Compare button */}
          <button
            onClick={() => navigate(`/diff/${selectedSnippet.id}`)}
            className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Diff
          </button>

          {/* Version badge */}
          {selectedVersion && (
            <span className="text-xs text-dark-500 font-mono bg-dark-700/50 px-2 py-1 rounded-md ml-1">
              v{selectedVersion.version}
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Commit Timeline */}
        <div className="w-72 border-r border-dark-600 bg-dark-800/30 flex-shrink-0 overflow-hidden flex flex-col">
          {isLoadingVersions ? <SkeletonTimeline /> : <CommitTimeline versions={versions} />}
        </div>

        {/* Center: Monaco Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={monacoLanguage}
              value={editorCode}
              onChange={(value) => setEditorCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                bracketPairColorization: { enabled: true },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                guides: { bracketPairs: true, indentation: true },
                renderWhitespace: 'selection',
              }}
              loading={
                <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
                  <div className="text-center scale-in">
                    <div className="spinner mx-auto mb-3" />
                    <p className="text-dark-400 text-sm">Loading editor...</p>
                  </div>
                </div>
              }
            />
          </div>

          {/* Bottom: Commit Form */}
          <CommitForm snippetId={selectedSnippet.id} />
        </div>
      </div>
    </div>
  );
}
