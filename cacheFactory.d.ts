
declare function cacheFactory(cacheId: string, options?: cacheFactory.cacheFactoryOption): cacheFactory.cacheObject;

declare namespace cacheFactory{
  interface cacheFactoryOption {
    capacity?: number;
    [key: string]: any;
  }

  interface cacheObjectStat {
    id: string;
    size: number;
    [key: string]: any;
  }

  interface cacheObject {
    get<T>(cacheId: string): T;
    put<T>(cacheId: string, value: T): T;
    remove(cacheId: string): void;
    removeAll(): void;
    destroy(): void;
    info(): cacheObjectStat;
  }

  function info(): {
    [cacheId: string]: cacheObjectStat
  }

  function get(cacheId: string): cacheObject;
}

export default cacheFactory;
