/// <reference types="node" />
export declare function checkPathExist(path: string): Promise<boolean>;
export declare function mkdir(path: string): Promise<void>;
export declare function dropFile(path: string, handler?: (e: any) => any): Promise<void>;
export declare function clearFile(path: string): Promise<void>;
export declare function writeFile(path: string, data: Buffer): Promise<void>;
