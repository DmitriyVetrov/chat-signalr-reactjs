import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import './App.css';
import Lobby from './Components/Lobby';
import Chat from './Components/Chat';
import { Backdrop, CircularProgress, ThemeProvider, Typography } from '@mui/material';
import theme from './Theme';
import { unreadMessagesCount } from './Components/types';
import { BasicLogger, User } from './Components/classes';
import { ChatMessage, Room } from './Components/classes';
import { postData, browserName } from './Utils';
import { ApplicationContext } from './Contexts';
import { useSnackbar } from 'notistack';
import { ConnectionClosedNotificationMessage } from './Components/NotificationBarMessages';
import { Route, Routes } from 'react-router-dom';
import { Home } from './Components/Pages/Home';
import { About } from './Components/Pages/About';
import { Parser } from './Components/Pages/Parser';

const webApiUrl: string = (process.env.NODE_ENV === 'development' ? process.env.REACT_APP_WEBAPI_DEV : process.env.REACT_APP_WEBAPI_PROD) as string;

const cayzuAgent: User = new User(
  (document.getElementById('agentMemberId') as HTMLInputElement).value,
  (document.getElementById('agentUserName') as HTMLInputElement).value,
  (document.getElementById('agentProviderId') as HTMLInputElement).value,
  (document.getElementById('agentAvatarImage') as HTMLInputElement)?.value
);
cayzuAgent.email = (document.getElementById('agentEmail') as HTMLInputElement)?.value;
cayzuAgent.phone = (document.getElementById('agentPhone') as HTMLInputElement)?.value;
const verificationToken = (document.getElementById('verificationToken') as HTMLInputElement)?.value;

cayzuAgent.unreadMessages = 1;

