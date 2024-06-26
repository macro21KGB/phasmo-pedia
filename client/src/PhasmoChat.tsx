import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  TextField,
  CircularProgress,
  Container,
  IconButton,
  ListItem,
  List,
  ListItemText,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Message } from './types';
import { submitQuery } from './services/RagService';

const sample_messages: Message[] = [
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
];

export const PhasmoChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(sample_messages);
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
    <>
      <Container
        maxWidth='md'
        sx={{
          height: '100%',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <List
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
          }}
        >
          {messages.map((message) => {
            const secondaryText = message.sources
              ? `Sources: ${message.sources.join(', ')}`
              : '';
            return (
              <ListItem
                key={message.id}
                sx={{
                  flexDirection: 'column',
                  alignItems:
                    message.type === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <ListItemText
                  primary={message.text}
                  secondary={secondaryText}
                  sx={{
                    maxWidth: '80%',
                    bgcolor:
                      message.type === 'user'
                        ? 'secondary.main'
                        : message.type === 'error'
                          ? 'error.main'
                          : 'transparent',
                    p: 2,
                    borderRadius: 10,
                    textTransform: 'uppercase',
                  }}
                />
              </ListItem>
            );
          })}
          {isPending && (
            <ListItem sx={{ justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </ListItem>
          )}
        </List>
        <Box
          component='form'
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            bgcolor: 'secondary.main',
            borderRadius: 10,
            justifySelf: 'flex-end',
          }}
        >
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Type your query...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            sx={{ pl: 2, '& fieldset': { border: 'none' } }}
            autoComplete='off'
          />
          <IconButton aria-label='submit' type='submit'>
            <SendIcon />
          </IconButton>
        </Box>
      </Container>
    </>
  );
};
