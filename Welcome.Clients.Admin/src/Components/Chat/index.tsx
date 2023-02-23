import React, { useContext, useEffect, useState } from "react";
import { Box, Divider, List, ListItem, ListItemText, Slide, Stack } from "@mui/material";

import MessageContainer from "../MessageContainer";
import SendMessageForm from "../SendMessageForm";
import ChatsList from "../ChatsList";
import { ChatMessage, User, Room } from "../classes";
import { ApplicationContext } from "../../Contexts";
import TopToolBar from "../TopToolBar";
import PropertiesSideBar from "../PropertiesSideBar";

type Props = {
  messages: ChatMessage[];
  directMessages: ChatMessage[];
  sendMessageToRoom: (message: string, roomId: string) => void;
  sendDirectMessage: (message: string, toAgetnId: string) => void;
  closeRoom: (roomId: string) => void;
  cleanUnreadMessageCounter: (agentId: string) => void;
};

const Chat = ({ messages, directMessages, sendMessageToRoom, sendDirectMessage, closeRoom, cleanUnreadMessageCounter }: Props) => {
  const appContext = useContext(ApplicationContext);

  const [roomAreaSelected, setRoomAreaSelected] = useState<boolean>(true);
  const [viewMessages, setViewMessages] = useState<ChatMessage[]>([new ChatMessage("", "", "", "")]);

  // Chat Messages Filter
  useEffect(() => {
    if (roomAreaSelected === false) return;
    const roomsMessages = messages.filter((chatMessage, i) => {
      if (chatMessage.roomId === appContext.selectedRoom.id) {
        return chatMessage;
      }
    });
    setViewMessages(() => roomsMessages);
  }, [messages, appContext.selectedRoom.id, roomAreaSelected]);

  // Direct Messages Filter
  useEffect(() => {
    if (roomAreaSelected === true) return;
    const filteredMessages = directMessages.filter((directMessage, i) => {
      if (
        ((directMessage.authorId === appContext.signedInUser.id || directMessage.authorId === appContext.selectedAgent.id) &&
          (directMessage.roomId === appContext.signedInUser.id || directMessage.roomId === appContext.selectedAgent.id)) ||
        (directMessage.authorName === "Bot chat" && directMessage.roomId === appContext.selectedAgent.id)
      ) {
        return directMessage;
      }
    });
    setViewMessages(() => filteredMessages);
  }, [directMessages, appContext.selectedAgent.id, roomAreaSelected]);

  return (
    <>
      <Divider />
      <Stack direction="row" sx={{ height: "calc(100vh - 90px)" }}>
        {/* Left Side panel */}
        <Stack sx={{ width: "100%", maxWidth: 360 }}>
          {/* CHAT LIST */}
          <ChatsList
            selectRoom={(id: string) => {
              const rm = appContext.rooms.find((f) => f.id === id);
              if (rm !== undefined) {
                appContext.setSelectedRoom(rm);
              }
              setRoomAreaSelected(true);
              cleanUnreadMessageCounter(id);
              appContext.setSelectedAgent(User.New);
            }}
            selectAgent={(id) => {
              setRoomAreaSelected(false);
              cleanUnreadMessageCounter(id);
              const agnt = appContext.agents.find((f) => f.id === id);
              if (agnt !== undefined) {
                appContext.setSelectedAgent(agnt);
              }
            }}
            closeRoom={(id: string) => {
              closeRoom(id);
              appContext.setSelectedRoom(appContext.rooms[appContext.rooms.length - 2]);
            }}></ChatsList>
          {/* Online mode on/off */}
          {process.env.NODE_ENV === "production" && (
            <List component={"nav"} dense={true}>
              <Divider />
              <ListItem>
                <ListItemText secondary={`Signed in as ${appContext.signedInUser.fullName}`} />
              </ListItem>
            </List>
          )}
        </Stack>
        <Divider orientation="vertical" flexItem />
        {/* Main window chat */}
        <Stack sx={{ width: "100%" }}>
          <TopToolBar></TopToolBar>
          <Divider flexItem />
          <MessageContainer messages={viewMessages}></MessageContainer>
          <SendMessageForm
            sendMessage={(msg: string) => {
              console.log("roomId, agentId: ", appContext.selectedRoom.id, appContext.selectedAgent.id);
              if (roomAreaSelected) {
                sendMessageToRoom(msg, appContext.selectedRoom.id);
              } else {
                sendDirectMessage(msg, appContext.selectedAgent.id);
              }
            }}></SendMessageForm>
        </Stack>
        <Divider orientation="vertical" flexItem />
        <div style={{ overflow: "hidden" }}>
          <Slide direction="left" in={appContext.rightSideBarOpen} mountOnEnter unmountOnExit>
            <Stack
              sx={{
                width: "100%",
                minWidth: 580,
                height: "calc(100vh - 90px)",
              }}>
              <PropertiesSideBar></PropertiesSideBar>
            </Stack>
          </Slide>
        </div>
      </Stack>
    </>
  );
};

export default Chat;