const App = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedAgent, setSelectedAgent] = useState<User>(User.New);
  const [selectedRoom, setSelectedRoom] = useState<Room>(Room.New);
  const [signedInUser, setCurrentAgent] = useState<User | undefined>();
  const [agents, setAgents] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [connection, setConnection] = useState<HubConnection>();
  const [messages, setMessages] = useState<Array<ChatMessage>>([]);
  const [directMessages, setDirectMessages] = useState<Array<ChatMessage>>([]);
  const [rightSideBarOpen, setRightSideBarOpen] = useState<boolean>(false);
  const [connectionState, setconnectionState] = useState<HubConnectionState>(HubConnectionState.Connected);

  const signInAgent = async (agent: User) => {
    try {
      await postData(webApiUrl + '/login', {
        UserName: agent.fullName,
        ProviderId: agent.providerId,
        MemberId: agent.id,
        AvatarImage: agent.avatarImage,
        Phone: agent.phone,
        Email: agent.email,
        Token: verificationToken,
      }).then(async (response) => {
        const connection = new HubConnectionBuilder()
          .withUrl(webApiUrl + '/chatHub', {
            accessTokenFactory: () => response.token,
          })
          .withAutomaticReconnect()
          .configureLogging(new BasicLogger(() => setconnectionState(HubConnectionState.Reconnecting)))
          .build();

        connection.onreconnecting((error) => {
          console.log('Reconnecting... ', error);
          setconnectionState(HubConnectionState.Reconnecting);
        });

        connection.onreconnected((conId) => {
          setconnectionState(HubConnectionState.Connected);
          console.log('Reconnected... ', conId);
          enqueueSnackbar("You're on-line again", { variant: 'info' });
        });

        connection.on('AgentIsSignedIn', (agent: User) => {
          setCurrentAgent(agent);
        });

        connection.on('AgentsInProviderRoom', (receivedAgents: User[]) => {
          setAgents((prevAgents) => {
            let ags: User[] = [];
            receivedAgents
              .filter((a) => a.id !== agent.id)
              .forEach((ra) => {
                const ind = prevAgents.findIndex((pa) => pa.id === ra.id);
                if (ind > -1) {
                  prevAgents[ind].connections = ra.connections.sort((a, b) => (a.isTechConnection > b.isTechConnection ? 1 : -1));
                  ags.push(prevAgents[ind]);
                } else ags.push(ra);
              });

            return ags.sort((a, b) => (a.fullName > b.fullName ? 1 : -1));
          });
        });

        connection.on('RefreshUnreadDirectMessagesCounters', (counters: unreadMessagesCount[]) => {
          setAgents((previousAgents: User[]) =>
            previousAgents.map((a) => {
              const counter = counters.find((c) => c.fromId === a.id);
              a.unreadMessages = counter === undefined ? 0 : counter.count;
              return a;
            })
          );
          setRooms((previousRooms: Room[]) =>
            previousRooms.map((r) => {
              const counter = counters.find((c) => c.fromId === r.id);
              r.unreadMessages = counter === undefined ? 0 : counter.count;
              return r;
            })
          );
        });

        connection.on('MyRooms', (rooms: Room[]) => {
          setRooms(rooms);
        });

        connection.on('ReceiveMessage', (roomId: string, userName: string, message: string, agentId: string, avatarSrc: string) => {
          setMessages((messages) => [...messages, new ChatMessage(message, userName === agent.fullName ? 'me' : userName, agentId, avatarSrc, roomId)]);
        });

        connection.on('ReceiveDirectMessage', (message: string, authorName: string, authorId: string, toUserId: string, avatarSrc: string) => {
          // Update direct messages
          setDirectMessages((directMessages) => [...directMessages, new ChatMessage(message, authorName, authorId, avatarSrc, toUserId)]);
        });

        connection.onclose((e) => {
          setCurrentAgent(User.New);
          setAgents([]);
          setRooms([]);
          setConnection(undefined);
          setMessages([]);
          setDirectMessages([]);
          setconnectionState(HubConnectionState.Disconnected);
        });

        await connection.start();
        // fetch("https://jsonip.com", { mode: "cors" })
        //   .then((resp) => resp.json())
        //   .then((data) => {
        //     connection
        //       .invoke("SignInAgent", data.ip, browserName, false)
        //       .catch((err) => console.error(err));
        //   });

        setConnection(connection);
        setconnectionState(HubConnectionState.Connected);
      });
    } catch (e) {
      console.log(e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    }
  };

  const isConnected = (): boolean => connection?.state === HubConnectionState.Connected;

  const sendMessageToRoom = async (message: string, room: string) => {
    if (isConnected()) {
      try {
        await connection?.invoke('SendMessageToRoom', signedInUser?.fullName, message, room);
      } catch (e) {
        console.log(e);
        setMessages((messages) => [...messages, new ChatMessage('Message cannot be sent due to a connection issue', 'Bot chat', '0', '', room)]);
      }
    } else setMessages((messages) => [...messages, new ChatMessage("Message cannot be sent as you're off-line", 'Bot chat', '0', '', room)]);
  };

  const sendDirectMessage = async (message: string, toAgentId: string) => {
    if (isConnected())
      await connection?.invoke('SendDirectMessage', message, toAgentId).catch((err) => {
        console.error(err);
        setDirectMessages((directMessages) => [
          ...directMessages,
          new ChatMessage('Message cannot be sent due to a connection issue', 'Bot chat', '0', toAgentId),
        ]);
      });
    else
      setDirectMessages((directMessages) => [...directMessages, new ChatMessage("Message cannot be sent as you're off-line", 'Bot chat', '0', '', toAgentId)]);
  };

  const cleanUnreadDirectMessagesCounters = async (forAgentId: string) => {
    if (isConnected()) {
      await connection?.invoke('CleanUnreadDirectMessagesCounters', forAgentId).catch((err) => console.error(err));
    }
  };

  const closeRoom = async (roomId: string) => {
    if (isConnected()) {
      await connection?.invoke('CloseRoom', roomId).catch((err) => console.error(err));
      setMessages(
        messages.filter((chatMessage) => {
          if (chatMessage.roomId !== roomId) return chatMessage;
        })
      );
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      console.log('useEffect: signInAgent done!');
      signInAgent(cayzuAgent);
    }
  }, []);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/Parser" element={<Parser />} />
        <Route
          path="/Chat"
          element={
            <>
              <ThemeProvider theme={theme}>
                <ConnectionClosedNotificationMessage state={connectionState}></ConnectionClosedNotificationMessage>
                {signedInUser !== undefined && (
                  <ApplicationContext.Provider
                    value={{
                      signedInUser,
                      agents,
                      selectedAgent,
                      setSelectedAgent,
                      rooms,
                      selectedRoom,
                      setSelectedRoom,
                      rightSideBarOpen,
                      setRightSideBarOpen,
                    }}>
                    <Chat
                      messages={messages}
                      directMessages={directMessages}
                      sendMessageToRoom={sendMessageToRoom}
                      sendDirectMessage={sendDirectMessage}
                      closeRoom={closeRoom}
                      cleanUnreadMessageCounter={cleanUnreadDirectMessagesCounters}></Chat>
                  </ApplicationContext.Provider>
                )}
                {signedInUser === undefined && (
                  <Box>
                    <Typography variant="h4" align="center" sx={{ padding: '20px' }}>
                      Chat Entrance
                    </Typography>
                    <Lobby signInAgent={signInAgent}></Lobby>
                  </Box>
                )}
              </ThemeProvider>
            </>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
