import React from 'react';
import { List, ListItem, ListItemAvatar, ListItemAvatarProps, ListItemProps, ListProps } from '@mui/material';
import { styled } from '@mui/styles';

export const StyledListItemAvatarProperties: React.FC<ListItemAvatarProps> = ({ children }) => {
  const StyledListItemAvatar = styled(ListItemAvatar)({
    padding: 24,
  });

  return <StyledListItemAvatar>{children}</StyledListItemAvatar>;
};

export const StyledListItemTopProperties: React.FC<ListItemProps> = ({ children }) => {
  const StyledListItem = styled(ListItem)(() => ({
    backgroundColor: '#F7F7F7',
    boxShadow: '0 4px 6px -6px rgba(222,222,222)',
    borderBottom: 1,
    borderColor: '#e9e9e9',
    marginBottom: 8,
  }));

  return <StyledListItem disablePadding>{children}</StyledListItem>;
};

export const StyledListProperties: React.FC<ListProps> = ({ children }) => {
  const StyledList = styled(List)({
    backgroundColor: '#F1F1F1',
    height: '100%',
  });

  return (
    <StyledList dense disablePadding>
      {children}
    </StyledList>
  );
};
