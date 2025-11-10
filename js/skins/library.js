const DEFAULT_SKIN_SELECTION = {
  light: { skin: "Slavic", type: "Type1" },
  shadow: { skin: "Slavic", type: "Type2" }
};

export class SkinLibrary {
  constructor({ manifestUrl = "data/skins.json" } = {}) {
    this.manifestUrl = manifestUrl;
    this.skins = {};
    this.skinConfigCache = {};
    this.skinConfigPromises = {};
    this.audioCache = new Map();
    this.loaded = false;
    this.defaultSelection = cloneSkinSelection(DEFAULT_SKIN_SELECTION);
  }

  get defaults() {
    return cloneSkinSelection(this.defaultSelection);
  }

  setDefaults(selection) {
    if (selection) {
      this.defaultSelection = cloneSkinSelection(selection);
    }
  }

  async load() {
    if (this.loaded) {
      return this.skins;
    }
    if (typeof fetch !== "function") {
      this.skins = {};
      this.loaded = true;
      return this.skins;
    }
    try {
      const response = await fetch(this.manifestUrl);
      if (!response.ok) {
        throw new Error(`Unable to load skins manifest: ${response.status}`);
      }
      const data = await response.json();
      if (!data || typeof data !== "object") {
        throw new Error("Skins manifest has invalid format");
      }
      this.skins = data;
      this.loaded = true;
      return this.skins;
    } catch (error) {
      console.error(error);
      this.skins = {};
      this.loaded = true;
      return this.skins;
    }
  }

  getSkinKeys() {
    return Object.keys(this.skins);
  }

  getSkinMeta(skinKey) {
    return this.skins[skinKey] || null;
  }

  getTypeMeta(skinKey, typeKey) {
    const skinMeta = this.getSkinMeta(skinKey);
    if (!skinMeta) return null;
    if (skinMeta.types && skinMeta.types[typeKey]) {
      return skinMeta.types[typeKey];
    }
    const firstTypeKey = Object.keys(skinMeta.types || {})[0];
    return firstTypeKey ? skinMeta.types[firstTypeKey] : null;
  }

  normaliseSelection(player, skinKey, typeKey, fallbackSelection) {
    const defaults = this.defaultSelection[player] || this.defaultSelection.light;
    const fallback = fallbackSelection || defaults || DEFAULT_SKIN_SELECTION[player] || DEFAULT_SKIN_SELECTION.light;
    const skinId = this.getSkinMeta(skinKey) ? skinKey : fallback.skin;
    const skinMeta = this.getSkinMeta(skinId);
    let finalTypeKey = typeKey;
    if (!skinMeta?.types?.[finalTypeKey]) {
      if (skinMeta?.types?.[fallback.type]) {
        finalTypeKey = fallback.type;
      }
      if (!skinMeta?.types?.[finalTypeKey]) {
        const available = Object.keys(skinMeta?.types || {});
        if (available.length > 0) {
          finalTypeKey = available[0];
        }
      }
    }
    if (!finalTypeKey) {
      finalTypeKey = fallback.type;
    }
    this.ensureSkinConfig(skinId);
    return { skin: skinId, type: finalTypeKey };
  }

  ensureSkinConfig(skinKey) {
    if (!skinKey) return null;
    if (Object.prototype.hasOwnProperty.call(this.skinConfigCache, skinKey)) {
      return this.skinConfigPromises[skinKey] || null;
    }
    const meta = this.getSkinMeta(skinKey);
    if (!meta || !meta.configPath) {
      this.skinConfigCache[skinKey] = {};
      return null;
    }
    if (!this.skinConfigPromises[skinKey] && typeof fetch === "function") {
      this.skinConfigPromises[skinKey] = fetch(meta.configPath)
        .then((response) => (response.ok ? response.json() : null))
        .then((json) => {
          this.skinConfigCache[skinKey] = json && typeof json === "object" ? json : {};
          return this.skinConfigCache[skinKey];
        })
        .catch(() => {
          this.skinConfigCache[skinKey] = {};
          return this.skinConfigCache[skinKey];
        });
    }
    if (!this.skinConfigPromises[skinKey]) {
      this.skinConfigCache[skinKey] = {};
    }
    return this.skinConfigPromises[skinKey] || null;
  }

  preload(selection) {
    if (!selection) return;
    const entries = selection.light || selection.shadow ? Object.values(selection) : [selection];
    entries.forEach((item) => {
      if (item && item.skin) {
        this.ensureSkinConfig(item.skin);
      }
    });
  }

  getConfig(selection) {
    if (!selection || !selection.skin) {
      return null;
    }
    const cache = this.skinConfigCache[selection.skin];
    if (!cache) {
      return null;
    }
    if (selection.type && cache[selection.type]) {
      return cache[selection.type];
    }
    if (cache.default) {
      return cache.default;
    }
    return null;
  }

  getAssetPath(selection, pieceType) {
    const fallback = DEFAULT_SKIN_SELECTION.light;
    const skinKey = selection && selection.skin ? selection.skin : fallback.skin;
    const typeKey = selection && selection.type ? selection.type : fallback.type;
    const skinMeta = this.getSkinMeta(skinKey);
    const typeMeta = skinMeta?.types?.[typeKey];
    if (typeMeta && typeMeta.assetBase) {
      return `pieces/skins/${typeMeta.assetBase}/${pieceType}.png`;
    }
    if (skinMeta && skinMeta.assetBase) {
      return `pieces/skins/${skinMeta.assetBase}/${pieceType}.png`;
    }
    return `pieces/skins/${skinKey}/${typeKey}/${pieceType}.png`;
  }

  getPreviewPath(skinKey, typeKey) {
    const typeMeta = this.getTypeMeta(skinKey, typeKey);
    if (typeMeta && typeMeta.preview) {
      return typeMeta.preview;
    }
    const skinMeta = this.getSkinMeta(skinKey);
    return skinMeta?.preview || "";
  }

  getLabel(skinKey) {
    const skinMeta = this.getSkinMeta(skinKey);
    return skinMeta?.label || skinKey;
  }

  getTypeLabel(skinKey, typeKey) {
    const typeMeta = this.getTypeMeta(skinKey, typeKey);
    return typeMeta?.label || typeKey;
  }

  getDescription(skinKey, typeKey) {
    const typeMeta = this.getTypeMeta(skinKey, typeKey);
    return typeMeta?.description || "";
  }

  playSound(playerOrSelection, cue, getPlayerSelection) {
    if (!cue || typeof Audio !== "function") return;
    let selection = null;
    if (typeof playerOrSelection === "string" && typeof getPlayerSelection === "function") {
      selection = getPlayerSelection(playerOrSelection);
    } else if (playerOrSelection && typeof playerOrSelection === "object") {
      selection = playerOrSelection;
    }
    if (!selection || !selection.skin) return;
    const config = this.getConfig(selection);
    const url = config && config.sounds ? config.sounds[cue] : null;
    if (!url) return;
    const key = `${selection.skin}:${selection.type}:${cue}`;
    let base = this.audioCache.get(key);
    if (!base) {
      base = new Audio(url);
      base.preload = "auto";
      this.audioCache.set(key, base);
    }
    const instance = base.cloneNode(true);
    instance.play().catch(() => {});
  }
}

export function cloneSkinSelection(selection) {
  const source = selection || {};
  return {
    light: { ...(source.light || DEFAULT_SKIN_SELECTION.light) },
    shadow: { ...(source.shadow || DEFAULT_SKIN_SELECTION.shadow) }
  };
}
