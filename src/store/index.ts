export interface StorePlugin<T extends Object> {
    onStateChanged<K extends keyof T>(key: K, value: T[K], store: Store<T>): Promise<void>

    onCreate(store: Store<T>): Promise<void>

    onReset(store: Store<T>): Promise<void>
}

export interface Logger {
    warn(message: string): void
}

export class Store<T extends Object> {
    public state: T
    private readonly initialStateValue: T
    private readonly plugins: StorePlugin<T>[]
    private readonly immutable: boolean
    private readonly lockedProperties: Set<keyof T> = new Set()
    private readonly logger: Logger

    public constructor(state: T, options?: {
        plugins?: StorePlugin<T>[],
        immutable?: boolean,
        logger?: Logger
    }) {
        this.logger = options?.logger ?? console
        this.immutable = options?.immutable ?? true
        this.plugins = options?.plugins ?? []

        this.state = this.createState(state)
        this.initialStateValue = JSON.parse(JSON.stringify(state))

        this.lock()

        this.onCreate()
    }

    private lock() {
        if (this.immutable) {
            ;(Object.keys(this.state) as Array<keyof T>).forEach((key => {
                this.lockStateProp(key)
            }))
        }

        Object.freeze(this)
    }

    private onCreate() {
        this.plugins.forEach(async plugin => {
            await plugin.onCreate(this)
        })
    }

    public reset() {
        (Object.keys(this.initialStateValue) as Array<keyof T>).forEach((key => {
            this.set(key, this.initialStateValue[key])
        }))
        this.onReset()
    }

    private onReset() {
        this.plugins.forEach(async plugin => {
            await plugin.onReset(this);
        })
    }

    public set<K extends keyof T>(key: K, value: T[K]) {
        if (this.immutable) this.unlockStateProp(key)
        this.state[key] = value
        if (this.immutable) this.lockStateProp(key)
        this.onStateChange(key, value)
    }

    private onStateChange<K extends keyof T>(key: K, value: T[K]) {
        this.plugins.forEach(async plugin => {
            await plugin.onStateChanged(key, value, this);
        })
    }

    private createState(state: T) {
        if (!this.immutable) return state

        const handler: ProxyHandler<T> = {
            set: (target, property, value) => {
                const key = property as keyof T
                if (this.lockedProperties.has(key)) {
                    this.logger.warn(`[Store] Attempted to directly modify locked state property "${String(property)}". Use store.set() method instead.`)
                    return true
                }
                target[key] = value
                return true
            },
            deleteProperty: (_, property) => {
                this.logger.warn(`[Store] Attempted to delete state property "${String(property)}". State property deletion is not allowed.`)
                return true
            }
        }

        return new Proxy(state, handler)
    }

    private lockStateProp<K extends keyof T>(key: K) {
        this.lockedProperties.add(key)
    }

    private unlockStateProp<K extends keyof T>(key: K) {
        this.lockedProperties.delete(key)
    }
}