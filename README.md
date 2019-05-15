# @hugsmidjan/gulp-rollup

```
npm install --save-dev @hugsmidjan/gulp-rollup
```

## Usage

```js
const rollupTaskFactory = require('@hugsmidjan/gulp-rollup');

const options = {
  // These are the defaults:
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

// Create the gulp tasks based on the above options.
const scriptTasks = rollupTaskFactory(options, customConfigger);

// scriptTasks is a two item array...
const [scripts, scriptsWatch] = scriptTasks;
// ...but it also exposes the tasks as named properties.
const { bundle, watch } = scriptTasks;
```
