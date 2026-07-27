// SVGO settings for campus-map.svg.
// The building search looks elements up by id and several fills reference
// <pattern>/<filter> defs by url(#...), so id mangling must stay off.
module.exports = {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: false,      // ids are the search index
          removeViewBox: false,   // panzoom needs the viewBox
          removeHiddenElems: false,
          removeUselessDefs: false,
          convertPathData: { floatPrecision: 2 },
          cleanupNumericValues: { floatPrecision: 2 }
        }
      }
    }
  ]
};
