(function () {
  const SKIN_KEY = "premium";
  if (!window.__createSimpleSkinEffects || !window.__registerSkinEffects) {
    return;
  }

  const effects = window.__createSimpleSkinEffects({
    key: SKIN_KEY,
    varPrefix: "premium",
    classes: {
      boardPulse: "premium-board-pulse",
      piece: "premium-piece",
      image: "premium-piece__image",
      enter: "premium-piece__image--enter",
      trail: "premium-piece-trail",
      trailActive: "premium-piece-trail--active",
      rotation: "premium-piece__image--rotate",
      invalid: "premium-cell--invalid",
      emitter: "premium-cell--emitter",
      victory: "premium-piece--victory"
    },
    pieceTypeClasses: {
      volhv: "premium-piece--volhv",
      shield: "premium-piece--shield",
      mirror: "premium-piece--mirror",
      totem: "premium-piece--totem"
    }
  });

  window.__registerSkinEffects(SKIN_KEY, effects);
})();
