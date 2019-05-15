const rollup = require('rollup');
// let hasTypescript = false;
// try {
//   hasTypescript = !!require.resolve('typescript');
// } catch (error) {}

const _plugins = {
  buble: require('rollup-plugin-buble'),
  commonjs: require('rollup-plugin-commonjs'),
  json: require('rollup-plugin-json'),
  // nodent: require('rollup-plugin-nodent'), // simple+fast async/await
  nodeResolve: require('rollup-plugin-node-resolve'),
  replace: require('rollup-plugin-replace'),
  // typescript: hasTypescript && require('rollup-plugin-typescript2'),
  uglify: require('rollup-plugin-uglify').uglify,
};
const glob = require('glob');
const { watch } = require('gulp');

const getFileList = (globList, cwd) => {
  if (typeof globList === 'string') {
    globList = [globList];
  }
  const foundFiles = {};
  return globList
    .reduce((fileList, globString) => fileList.concat(glob.sync(globString, { cwd })), [])
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
  glob: '*.{js,ts}', // which files to glob up as entry points
  // entryPoints: null, // Advanced: rollup.input string array or input map
  NODE_ENV: 'production',
  // plugins: [], // custom list of plugins
  // replaceOpts: {}, // custom options for rollup-plugin-replace
  // uglifyOpts: {}, // custom options for rollup-plugin-uglify
  minify: true,
  sourcemaps: true,
  format: 'iife',
  codeSplit: true, // (when format isn't 'iife')
  // inputOpts: {},
  // outputOpts: {},
  // watchOptions: {},
};

const getConfig = (opts) => {
  const makeConfig = (input) => {
    const isFileNameInput = typeof input === 'string';
    const outputDist = isFileNameInput ? { file: opts.dist + input } : { dir: opts.dist };
    return {
      input: isFileNameInput ? opts.src + input : input,
      plugins: opts.plugins || [
        _plugins.json(),
        _plugins.nodeResolve(),
        _plugins.commonjs(),
        // _plugins.nodent({
        //   noRuntime: true,
        //   promises: true,
        // }),
        _plugins.buble({ objectAssign: true }),
        // hasTypescript && _plugins.typescript(),
        _plugins.replace({
          'process.env.NODE_ENV': JSON.stringify(opts.NODE_ENV),
          ...opts.replaceOpts,
        }),
        !opts.minify
          ? null
          : _plugins.uglify({
              output: { comments: 'some' },
              compress: {
                // drop_console: true, // Meh, ESLint warnings should be sufficient
              },
              ...opts.uglifyOpts,
            }),
      ],
      ...opts.inputOptions,
      output: {
        ...outputDist,
        format: opts.format,
        sourcemap: opts.sourcemaps,
        // sourcemapExcludeSources: true,
        ...opts.outputOptions,
      },
      watch: {
        exclude: 'node_modules/**',
        ...opts.watchOptions,
      },
    };
  };

  if (opts.entryPoints) {
    return [makeConfig(opts.entryPoints)];
  } else if (opts.format === 'iife' || opts.codeSplit === false) {
    return getFileList(opts.glob, opts.src).map(makeConfig);
  } else {
    let entryPointMap = getFileList(opts.glob, opts.src).reduce((acc, fileName) => {
      acc[fileName.replace(/\..+?$/, '')] = opts.src + fileName;
      return acc;
    }, {});
    return [makeConfig(entryPointMap)];
  }
};

const taskFactory = (opts = {}, configger = (x) => x) => {
  opts = { ...defaultOpts, ...opts };
  opts.src += '/';
  opts.dist += '/';

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
        console.info(logPrefix, 'rolled', fileName);
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
taskFactory.glob = glob;

module.exports = taskFactory;
