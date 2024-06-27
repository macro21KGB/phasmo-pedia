import React, { useEffect, useRef, useState } from 'react';
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
  Typography,
  Link,
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

const getLastUrlPath = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

export const PhasmoChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(sample_messages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll down the message list when new message added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    //sendMessage(input);
    setInput('');
  };

  return (
    <Container
      maxWidth='md'
      sx={{
        height: '100%',
        py: 4,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <List
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '12px',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '10px',
            WebkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,.3)',
            bgcolor: 'secondary.light',
          },
        }}
      >
        {messages.map((message) => {
          const secondaryText = message.sources ? (
            <Typography variant='overline' sx={{ display: 'flex', gap: 0.5 }}>
              Sources:
              {message.sources.map((source, index) => (
                <Link
                  key={index}
                  href={source}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {getLastUrlPath(source)}
                </Link>
              ))}
            </Typography>
          ) : (
            <></>
          );
          return (
            <ListItem
              key={message.id}
              sx={{
                flexDirection: 'column',
                alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
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
        <div ref={messagesEndRef} />
      </List>
      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          bgcolor: 'secondary.main',
          borderRadius: 10,
          justifySelf: 'flex-end',
          px: 1,
        }}
      >
        <TextField
          fullWidth
          variant='outlined'
          placeholder='Message PhasmoGPT'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{
            '& fieldset': { border: 'none' },
            '& .MuiInputBase-input': {
              fontFamily: 'Arial',
            },
          }}
          autoComplete='off'
        />
        <IconButton
          aria-label='submit'
          type='submit'
          sx={{
            bgcolor: 'secondary.light',
            height: '32px',
            width: '32px',
            alignSelf: 'center',
          }}
        >
          <SendIcon fontSize='small' />
        </IconButton>
      </Box>
    </Container>
  );
};
