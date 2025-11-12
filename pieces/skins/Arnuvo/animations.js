(function () {
  const SKIN_KEY = "Arnuvo";
  if (!window.__createSimpleSkinEffects || !window.__registerSkinEffects) {
    return;
  }

  const effects = window.__createSimpleSkinEffects({
    key: SKIN_KEY,
    varPrefix: "arnuvo",
    classes: {
      boardPulse: "arnuvo-board-bloom",
      piece: "arnuvo-piece",
      image: "arnuvo-piece__image",
      enter: "arnuvo-piece__image--enter",
      trail: "arnuvo-piece-trail",
      trailActive: "arnuvo-piece-trail--active",
      rotation: "arnuvo-piece__image--rotate",
      rotationReverse: null,
      invalid: "arnuvo-cell--invalid",
      emitter: "arnuvo-cell--emitter",
      victory: "arnuvo-piece--victory"
    },
    pieceTypeClasses: {
      volhv: "arnuvo-piece--volhv",
      shield: "arnuvo-piece--shield",
      mirror: "arnuvo-piece--mirror",
      totem: "arnuvo-piece--totem"
    }
  });

  window.__registerSkinEffects(SKIN_KEY, effects);
})();
