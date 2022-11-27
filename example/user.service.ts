import { ILogger } from "./logger";
import { IMailer } from "./mailer";
import { IUserRepository } from "./user.repository";

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly mailer: IMailer,
    private readonly logger: ILogger
  ) {
    
  }

  public register(fullname: string, email: string) {
    this.userRepository.save({
        email,
        fullname,
        password: Math.random().toString()
    });

    this.mailer.sendMail(
      email,
      "Welcome to our app!",
      "Here is your register email confirmation"
    );

    this.logger.log(`Registered new user ${fullname} (${email})`);
  }
}
