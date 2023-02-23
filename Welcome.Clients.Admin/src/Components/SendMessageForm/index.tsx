import React from 'react';
import { Box, Fab, FormControl, TextField } from '@mui/material';
import { useState } from 'react';
import { Send } from '@mui/icons-material';

type Props = {
  sendMessage: (message: string) => void;
};

const SendMessageForm = ({ sendMessage }: Props) => {
  const [message, setMessage] = useState('');

  return (
    <Box
      component="form"
      sx={{ display: 'flex' }}
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (message.trim() != '') {
          sendMessage(message);
          setMessage('');
        }
      }}>
      <FormControl fullWidth>
        <TextField
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setMessage(e.target.value);
          }}
          inputProps={{ maxLength: 20000 }}
          label="Message"
          variant="filled"
          size="small"
          sx={{ m: 1 }}
        />
      </FormControl>
      <Box>
        <Fab
          type="submit"
          color="primary"
          aria-label="add"
          size="medium"
          sx={{
            m: 1,
            '&:hover': {
              backgroundColor: 'secondary.main',
            },
          }}>
          <Send />
        </Fab>
      </Box>
    </Box>
  );
};

export default SendMessageForm;
