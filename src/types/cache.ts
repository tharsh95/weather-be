// Simple type for our in-memory cache that mimics Redis functionality
export type CacheClient = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, expiry: string): Promise<void>;
  del(key: string): Promise<void>;
  flushall(): Promise<void>;
  status: string;
  on(event: string, callback: Function): void;
};
