import { IUser } from "./user.entity";

export interface IUserRepository {
    save(user: IUser): void;
}

export class UserRepository implements IUserRepository {
    private users: IUser[] = [];

    save(user: IUser): void {
        this.users.push(user);

        console.log(`Saved user ${user.email}`)
    }

}