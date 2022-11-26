# genioc

Bloat-free and magical IoC-container for Typescript based on code-generation

## Why another IoC/DI library?

* this is initially a personal pet-project, so first of all - just for gaining experience
* I don't like existing typescript solutions for dependency injection, such as inversify or even Nest.js IoC - they are either not maintained that much or use outdated/non-standard 'reflect-metadata' and are based on also non-standard decorators
* I want to be able to magically inject dependencies in TS as guys do in Java, C# or even PHP!

## So what's changed?

In Java or PHP, because of powerful built-in reflection features, you can inject dependencies into constructors just by specifying correct type:

```java
class UserService {
    public UserService(IUserRepository userRepo) {
        this.userRepo = userRepo;
    }
}
```

in current TS/JS solutions, you will have either to:

1) use tokens with decorators:

```ts
const UserRepositoryIdentifier = Symbol.for('UserRepository')

class UserService {
    constructor(
        @inject(UserRepositoryIdentifier) private readonly userRepo: IUserRepository
    ) {

    }
}
```

2) in such solutions as `awilix` with `InjectMode.CLASSIC`, you must preserve the original names of the arguments in the code, and therefore cannot minify the code.


3) destruct object in the constructor which contains all dependencies, which basically is a violation of IoC principle and resolves to Service locator pattern

```js
class UserService {
  constructor(opts) {
    this.emailService = opts.emailService // this is not true DI!
    this.logger = opts.logger
  }
}
```
And as you might see, all these solutions are kinda hacky and not as magical and easy-to-use as Java one for example.

`genioc` on other hand, allows you to write Java-way injection:


```ts
class UserService {
    constructor(
        private readonly userRepo: IUserRepository
    ) {

    }
}
```

Yes, that is really that simple. Just do not forget to bind the actual `IUserRepository` to an implementation.

**However**, there is one catch - you must run `genioc` script everytime you add a new dependency in the code. And to find out why, now we come to the mechanism how `genioc` works.  

## How it works?

For `genioc` to work, there is additional pre-processing step before running your app.

`genioc` compiles your Typescript project, parses dependencies of each class constructor, and generates a specific-for-you-project file which exports a ready-to-use IoC container for you.

Example usage:

```ts
//userService.ts
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository
  ) {
    
  }
}

```

```ts
//index.ts
import container from './genioc.autogenerated.ts'

container.bind("IUserRepository", SqlUserRepository);
container.bindSelf(UserService);

const userService: UserService = container.get(UserService);

userService.doStuff(); //at this point, userService would be a valid instance with SqlUserRepository implementation injected
```

Because of current Typescript limitations, you must pass interface names as strings to bind them. However, `genioc` creates a union special type for that to guarantee that you will enter a valid interface name.

## Usage in project

Due `genioc` being not quite a default library, you must alter your development workflow a little:

1. First you define interfaces of your dependencies such as `IUserRepository`, `IMailer` or `ILogger`, etc..
2. Then you create actual implementations for them: `SqlUserRepository`, `MailchimpMailer`, `ConsoleLogger`
3. Then you pass interfaces for these dependencies to classes where you need them, for example:

```ts
class MyService {
    constructor(
        private readonly mailer: IMailer,
        private readonly userRepo: IUserRepository
    ) {

    }

    public resetPassword(email: string) {
        const user = await this.useRepo.findByEmail(email);

        await mailer.sendResetPasswordEmail(user.email, user.resetToken);
    }
}
```
4. You run `genioc` to generate IoC container code for you
5. You bind interfaces to their dependencies:
```ts
import container from './genioc.autogenerated.ts'

container.bind('ILogger', ConsoleLogger);
container.bind('IMailer', MailchimpMailer);
container.bind('IUserRepository', SqlUserRepository);
```
6. Done. You can now run your app


## Command line usage

```
genioc [--dev] [project directory]
```
* `--dev` - only used when testing genioc example itself
* `project directory` - path to your project with tsconfig.json. If not used, it will use current process working directory.


## Author
Nikita Kogut

## License
MIT (see LICENSE file)