export type Message = {
  id: number;
  type: 'user' | 'bot' | 'error';
  text: string;
  sources?: string[];
};

export type SubmitQueryRequest = {
  query_text: string;
};

export type QueryResponse = {
  query_text: string;
  response_text: string;
  sources: string[];
};

export interface StreamData {
  sources: string[];
  answer: string;
}

export type StreamChunk = {
  sources?: string[];
  answer?: string;
};
