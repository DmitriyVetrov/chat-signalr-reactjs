import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import { Avatar, Box, ListItem, ListItemAvatar, ListItemText, Tooltip } from '@mui/material';
import React from 'react';
import ImageIcon from '@mui/icons-material/Image';
import { deepOrange, deepPurple, green, grey } from '@mui/material/colors';
import RightSideToolBar from '../RightSideToolBar';
import { stringAvatar } from '../../../Utils';
import { User } from '../../classes';
import { StyledListItemAvatarProperties, StyledListItemTopProperties, StyledListProperties } from '../StyledProperties';

type Props = {
  agent: User;
};

const onlyOneItemStyle = {
  pt: 1,
  pb: 1,
  backgroundColor: '#F7F7F7',
  boxShadow: '0 6px 6px -6px rgba(222,222,222)',
  borderTop: 1,
  borderBottom: 1,
  borderColor: '#e9e9e9',
  mb: 1,
};
const topItemStyle = {
  pt: 1,
  backgroundColor: '#F7F7F7',
  borderTop: 1,
  borderColor: '#e9e9e9',
};
const bottomItemStyle = {
  pb: 1,
  backgroundColor: '#F7F7F7',
  boxShadow: '0 6px 6px -6px rgba(222,222,222)',
  borderBottom: 1,
  borderColor: '#e9e9e9',
  mb: 1,
};
const internalItemStyle = {
  backgroundColor: '#F7F7F7',
};

const AgentProperties = ({ agent }: Props) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
      }}>
      <RightSideToolBar plainText={'Agent Info'}></RightSideToolBar>
      <StyledListProperties>
        <StyledListItemTopProperties>
          <StyledListItemAvatarProperties>
            {agent.avatarImage !== undefined ? (
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                }}
                src={agent.avatarImage}>
                <ImageIcon />
              </Avatar>
            ) : (
              <Avatar {...stringAvatar(agent.fullName.toUpperCase(), 'large')}></Avatar>
            )}
          </StyledListItemAvatarProperties>
          <ListItemText
            primary={agent.fullName}
            primaryTypographyProps={{
              color: 'text.primary',
              fontWeight: 'medium',
            }}
            secondary="Online"
          />
        </StyledListItemTopProperties>

        {/* EMAIL text */}
        <ListItem
          component="div"
          disablePadding
          sx={{
            pt: 1,
            backgroundColor: '#F7F7F7',
            borderTop: 1,
            borderColor: '#e9e9e9',
          }}>
          <ListItemAvatar sx={{ pl: 3, pr: 2, minWidth: 42 }}>
            <Avatar sx={{ bgcolor: deepPurple[200], width: 28, height: 28 }}>
              <EmailIcon sx={{ width: 16, height: 16 }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={agent.email}
            secondary="Email"
            key="Email-key"
            primaryTypographyProps={{
              fontSize: 15,
              fontWeight: 'medium',
              lineHeight: '20px',
              mb: '2px',
              color: 'text.primary',
            }}
          />
        </ListItem>

        {/* PHONE text */}
        <ListItem
          component="div"
          disablePadding
          sx={{
            pb: 1,
            backgroundColor: '#F7F7F7',
            boxShadow: '0 6px 6px -6px rgba(222,222,222)',
            borderBottom: 1,
            borderColor: '#e9e9e9',
            mb: 1,
          }}>
          <ListItemAvatar sx={{ pl: 3, pr: 2, minWidth: 42 }}>
            <Avatar sx={{ bgcolor: deepPurple[200], width: 28, height: 28 }}>
              <PhoneIcon sx={{ width: 16, height: 16 }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={agent.phone}
            secondary="Phone"
            key="Phone-key"
            primaryTypographyProps={{
              fontSize: 15,
              fontWeight: 'medium',
              lineHeight: '20px',
              mb: '2px',
              color: 'text.primary',
            }}
          />
        </ListItem>

        {agent.connections.map((con, index) => (
          <ListItem
            key={index}
            component="div"
            disablePadding
            sx={
              agent.connections.length === 1
                ? onlyOneItemStyle
                : index === 0
                ? topItemStyle
                : index > 0 && index < agent.connections.length - 1
                ? internalItemStyle
                : bottomItemStyle
            }>
            <Tooltip key={`tool-tip-rsidebear-${index}`} title={con.connectionId} placement="left-start" enterDelay={500}>
              <ListItemAvatar sx={{ pl: 3, pr: 2, minWidth: 42 }}>
                <Avatar sx={{ bgcolor: green[200], width: 28, height: 28 }}>
                  {con.isTechConnection ? <MarkChatUnreadIcon sx={{ width: 16, height: 16 }} /> : <LaptopMacOutlinedIcon sx={{ width: 16, height: 16 }} />}
                </Avatar>
              </ListItemAvatar>
            </Tooltip>
            <ListItemText
              primary={con.ipAdress}
              secondary="IP Address"
              primaryTypographyProps={{
                fontSize: 15,
                fontWeight: 'medium',
                lineHeight: '20px',
                mb: '2px',
                color: 'text.primary',
              }}
            />
          </ListItem>
        ))}
      </StyledListProperties>
    </Box>
  );
};

export default AgentProperties;
