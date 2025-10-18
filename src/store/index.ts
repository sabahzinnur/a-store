export interface StorePlugin<T extends Object> {
    onStateChanged<K extends keyof T>(key: K, value: T[K], store: Store<T>): Promise<void>

    onCreate(store: Store<T>): Promise<void>

    onReset(store: Store<T>): Promise<void>
}

export class Store<T extends Object> {
    public state: T
    private readonly plugins: StorePlugin<T>[] = []
    private readonly initialStateValue: T
    private readonly immutable
    private readonly rawState: T
    private lockedProperties: Set<keyof T> = new Set()

    public constructor(state: T, options?: {
        plugins?: StorePlugin<T>[],
        immutable?: boolean
    }) {
        this.rawState = state
        this.state = state
        this.initialStateValue = JSON.parse(JSON.stringify(state))

        if (options?.plugins) {
            this.plugins = options.plugins
        }
        this.immutable = !!options?.immutable
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
        if (this.immutable) this.unlockStateProp(key)
        this.rawState[key] = value
        if (this.immutable) this.lockStateProp(key)
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
        if (this.immutable) this.lockState()
        Object.preventExtensions(this.state)
        Object.preventExtensions(this)
        Object.freeze(this)
    }

    private lockState() {
        const handler = {
            set: (target, property, value) => {
                const key = property as keyof T
                if (this.lockedProperties.has(key)) {
                    console.warn(`[Store] Attempted to directly modify locked state property "${String(property)}". Use store.set() method instead.`)

                }
                target[key] = value
                return true
            },
            deleteProperty: (target, property) => {
                console.warn(`[Store] Attempted to delete state property "${String(property)}". Direct deletion is not allowed.`)
                return true
            }
        }

        this.state = new Proxy(this.rawState, handler)

        // Блокируем все свойства по умолчанию
        ;(Object.keys(this.state) as Array<keyof T>).forEach((key => {
            this.lockStateProp(key)
        }))
    }

    private lockStateProp<K extends keyof T>(key: K) {
        this.lockedProperties.add(key)
    }

    private unlockStateProp<K extends keyof T>(key: K) {
        this.lockedProperties.delete(key)
    }
}