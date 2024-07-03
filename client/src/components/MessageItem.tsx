import { Link, ListItem, ListItemText, Typography } from '@mui/material';
import { Message } from '../types';

interface Props {
  message: Message;
}

const getLastUrlPath = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

const linkColors = ['rgb(255,189,236)', 'rgb(178,248,178)', 'rgb(255,192,107)'];

const MessageItem = ({ message }: Props) => {
  const secondaryText = message.sources ? (
    <Typography variant='overline' display='flex' gap={0.8}>
      Source(s):
      {message.sources.map((source, index) => (
        <Link
          key={index}
          href={source}
          target='_blank'
          rel='noopener noreferrer'
          color={linkColors[index % linkColors.length]}
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
};

export default MessageItem;
