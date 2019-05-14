# @hugsmidjan/gulp-rollup

```
npm install --save-dev @hugsmidjan/gulp-rollup
```

## Usage

```js
const rollupTaskFactory = require('@hugsmidjan/gulp-rollup');

const options = {
  // Defaults
  name: 'scripts', // the display name of the generated tasks
  src: 'src/',
  dist: 'pub/',
  glob: '*.{js,ts}', // A single glob or Array of globs. entry points (.ts support coming soon)
  // entryPoints: null, // Advanced: rollup.input map - overrides the `glob` option
  NODE_ENV: 'production',
  // plugins: [], // custom list of plugins
  // replaceOpts: {}, // custom options for rollup-plugin-replace
  // uglifyOpts: {}, // custom options for rollup-plugin-uglify
  minify: true,
  sourcemaps: true,
  format: 'iife',
  codeSplit: true, // (kicks in when format isn't 'iife')
  // inputOpts: {},
  // outputOpts: {},
  // watchOptions: {},
};

// If the `options` object isn't flexible enough...
const customConfigger = (rollupConfig) => {
  return {
    ...rollupConfig,
    // Replace or add properties or mutate rollupConfig directly.
  };
};

const { script, script_watch } = rollupTaskFactory(options, customConfigger);

// Note that `options.name` controls the names of the exported
// task functions.
const { vendorScripts, vendorScripts_watch } = rollupTaskFactory({
  name: 'vendorScripts',
  src: 'libs/',
});
```
