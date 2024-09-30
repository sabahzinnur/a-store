export declare function defineStore<T extends Object>(state: T, options?: {
    plugins?: StorePlugin<T>[];
}): Store<T>;

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
    private readonly plugins;
    private readonly initialStateValue;
    constructor(state: T, options?: {
        plugins?: StorePlugin<T>[];
    });
    reset(): void;
    set<K extends keyof T>(key: K, value: T[K]): void;
    private onCreate;
    private onStateChange;
    private onReset;
    private lock;
    private lockState;
    private lockStateProp;
    private unlockStateProp;
}

export declare interface StorePlugin<T extends Object> {
    onStateChanged<K extends keyof T>(key: K, value: T[K], store: Store<T>): Promise<void>;
    onCreate(store: Store<T>): Promise<void>;
    onReset(store: Store<T>): Promise<void>;
}

export { }
