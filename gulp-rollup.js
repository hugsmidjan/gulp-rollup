/* global process */
const { normalizeOpts } = require('@hugsmidjan/gulp-utils');
const rollup = require('rollup');

const hasTypescript = false;

const _plugins = {
  buble: require('@rollup/plugin-buble'),
  commonjs: require('@rollup/plugin-commonjs'),
  json: require('@rollup/plugin-json'),
  // nodent: require('rollup-plugin-nodent'), // simple+fast async/await
  nodeResolve: require('@rollup/plugin-node-resolve'),
  replace: require('@rollup/plugin-replace'),
  typescript: require('rollup-plugin-typescript2'),
  terser: require('rollup-plugin-terser').terser,
};
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
  // entryPoints: null, // Advanced: rollup.input string array or input map
  NODE_ENV: process.env.NODE_ENV,
  // plugins: [], // custom list of plugins
  // replaceOpts: {}, // custom options for rollup-plugin-replace
  // terserOpts: {}, // custom options for rollup-plugin-terser
  // typescriptOpts: {}, // custom options for rollup-plugin-typescript2
  minify: true,
  sourcemaps: true,
  format: 'iife', // Rollup output format
  codeSplit: true, // (when format isn't 'iife')
  // inputOpts: {},
  // outputOpts: {},
  // watchOptions: {},
};

const makeTSOpts = (opts) => {
  const tsconfigOverride = opts && opts.tsconfigOverride;
  const compilerOptions = (tsconfigOverride && tsconfigOverride.compilerOptions) || {};
  return {
    clean: true, // Turn off rollup-plugin-typescript2's cache by default.
    ...opts,
    tsconfigOverride: {
      ...tsconfigOverride,
      compilerOptions: {
        ...compilerOptions,
        jsx: compilerOptions.jsx || 'react',
      },
    },
  };
};

const handleTS = (opts) => {
  if (opts.typescriptOpts) {
    return true;
  }
  const fs = require('fs');
  let path = process.cwd();
  while (path) {
    if (fs.existsSync(path + '/tsconfig.json')) {
      return true;
    } else if (fs.existsSync(path + '/package.json')) {
      return false;
    }
    path = path.replace(/\/[^/]+?$/, '');
  }
  return false;
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
          _plugins.json(),
          handleTS(opts) && _plugins.typescript(makeTSOpts(opts.typescriptOpts)),
          _plugins.buble({ exclude: '**/*.{ts,tsx}' }),
          // _plugins.nodent({
          //   noRuntime: true,
          //   promises: true,
          // }),
          _plugins.nodeResolve({
            mainFields: ['main'],
            extensions: [/* '.mjs',  */ '.js', '.jsx', '.json', '.ts', '.tsx'],
          }),
          _plugins.commonjs(),
          _plugins.replace({
            'process.env.NODE_ENV': JSON.stringify(opts.NODE_ENV),
            ...opts.replaceOpts,
          }),
          !opts.minify
            ? null
            : _plugins.terser({
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

const taskFactory = (opts = {}, configger = (x) => x) => {
  opts = normalizeOpts(opts, defaultOpts);
  opts.src = (opts.src + '/').replace(/\/\/$/, '/');
  opts.dist = (opts.dist + '/').replace(/\/\/$/, '/');

  const bundleTask = () => {
    const rollupConfig = getConfig(opts).map(configger);
    const rollups = rollupConfig.map((config) => {
      return rollup.rollup(config).then((bundle) => bundle.write(config.output));
    });
    return Promise.all(rollups);
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

taskFactory.plugins = _plugins;

module.exports = taskFactory;
