import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { Box } from "@mui/material";
import React, { useState } from "react";

type compProps = {
  lastSeen: number;
};

export const DisconectedNotificationMessage = ({ lastSeen }: compProps) => {
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  setInterval(() => {
    console.log("setInterval: setCurrentTime");
    setCurrentTime(new Date().getTime());
  }, 1000);

  return (
    <>
      {currentTime - lastSeen > 1500 && lastSeen != 0 && (
        <Box
          sx={{
            width: "100%",
            color: "white",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "error.light",
            p: 1,
          }}>
          You're offline. Please ckeck your internet connection!
          {`${currentTime} - ${lastSeen} = ${currentTime - lastSeen}`}
        </Box>
      )}
    </>
  );
};

type props = {
  state: HubConnectionState;
};

export const ConnectionClosedNotificationMessage = ({ state }: props) => (
  <Box
    sx={{
      width: "100%",
      color: "white",
      display: state === HubConnectionState.Connected ? "none" : "flex",
      justifyContent: "center",
      backgroundColor:
        state === HubConnectionState.Disconnected
          ? "error.main"
          : "primary.main",
      p: 1,
    }}>
    {state}
    {/* {`Connection closed. Try refreshing this page to restart the connection.`} */}
  </Box>
);
