export interface ILogger {
    log(message: string): void;
}

export class ConsoleLogger implements ILogger {
    log(message: string) {
        console.log(`<INFO> [${new Date().toISOString()}] ${message}`);
    }
}