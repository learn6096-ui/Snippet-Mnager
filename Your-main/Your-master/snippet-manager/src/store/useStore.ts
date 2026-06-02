import { create } from 'zustand';
import { User, Snippet, SnippetVersion } from '../types';
import { api } from '../api/mockApi';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;

  // Snippets
  snippets: Snippet[];
  selectedSnippet: Snippet | null;
  selectedLanguage: string | null;
  isLoadingSnippets: boolean;
  fetchSnippets: () => Promise<void>;
  createSnippet: (data: { title: string; description: string; language: string; initialCode: string; commitMessage: string }) => Promise<Snippet>;
  deleteSnippet: (snippetId: string) => Promise<void>;
  selectSnippet: (snippet: Snippet) => void;
  setSelectedLanguage: (lang: string | null) => void;

  // Versions
  versions: SnippetVersion[];
  selectedVersion: SnippetVersion | null;
  isLoadingVersions: boolean;
  fetchVersions: (snippetId: string) => Promise<void>;
  selectVersion: (version: SnippetVersion) => void;
  commitVersion: (snippetId: string, message: string, code: string) => Promise<void>;

  // Diff
  compareVersionA: SnippetVersion | null;
  compareVersionB: SnippetVersion | null;
  setCompareVersions: (a: SnippetVersion | null, b: SnippetVersion | null) => void;

  // Current editor code
  editorCode: string;
  setEditorCode: (code: string) => void;

  // UI
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  login: async (email, password) => {
    const { data } = await api.login(email, password);
    set({ user: data.user, isAuthenticated: true });
  },
  signup: async (username, email, password) => {
    const { data } = await api.signup(username, email, password);
    set({ user: data.user, isAuthenticated: true });
  },
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      snippets: [],
      selectedSnippet: null,
      versions: [],
      selectedVersion: null,
      editorCode: '',
    });
  },

  // Snippets
  snippets: [],
  selectedSnippet: null,
  selectedLanguage: null,
  isLoadingSnippets: false,
  fetchSnippets: async () => {
    const { user } = get();
    if (!user) return;
    set({ isLoadingSnippets: true });
    const { data } = await api.getSnippetsByUser(user.id);
    set({ snippets: data, isLoadingSnippets: false });
  },
  createSnippet: async ({ title, description, language, initialCode, commitMessage }) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');
    const { data } = await api.createSnippet(
      user.id, title, description, language, initialCode, commitMessage
    );
    // Prepend new snippet so it appears at the top of the list
    set(state => ({ snippets: [data.snippet, ...state.snippets] }));
    // Seed versions in the store for immediate workbench load
    set({
      selectedSnippet: data.snippet,
      versions: [data.version],
      selectedVersion: data.version,
      editorCode: data.version.code,
    });
    return data.snippet;
  },
  deleteSnippet: async (snippetId) => {
    await api.deleteSnippet(snippetId);
    set(state => ({
      snippets: state.snippets.filter(s => s.id !== snippetId),
      selectedSnippet: state.selectedSnippet?.id === snippetId ? null : state.selectedSnippet,
    }));
  },
  selectSnippet: (snippet) => {
    set({
      selectedSnippet: snippet,
      selectedVersion: null,
      versions: [],
      editorCode: '',
      compareVersionA: null,
      compareVersionB: null,
    });
  },
  setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),

  // Versions
  versions: [],
  selectedVersion: null,
  isLoadingVersions: false,
  fetchVersions: async (snippetId) => {
    set({ isLoadingVersions: true });
    const { data } = await api.getVersions(snippetId);
    set({ versions: data, isLoadingVersions: false });
    // Auto-select latest version
    if (data.length > 0) {
      const latest = data[data.length - 1];
      set({ selectedVersion: latest, editorCode: latest.code });
    }
  },
  selectVersion: (version) => {
    set({ selectedVersion: version, editorCode: version.code });
  },
  commitVersion: async (snippetId, message, code) => {
    const { data } = await api.createVersion(snippetId, message, code);
    set(state => ({
      versions: [...state.versions, data],
      selectedVersion: data,
    }));
  },

  // Diff
  compareVersionA: null,
  compareVersionB: null,
  setCompareVersions: (a, b) => set({ compareVersionA: a, compareVersionB: b }),

  // Editor
  editorCode: '',
  setEditorCode: (code) => set({ editorCode: code }),

  // UI
  sidebarCollapsed: false,
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
