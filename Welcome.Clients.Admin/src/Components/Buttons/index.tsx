import * as React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)<ButtonProps>(({ color, theme }) => ({
  backgroundColor: color === 'error' ? theme.palette.error.main : color === 'secondary' ? theme.palette.secondary.main : theme.palette.primary.main,
  color: 'white',
  borderRadius: 4,
  paddingTop: 8,
  paddingBottom: 8,
  paddingLeft: 16,
  paddingRight: 16,
  fontSize: 16,
  fontWeight: 400,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: color === 'error' ? theme.palette.error.main : color === 'secondary' ? theme.palette.secondary.main : theme.palette.primary.main,
  },
}));

const CustomButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};

export default CustomButton;
