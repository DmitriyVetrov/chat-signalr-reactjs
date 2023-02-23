import EmailIcon from '@mui/icons-material/Email';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import { Avatar, Box, Button, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { deepPurple, grey, red } from '@mui/material/colors';
import RightSideToolBar from '../RightSideToolBar';
import { stringAvatar } from '../../../Utils';
import { IoMdChatboxes } from 'react-icons/io';
import { User } from '../../classes';
import { useContext } from 'react';
import { ApplicationContext } from '../../../Contexts';
import { StyledListItemAvatarProperties, StyledListItemTopProperties, StyledListProperties } from '../StyledProperties';
import BlockIpAddressDialog from '../../Dialogs/BlockIpAddressDialog';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

type Props = {
  customer: User;
};

const CustomerProperties = ({ customer }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const appContext = useContext(ApplicationContext);
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
      }}>
      <RightSideToolBar plainText="Contact Info"></RightSideToolBar>
      <StyledListProperties>
        <StyledListItemTopProperties>
          <StyledListItemAvatarProperties>
            {customer.avatarImage === '' ? (
              <Avatar {...stringAvatar(customer.fullName.toUpperCase(), 'large')}></Avatar>
            ) : (
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                }}
                src={customer.avatarImage}>
                <h1>
                  <IoMdChatboxes></IoMdChatboxes>
                </h1>
              </Avatar>
            )}
          </StyledListItemAvatarProperties>
          <ListItemText
            primary={customer.fullName}
            primaryTypographyProps={{
              color: 'text.primary',
              fontWeight: 'medium',
            }}
            secondary={
              <Button
                startIcon={<AccountCircleOutlinedIcon />}
                disableElevation
                variant="contained"
                color="primary"
                target="_blank"
                href={`/Manage/Contact/EditContact?id=${customer.id}`}
                sx={{
                  borderRadius: 2,
                  mt: 1,
                  textTransform: 'none',
                  fontSize: 13,
                  fontWeight: 400,
                  color: 'white!important',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                  },
                }}>
                View Profile
              </Button>
            }
          />
        </StyledListItemTopProperties>

        {/* EMAIL text */}
        <ListItem
          component="div"
          disablePadding
          sx={{
            pt: 1,
            pb: 1,
            backgroundColor: '#F7F7F7',
            boxShadow: '0 6px 6px -6px rgba(222,222,222)',
            borderTop: 1,
            borderBottom: 1,
            borderColor: '#e9e9e9',
            mb: 1,
          }}>
          <ListItemAvatar sx={{ pl: 3, pr: 2, minWidth: 42 }}>
            <Avatar sx={{ bgcolor: deepPurple[200], width: 28, height: 28 }}>
              <EmailIcon sx={{ width: 16, height: 16 }} />
            </Avatar>
          </ListItemAvatar>

          <ListItemText
            primary={customer.email}
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

        {/* BLOCK */}
        <ListItem
          component="div"
          disablePadding
          sx={{
            pb: 1,
            pt: 1,
            mb: 1,
            color: red[300],
            backgroundColor: '#F7F7F7',
            boxShadow: '0 6px 6px -6px rgba(222,222,222)',
            borderTop: 1,
            borderBottom: 1,
            borderColor: '#e9e9e9',
          }}>
          <ListItemButton
            sx={{
              height: 56,
              pl: 3,
              pr: 3,
            }}
            onClick={() => setDialogOpen(true)}>
            <Tooltip title={customer.connectionId ?? ''} placement="left-start" enterDelay={1500}>
              <ListItemIcon sx={{ color: red[200] }}>
                <PanToolOutlinedIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText
              primary="Block user by IP address"
              secondary={customer.ipAddress}
              key="112233"
              primaryTypographyProps={{
                fontSize: 15,
                fontWeight: 'medium',
                lineHeight: '20px',
                mb: '2px',
              }}
            />
          </ListItemButton>
        </ListItem>
      </StyledListProperties>
      <BlockIpAddressDialog
        open={dialogOpen}
        ipAddress={customer.ipAddress}
        closeDialog={() => setDialogOpen(false)}
        handleAgree={() => {
          setDialogOpen(false);
        }}></BlockIpAddressDialog>
    </Box>
  );
};

export default CustomerProperties;
