import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Chip, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, ListSubheader } from '@mui/material';
import { KeyboardArrowDown, Close, AccountCircleOutlined } from '@mui/icons-material';
import { Box } from '@mui/system';
import AlertDialog from '../Dialogs/AlertDialog';
import { ApplicationContext } from '../../Contexts';
import { IoMdChatboxes } from 'react-icons/io';
import { stringAvatar } from '../../Utils';

type Props = {
  selectRoom: (roomId: string) => void;
  selectAgent: (agentId: string) => void;
  closeRoom: (roomId: string) => void;
};

const ChatsList = ({ selectRoom, selectAgent, closeRoom }: Props) => {
  const appContext = useContext(ApplicationContext);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [firstTime, setfirstTime] = useState(true);

  const [roomIndexToClose, setRoomIndexToClose] = useState(0);
  const [roomNameToClose, setRoomIdToClose] = useState('');

  const handleCloseRoom = (index: number) => {
    setOpenAlertDialog(true);
    setRoomIndexToClose(index);
    setRoomIdToClose(appContext.rooms[index].id);
  };

  useEffect(() => {
    if ((appContext.agents.length === 0 && selectedIndex >= 1000) || (appContext.rooms.length > 0 && selectedIndex === 0 && firstTime)) {
      setSelectedIndex(0);
      selectRoom(appContext.rooms[0].id);
      setfirstTime(false);
    }
  });

  return (
    <List component={'nav'} dense sx={{ height: '100vh' }} disablePadding>
      <ListItem component="div" disablePadding>
        <ListItemButton
          sx={{ height: 90, pl: 3, pt: 1 }}
          key="general_chat"
          selected={selectedIndex === 0}
          onClick={() => {
            setSelectedIndex(0);
            selectRoom(appContext.rooms[0].id);
          }}>
          <ListItemAvatar>
            <Avatar sx={{ background: 'linear-gradient(to bottom, #4F95FE, #7879FD)' }}>
              <IoMdChatboxes></IoMdChatboxes>
            </Avatar>
          </ListItemAvatar>

          <ListItemText
            primary="General Chat"
            primaryTypographyProps={{
              fontSize: 15,
              fontWeight: 'medium',
              lineHeight: '20px',
              mb: '2px',
            }}
          />
          {appContext.rooms.length > 0 && appContext.rooms[0].unreadMessages > 0 && selectedIndex !== 0 && (
            <Chip label={appContext.rooms[0].unreadMessages} color="primary" size="small" />
          )}
        </ListItemButton>
      </ListItem>
      {
        // Agent's Chats
      }
      {appContext.agents.length > 0 && <ListSubheader></ListSubheader>}
      {appContext.agents.map((usr, ind) => (
        <ListItemButton
          selected={selectedIndex === (ind + 1) * 1000}
          key={usr.id}
          sx={{ height: 56, pl: 3 }}
          onClick={() => {
            setSelectedIndex((ind + 1) * 1000);
            selectAgent(usr.id);
          }}>
          <ListItemAvatar>
            <Avatar src={usr.avatarImage}>
              <AccountCircleOutlined></AccountCircleOutlined>
            </Avatar>
          </ListItemAvatar>

          <ListItemText primary={usr.fullName} />
          {usr.unreadMessages > 0 && appContext.selectedAgent.id !== usr.id && <Chip label={usr.unreadMessages} color="primary" size="small" />}
        </ListItemButton>
      ))}
      {
        // Chats with Customers
      }
      {appContext.rooms.length > 1 && <ListSubheader>Chats with Customers</ListSubheader>}
      {appContext.rooms.slice(1).map((rm, index) => (
        <ListItem component="div" disablePadding key={rm.id}>
          <ListItemButton
            sx={{ height: 56, pl: 3 }}
            key={rm.customer?.fullName}
            selected={selectedIndex === index + 1}
            onClick={() => {
              setSelectedIndex(index + 1);
              selectRoom(rm.id);
            }}>
            <ListItemAvatar>
              {rm.customer !== undefined && (
                <Avatar
                  src={rm.customer.avatarImage}
                  {...stringAvatar(rm.customer.avatarImage === '' ? rm.customer.fullName.toUpperCase() : '', 'medium')}></Avatar>
              )}
            </ListItemAvatar>
            <ListItemText
              key={rm.id}
              primary={rm.customer?.fullName}
              secondary={rm.brand?.name}
              primaryTypographyProps={{
                fontSize: 15,
                fontWeight: 'medium',
                lineHeight: '20px',
                mb: '2px',
              }}
            />
            {appContext.rooms.length > 1 && appContext.rooms[index + 1].unreadMessages > 0 && selectedIndex !== index + 1 && (
              <Chip label={appContext.rooms[index + 1].unreadMessages} color="primary" size="small" />
            )}

            <IconButton edge="end" aria-label="close" color="default" onClick={() => handleCloseRoom(index + 1)}>
              <Close />
            </IconButton>
          </ListItemButton>
        </ListItem>
      ))}
      {appContext.rooms.length > 1 && (
        <Box>
          <AlertDialog
            open={openAlertDialog}
            closeDialog={() => setOpenAlertDialog(false)}
            roomIndexToClose={roomIndexToClose}
            roomNameToClose={roomNameToClose}
            handleAgree={(index) => {
              closeRoom(appContext.rooms[index].id);
              setSelectedIndex(index - 1);
              selectRoom(appContext.rooms[index - 1].id);
              setOpenAlertDialog(false);
            }}
          />
        </Box>
      )}
    </List>
  );
};

export default ChatsList;
