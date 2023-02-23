import React from 'react';
import { User, Room } from '../Components/classes';

export const ApplicationContext = React.createContext({
  signedInUser: User.New,
  agents: [User.New],
  selectedAgent: User.New,
  setSelectedAgent: (agent: User) => {},
  rooms: [Room.New],
  selectedRoom: Room.New,
  setSelectedRoom: (room: Room) => {},
  rightSideBarOpen: false,
  setRightSideBarOpen: (open: boolean) => {},
});
