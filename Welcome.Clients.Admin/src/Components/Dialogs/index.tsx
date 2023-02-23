import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Dialog, DialogProps } from '@mui/material';

const StyledDialog = styled(Dialog)<DialogProps>(() => ({
  borderRadius: 0,
  boxShadow: '1px 1px 7px 1px rgb(128 128 128 / 20%)',
}));

const CustomDialogContent: React.FC<DialogProps> = ({ children, ...props }) => {
  return <StyledDialog {...props}>{children}</StyledDialog>;
};

export default CustomDialogContent;
