import React, { useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import { Typography } from "@mui/material";
import { ApplicationContext } from "../../../Contexts";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/styles";
import { alignProperty } from "@mui/material/styles/cssUtils";

const StyledToolbar = styled(Toolbar)({
  padding: "0 5px 0 20px",
  backgroundColor: "#F7F7F7",
});

type Props = {
  plainText: string;
};
const RightSideToolBar = ({ plainText }: Props) => {
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
          {plainText}
        </Typography>
        <IconButton
          size="medium"
          color="secondary"
          aria-label="menu"
          onClick={() => appContext.setRightSideBarOpen(false)}
        >
          <CloseIcon />
        </IconButton>
      </StyledToolbar>
    </AppBar>
  );
};

export default RightSideToolBar;
