export declare function defineStore<T extends Object>(state: T, options?: {
    plugins?: StorePlugin<T>[];
    immutable?: boolean;
    logger?: Logger;
}): Readonly<Store<Readonly<T>>>;

declare interface Logger {
    warn(message: string): void;
}

export declare class PersistLocalStoragePlugin<T extends Object> implements StorePlugin<T> {
    private readonly itemName;
    constructor(itemName: string);
    onCreate(store: Store<T>): Promise<void>;
    onStateChanged<K extends keyof T>(_: K, __: T[K], store: Store<T>): Promise<void>;
    onReset(): Promise<void>;
}

export declare class PersistSessionStoragePlugin<T extends Object> implements StorePlugin<T> {
    private readonly itemName;
    constructor(itemName: string);
    onCreate(store: Store<T>): Promise<void>;
    onStateChanged<K extends keyof T>(_: K, __: T[K], store: Store<T>): Promise<void>;
    onReset(): Promise<void>;
}

export declare class Store<T extends Object> {
    state: T;
    private readonly initialStateValue;
    private readonly plugins;
    private readonly immutable;
    private readonly lockedProperties;
    private readonly logger;
    constructor(state: T, options?: {
        plugins?: StorePlugin<T>[];
        immutable?: boolean;
        logger?: Logger;
    });
    private lock;
    private onCreate;
    reset(): void;
    private onReset;
    set<K extends keyof T>(key: K, value: T[K]): void;
    private onStateChange;
    private createState;
    private lockStateProp;
    private unlockStateProp;
}

export declare interface StorePlugin<T extends Object> {
    onStateChanged<K extends keyof T>(key: K, value: T[K], store: Store<T>): Promise<void>;
    onCreate(store: Store<T>): Promise<void>;
    onReset(store: Store<T>): Promise<void>;
}

export { }
