// rollup.config.js
export default {
  entry: 'src/cacheFactory.js',
  dest: 'cachefactory.js',
  format: 'umd',
  moduleName: 'cacheFactory',
  exports: 'named',
}
