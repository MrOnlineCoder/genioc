export type Newable<T> = new (...args: any[]) => T;

export type DefaultDependencyToken = string | symbol;

export type DependencyBinding = {
  type: "class";
  classConstructor: Function;
};

export type ConstructorsDependenciesMetadata = {
    [className: string]: string[];
  }

export interface IPrebuildMetadata {
  constructors: ConstructorsDependenciesMetadata;
  injectableTypes: Set<string>;
}

export class AbstractContainer<AllowedInjectableToken extends DefaultDependencyToken> {
  private prebuildMetadata: ConstructorsDependenciesMetadata;

  private instances: Map<AllowedInjectableToken, any>;
  private bindings: Map<AllowedInjectableToken, DependencyBinding>;

  constructor(metadata: ConstructorsDependenciesMetadata) {
    this.instances = new Map();
    this.bindings = new Map();
    this.prebuildMetadata = metadata;
  }

  private getOrResolve<T>(token: AllowedInjectableToken): T {
    const existingInstance = this.instances.get(token);

    if (existingInstance) return existingInstance;

    const binding = this.bindings.get(token);

    if (!binding)
      throw new Error(`No binding was found for ${token.toString()}`);

    const constructor: Newable<T> = binding.classConstructor as Newable<T>;

    const dependenciesNames =
      this.prebuildMetadata[constructor.name] || [];

    const dependencies = [];

    for (const depName of dependenciesNames) {
      dependencies.push(
        this.getOrResolve(Symbol.for(depName) as AllowedInjectableToken)
      );
    }

    const instance = new constructor(...dependencies);

    this.instances.set(token, instance);

    return instance;
  }

  public get<T>(tokenOrClass: AllowedInjectableToken | Function): T {
    const token =
      typeof tokenOrClass === "function"
        ? Symbol.for(tokenOrClass.name)
        : tokenOrClass;

    return this.getOrResolve(token as AllowedInjectableToken);
  }

  public bind(token: AllowedInjectableToken, to: Function) {
    this.bindings.set(token, {
      type: "class",
      classConstructor: to,
    });
  }

  public bindSelf(arg: Function) {
    const classSymbol = Symbol.for(arg.name) as AllowedInjectableToken;

    this.bindings.set(classSymbol, {
      type: "class",
      classConstructor: arg,
    });
  }
}
