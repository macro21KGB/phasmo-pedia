import React, { useState } from 'react';
import {
  useMutation,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Message } from './types';
import { submitQuery } from './services/RagService';

const queryClient = new QueryClient();

const PhasmoChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  // Mutation hook for sending query
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: submitQuery,
    onSuccess: (data) => {
      const newMessage: Message = {
        id: Date.now(),
        type: 'bot',
        text: data.response_text,
        sources: data.sources,
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now(),
        type: 'error',
        text:
          error instanceof Error ? error.message : 'An unknown error occurred',
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    sendMessage(input);
    setInput('');
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <Paper
        elevation={3}
        sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}
      >
        <Typography
          variant='h6'
          sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          PhasmoChat
        </Typography>
        <List sx={{ flexGrow: 1, overflow: 'auto', padding: 2 }}>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                flexDirection: 'column',
                alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 1,
                  maxWidth: '80%',
                  bgcolor:
                    message.type === 'user'
                      ? 'primary.light'
                      : message.type === 'error'
                        ? 'error.light'
                        : 'background.paper',
                  color:
                    message.type === 'error' ? 'error.contrastText' : 'inherit',
                }}
              >
                <ListItemText primary={message.text} />
              </Paper>
              {message.sources && (
                <Typography variant='caption' sx={{ mt: 0.5 }}>
                  Sources: {message.sources.join(', ')}
                </Typography>
              )}
            </ListItem>
          ))}
          {isPending && (
            <ListItem sx={{ justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </ListItem>
          )}
        </List>
        <Box
          component='form'
          onSubmit={handleSubmit}
          sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex' }}
        >
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Type your query...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            sx={{ mr: 1 }}
          />
          <Button
            type='submit'
            variant='contained'
            endIcon={
              isPending ? (
                <CircularProgress size={20} color='inherit' />
              ) : (
                <SendIcon />
              )
            }
            disabled={isPending}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <PhasmoChat />
  </QueryClientProvider>
);

export default App;
