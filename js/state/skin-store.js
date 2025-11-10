import { cloneSkinSelection } from "../skins/library.js";

export class SkinStore {
  constructor(library) {
    this.library = library;
    this.listeners = new Set();
    this.onlineRole = null;
    this.defaults = cloneSkinSelection(library.defaults);
    this.actual = cloneSkinSelection(this.defaults);
    this.pending = cloneSkinSelection(this.defaults);
  }

  reset({ defaults } = {}) {
    if (defaults) {
      this.defaults = cloneSkinSelection(defaults);
    }
    this.actual = cloneSkinSelection(this.defaults);
    this.pending = cloneSkinSelection(this.defaults);
    this.notify();
  }

  setDefaults(defaults, options = {}) {
    const { reset = true } = options;
    if (defaults) {
      this.defaults = cloneSkinSelection(defaults);
    }
    if (reset) {
      this.actual = cloneSkinSelection(this.defaults);
      this.pending = cloneSkinSelection(this.defaults);
    }
    this.notify();
  }

  getAllActual() {
    return cloneSkinSelection(this.actual);
  }

  getAllPending() {
    return cloneSkinSelection(this.pending);
  }

  getDefault(player) {
    const fallback = this.defaults[player] || this.defaults.light;
    return { ...fallback };
  }

  getActual(player) {
    const resolved = this.#normalise(player, this.actual[player]);
    this.actual[player] = resolved;
    return { ...resolved };
  }

  getPending(player) {
    const resolved = this.#normalise(player, this.pending[player]);
    this.pending[player] = resolved;
    return { ...resolved };
  }

  setPending(player, skin, type, { silent = false } = {}) {
    const next = this.library.normaliseSelection(player, skin, type, this.defaults[player]);
    this.library.ensureSkinConfig(next.skin);
    this.pending[player] = next;
    if (!silent) {
      this.notify();
    }
    return next;
  }

  applyPending(player, { silent = false } = {}) {
    const selection = this.getPending(player);
    this.actual[player] = { ...selection };
    if (!silent) {
      this.notify();
    }
    return selection;
  }

  applyAllPending({ silent = false } = {}) {
    Object.keys(this.actual).forEach((player) => {
      this.actual[player] = { ...this.getPending(player) };
    });
    if (!silent) {
      this.notify();
    }
    return this.getAllActual();
  }

  updateActual(selection, { preservePendingFor = null, silent = false } = {}) {
    const nextActual = cloneSkinSelection(selection);
    Object.keys(nextActual).forEach((player) => {
      const resolved = this.#normalise(player, nextActual[player]);
      nextActual[player] = resolved;
    });
    const nextPending = cloneSkinSelection(nextActual);
    if (preservePendingFor && this.pending[preservePendingFor]) {
      nextPending[preservePendingFor] = { ...this.pending[preservePendingFor] };
    }
    this.actual = nextActual;
    this.pending = nextPending;
    if (!silent) {
      this.notify();
    }
    return this.getAllActual();
  }

  setOnlineRole(role, { silent = false } = {}) {
    this.onlineRole = role || null;
    if (!silent) {
      this.notify();
    }
  }

  getOnlineRole() {
    return this.onlineRole;
  }

  subscribe(callback) {
    if (typeof callback !== "function") return () => {};
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getSnapshot() {
    return {
      defaults: cloneSkinSelection(this.defaults),
      actual: cloneSkinSelection(this.actual),
      pending: cloneSkinSelection(this.pending),
      onlineRole: this.onlineRole
    };
  }

  notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error("SkinStore listener failed", error);
      }
    });
  }

  #normalise(player, selection) {
    const base = selection || this.defaults[player] || this.defaults.light;
    const resolved = this.library.normaliseSelection(player, base.skin, base.type, this.defaults[player]);
    this.library.ensureSkinConfig(resolved.skin);
    return resolved;
  }
}
