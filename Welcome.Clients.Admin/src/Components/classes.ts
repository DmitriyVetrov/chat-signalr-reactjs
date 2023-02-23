import { ILogger, LogLevel } from "@microsoft/signalr";
import { Brand, UserConnection } from "./types";

export class ChatMessage {
  constructor(message: string, authorName: string, authorId: string, avatarSrc: string, roomId: string = "", fromUserId: string = "", toUserId: string = "") {
    this.roomId = roomId;
    this.authorId = authorId;
    this.authorName = authorName;
    this.avatarSrc = avatarSrc;
    this.message = message;
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
  }
  roomId: string;
  authorId: string;
  authorName: string;
  avatarSrc: string;
  message: string;
  receivedDateTime: Date = new Date();
  unread: boolean = true;
  fromUserId: string;
  toUserId: string;
}

export class User {
  get IsEmpty(): boolean {
    return this.id === "" || this.id === undefined || this === undefined;
  }

  static get New(): User {
    return new User("", "", "", "");
  }
  constructor(id: string, fullName: string, providerId: string, avatarImage: string) {
    this.id = id;
    this.avatarImage = avatarImage;
    this.fullName = fullName;
    this.providerId = providerId;
    this.unreadMessages = 0;
    this.email = "";
    this.phone = "";
    (this.ipAddress = ""),
      (this.connectionId = ""),
      (this.connections = [
        {
          connectionId: "",
          ipAdress: "",
          browserName: "",
          isTechConnection: false,
        },
      ]);
  }
  id: string;
  fullName: string;
  providerId: string;
  connections: UserConnection[];
  unreadMessages: number;
  avatarImage?: string;
  ipAddress: string;
  connectionId: string;
  email: string;
  phone: string;
  lastSeen: number = new Date().getTime();
}

export class Room {
  static get New(): Room {
    return new Room("");
  }
  constructor(id: string, brand?: Brand, customer?: User) {
    this.id = id;
    this.brand = brand;
    this.unreadMessages = 0;
    this.customer = customer;
  }
  id: string;
  brand?: Brand;
  unreadMessages: number;
  customer?: User;
}

export class BasicLogger implements ILogger {
  constructor(disconnectionHandler: () => void) {
    this.disconnectionHandler = disconnectionHandler;
  }
  log(logLevel: LogLevel, message: string) {
    // Use `message` and `logLevel` to record the log message to your own system
    if (logLevel === LogLevel.Error) {
      this.disconnectionHandler();
      console.log("error: ", message);
    }
  }
  private disconnectionHandler: () => void;
}
