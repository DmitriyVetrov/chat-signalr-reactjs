import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { useLocation } from 'react-router-dom';

const pages = [
  { title: 'Chat', href: '/Chat' },
  { title: 'Parser', href: '/Parser' },
  { title: 'About', href: '/About' },
];

function ApplicationBar() {
  let location = useLocation();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}>
            Welcome
          </Typography>
          {pages.map((page) => (
            <Button href={page.href} color="inherit" sx={{ opacity: location.pathname.toLowerCase() == page.href.toLowerCase() ? 1 : 0.7 }}>
              {page.title}
            </Button>
          ))}
          {/* <Button href="/Chat" color="inherit" sx={{ opacity: 1 == 1 ? 0.7 : 1 }}>
            Chat
          </Button>
          <Button href="/Parser" color="inherit">
            Parser
          </Button>
          <Button href="/About" color="inherit">
            About
          </Button> */}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
export default ApplicationBar;
