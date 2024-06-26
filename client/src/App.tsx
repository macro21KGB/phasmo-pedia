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
  CircularProgress,
  ThemeProvider,
  CssBaseline,
  Container,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import { Message } from './types';
import { submitQuery } from './services/RagService';
import theme from './theme';

const queryClient = new QueryClient();

const PhasmoChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now(),
      type: 'bot',
      text: 'Welcome to PhasmoChat! How can I assist you with your ghost hunting today?',
    },
    {
      id: Date.now() + 1000,
      type: 'user',
      text: 'Hello bot.',
    },
    {
      id: Date.now() + 2000,
      type: 'bot',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in dignissim lacus. Nam faucibus et lacus quis sodales. Praesent commodo mauris in sodales vulputate. Praesent odio nisl, scelerisque ac diam non, sodales congue enim. Donec aliquet egestas nisl ac commodo. Ut viverra scelerisque tortor in ullamcorper. Nullam eu odio vitae ligula bibendum vulputate vitae ut lorem. Aliquam erat volutpat. In a magna arcu. Etiam tincidunt mi sed efficitur commodo.',
      sources: ['source1', 'source2'],
    },
    {
      id: Date.now() + 3000,
      type: 'user',
      text: 'Give me some error please.',
    },
    {
      id: Date.now() + 4000,
      type: 'error',
      text: 'Network error',
    },
  ]);
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
    // Simulated bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now(),
        type: 'bot',
        text: `Here's a simulated response to "${input}". In a real app, this would be replaced with actual AI-generated content about Phasmophobia.`,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);

    /* Disabled sending to backend for now */
    // sendMessage(input);
    setInput('');
  };

  return (
    <Container sx={{ height: '100%', py: 2 }}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <List sx={{ flexGrow: 1, overflow: 'auto', padding: 2 }}>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  flexDirection: 'column',
                  alignItems:
                    message.type === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Card
                  sx={{
                    maxWidth: '80%',
                    bgcolor:
                      message.type === 'user'
                        ? 'primary.light'
                        : message.type === 'error'
                          ? 'error.light'
                          : 'success.light',
                    color:
                      message.type === 'error'
                        ? 'error.contrastText'
                        : 'inherit',
                    textTransform: 'uppercase',
                  }}
                >
                  <CardHeader
                    title={message.type}
                    subheader={new Date(message.id).toISOString()}
                    sx={{
                      pb: 0,
                    }}
                  />
                  <CardContent>{message.text}</CardContent>
                </Card>
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
                isPending && <CircularProgress size={20} color='inherit' />
              }
              disabled={isPending}
            >
              Send
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PhasmoChat />
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
