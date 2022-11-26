export interface IMailer {
  sendMail(email: string, subject: string, content: string): boolean;
}

export class ConsoleMailer implements IMailer {
  sendMail(email: string, subject: string, content: string) {
    console.log(
      `Sent mail to ${email} ("${subject}"), body is ${content.length} bytes.`
    );

    return true;
  }
}
