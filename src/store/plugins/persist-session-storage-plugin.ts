import {Store, type StorePlugin} from "../index";

export class PersistSessionStoragePlugin<T extends Object> implements StorePlugin<T> {
    private readonly itemName: string;

    constructor(itemName: string) {
        this.itemName = itemName
    }


    async onCreate(store: Store<T>) {
        const dataString = sessionStorage.getItem(this.itemName)
        if (dataString) {
            const savedData = JSON.parse(dataString) as T
            (Object.keys(savedData) as Array<keyof T>).forEach((key => {
                if (store.state.hasOwnProperty(key)) {
                    store.set(key, savedData[key])
                }
            }))
        }
    }

    async onStateChanged<K extends keyof T>(_: K, __: T[K], store: Store<T>): Promise<void> {
        sessionStorage.setItem(this.itemName, JSON.stringify(store.state));
    }

    async onReset(): Promise<void> {
        sessionStorage.removeItem(this.itemName);
    }
}