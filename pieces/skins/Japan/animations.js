(function () {
  const SKIN_KEY = "Japan";
  if (!window.__createSimpleSkinEffects || !window.__registerSkinEffects) {
    return;
  }

  const effects = window.__createSimpleSkinEffects({
    key: SKIN_KEY,
    varPrefix: "japan",
    classes: {
      boardPulse: "japan-board-bloom",
      piece: "japan-piece",
      image: "japan-piece__image",
      enter: "japan-piece__image--enter",
      trail: "japan-piece-trail",
      trailActive: "japan-piece-trail--active",
      rotation: "japan-piece__image--rotate",
      invalid: "japan-cell--invalid",
      emitter: "japan-cell--emitter",
      victory: "japan-piece--victory"
    },
    pieceTypeClasses: {
      volhv: "japan-piece--volhv",
      shield: "japan-piece--shield",
      mirror: "japan-piece--mirror",
      totem: "japan-piece--totem"
    }
  });

  window.__registerSkinEffects(SKIN_KEY, effects);
})();
