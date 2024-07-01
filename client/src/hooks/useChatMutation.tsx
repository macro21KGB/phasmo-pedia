import { useMutation } from '@tanstack/react-query';
import { submitQueryStream } from '../services/RagService';
import { Message, StreamChunk } from '../types';

export const useChatMutation = (onNewMessage: (message: Message) => void) => {
  return useMutation({
    mutationFn: submitQueryStream,
    onSuccess: async (response) => {
      // Prepping for the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streaming = true;

      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const botMessageId = Date.now();
      const botMessage: Message = {
        id: botMessageId,
        type: 'bot',
        text: '',
        sources: [],
      };

      onNewMessage(botMessage);

      while (streaming) {
        // Here we start reading the stream, until its done.
        const { value, done } = await reader.read();
        if (done) {
          streaming = false;
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          try {
            const data: StreamChunk = JSON.parse(line);
            if (data.sources) {
              console.log(data.sources);
              botMessage.sources = data.sources;
            }
            if (data.answer !== undefined) {
              console.log(data.answer);
              botMessage.text += data.answer;
            }
            onNewMessage(botMessage);
          } catch (error) {
            console.error('Failed to parse streaming data:', error);
          }
        }
      }
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now(),
        type: 'error',
        text:
          error instanceof Error ? error.message : 'An unknown error occurred',
      };
      onNewMessage(errorMessage);
    },
  });
};
