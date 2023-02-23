export type ChatMessage = {
  RoomId: string;
  AuthorId: string;
  UserName: string;
  Message: string;
  ReceivedDateTime: string;
  Unread: boolean;
};

export type Brand = {
  id: string;
  name: string;
};

export type unreadMessagesCount = {
  fromId: string;
  count: number;
};

export type UserConnection = {
  connectionId: string;
  ipAdress: string;
  browserName: string;
  isTechConnection: boolean;
};
