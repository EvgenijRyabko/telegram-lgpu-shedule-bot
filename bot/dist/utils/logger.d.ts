declare class CustomLogger {
    winstonFileLogger: import("winston").Logger;
    log(message: string, fromModule?: string, optionalParam?: any): Promise<void>;
    error(message: string, fromModule?: string, optionalParam?: any): Promise<void>;
}
export declare const logger: CustomLogger;
export {};
