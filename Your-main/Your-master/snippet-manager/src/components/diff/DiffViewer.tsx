import { useState, useEffect } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function DiffViewer() {
  const {
    selectedSnippet,
    versions,
    compareVersionA,
    compareVersionB,
    setCompareVersions,
    fetchVersions,
  } = useStore();
  const navigate = useNavigate();
  const [splitView, setSplitView] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedSnippet) {
      navigate('/dashboard');
      return;
    }
    if (versions.length === 0) {
      fetchVersions(selectedSnippet.id).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [selectedSnippet, versions.length, fetchVersions, navigate]);

  useEffect(() => {
    if (versions.length >= 2 && !compareVersionA && !compareVersionB) {
      setCompareVersions(versions[0], versions[versions.length - 1]);
    }
  }, [versions, compareVersionA, compareVersionB, setCompareVersions]);

  if (!selectedSnippet) return null;

  const handleVersionChange = (side: 'a' | 'b', versionId: string) => {
    const version = versions.find(v => v.id === versionId) || null;
    if (side === 'a') {
      setCompareVersions(version, compareVersionB);
    } else {
      setCompareVersions(compareVersionA, version);
    }
  };

  const swapVersions = () => {
    setCompareVersions(compareVersionB, compareVersionA);
  };

  const newStyles = {
    variables: {
      dark: {
        diffViewerBackground: '#0d1117',
        diffViewerColor: '#c9d1d9',
        addedBackground: '#12261e',
        addedColor: '#3fb950',
        removedBackground: '#2d1215',
        removedColor: '#f85149',
        wordAddedBackground: '#1a4028',
        wordRemovedBackground: '#4b1a1e',
        addedGutterBackground: '#0d2117',
        removedGutterBackground: '#241013',
        gutterBackground: '#161b22',
        gutterBackgroundDark: '#12161c',
        highlightBackground: '#1c2333',
        highlightGutterBackground: '#1c2333',
        codeFoldGutterBackground: '#161b22',
        codeFoldBackground: '#12161c',
        emptyLineBackground: '#0d1117',
        gutterColor: '#484f58',
        addedGutterColor: '#3fb950',
        removedGutterColor: '#f85149',
        codeFoldContentColor: '#6e7681',
        diffViewerTitleBackground: '#161b22',
        diffViewerTitleColor: '#c9d1d9',
        diffViewerTitleBorderColor: '#30363d',
      },
    },
    line: {
      fontSize: '13px',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    },
  };

  return (
    <div className="flex flex-col h-full page-enter">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-dark-800/90 border-b border-dark-600 backdrop-blur-sm">
        <div className="flex items-center gap-3 fade-in-up">
          <button
            onClick={() => navigate(`/workbench/${selectedSnippet.id}`)}
            className="btn-ghost p-1.5 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-sm font-semibold text-dark-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Compare Versions
            </h2>
            <p className="text-[11px] text-dark-500">{selectedSnippet.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Split/Unified toggle */}
          <div className="flex items-center bg-dark-700/50 rounded-lg p-0.5">
            <button
              onClick={() => setSplitView(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                splitView
                  ? 'bg-dark-600 text-dark-200 shadow-sm'
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setSplitView(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                !splitView
                  ? 'bg-dark-600 text-dark-200 shadow-sm'
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              Unified
            </button>
          </div>
        </div>
      </div>

      {/* Version selectors */}
      <div className="flex items-center gap-3 px-4 py-3 bg-dark-800/50 border-b border-dark-600">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-dark-400 font-medium w-14 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-red/60" />
            Base
          </span>
          <select
            value={compareVersionA?.id || ''}
            onChange={(e) => handleVersionChange('a', e.target.value)}
            className="input-field text-sm py-1.5 flex-1"
          >
            <option value="">Select version...</option>
            {versions.map(v => (
              <option key={v.id} value={v.id}>
                v{v.version} &mdash; {v.commitMessage}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={swapVersions}
          className="btn-ghost p-2 rounded-lg hover:bg-dark-700/50 transition-transform hover:rotate-180"
          title="Swap versions"
        >
          <svg className="w-4 h-4 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-dark-400 font-medium w-14 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-green/60" />
            Compare
          </span>
          <select
            value={compareVersionB?.id || ''}
            onChange={(e) => handleVersionChange('b', e.target.value)}
            className="input-field text-sm py-1.5 flex-1"
          >
            <option value="">Select version...</option>
            {versions.map(v => (
              <option key={v.id} value={v.id}>
                v{v.version} &mdash; {v.commitMessage}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diff content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center scale-in">
              <div className="spinner mx-auto mb-3" />
              <p className="text-dark-400 text-sm">Loading versions...</p>
            </div>
          </div>
        ) : compareVersionA && compareVersionB ? (
          <div className="fade-in-up">
            <ReactDiffViewer
              oldValue={compareVersionA.code}
              newValue={compareVersionB.code}
              splitView={splitView}
              useDarkTheme
              styles={newStyles}
              leftTitle={`v${compareVersionA.version} \u2014 ${compareVersionA.commitMessage}`}
              rightTitle={`v${compareVersionB.version} \u2014 ${compareVersionB.commitMessage}`}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center scale-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-dark-700/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-dark-300 mb-1">Select two versions</h3>
              <p className="text-dark-500 text-sm max-w-xs mx-auto">
                Choose a base version and a comparison version to see the differences.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
