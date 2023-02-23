import { Avatar, Box, Stack, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../classes';
import { stringAvatar } from '../../Utils';

type Props = {
  messages: Array<ChatMessage>;
};

const MessageContainer = ({ messages }: Props) => {
  const messageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messageRef && messageRef.current) {
      const { scrollHeight, clientHeight } = messageRef.current;
      messageRef.current.scrollTo({
        left: 0,
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <Box ref={messageRef} sx={{ m: 1, height: '100vh', overflow: 'auto' }}>
      {messages.map((m, index) => {
        if (m.authorName == 'me') {
          return (
            <Stack key={index} direction="row" justifyContent="end" mt={1}>
              <Tooltip key={index} title={m.receivedDateTime.toLocaleTimeString()} placement="left-start" enterDelay={500}>
                <Box
                  key={m.receivedDateTime.toISOString()}
                  sx={{
                    borderRadius: '18px',
                    pl: 2,
                    pr: 2,
                    pt: 1,
                    pb: 1,
                    bgcolor: 'primary.main',
                    color: '#fff',
                    width: 'fit-content',
                    wordBreak: 'break-word',
                  }}>
                  {m.message}
                </Box>
              </Tooltip>
            </Stack>
          );
        } else if (m.authorName == 'Bot chat') {
          return (
            <Typography key={index} variant="caption" display="block" align="center" paragraph={true}>
              {m.message}
            </Typography>
          );
        } else {
          //
          // This is a message from the outside
          //
          const displayName = m.avatarSrc === '' ? m.authorName.toUpperCase() : '';
          return (
            <Stack key={index} direction="row" justifyContent="start" mt={1}>
              <Tooltip key={`${index}_avatar`} title={m.authorName} placement="left-start" enterDelay={500}>
                <Avatar src={m.avatarSrc} {...stringAvatar(displayName, 'small')}></Avatar>
              </Tooltip>
              <Tooltip key={m.receivedDateTime.toLocaleTimeString()} title={m.receivedDateTime.toLocaleTimeString()} placement="left-start" enterDelay={500}>
                <Box
                  sx={{
                    borderRadius: '18px',
                    pl: 2,
                    pr: 2,
                    pt: 1,
                    pb: 1,
                    bgcolor: '#e4e6eb',
                    width: 'fit-content',
                    fontSize: '13px',
                    fontFamily: 'Roboto',
                    wordBreak: 'break-word',
                  }}>
                  {m.message}
                </Box>
              </Tooltip>
            </Stack>
          );
        }
      })}
    </Box>
  );
};

export default MessageContainer;
