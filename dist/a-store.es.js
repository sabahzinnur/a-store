var h = Object.defineProperty;
var c = (i, t, e) => t in i ? h(i, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[t] = e;
var r = (i, t, e) => c(i, typeof t != "symbol" ? t + "" : t, e);
class l {
  constructor(t, e) {
    r(this, "state");
    r(this, "initialStateValue");
    r(this, "plugins");
    r(this, "immutable");
    r(this, "lockedProperties", /* @__PURE__ */ new Set());
    r(this, "logger");
    this.logger = (e == null ? void 0 : e.logger) ?? console, this.immutable = (e == null ? void 0 : e.immutable) ?? !0, this.plugins = (e == null ? void 0 : e.plugins) ?? [], this.initialStateValue = JSON.parse(JSON.stringify(t)), this.state = this.createState(t), this.lock(), this.onCreate();
  }
  lock() {
    this.immutable && Object.keys(this.state).forEach((t) => {
      this.lockStateProp(t);
    }), Object.preventExtensions(this.state), Object.freeze(this);
  }
  onCreate() {
    this.plugins.forEach(async (t) => {
      await t.onCreate(this);
    });
  }
  reset() {
    Object.keys(this.initialStateValue).forEach((t) => {
      this.set(t, this.initialStateValue[t]);
    }), this.onReset();
  }
  onReset() {
    this.plugins.forEach(async (t) => {
      await t.onReset(this);
    });
  }
  set(t, e) {
    this.immutable && this.unlockStateProp(t), this.state[t] = e, this.immutable && this.lockStateProp(t), this.onStateChange(t, e);
  }
  onStateChange(t, e) {
    this.plugins.forEach(async (a) => {
      await a.onStateChanged(t, e, this);
    });
  }
  createState(t) {
    if (!this.immutable) return t;
    const e = {
      set: (a, s, o) => {
        const n = s;
        return this.lockedProperties.has(n) ? (this.logger.warn(`[Store] Attempted to directly modify locked state property "${String(s)}". Use store.set() method instead.`), !0) : (a[n] = o, !0);
      },
      deleteProperty: (a, s) => (this.logger.warn(`[Store] Attempted to delete state property "${String(s)}". State property deletion is not allowed.`), !0)
    };
    return new Proxy(t, e);
  }
  lockStateProp(t) {
    this.lockedProperties.add(t);
  }
  unlockStateProp(t) {
    this.lockedProperties.delete(t);
  }
}
class S {
  constructor(t) {
    r(this, "itemName");
    this.itemName = t;
  }
  async onCreate(t) {
    const e = localStorage.getItem(this.itemName);
    if (e) {
      const a = JSON.parse(e);
      Object.keys(a).forEach((s) => {
        t.state.hasOwnProperty(s) && t.set(s, a[s]);
      });
    }
  }
  async onStateChanged(t, e, a) {
    localStorage.setItem(this.itemName, JSON.stringify(a.state));
  }
  async onReset() {
    localStorage.removeItem(this.itemName);
  }
}
class g {
  constructor(t) {
    r(this, "itemName");
    this.itemName = t;
  }
  async onCreate(t) {
    const e = sessionStorage.getItem(this.itemName);
    if (e) {
      const a = JSON.parse(e);
      Object.keys(a).forEach((s) => {
        t.state.hasOwnProperty(s) && t.set(s, a[s]);
      });
    }
  }
  async onStateChanged(t, e, a) {
    sessionStorage.setItem(this.itemName, JSON.stringify(a.state));
  }
  async onReset() {
    sessionStorage.removeItem(this.itemName);
  }
}
function u(i, t) {
  return new l(i, t);
}
export {
  S as PersistLocalStoragePlugin,
  g as PersistSessionStoragePlugin,
  l as Store,
  u as defineStore
};
