export interface cacheFactoryInterface {
    (cacheId: string, options?: {
        capacity?: number;
    }): cacheObject;
    info?(): any;
    get?(cacheId: string): cacheObject;
}
export interface cacheObject {
    put<T>(key: string, value: T): T;
    get<T>(key: string): T;
    remove(key: string): void;
    removeAll(): void;
    destroy(): void;
    info(): {
        id: string;
        size: number;
    };
}
export declare let cacheFactory: cacheFactoryInterface;
