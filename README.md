# @lightway/a-store

Immutable, type-safe state management library with plugin system for JavaScript/TypeScript applications.

## Features

- 🔒 **Immutable by default** - Prevents direct state mutations
- 🔌 **Plugin system** - Extend functionality with custom plugins
- 💾 **Persistence plugins** - Built-in localStorage and sessionStorage support
- 🎯 **Type-safe** - Full TypeScript support
- 🪶 **Lightweight** - No dependencies
- 🔧 **Flexible** - Can disable immutability when needed

## Installation

```bash
npm install --save @lightway/a-store
```

## Quick Start

```typescript
import { defineStore } from '@lightway/a-store'

interface AppState {
  count: number
  user: string
}

const store = defineStore<AppState>({
  count: 0,
  user: 'guest'
})

// Update state using set method
store.set('count', 1)

// Access state
console.log(store.state.count) // 1

// Reset to initial state
store.reset()
```

## Core API

### `defineStore<T>(state, options?)`

Creates a new immutable store instance.

**Parameters:**
- `state: T` - Initial state object
- `options?: Object` - Optional configuration
  - `plugins?: StorePlugin<T>[]` - Array of plugins
  - `immutable?: boolean` - Enable/disable immutability (default: `true`)
  - `logger?: Logger` - Custom logger (default: `console`)

**Returns:** `Readonly<Store<Readonly<T>>>`

### Store Methods

#### `store.set<K>(key, value)`

Updates a specific state property. This is the only way to modify state when immutability is enabled.

```typescript
store.set('count', 5)
```

#### `store.reset()`

Resets all state properties to their initial values and triggers `onReset` for all plugins.

```typescript
store.reset()
```

#### `store.state`

Read-only access to the current state. Direct mutations are prevented when immutability is enabled.

```typescript
console.log(store.state.count)
```

## Built-in Plugins

### PersistLocalStoragePlugin

Automatically persists store state to localStorage and restores it on initialization.

```typescript
import { defineStore, PersistLocalStoragePlugin } from '@lightway/a-store'

const store = defineStore(
  { count: 0, user: 'guest' },
  {
    plugins: [
      new PersistLocalStoragePlugin('my-app-state')
    ]
  }
)
```

**Features:**
- Saves state to localStorage on every change
- Restores state on store creation
- Removes data from localStorage on reset

### PersistSessionStoragePlugin

Same as PersistLocalStoragePlugin but uses sessionStorage (data persists only for the session).

```typescript
import { defineStore, PersistSessionStoragePlugin } from '@lightway/a-store'

const store = defineStore(
  { count: 0, user: 'guest' },
  {
    plugins: [
      new PersistSessionStoragePlugin('my-session-state')
    ]
  }
)
```

## Creating Custom Plugins

Implement the `StorePlugin` interface to create custom plugins:

```typescript
import { StorePlugin, Store } from '@lightway/a-store'

class LoggerPlugin<T extends Object> implements StorePlugin<T> {
  async onCreate(store: Store<T>): Promise<void> {
    console.log('Store created with state:', store.state)
  }

  async onStateChanged<K extends keyof T>(
    key: K,
    value: T[K],
    store: Store<T>
  ): Promise<void> {
    console.log(`State changed: ${String(key)} = ${value}`)
  }

  async onReset(store: Store<T>): Promise<void> {
    console.log('Store reset to:', store.state)
  }
}

// Use the plugin
const store = defineStore(
  { count: 0 },
  { plugins: [new LoggerPlugin()] }
)
```

### Plugin Interface

```typescript
interface StorePlugin<T extends Object> {
  // Called when store is created
  onCreate(store: Store<T>): Promise<void>

  // Called when any state property changes
  onStateChanged<K extends keyof T>(
    key: K,
    value: T[K],
    store: Store<T>
  ): Promise<void>

  // Called when store.reset() is invoked
  onReset(store: Store<T>): Promise<void>
}
```

## Immutability

By default, the store prevents direct state mutations:

```typescript
const store = defineStore({ count: 0 })

// ❌ This will log a warning and not change the state
store.state.count = 10

// ✅ Use set method instead
store.set('count', 10)
```

### Disable Immutability

You can disable immutability if needed for performance gains:

```typescript
const store = defineStore(
  { count: 0 },
  { immutable: false }
)

// ✅ Direct mutations are now allowed at runtime
store.state.count = 10
```

**Note:** Disabling immutability improves performance by removing runtime proxy overhead, but TypeScript will still show type errors for direct property assignments. This provides compile-time safety while allowing runtime flexibility when needed.

## Advanced Usage

### Multiple Plugins

```typescript
import {
  defineStore,
  PersistLocalStoragePlugin,
  PersistSessionStoragePlugin
} from '@lightway/a-store'

const store = defineStore(
  { count: 0, temp: '' },
  {
    plugins: [
      new PersistLocalStoragePlugin('persistent-data'),
      new PersistSessionStoragePlugin('session-data'),
      new CustomPlugin()
    ]
  }
)
```

### Custom Logger

```typescript
const customLogger = {
  warn: (message: string) => {
    // Send to logging service
    myLoggingService.warn(message)
  }
}

const store = defineStore(
  { count: 0 },
  { logger: customLogger }
)
```

## TypeScript Support

Full TypeScript support with type inference:

```typescript
interface UserState {
  id: number
  name: string
  email: string
}

const store = defineStore<UserState>({
  id: 0,
  name: '',
  email: ''
})

// ✅ Type-safe
store.set('name', 'John')

// ❌ TypeScript error
store.set('name', 123)
store.set('invalid', 'value')
```

### Direct Property Assignment

TypeScript will prevent direct property assignment at compile time, as the store state is typed as `Readonly`:

```typescript
// ❌ TypeScript error: Cannot assign to 'name' because it is a read-only property
store.state.name = 'Jane'

// ❌ TypeScript error occurs even when immutability is disabled
const mutableStore = defineStore<UserState>(
  { id: 0, name: '', email: '' },
  { immutable: false }
)
mutableStore.state.name = 'Jane' // Still a TypeScript error

// ✅ Always use set method
store.set('name', 'Jane')
```

Note: Even with `immutable: false`, TypeScript will still show type errors for direct assignments because the store interface is readonly. This provides an additional layer of type safety at compile time.

## License

MIT

## Repository

[https://github.com/sabahzinnur/a-store](https://github.com/sabahzinnur/a-store)