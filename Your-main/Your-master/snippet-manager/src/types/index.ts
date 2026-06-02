export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
}

export interface Snippet {
  id: string;
  userId: string;
  title: string;
  description: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  latestVersion: number;
}

export interface SnippetVersion {
  id: string;
  snippetId: string;
  version: number;
  code: string;
  commitMessage: string;
  createdAt: string;
  author: string;
}

export interface Comparison {
  id: string;
  snippetId: string;
  versionAId: string;
  versionBId: string;
  createdAt: string;
}

export type LanguageColor = {
  [key: string]: string;
};

export const LANGUAGE_COLORS: LanguageColor = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3572A5',
  java: '#b07219',
  rust: '#dea584',
  go: '#00ADD8',
  cpp: '#f34b7d',
  html: '#e34c26',
  css: '#563d7c',
  sql: '#e38c00',
};
