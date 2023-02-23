import { ILogger, LogLevel } from "@microsoft/signalr";

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
