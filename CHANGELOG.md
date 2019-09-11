# Change Log

## Upcoming...

- ... <!-- Add new lines here. Version number will be decided later -->

## 0.3.7 / 0.3.8

_2019-09-11_

- fix: Default `typescriptOpts.compilerOptions.jsx` to `'react'` – to Match Bublé's default handling of JavaScript files.

## 0.3.6

_2019-09-10_

- fix: Ensure non-code-splitting bundle files have a `.js` extension

## 0.3.5

_2019-09-09_

- fix: Bundle file-names got truncated on first period

## 0.3.4

_2019-08-27_

- fix: Use the raw `process.env.NODE_ENV` as default
- fix: Move bublé plugin to earlier in the plugin list

## 0.3.2 / 0.3.3

_2019-07-24_

- fix: Tolerate sparce `opts.plugins` arrays
- fix: Remove all TS config defaults and skip Bublé on .ts(x) files
- chore: Update dpendencies

## 0.3.1

_2019-06-06_

- feat: Add `jsx` and `tsx` files to the default `glob`

## 0.3.0

_2019-05-15_

- **BREAKING** feat: Stop exposing the `glob` module
- feat: Support negative (ignore) glob patterns

## 0.2.2

_2019-05-15_

- feat: Add automatic TypeScript compiling
- docs: Add example of default/simple usage + mention exposed plugins/helper

## 0.2.0 / 0.2.1

_2019-05-15_

- **BREAKING** feat: Return tasks in an array, with (fixed) named props on top

## 0.1.0

_2019-05-14_

- feat: Initial commit
  - Exposes dynamically-named bundle and watch tasks
  - Minify, sourcemaps, json, commonjs + es6 modules, NODE_ENV injection, etc.
  - Missing features: TypeScript and async/await
