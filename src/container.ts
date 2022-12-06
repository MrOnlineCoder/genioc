export type Newable<T> = new (...args: any[]) => T;

export type DefaultDependencyToken = string | symbol | Function;

export type DependencyBinding = {
  classConstructor?: Function;
  constantValue?: any;
};

export type ConstructorsDependenciesMetadata = {
  [className: string]: string[];
};

export interface IPrebuildMetadata {
  constructors: ConstructorsDependenciesMetadata;
  injectableTypes: Set<string>;
}

export class AbstractContainer<
  AllowedInjectableToken extends DefaultDependencyToken
> {
  private prebuildMetadata: ConstructorsDependenciesMetadata;

  private instances: Map<symbol, any>;
  private bindings: Map<symbol, DependencyBinding>;

  constructor(metadata: ConstructorsDependenciesMetadata) {
    this.instances = new Map();
    this.bindings = new Map();
    this.prebuildMetadata = metadata;
  }

  private toSymbolToken(token: AllowedInjectableToken): symbol {
    if (typeof token == "symbol") {
      return token;
    } else if (typeof token === "string") {
      return Symbol.for(token);
    } else if (typeof token === "function") {
      return Symbol.for((token as Function).name);
    }

    throw new Error(`Unsupported token provided`);
  }

  private makeCircularResolveProxy(internalToken: AllowedInjectableToken) {
    const _container = this;

    //for circular dependencies, we inject proxy which will resolve to 
    return new Proxy(
      {},
      {
        get(target, property, receiver) {
          const instance = _container.get(internalToken) as any;

          return Reflect.get(instance, property, receiver);
        },
        set(target, property, value, receiver) {
          const instance = _container.get(internalToken) as any;

          return Reflect.set(instance, property, value, receiver);
        },
      }
    );
  }

  private getOrResolve<T>(
    token: AllowedInjectableToken,
    resolveParents: symbol[] = []
  ): T {
    const bindableToken = this.toSymbolToken(token);

    const existingInstance = this.instances.get(bindableToken);

    if (existingInstance) return existingInstance;

    const binding = this.bindings.get(bindableToken);

    if (!binding)
      throw new Error(`No binding was found for ${token.toString()}`);

    if (binding.classConstructor) {
      const constructor: Newable<T> = binding.classConstructor as Newable<T>;

      const dependenciesNames = this.prebuildMetadata[constructor.name] || [];

      const dependencies = [];

      for (const depName of dependenciesNames) {
        //if we encountered circular dependency, use a proxy
        if (resolveParents.includes(Symbol.for(depName))) {
          dependencies.push(
            this.makeCircularResolveProxy(
              Symbol.for(depName) as AllowedInjectableToken
            )
          );
          continue;
        }

        dependencies.push(
          this.getOrResolve(Symbol.for(depName) as AllowedInjectableToken, [
            ...resolveParents,
            bindableToken,
          ])
        );
      }

      const instance = new constructor(...dependencies);

      this.instances.set(bindableToken, instance);
    } else if (binding.constantValue) {
      this.instances.set(bindableToken, binding.constantValue);
    }

    return this.instances.get(bindableToken);
  }

  public get<T>(tokenOrClass: AllowedInjectableToken): T {
    return this.getOrResolve(tokenOrClass);
  }

  public bind(token: AllowedInjectableToken, to: Function) {
    this.bindings.set(this.toSymbolToken(token), {
      classConstructor: to,
    });
  }

  public bindValue<T = any>(token: AllowedInjectableToken, value: T) {
    this.bindings.set(this.toSymbolToken(token), {
      constantValue: value,
    });
  }

  public bindSelf(arg: Function) {
    this.bindings.set(Symbol.for(arg.name), {
      classConstructor: arg,
    });
  }
}
