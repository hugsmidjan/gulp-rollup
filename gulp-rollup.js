/* global process */
const { normalizeOpts } = require('@hugsmidjan/gulp-utils');
const rollup = require('rollup');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { relative } = require('path');

const glob = require('glob');
const { watch } = require('gulp');

const getFileList = (globList, cwd) => {
  const ignore = [];
  globList = typeof globList === 'string' ? [globList] : globList;
  globList = globList.filter((globString) => {
    if (globString[0] === '!') {
      ignore.push(globString.substr(1));
      return false;
    }
    return true;
  });
  const foundFiles = {};
  return globList
    .reduce(
      (fileList, globString) => fileList.concat(glob.sync(globString, { cwd, ignore })),
      []
    )
    .filter((fileName) => {
      const found = foundFiles[fileName];
      foundFiles[fileName] = true;
      return !found;
    });
};

const defaultOpts = {
  name: 'scripts', // the display name of the generated tasks
  src: 'src/',
  dist: 'pub/',
  glob: '*.{js,jsx,ts,tsx}', // which files to glob up as entry points
  // entryPoints: null, // Advanced: rollup.input map - overrides the `glob` option
  //                    // Example:  { 'bar/outfile-sans-ext': 'foo/infile.ts' }
  NODE_ENV: process.env.NODE_ENV,
  // plugins: [], // custom list of plugins
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
  codeSplit: true, // (when format isn't 'iife')
  // inputOpts: {},
  // outputOpts: {},
  // watchOptions: {},
};

const findTsConfig = (customTsConfig) => {
  if (customTsConfig) {
    if (existsSync(customTsConfig)) {
      return customTsConfig;
    }
    console.error(customTsConfig + ' does not exist.');
  }
  let path = process.cwd();
  while (path) {
    const tsFile = path + '/tsconfig.json';
    if (existsSync(tsFile)) {
      return tsFile;
    } else if (existsSync(path + '/package.json')) {
      return;
    }
    path = path.replace(/\/[^/]+?$/, '');
  }
};

const getNormalizedTSOpts = (opts) => {
  const { rawDeclarations, ...tsOpts } = opts.typescriptOpts || {};
  const rawDecl = rawDeclarations || Array.isArray(opts.outputOpts);
  const tsConfigFile = findTsConfig(tsOpts.tsconfig);
  if (tsConfigFile) {
    const { config /* , error */ } = require('typescript').readConfigFile(tsConfigFile);
    if (config) {
      const cOpts = config.compilerOptions;
      const declaration =
        tsOpts.declaration != null ? tsOpts.declaration : cOpts.declaration;
      const overrideDeclDir = declaration && !rawDecl;

      return [
        rawDecl,
        {
          jsx: 'react', // Override tsconfig.json by default
          // Ensure rootDir is defined and set to a sensible default
          // if we're auto-generating clean declaration files.
          ...(overrideDeclDir && cOpts.rootDir == null && { rootDir: opts.src }),
          declaration,
          ...tsOpts,
          ...(overrideDeclDir && { declarationDir: opts.dist + '__types/' }),
        },
      ];
    }
  }
  return [rawDecl, undefined];
};

const getConfig = (opts) => {
  const makeConfig = (input) => {
    const isFileNameInput = typeof input === 'string';
    const outputDist = isFileNameInput
      ? // Auto-map `*.ts`, `*.tsx` and `*.jsx` to `*.js`.
        // Leave *.esm as is.
        { file: opts.dist + input.replace(/\.(?:tsx?|jsx)$/, '.js') }
      : { dir: opts.dist };
    return {
      input: isFileNameInput ? opts.src + input : input,
      plugins: (
        opts.plugins || [
          !!opts.aliasOpts && require('@rollup/plugin-alias')(opts.aliasOpts),
          require('rollup-plugin-preserve-shebangs').preserveShebangs(),
          require('@rollup/plugin-json')(),
          opts.typescriptOpts &&
            require('@rollup/plugin-typescript')(opts.typescriptOpts),
          require('@rollup/plugin-buble')({ exclude: '**/*.{ts,tsx}' }),
          require('@rollup/plugin-node-resolve')({
            mainFields: ['main'],
            extensions: [/* '.mjs',  */ '.js', '.jsx', '.json', '.ts', '.tsx'],
          }),
          require('@rollup/plugin-commonjs')(),
          require('@rollup/plugin-replace')({
            'process.env.NODE_ENV': JSON.stringify(opts.NODE_ENV),
            ...opts.replaceOpts,
          }),
          !!opts.minify &&
            require('rollup-plugin-terser').terser({
              output: { comments: 'some' },
              ...opts.terserOpts,
            }),
        ]
      ).filter((plugin) => !!plugin),
      ...opts.inputOpts,
      output: {
        ...outputDist,
        format: opts.format,
        sourcemap: opts.sourcemaps,
        // sourcemapExcludeSources: true,
        ...opts.outputOpts,
      },
      watch: {
        exclude: 'node_modules/**',
        ...opts.watchOpts,
      },
    };
  };

  if (opts.entryPoints) {
    return [makeConfig(opts.entryPoints)];
  } else if (opts.format === 'iife' || opts.codeSplit === false) {
    return getFileList(opts.glob, opts.src).map(makeConfig);
  } else {
    const entryPointMap = getFileList(opts.glob, opts.src).reduce((acc, fileName) => {
      acc[fileName.replace(/\.[^.]+$/, '')] = opts.src + fileName;
      return acc;
    }, {});
    return [makeConfig(entryPointMap)];
  }
};

