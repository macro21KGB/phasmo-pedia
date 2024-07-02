import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  Container,
  IconButton,
  ListItem,
  List,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Message } from '../types';
import { useChatMutation } from '../hooks/useChatMutation';
import {
  clearMessages,
  loadMessages,
  saveMessages,
} from '../services/ChatStorageService';
import LandingText from './LandingText';
import ChatMessage from './ChatMessage';
import DeleteChatDialog, { DeleteChatDialogRef } from './DeleteChatDialog';

const PhasmoChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<DeleteChatDialogRef>(null);

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
    setIsLoadingMessages(true);
    const savedMessages = loadMessages();
    setMessages(savedMessages);
    setIsLoadingMessages(false);
  }, []);

  // Scroll down the message list when new message added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendQuery = (query: string) => {
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: query,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    mutation.mutate(query);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    sendQuery(input);
  };

  const handleClearChat = () => {
    clearMessages();
    dialogRef.current?.closeDialog();
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
          {isLoadingMessages ? (
            <ListItem
              sx={{
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <CircularProgress size={24} />
            </ListItem>
          ) : messages.length > 0 ? (
            messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))
          ) : (
            <ListItem
              sx={{
                height: '100%',
              }}
            >
              <LandingText sendQuery={sendQuery} />
            </ListItem>
          )}
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
              onClick={() => dialogRef.current?.openDialog()}
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
      <DeleteChatDialog handleClearChat={handleClearChat} ref={dialogRef} />
    </>
  );
};

export default PhasmoChat;
