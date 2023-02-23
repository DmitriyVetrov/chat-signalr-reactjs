import React, { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { addResponseMessage, Widget } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import { Brand, ChatSettings, CheckEmailResponse, StyleProps, User } from './types';
import { createGlobalStyle } from 'styled-components';
import validator from 'validator';
import { postData } from '../Utils';
import { BasicLogger } from './classes';
import manSvg from '../Images/man.png';

const webApiUrl = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_WEBAPI_DEV : process.env.REACT_APP_WEBAPI_PROD;

const fullName = (document.getElementById('fullName') as HTMLInputElement).value;
const userName = (document.getElementById('userName') as HTMLInputElement).value;
const userId = (document.getElementById('userId') as HTMLInputElement).value;
const avatarImage = (document.getElementById('avatarImage') as HTMLInputElement).value;
let providerId = (document.getElementById('providerId') as HTMLInputElement).value;
const brandId = (document.getElementById('brandId') as HTMLInputElement).value;
const brandName = (document.getElementById('brandName') as HTMLInputElement).value;

const defaultAgentAvatar = '../Images/man.svg';

const GlobalStyle = createGlobalStyle<StyleProps>`
.rcw-conversation-container > .rcw-header { background-color: ${(props) => props.backgroundColor}; }
.rcw-launcher { background-color: ${(props) => props.backgroundColor}; }
.rcw-picker-btn { display: none; }
.rcw-new-message { width: 100% }
`;

const brand: Brand = { id: brandId, name: brandName };
const chatSettingsEmpty: ChatSettings = {
  brandId: 0,
  color: '',
  isActive: false,
  logo: '',
  name: '',
  providerId: 0,
};

const App = () => {
  const [chatSettings, setChatSettings] = useState<ChatSettings>(chatSettingsEmpty);
  const [isActive, setIsActive] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [agentAvatar, setAgentAvatar] = useState<string>(defaultAgentAvatar);
  const [user, setUser] = useState<User>({
    id: userId,
    providerId: Number(providerId),
    fullName,
    userName,
    email: userName,
    avatarImage,
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(user.fullName !== '');
  const [pendingChat, setPendingChat] = useState<boolean>(true);
  const [connection, setConnection] = useState<HubConnection>();
  const [connectionState, setconnectionState] = useState<HubConnectionState>(HubConnectionState.Connected);
  const [reconnected, setReconnected] = useState<boolean>(false);

  useEffect(() => {
    if (connectionState === HubConnectionState.Reconnecting) {
      addResponseMessage('Connection is poor ...reconnecting');
    } else if (connectionState === HubConnectionState.Connected && reconnected) {
      addResponseMessage("You're on-line again");
    } else if (connectionState === HubConnectionState.Disconnected) {
      addResponseMessage('Connection is lost. Please refresh the page after a while');
    }
  }, [connectionState]);

  useEffect(() => {
    const fetchChatSettings = async () => {
      const responseIpAddress = await fetch('https://jsonip.com', {
        mode: 'cors',
      });
      if (!responseIpAddress.ok) {
        throw new Error(`cannot take the ip address`);
      }
      const data = await responseIpAddress.json();
      setUser((usr) => {
        usr.ipAddress = data.ip;
        return usr;
      });

      const responseChatSettings = await fetch(`${webApiUrl}/settings?id=${brand.id}&ipAddress=${user.ipAddress}`, { mode: 'cors' });
      if (!responseChatSettings.ok) {
        throw new Error(`Error! status: ${responseChatSettings.status}`);
      }
      const chatSettings = await responseChatSettings.json();
      setChatSettings(chatSettings);
      setIsActive(chatSettings.isActive);
    };
    fetchChatSettings().catch(console.error);

    if (isAuthenticated) {
      addResponseMessage(`Hi ${user.fullName}!
      How can I help you?`);
    } else {
      addResponseMessage('Hello. Can I have your email address so we can connect you to an agent?');
    }

    const connection = new HubConnectionBuilder()
      .withUrl(`${webApiUrl}/chatHub`)
      .withAutomaticReconnect()
      .configureLogging(new BasicLogger(() => setconnectionState(HubConnectionState.Reconnecting)))
      .build();

    connection.onreconnecting((error) => {
      console.log('Reconnecting... ', error);
      setconnectionState(HubConnectionState.Reconnecting);
    });

    connection.onreconnected((conId) => {
      console.log('Reconnected... ', conId);
      setReconnected(true);
      setconnectionState(HubConnectionState.Connected);
      connection?.invoke('RequestChat', '', user, brand);
    });

    connection.on('ReceiveMessage', (room: string, user: string, message: string, connectionId?: string, avatarImage?: string) => {
      if (connection.connectionId != connectionId) {
        addResponseMessage(message);
        setAgentAvatar(avatarImage ?? defaultAgentAvatar);
      }
    });

    connection.on('BlockChatWidget', () => {
      setChatSettings((chatSet) => {
        chatSet.isActive = false;
        return chatSet;
      });
      setIsActive(false);
      console.log('chatSettings.isActive', chatSettings.isActive);
      console.log('isActive', isActive);
    });

    connection.on('PendingChat', (pending: boolean) => {
      setPendingChat(pending);
    });

    connection.onclose((e) => {
      setconnectionState(HubConnectionState.Disconnected);
    });

    connection.start();

    setConnection(connection);
  }, []);

  const sendMessage = async (message: string) => {
    await connection?.invoke('SendMessageToRoom', user.fullName, message, `Chat_With_${connection?.connectionId}`);
  };

  const requestChat = async (message: string) => {
    try {
      await connection?.invoke('RequestChat', message, user, brand);
    } catch (e) {
      console.log(e);
    }
  };

  const handleNewUserMessage = (newMessage: string) => {
    if (!isAuthenticated) {
      if (step === 1) {
        if (validator.isEmail(newMessage)) {
          try {
            postData(webApiUrl + '/user/check', { email: newMessage }).then(async (response: CheckEmailResponse) => {
              if (response.found) {
                setIsAuthenticated(true);
                setUser((u) => {
                  u.email = newMessage;
                  u.fullName = response.fullName;
                  return u;
                });
                addResponseMessage(`Hi ${user.fullName}!
                  How can I help you?`);
              } else {
                setUser((u) => {
                  u.email = newMessage;
                  return u;
                });
                addResponseMessage('What is your full name?');
              }
            });
          } catch (e) {
            addResponseMessage('We are so sorry, internal server error');
          }
          setStep(2);
        } else {
          addResponseMessage('Please enter a valid email');
        }
      }
      if (step === 2) {
        setUser((u) => {
          u.fullName = newMessage;
          return u;
        });
        setIsAuthenticated(true);
        addResponseMessage(`Hi ${user.fullName}!
        How can I help you?`);
      }
    } else if (pendingChat) {
      requestChat(newMessage);
      setPendingChat(false);
      return;
    }
    sendMessage(newMessage);
  };

  return (
    <>
      <GlobalStyle backgroundColor={chatSettings.color}></GlobalStyle>
      {chatSettings.isActive && (
        <Widget
          handleNewUserMessage={handleNewUserMessage}
          subtitle={`Wellcome ${user.fullName}${connectionState === HubConnectionState.Connected ? '' : ' (' + connectionState + ')'}`}
          profileAvatar={manSvg}
          titleAvatar={chatSettings.logo}
          title={chatSettings.name}
        />
      )}
    </>
  );
};

export default App;
