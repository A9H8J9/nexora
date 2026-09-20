import type { Chat, Project } from "./types";

const STORAGE_KEYS = {
  chats: "nexora.chats",
  projects: "nexora.projects",
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadChats(): Chat[] {
  return readStorage<Chat[]>(STORAGE_KEYS.chats, []);
}

export function saveChats(chats: Chat[]): void {
  writeStorage(STORAGE_KEYS.chats, chats);
}

export function loadProjects(): Project[] {
  return readStorage<Project[]>(STORAGE_KEYS.projects, []);
}

export function saveProjects(projects: Project[]): void {
  writeStorage(STORAGE_KEYS.projects, projects);
}
