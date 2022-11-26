import { IUserRepository } from "./user.repository";

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository
  ) {
    
  }

  public register(fullname: string, email: string) {
    this.userRepository.save({
        email,
        fullname,
        password: Math.random().toString()
    });
  }
}
