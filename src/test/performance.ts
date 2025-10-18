import {defineStore} from "../main";

const state = {
    counter: 0
}


console.time('test immutable')

const store = defineStore(state)

for (let i = 0; i < 1_000_000; i++) {
    store.set('counter', store.state.counter + 1)
}

console.timeEnd('test immutable')

console.time('test mutable')

const mutableStore = defineStore(state, { immutable: true})

for (let i = 0; i < 1_000_000; i++) {
    mutableStore.set('counter', mutableStore.state.counter + 1)
}

console.timeEnd('test mutable')