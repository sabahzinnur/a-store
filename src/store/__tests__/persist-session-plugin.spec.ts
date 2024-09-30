import { describe, it, expect, beforeEach } from 'vitest';
import { PersistSessionStoragePlugin } from '../plugins/persist-session-storage-plugin';
import { Store } from '../index';

interface TestState {
    count: number;
    name: string;
}

describe('PersistSessionPlugin', () => {
    const itemName = 'testItem';
    let store: Store<TestState>;
    let plugin: PersistSessionStoragePlugin<TestState>;

    beforeEach(() => {
        // reset sessionStorage
        sessionStorage.clear();
        // create new instances for each test
        store = new Store<TestState>({ count: 0, name: 'initial' });
        plugin = new PersistSessionStoragePlugin<TestState>(itemName);
    });

    it('should load state from sessionStorage onCreate', async () => {
        const savedState = { count: 42, name: 'test-name' };
        sessionStorage.setItem(itemName, JSON.stringify(savedState));

        await plugin.onCreate(store);

        expect(store.state).toEqual(savedState);
    });

    it('should save state to sessionStorage onStateChanged', async () => {
        store = new Store<TestState>({ count: 0, name: 'initial' }, { plugins: [plugin] });

        store.set('count', 5);

        const savedState = JSON.parse(sessionStorage.getItem(itemName) as string);
        expect(savedState).toEqual({ count: 5, name: 'initial' });
    });

    it('should remove state from sessionStorage onReset', async () => {
        const savedState = { count: 42, name: 'test-name' };
        sessionStorage.setItem(itemName, JSON.stringify(savedState));

        await plugin.onReset();

        expect(sessionStorage.getItem(itemName)).toBeNull();
    });
});