const { series } = require('gulp');
const gulpRollup = require('./');
const del = require('del');

const opts = {
  src: 'test/src/',
  dist: 'test/pub/',
  glob: ['*.{js,ts}', '!bar.*'], // overridden by entryPoints below
  entryPoints: {
    hello: 'test/src/hello.ts',
    helloFoobar: 'test/src/foobar/hello.ts',
    bar: 'test/src/bar.ts',
  },
  format: 'cjs',
  outputOpts: {
    chunkFileNames: '_chunks/[name]-[hash].js',
    exports: 'auto',
  },
  typescriptOpts: {
    declaration: true,
    // rawDeclarations: true,
    // rootDir: 'test/src',
    // declarationDir: 'test/pub',
  },
  // codeSplit: false,
  // format: 'system',
  sourcemaps: false,
  minify: false,
};

const [scripts, scripts_watch] = gulpRollup(opts);

const cleanup = () => del(['test/pub']);

exports.build = series(cleanup, scripts);
exports.default = series([exports.build, scripts_watch]);
