import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  Container,
  IconButton,
  ListItem,
  List,
  ListItemText,
  Typography,
  Link,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Message } from '../types';
import { useChatMutation } from '../hooks/useChatMutation';

const CHAT_HISTORY_KEY = 'phasmo_chat_history';

const loadMessages = (): Message[] => {
  const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
  return savedMessages ? JSON.parse(savedMessages) : [];
};

const saveMessages = (messages: Message[]) => {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
};

const clearMessages = () => {
  localStorage.removeItem(CHAT_HISTORY_KEY);
};

const getLastUrlPath = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

const PhasmoChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mutation = useChatMutation((newMessage) => {
    setMessages((prev) => {
      const updatedMessages = prev.find((msg) => msg.id === newMessage.id)
        ? prev.map((msg) => (msg.id === newMessage.id ? newMessage : msg))
        : [...prev, newMessage];
      saveMessages(updatedMessages);
      return updatedMessages;
    });
  });

  // Load saved messages when the component mounts
  useEffect(() => {
    const savedMessages = loadMessages();
    setMessages(savedMessages);
  }, []);

  // Scroll down the message list when new message added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    mutation.mutate(input);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClearChat = () => {
    clearMessages();
    handleClose();
    setMessages([]);
  };

  return (
    <>
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
          {mutation.isPending && (
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
          {messages.length > 0 && (
            <IconButton
              sx={{
                alignSelf: 'center',
                mr: 1,
                '&:hover': {
                  bgcolor: 'error.main',
                },
              }}
              onClick={() => setOpen(true)}
            >
              <DeleteSweepIcon fontSize='small' />
            </IconButton>
          )}
          <IconButton
            aria-label='submit'
            type='submit'
            disabled={mutation.isPending}
            sx={{
              bgcolor: 'secondary.light',
              alignSelf: 'center',
            }}
          >
            <SendIcon fontSize='small' />
          </IconButton>
        </Box>
      </Container>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        PaperProps={{
          sx: {
            bgcolor: 'secondary.main',
            fontFamily: 'Arial',
          },
        }}
      >
        <DialogTitle id='alert-dialog-title' fontFamily='inherit'>
          {'Clear Chat History?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description' fontFamily='inherit'>
            Are you sure you want to clear your chat history?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button sx={{ fontFamily: 'inherit' }} onClick={handleClose}>
            Disagree
          </Button>
          <Button
            sx={{ fontFamily: 'inherit' }}
            onClick={handleClearChat}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PhasmoChat;
