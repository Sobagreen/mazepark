(function () {
  const SKIN_KEY = "Egypt";
  if (!window.__createSimpleSkinEffects || !window.__registerSkinEffects) {
    return;
  }

  const effects = window.__createSimpleSkinEffects({
    key: SKIN_KEY,
    varPrefix: "egypt",
    classes: {
      boardPulse: "egypt-board-pulse",
      piece: "egypt-piece",
      image: "egypt-piece__image",
      enter: "egypt-piece__image--enter",
      trail: "egypt-piece-trail",
      trailActive: "egypt-piece-trail--active",
      rotation: "egypt-piece__image--rotate",
      invalid: "egypt-cell--invalid",
      emitter: "egypt-cell--emitter",
      victory: "egypt-piece--victory"
    },
    pieceTypeClasses: {
      volhv: "egypt-piece--volhv",
      shield: "egypt-piece--shield",
      mirror: "egypt-piece--mirror",
      totem: "egypt-piece--totem"
    }
  });

  window.__registerSkinEffects(SKIN_KEY, effects);
})();
