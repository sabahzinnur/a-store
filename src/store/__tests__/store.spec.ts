import {describe, it, expect, beforeEach, vi} from 'vitest';
import {Store, type StorePlugin} from '../index';

interface TestState {
    count: number;
    name: string;
}

describe('Store', () => {
    let store: Store<TestState>;
    const initialState: TestState = {count: 0, name: 'initial'};

    beforeEach(() => {
        store = new Store<TestState>({...initialState});
    });

    it('should initialize with given state', () => {
        expect(store.state).toEqual(initialState);
    });

    it('should reset to initial state', async () => {
        store.set('count', 5);
        store.reset();
        expect(store.state).toEqual(initialState);
    });

    it('should set state correctly', () => {
        store.set('count', 10);
        expect(store.state.count).toBe(10);
    });

    it('should be prevented extensions after initialization', () => {
        expect(Object.isExtensible(store)).toBe(false);
    });

    it('store state should prevented extensions after initialization', () => {
        expect(Object.isExtensible(store)).toBe(false);
    });

    it('should lock store properties after initialization', () => {
        expect(Object.isFrozen(store)).toBe(true);
    });

    it('should unlock and lock store state properties correctly during set', () => {
        expect(Object.getOwnPropertyDescriptor(store.state, 'count')?.writable).toBe(false);

        store.set('count', 10);

        expect(Object.getOwnPropertyDescriptor(store.state, 'count')?.writable).toBe(false);
    });

    it('should not allow direct modification of stare properties', () => {
        try {
            store.state.count = 20;
        } catch (e) {
            // nothing to do
        }
        expect(store.state.count).toBe(0);
    });
});


describe('Store plugins', () => {
    let store: Store<TestState>;
    const initialState: TestState = {count: 0, name: 'initial'};

    it('should call onCreate for all plugins', async () => {
        const plugin: StorePlugin<TestState> = {
            onCreate: vi.fn().mockResolvedValue(undefined),
            onStateChanged: vi.fn().mockResolvedValue(undefined),
            onReset: vi.fn().mockResolvedValue(undefined),
        };
        store = new Store<TestState>(initialState, {plugins: [plugin]});

        expect(plugin.onCreate).toHaveBeenCalledWith(store);
    });

    it('should call onStateChanged for all plugins on state change', async () => {
        const plugin: StorePlugin<TestState> = {
            onCreate: vi.fn().mockResolvedValue(undefined),
            onStateChanged: vi.fn().mockResolvedValue(undefined),
            onReset: vi.fn().mockResolvedValue(undefined),
        };
        store = new Store<TestState>(initialState, {plugins: [plugin]});

        store.set('name', 'updated');
        expect(plugin.onStateChanged).toHaveBeenCalledWith('name', 'updated', store);
    });

    it('should call onReset for all plugins on reset', async () => {
        const plugin: StorePlugin<TestState> = {
            onCreate: vi.fn().mockResolvedValue(undefined),
            onStateChanged: vi.fn().mockResolvedValue(undefined),
            onReset: vi.fn().mockResolvedValue(undefined),
        };
        store = new Store<TestState>(initialState, {plugins: [plugin]});

        store.reset();
        expect(plugin.onReset).toHaveBeenCalledWith(store);
    });
})