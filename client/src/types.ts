export type Message = {
  id: number;
  type: 'user' | 'bot' | 'error';
  text: string;
  sources?: string[];
};

export type StreamChunk = {
  sources?: string[];
  answer?: string;
};
