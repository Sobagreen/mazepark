(function () {
  const SKIN_KEY = "Slavic";
  if (!window.__createSimpleSkinEffects || !window.__registerSkinEffects) {
    return;
  }

  const effects = window.__createSimpleSkinEffects({
    key: SKIN_KEY,
    varPrefix: "slavic",
    classes: {
      boardPulse: "slavic-board-pulse",
      piece: "slavic-piece",
      image: "slavic-piece__image",
      enter: "slavic-piece__image--enter",
      trail: "slavic-piece-trail",
      trailActive: "slavic-piece-trail--active",
      rotation: "slavic-piece__image--rotate",
      invalid: "slavic-cell--invalid",
      emitter: "slavic-cell--emitter",
      victory: "slavic-piece--victory"
    },
    pieceTypeClasses: {
      volhv: "slavic-piece--volhv",
      shield: "slavic-piece--shield",
      mirror: "slavic-piece--mirror",
      totem: "slavic-piece--totem"
    }
  });

  window.__registerSkinEffects(SKIN_KEY, effects);
})();
