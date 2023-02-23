import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import EmailIcon from '@mui/icons-material/Email';
import { Avatar, Box, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText, ListSubheader, Paper, Tooltip } from '@mui/material';
import React, { useContext } from 'react';
import { deepPurple, grey } from '@mui/material/colors';
import RightSideToolBar from '../RightSideToolBar';
import { stringAvatar } from '../../../Utils';
import { IoMdChatboxes } from 'react-icons/io';
import { User } from '../../classes';
import { ApplicationContext } from '../../../Contexts';
import { StyledListItemAvatarProperties, StyledListItemTopProperties, StyledListProperties } from '../StyledProperties';

const GeneralChatProperties = () => {
  const appContext = useContext(ApplicationContext);
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
      }}>
      <RightSideToolBar plainText="Chat Info"></RightSideToolBar>
      <StyledListProperties>
        <StyledListItemTopProperties>
          <StyledListItemAvatarProperties>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: 'linear-gradient(to bottom, #4F95FE, #7879FD)',
              }}>
              <h1>
                <IoMdChatboxes></IoMdChatboxes>
              </h1>
            </Avatar>
          </StyledListItemAvatarProperties>
          <ListItemText
            primary="General Chat"
            primaryTypographyProps={{
              color: 'text.primary',
              fontWeight: 'medium',
            }}
            secondary={`${appContext.agents.length} Online`}
          />
        </StyledListItemTopProperties>
      </StyledListProperties>
    </Box>
  );
};

export default GeneralChatProperties;
