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
  //                    // Example:  { 'bar/outfile-sans-ext': 'foo/infile.ts' }
  NODE_ENV: process.env.NODE_ENV,
  // plugins: (pluginsArr) => pluginsArr, // Supply your own plugin list
  // replaceOpts: {}, // custom options for @rollup/plugin-replace
  // terserOpts: {}, // custom options for rollup-plugin-terser
  // aliasOpts: {}, // custom options for @rollup/plugin-alias
  // typescriptOpts: {
  //   rawDeclarations: false // true turns off auto-tidying
  //   // custom options for @rollup/plugin-typescript
  // },
  minify: true,
  sourcemaps: true,
  format: 'iife', // Rollup output format
  codeSplit: true, // (kicks in when format isn't 'iife')
  // inputOpts: {},
  // outputOpts: {}, // or Array of option objects
  // watchOpts: {},
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

## TypeScript support.

This task automatically bundles TypeScript files, but it's BYOTS (Bring Your
Own TypeScript).

The Typescript plugin is invoked if a `tsconfig.json` file is detected in/or
above the current folder, or via the `typescriptOpts.tsconfig` option.

It respects `./tsconfig.json`, but
[some compiler options are ignored](https://github.com/rollup/plugins/tree/master/packages/typescript#ignored-options).

Additionally, `compilerOptions.jsx` is hard-defaulted to `'react'`, but it can
be overridden via `typescriptOpts.jsx`.
