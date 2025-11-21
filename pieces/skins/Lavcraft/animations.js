(function () {
  const SKIN_KEY = "Lavcraft";
  if (!window.__createSimpleSkinEffects || !window.__registerSkinEffects) {
    return;
  }

  const effects = window.__createSimpleSkinEffects({
    key: SKIN_KEY,
    varPrefix: "lavcraft",
    classes: {
      boardPulse: "lavcraft-board-pulse",
      piece: "lavcraft-piece",
      image: "lavcraft-piece__image",
      enter: "lavcraft-piece__image--enter",
      trail: "lavcraft-piece-trail",
      trailActive: "lavcraft-piece-trail--active",
      rotation: "lavcraft-piece__image--rotate",
      invalid: "lavcraft-cell--invalid",
      emitter: "lavcraft-cell--emitter",
      victory: "lavcraft-piece--victory"
    },
    pieceTypeClasses: {
      volhv: "lavcraft-piece--volhv",
      shield: "lavcraft-piece--shield",
      mirror: "lavcraft-piece--mirror",
      totem: "lavcraft-piece--totem"
    }
  });

  window.__registerSkinEffects(SKIN_KEY, effects);
})();
