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
  handleAgree: () => void;
  ipAddress: string;
};

const BlockIpAddressDialog = ({ open, closeDialog, handleAgree, ipAddress }: Props) => {
  return (
    <div>
      <Dialog open={open} onClose={closeDialog} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">Add IP to Blacklist (Will be blocked)</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Banning the IP address: {ipAddress} will block them from future chats</DialogContentText>
        </DialogContent>
        <DialogActions>
          <StyledButton color="error" onClick={closeDialog}>
            Cancel
          </StyledButton>
          <StyledButton color="secondary" onClick={() => handleAgree()} autoFocus>
            Ok
          </StyledButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BlockIpAddressDialog;
