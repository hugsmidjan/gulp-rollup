# @hugsmidjan/gulp-rollup

```
npm install --save-dev @hugsmidjan/gulp-rollup
```

## Usage

```js
const [scripts, scriptsWatch] = require('@hugsmidjan/gulp-rollup')(opts);
```

## API / Advanced usage

```js
const rollupTaskFactory = require('@hugsmidjan/gulp-rollup');

const options = {
  // These are the defaults:
  name: 'scripts', // the display name of the generated tasks
  src: 'src/',
  dist: 'pub/',
  glob: '*.{js,jsx,ts,tsx}', // Glob|Array<Glob> for entry points. Use '!' prefix to ignore
  // entryPoints: null, // Advanced: rollup.input map - overrides the `glob` option
  NODE_ENV: 'production',
  // plugins: [], // custom list of plugins
  // replaceOpts: {}, // custom options for rollup-plugin-replace
  // uglifyOpts: {}, // custom options for rollup-plugin-uglify
  // typescriptOpts: {}, // custom options for rollup-plugin-typescript2
  minify: true,
  sourcemaps: true,
  format: 'iife', // Rollup output format
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

For convenience, the "task factory" function also exposes the rollup plugins
it uses, as well as its file-globbing module.

```js
console.log(rollupTaskFactory.plugins);
```

## TypeScript support.

This task automatically bundles TypeScript files, but it's BYOTS (Bring Your Own TypeScript).

The Typescript plugin is invoked if `typescriptOpts` are present (even if they're empty), or a `tsconfig.json` file is detected in/or above the current folder.

It respects `./tsconfig.json`, but [some compiler options are forced](https://www.npmjs.com/package/rollup-plugin-typescript2#some-compiler-options-are-forced).

Additionally, `compilerOptions.jsx` is hard-defaulted to `'react'`, but it can be overridden via `typescriptOpts.tsconfigOverride.compilerOptions.jsx`.



