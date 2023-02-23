import React, { useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import { BsReverseLayoutSidebarReverse } from "react-icons/bs";
import { Typography } from "@mui/material";
import { ApplicationContext } from "../../Contexts";
import { styled } from "@mui/styles";

const StyledToolbar = styled(Toolbar)({
  padding: "0 5px 0 20px",
  backgroundColor: "#F7F7F7",
});

const TopToolBar = () => {
  const appContext = useContext(ApplicationContext);
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <StyledToolbar variant="dense">
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
        >
          {appContext.selectedAgent.fullName !== ""
            ? appContext.selectedAgent.fullName
            : appContext.selectedRoom.customer?.fullName !== undefined
            ? appContext.selectedRoom.customer?.fullName
            : "General Chat"}
        </Typography>
        <IconButton
          size="medium"
          edge="start"
          color={appContext.rightSideBarOpen ? "primary" : "secondary"}
          aria-label="menu"
          onClick={() =>
            appContext.setRightSideBarOpen(!appContext.rightSideBarOpen)
          }
        >
          <BsReverseLayoutSidebarReverse />
        </IconButton>
      </StyledToolbar>
    </AppBar>
  );
};

export default TopToolBar;
