import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import {Store, type StorePlugin} from '../index'

interface TestState {
    count: number
    name: string
}

const logger = {
    warn: vi.fn()
}

describe('Store', () => {
    let store: Store<TestState>
    const initialState: TestState = {count: 0, name: 'initial'}

    beforeEach(() => {
        store = new Store<TestState>({...initialState}, {logger})
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should initialize with given state', () => {
        expect(store.state).toEqual(initialState)
    })

    it('should reset to initial state', async () => {
        store.set('count', 5)
        store.reset()
        expect(store.state).toEqual(initialState)
    })

    it('should set state correctly', () => {
        store.set('count', 10)
        expect(store.state.count).toBe(10)
    })

    it('store should be prevented extensions after initialization', () => {
        expect(Object.isExtensible(store)).toBe(false)
    })

    it('store state should prevented extensions after initialization', () => {
        expect(Object.isExtensible(store)).toBe(false)
    })

    it('should lock store properties after initialization', () => {
        expect(Object.isFrozen(store)).toBe(true)
    })


    it('should not allow direct modification of state properties, and log warn', () => {
        store.state.count = 20
        expect(logger.warn).toBeCalled()
        expect(store.state.count).toBe(0)
    })

    it('should throw error and log warn then attempt delete state property', () => {
        try {
            //@ts-ignore
            delete store.state.count
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError)
        }
        expect(logger.warn).toBeCalled()
        expect(store.state.count).toBe(0)
    })

    it('should throw error then attempt add new property to state', () => {
        try {
            //@ts-ignore
            store.state.foo = 'bar'
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError)
        }
    })

    it('should allow direct modification of state properties without warn on immutable disabled ', () => {
        store = new Store<TestState>({...initialState}, {logger, immutable: false})

        store.state.count = 20
        expect(logger.warn).not.toBeCalled()
        expect(store.state.count).toBe(20)
    })

})

describe('Store plugins common features', () => {
    let store: Store<TestState>
    const initialState: TestState = {count: 0, name: 'initial'}

    it('should call onCreate for all plugins', async () => {
        const plugin: StorePlugin<TestState> = {
            onCreate: vi.fn().mockResolvedValue(undefined),
            onStateChanged: vi.fn().mockResolvedValue(undefined),
            onReset: vi.fn().mockResolvedValue(undefined),
        }
        store = new Store<TestState>(initialState, {plugins: [plugin]})

        expect(plugin.onCreate).toHaveBeenCalledWith(store)
    })

    it('should call onStateChanged for all plugins on state change', async () => {
        const plugin: StorePlugin<TestState> = {
            onCreate: vi.fn().mockResolvedValue(undefined),
            onStateChanged: vi.fn().mockResolvedValue(undefined),
            onReset: vi.fn().mockResolvedValue(undefined),
        }
        store = new Store<TestState>(initialState, {plugins: [plugin]})

        store.set('name', 'updated')
        expect(plugin.onStateChanged).toHaveBeenCalledWith('name', 'updated', store)
    })

    it('should call onReset for all plugins on reset', async () => {
        const plugin: StorePlugin<TestState> = {
            onCreate: vi.fn().mockResolvedValue(undefined),
            onStateChanged: vi.fn().mockResolvedValue(undefined),
            onReset: vi.fn().mockResolvedValue(undefined),
        }
        store = new Store<TestState>(initialState, {plugins: [plugin]})

        store.reset()
        expect(plugin.onReset).toHaveBeenCalledWith(store)
    })
})
