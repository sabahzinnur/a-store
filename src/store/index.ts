export interface StorePlugin<T extends Object> {
    onStateChanged<K extends keyof T>(key: K, value: T[K], store: Store<T>): Promise<void>

    onCreate(store: Store<T>): Promise<void>

    onReset(store: Store<T>): Promise<void>
}

export class Store<T extends Object> {
    public state: T
    private readonly plugins: StorePlugin<T>[] = []
    private readonly initialStateValue: T

    public constructor(state: T, options?: {
        plugins?: StorePlugin<T>[]
    }) {
        this.state = state
        this.initialStateValue = JSON.parse(JSON.stringify(state))

        if (options?.plugins) {
            this.plugins = options.plugins
        }
        this.lock()
        this.onCreate()
    }

    public reset() {
        (Object.keys(this.initialStateValue) as Array<keyof T>).forEach((key => {
            this.set(key, this.initialStateValue[key])
        }))
        this.onReset()
    }

    public set<K extends keyof T>(key: K, value: T[K]) {
        this.unlockStateProp(key)
        this.state[key] = value
        this.lockStateProp(key)
        this.onStateChange(key, value)
    }

    private onCreate() {
        this.plugins.forEach(async plugin => {
            await plugin.onCreate(this)
        })
    }

    private onStateChange<K extends keyof T>(key: K, value: T[K]) {
        this.plugins.forEach(async plugin => {
            await plugin.onStateChanged(key, value, this);
        })
    }

    private onReset() {
        this.plugins.forEach(async plugin => {
            await plugin.onReset(this);
        })
    }

    private lock() {
        Object.preventExtensions(this.state)
        Object.preventExtensions(this)
        Object.freeze(this)
        this.lockState()
    }

    private lockState() {
        (Object.keys(this.state) as Array<keyof T>).forEach((key => {
            this.lockStateProp(key)
        }))
    }

    private lockStateProp<K extends keyof T>(key: K) {
        Object.defineProperty(this.state, key, {writable: false});
    }

    private unlockStateProp<K extends keyof T>(key: K) {
        Object.defineProperty(this.state, key, {writable: true});
    }
}