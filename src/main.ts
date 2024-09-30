import {type StorePlugin, Store} from "./store";

export {type StorePlugin, Store} from "./store"
export * from "./store/plugins/persist-local-storage-plugin"
export * from "./store/plugins/persist-session-storage-plugin"
export function defineStore<T extends Object>(state: T, options?: {
    plugins?: StorePlugin<T>[]
}) {
    return new Store(state, options)
}
