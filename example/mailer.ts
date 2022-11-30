import { IConfig } from "./config";

export interface IMailer {
  sendMail(email: string, subject: string, content: string): boolean;
}

export class ConsoleMailer implements IMailer {
  constructor(private readonly config: IConfig) {

  }

  sendMail(email: string, subject: string, content: string) {
    console.log(
      `Sent mail to ${email} ("${subject}"), body is ${content.length} bytes. (${this.config.environment})`
    );

    return true;
  }
}
