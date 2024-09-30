import { describe, it, expect, beforeEach } from 'vitest';
import {  PersistLocalStoragePlugin } from '../plugins/persist-local-storage-plugin';
import { Store } from '../index';

interface TestState {
    count: number;
    name: string;
}

describe('PersistLocalStoragePlugin', () => {
    const itemName = 'testItem';
    let store: Store<TestState>;
    let plugin: PersistLocalStoragePlugin<TestState>;

    beforeEach(() => {
        // reset localStorage
        localStorage.clear();
        // create new instances for each test
        store = new Store<TestState>({ count: 0, name: 'initial' });
        plugin = new PersistLocalStoragePlugin<TestState>(itemName);
    });

    it('should load state from localStorage onCreate', async () => {
        const savedState = { count: 42, name: 'test-name' };
        localStorage.setItem(itemName, JSON.stringify(savedState));

        await plugin.onCreate(store);

        expect(store.state).toEqual(savedState);
    });

    it('should save state to localStorage onStateChanged', async () => {
        store = new Store<TestState>({ count: 0, name: 'initial' }, { plugins: [plugin] });

        store.set('count', 5);

        const savedState = JSON.parse(localStorage.getItem(itemName) as string);
        expect(savedState).toEqual({ count: 5, name: 'initial' });
    });

    it('should remove state from localStorage onReset', async () => {
        const savedState = { count: 42, name: 'test-name' };
        localStorage.setItem(itemName, JSON.stringify(savedState));

        await plugin.onReset();

        expect(localStorage.getItem(itemName)).toBeNull();
    });
});