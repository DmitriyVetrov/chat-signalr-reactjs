import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import StyledButton from '../../Buttons';

type Props = {
  open: boolean;
  closeDialog: () => void;
  roomIndexToClose: number;
  roomNameToClose: string;
  handleAgree: (index: number) => void;
};

const AlertDialog = ({ open, closeDialog, roomIndexToClose, handleAgree }: Props) => {
  return (
    <div>
      <Dialog open={open} onClose={closeDialog} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">Are you sure to close the chat?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Closing the chat means that the question asked by the user has been resolved, the user is satisfied with the answer and there are no more questions
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <StyledButton color="error" onClick={closeDialog}>
            No
          </StyledButton>
          <StyledButton color="secondary" onClick={() => handleAgree(roomIndexToClose)} autoFocus>
            Yes
          </StyledButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AlertDialog;
