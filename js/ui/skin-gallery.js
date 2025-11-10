export class SkinGallery {
  constructor(container, library, { onSelect } = {}) {
    this.container = container;
    this.library = library;
    this.onSelect = onSelect;
    this.items = new Map();
  }

  render() {
    if (!this.container || !this.library) return;
    this.items.clear();
    this.container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    this.library.getSkinKeys().forEach((skinKey) => {
      const skinMeta = this.library.getSkinMeta(skinKey);
      if (!skinMeta) return;
      this.library.ensureSkinConfig(skinKey);
      Object.keys(skinMeta.types || {}).forEach((typeKey) => {
        const item = this.createItem(skinKey, typeKey);
        fragment.appendChild(item);
      });
    });
    this.container.appendChild(fragment);
  }

  createItem(skinKey, typeKey) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "skin-gallery__item";
    item.dataset.skin = skinKey;
    item.dataset.type = typeKey;
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", "false");

    const thumb = document.createElement("div");
    thumb.className = "skin-gallery__thumb";
    const img = document.createElement("img");
    img.src = this.library.getPreviewPath(skinKey, typeKey);
    img.alt = "";
    thumb.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "skin-gallery__meta";
    const skinLabel = document.createElement("span");
    skinLabel.className = "skin-gallery__skin";
    skinLabel.textContent = this.library.getLabel(skinKey);
    const name = document.createElement("span");
    name.className = "skin-gallery__name";
    name.textContent = this.library.getTypeLabel(skinKey, typeKey);
    meta.append(skinLabel, name);

    item.append(thumb, meta);
    item.addEventListener("click", () => {
      this.setSelection(skinKey, typeKey);
      if (typeof this.onSelect === "function") {
        this.onSelect(skinKey, typeKey);
      }
    });

    this.items.set(`${skinKey}:${typeKey}`, item);
    return item;
  }

  setSelection(skinKey, typeKey) {
    this.items.forEach((element, key) => {
      const isActive = key === `${skinKey}:${typeKey}`;
      element.setAttribute("aria-selected", isActive ? "true" : "false");
      element.classList.toggle("skin-gallery__item--active", isActive);
    });
  }
}
