# Change Log

## Upcoming...

- ... <!-- Add new lines here. Version number will be decided later -->

## 0.5.0

_2020-05-04_

- **BREAKING** feat: Stop exposing `plugins` on the factory object.
- fix: Read tsconfigs with `"extends"` field

## 0.4.1 – 0.4.2

_2020-04-30_

- fix: Only require/load `@rollup/plugin-typescript` if tsconfig is detected
- fix: Only set tsc rootDir if we're generating clean declaration files

## 0.4.0

_2020-04-29_

- **BREAKING** feat: Upgrade `rollup` to v2
- **BREAKING** feat: Switch to `@rollup/plugin-typescript`
- feat: Auto-tidy TypeScript declarations – unless
  `typescriptOpts.rawDeclarations` is `true`

## 0.3.23 – 0.3.25

_2020-03-23_

- fix: Upgrade shebang plugin to a version that supports sourcemaps

## 0.3.21 – 0.3.22

_2020-03-10_

- feat: Preserve "shebang" headers (e.g. `#!/usr/bin/env node`)

## 0.3.20

_2020-02-28_

- feat: Add `@rollup/plugin-alias` support

## 0.3.19

_2020-02-15_

- feat: Add duration info to log output
- fix: Prefer `.js` over `.mjs` inside node_modules

## 0.3.18

_2019-11-14_

- feat: Use 'terser' instead of 'uglifyjs' for minifying modern JavaScript
- fix: Only use the 'main' field of modules inside node_modules – this avoids
  errors caused by widespread incorrect importing of React properties
- fix: Enable extensionless import of .ts/.tsx files in .js files

## 0.3.17

_2019-11-07_

- feat: Turn off rollup-plugin-typescript2's cache by default – it's unsafe
  when writing declaration files

## 0.3.15 – 0.3.16

_2019-10-31_

- feat: Update `rollup-plugin-buble` dependency

## 0.3.13 – 0.3.14

_2019-10-14_

- feat: Update `rollup-plugin-typescript2` dependency

## 0.3.11 – 0.3.12

_2019-10-04_

- fix: Correctly apply `inputOpts` and `outputOpts` + rename `watchOpts`
- fix: Stop searching for `tsconfig.json` at package root

## 0.3.9 – 0.3.10

_2019-09-16_

- fix: Change TS auto-detection to search for `tsconfig.json` – or the
  presence of `typescriptOpts`. This is a truer indicator of the intent to use
  TypeScript than `typescript`/`tsc` being installed.

## 0.3.7 – 0.3.8

_2019-09-11_

- fix: Default `typescriptOpts.compilerOptions.jsx` to `'react'` – to Match
  Bublé's default handling of JavaScript files.

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

## 0.3.2 – 0.3.3

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

## 0.2.0 – 0.2.1

_2019-05-15_

- **BREAKING** feat: Return tasks in an array, with (fixed) named props on top

## 0.1.0

_2019-05-14_

- feat: Initial commit
  - Exposes dynamically-named bundle and watch tasks
  - Minify, sourcemaps, json, commonjs + es6 modules, NODE_ENV injection, etc.
  - Missing features: TypeScript and async/await
