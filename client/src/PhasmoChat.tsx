import React, { useEffect, useRef, useState } from 'react';
/* import { useMutation } from '@tanstack/react-query'; */
import {
  Box,
  TextField,
  /* CircularProgress, */
  Container,
  IconButton,
  ListItem,
  List,
  ListItemText,
  Typography,
  Link,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Message, StreamChunk } from './types';
/* import { submitQuery } from './services/RagService'; */

const getLastUrlPath = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

const PhasmoChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Scroll down the message list when new message added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // OLD: Mutation hook for sending query
  /* const mutation = useMutation({
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
  }); */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Getting response from server based on the user prompt
    const response = await fetch('http://localhost:5656/submit_query_stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query_text: input }),
    });
    if (!response.ok || !response.body) {
      const errorMessage: Message = {
        id: Date.now(),
        type: 'error',
        text:
          response.status && response.statusText
            ? `${response.status} ${response.statusText}`
            : 'An unknown error occurred',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

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

    setMessages((prev) => [...prev, botMessage]);

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
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...botMessage } : msg
            )
          );
        } catch (error) {
          console.error('Failed to parse streaming data:', error);
        }
      }
    }
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
        {/* mutation.isPending && (
          <ListItem sx={{ justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </ListItem>
        ) */}
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
          /* disabled={mutation.isPending} */
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

export default PhasmoChat;
