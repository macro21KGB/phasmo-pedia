import { Message } from '../types';

const CHAT_HISTORY_KEY = 'phasmo_chat_history';

export const loadMessages = (): Message[] => {
  const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
  return savedMessages ? JSON.parse(savedMessages) : [];
};

export const saveMessages = (messages: Message[]) => {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
};

export const clearMessages = () => {
  localStorage.removeItem(CHAT_HISTORY_KEY);
};
