var o = Object.defineProperty;
var r = (a, t, e) => t in a ? o(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e;
var n = (a, t, e) => r(a, typeof t != "symbol" ? t + "" : t, e);
class c {
  constructor(t, e) {
    n(this, "state");
    n(this, "plugins", []);
    n(this, "initialStateValue");
    this.state = t, this.initialStateValue = JSON.parse(JSON.stringify(t)), e != null && e.plugins && (this.plugins = e.plugins), this.lock(), this.onCreate();
  }
  reset() {
    Object.keys(this.initialStateValue).forEach((t) => {
      this.set(t, this.initialStateValue[t]);
    }), this.onReset();
  }
  set(t, e) {
    this.unlockStateProp(t), this.state[t] = e, this.lockStateProp(t), this.onStateChange(t, e);
  }
  onCreate() {
    this.plugins.forEach(async (t) => {
      await t.onCreate(this);
    });
  }
  onStateChange(t, e) {
    this.plugins.forEach(async (s) => {
      await s.onStateChanged(t, e, this);
    });
  }
  onReset() {
    this.plugins.forEach(async (t) => {
      await t.onReset(this);
    });
  }
  lock() {
    Object.preventExtensions(this.state), Object.preventExtensions(this), Object.freeze(this), this.lockState();
  }
  lockState() {
    Object.keys(this.state).forEach((t) => {
      this.lockStateProp(t);
    });
  }
  lockStateProp(t) {
    Object.defineProperty(this.state, t, { writable: !1 });
  }
  unlockStateProp(t) {
    Object.defineProperty(this.state, t, { writable: !0 });
  }
}
class l {
  constructor(t) {
    n(this, "itemName");
    this.itemName = t;
  }
  async onCreate(t) {
    const e = localStorage.getItem(this.itemName);
    if (e) {
      const s = JSON.parse(e);
      Object.keys(s).forEach((i) => {
        t.state.hasOwnProperty(i) && t.set(i, s[i]);
      });
    }
  }
  async onStateChanged(t, e, s) {
    localStorage.setItem(this.itemName, JSON.stringify(s.state));
  }
  async onReset() {
    localStorage.removeItem(this.itemName);
  }
}
class S {
  constructor(t) {
    n(this, "itemName");
    this.itemName = t;
  }
  async onCreate(t) {
    const e = sessionStorage.getItem(this.itemName);
    if (e) {
      const s = JSON.parse(e);
      Object.keys(s).forEach((i) => {
        t.state.hasOwnProperty(i) && t.set(i, s[i]);
      });
    }
  }
  async onStateChanged(t, e, s) {
    sessionStorage.setItem(this.itemName, JSON.stringify(s.state));
  }
  async onReset() {
    sessionStorage.removeItem(this.itemName);
  }
}
function g(a, t) {
  return new c(a, t);
}
export {
  l as PersistLocalStoragePlugin,
  S as PersistSessionStoragePlugin,
  c as Store,
  g as defineStore
};