const tsExtRe = /\.tsx?$/;
const isTsFile = (file) => tsExtRe.test(file);
const getPath = (file) => (/\//.test(file) ? file.replace(/\/[^/]+$/, '') : '');
const stripExt = (file) => file.replace(/\.[^.]+$/, '');

const taskFactory = (opts = {}, configger = (x) => x) => {
  opts = normalizeOpts(opts, defaultOpts);
  opts.src = (opts.src + '/').replace(/\/\/$/, '/');
  opts.dist = (opts.dist + '/').replace(/\/\/$/, '/');
  const [rawDeclarations, tsOpts] = getNormalizedTSOpts(opts);
  opts.typescriptOpts = tsOpts;

  const bundleTask = () => {
    const rollupConfig = getConfig(opts).map(configger);

    return Promise.all(
      rollupConfig.map((config) => {
        return rollup.rollup(config).then((bundle) =>
          bundle.write(config.output).then(() => {
            const tsOpts = opts.typescriptOpts || {};

            if (tsOpts.declaration && !rawDeclarations) {
              const distFolder = config.output.dir || opts.dist;
              let entryPointMap = config.input;
              if (typeof entryPointMap === 'string') {
                const outToken = stripExt(config.output.file.slice(distFolder.length));
                entryPointMap = { [outToken]: entryPointMap };
              }
              Object.entries(entryPointMap)
                .filter((entry) => isTsFile(entry[1]))
                .forEach(([outToken, sourceFile]) => {
                  const outFile = distFolder + outToken + '.d.ts';
                  const tsDeclFile =
                    './' +
                    relative(
                      getPath(outFile),
                      tsOpts.declarationDir +
                        relative(tsOpts.rootDir, opts.src) +
                        '/' +
                        stripExt(sourceFile.slice(opts.src.length))
                    );

                  writeFileSync(
                    outFile,
                    [
                      'export * from "' + tsDeclFile + '";',
                      'import x from "' + tsDeclFile + '";',
                      'export default x;',
                      '',
                    ].join('\n')
                  );
                });
            }
          })
        );
      })
    );
  };
  bundleTask.displayName = opts.name;

  const watchTask = () => {
    const rollupConfig = getConfig(opts).map(configger);
    const rollupWatcher = rollup.watch(rollupConfig);

    const logPrefix = opts.name + ' ::';
    const builtFiles = {};
    rollupWatcher.on('event', (e) => {
      const fileName = typeof e.input === 'string' ? e.input : '';
      const isBuilt = builtFiles[fileName];
      if (e.code === 'BUNDLE_START' && isBuilt) {
        console.info(logPrefix, 'rolling', fileName);
      } else if (e.code === 'BUNDLE_END' && isBuilt) {
        const sec =
          e.duration < 500
            ? e.duration + ' ms'
            : ('' + Math.round(e.duration / 10)).replace(/(..)$/, '.$1 s');
        console.info(logPrefix, 'rolled', fileName + '  (' + sec + ')');
      } else if (e.code === 'ERROR' || e.code === 'FATAL') {
        console.error(logPrefix, e.code, e.error);
      }
      if (!isBuilt && (e.code === 'BUNDLE_END' || e.code === 'ERROR')) {
        builtFiles[fileName] = true;
      }
    });
    if (opts.onWatchEvent) {
      rollupWatcher.on('event', opts.onWatchEvent);
    }

    if (!opts.entryPoints) {
      // TODO: Consider using gulp-utils's `prefixGlobs()` function here
      const gulpWatcher = watch(opts.glob, { cwd: opts.src });
      gulpWatcher.on('add', (path) => {
        console.info(logPrefix, path, 'added');
        rollupWatcher.close();
        gulpWatcher.close();
        watchTask();
      });
    }
  };
  watchTask.displayName = opts.name + '_watch';

  const ret = [bundleTask, watchTask];
  ret.bundle = bundleTask;
  ret.watch = watchTask;

  return ret;
};

module.exports = taskFactory;
