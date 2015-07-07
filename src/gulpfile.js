'use strict';

var gulp = require('gulp');
var header = require('gulp-header');
var footer = require('gulp-footer');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var jade = require('gulp-jade');
var ejs = require('gulp-ejs');
var concat = require('gulp-concat');
var globby = require('globby');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var jsmin = require('jsmin').jsmin;
var gulpif = require('gulp-if');
var merge = require('merge-stream');
var streamqueue = require('streamqueue');
var templateCache = require('gulp-angular-templatecache');
var ngAnnotate = require('gulp-ng-annotate');
var plumber = require('gulp-plumber');
var fs = require('fs');
var path = require('path');
var del = require('del');
var runSequence = require('run-sequence');
var yargs = require('yargs');
var connect = require('gulp-connect');
var traceur = require('gulp-traceur');
var bower = require('gulp-bower');
var rename = require('gulp-rename');

var argv = yargs
  .usage('Usage: $0 ' +
  '[--min] ' +
  '[--min-modules] ' +
  '[--min-packages] ' +
  '[--min-projects] ' +
  '[--min-locales] ' +
  '[--no-watch] ' +
  '[--no-clean] ' +
  '[--debug] ' +
  '[--local] ' +
  '[--locale] ' +
  '[--apps] ' +
  '[--connect] ' +
  '[--connect-livereload] ' +
  '[--connect-plugins] ' +
  '[--connect-port] ' +
  '[--connect-root] ' +
  '[--template-context-disabled-loggers] ' +
  '')
  .argv;


var traceurRuntimeJs = 'node_modules/traceur/bin/traceur-runtime.js';
var traceurOptions = {
  //asyncFunctions: true
};

var getDestBase = function() {
  return argv.destBase || 'build';
};

var paths = {
  src: {
    base: 'apps',
    apps: '*',
    fonts: '*/fonts/**/*.*',
    images: '*/images/**/*.*',
    styles: ['*/styles/**/*.{scss,sass}', '!*/styles/**/_*.{scss,sass}'],
    stylesWatch: '*/styles/**/*.{scss,sass}',
    pages: '*',
    pagesWatch: '*/pages/**/*.{jade,ejs,html,htm}',
    scripts: {
      modules: '*/modules/*',
      apps: '*'
    },
    scriptsWatch: ['**/*.{js,jade,ejs,json,html,htm}', '!*/vendors/**']
  },
  dest: {
    base: getDestBase()
  }
};

var readJsonFile = function(filename) {
  try {
    return fs.existsSync(filename) ? JSON.parse(jsmin(fs.readFileSync(filename) + '')) : undefined;
  }
  catch(e) {
    gutil.log(e);
    return null;
  }
};

var isMinify = function() {
  return argv.min;
};
var isMinifyPackages = function() {
  return argv.min && (typeof argv.minPackages == 'undefined' || argv.minPackages);
};
var isMinifyProjects = function() {
  return argv.min && (typeof argv.minProjects == 'undefined' || argv.minProjects);
};
var isMinifyModules = function() {
  return argv.min && (typeof argv.minModules == 'undefined' || argv.minModules);
};
var isMinifyLocales = function() {
  return argv.min && (typeof argv.minLocales == 'undefined' || argv.minLocales);
};

var isWatch = function() {
  return typeof argv.watch == 'undefined' || argv.watch;
};
var isClean = function() {
  return typeof argv.clean == 'undefined' || argv.clean;
};
var isDebug = function() {
  return typeof argv.debug == 'undefined' || argv.debug;
};
var isLocal = function() {
  return typeof argv.local == 'undefined' || argv.local;
};

var isConnect = function() {
  return argv.connect || argv.connectLivereload || argv.connectPort || argv.connectRoot || argv.connectPlugins;
};
var isConnectLivereload = function() {
  return argv.connectLivereload;
};
var isConnectPlugins = function() {
  return typeof argv.connectPlugins == 'undefined' || argv.connectPlugins;
};
var getConnectPort = function() {
  var port = parseInt(argv.connectPort);
  return isNaN(port) || !port ? 3456 : port;
};
var getConnectRoot = function() {
  return typeof argv.connectRoot == 'undefined' ? getPagesRoot() : argv.connectRoot;
};

var getPagesRoot = function() {
  return argv.pagesRoot || 'pages';
};

var getIndex = function() {
  return argv.index;
}

var getLocaleId = function() {
  return argv.locale;
};

var getTemplateContextDisabledLoggers = function() {
  return String(argv.templateContextDisabledLoggers || '')
    .split(',');
};

var getConnectApps = function() {
  var
    apps = getApps(),
    list;

  list = String(argv.apps || '')
    .split(',')
    .filter(function(value) {
      return value && apps.indexOf(value) != -1;
    });
  if (list.length) {
    apps = list;
  }

  if (argv.connect) {
    return String(argv.connect)
      .split(',')
      .filter(function(value) {
        return value && apps.indexOf(value) != -1;
      });
  }
  return apps;
};

var getApps = function() {
  var
    list = [],
    apps = [];

  if (typeof argv.apps == 'undefined' || (typeof argv.apps == 'boolean' && argv.apps)) {
    apps = globby.sync(paths.src.apps, { cwd: paths.src.base })
      .map(path.basename.bind(path))
      .filter(function(name) {
        var
          config = getAppManifest(name);
        return typeof config.build == 'undefined' || config.build;
      });
  }
  else {
    list = String(argv.apps || '').split(',').filter(function(value) {
      return value;
    });

    globby.sync(paths.src.apps, { cwd: paths.src.base })
      .map(path.basename.bind(path))
      .forEach(function(name) {
        var
          config = getAppManifest(name);
        if (config.build || list.indexOf(name) != -1) {
          apps.push(name);
        }
      });
  }

  apps.forEach(function(name) {
    getAppExtendsList(name).forEach(function(name) {
      if (apps.indexOf(name) == -1) {
        apps.push(name);
      }
    });
  });

  return apps;
};

var mergeObjects = function(to /*, from [, from[, ...]]*/) {
  var args = Array.prototype.slice.call(arguments);
  if (args.length == 0) {
    return {};
  }
  if (args.length < 2) {
    if (!Array.isArray(to)) {
      return to;
    }
    args = to;
    to = args[0];
  }
  args.slice(1).forEach(function(from) {
    to = _merge(to, from);
  });
  return to;

  function _merge(to, from) {
    if (!to || !from || typeof to != 'object' || typeof from != 'object' || Array.isArray(to) || Array.isArray(from)) {
      return from;
    }
    Object.keys(from).forEach(function(key) {
      if (to.hasOwnProperty(key)) {
        to[key] = _merge(to[key], from[key]);
      }
      else {
        to[key] = from[key];
      }
    });
    return to;
  }
};

var getAppManifest = function(name) {
  return mergeObjects(
    {},
    readJsonFile(path.join(paths.src.base, name, 'config.json')) || {},
    isDebug()
      ? readJsonFile(path.join(paths.src.base, name, 'config.debug.json')) || {}
      : {},
    isLocal()
      ? readJsonFile(path.join(paths.src.base, name, 'config.local.json')) || {}
      : {}
  );
};

var getAppExtendsList = function(name) {
  var
    list = [];
  var _appExtendsList = function(name) {
    if (list.indexOf(name) != -1) {
      return;
    }
    (getAppManifest(name).extends || []).forEach(function(name) {
      _appExtendsList(name);
    });
    list.push(name);
  };
  _appExtendsList(name);
  return list
    .filter(function(value) {
      return value != name;
    });
};

var getAppConfig = function(name) {
  return mergeObjects([].concat(
    {},
    getAppExtendsList(name)
      .concat(name)
      .map(function(name) {
        return mergeObjects(
          {},
          readJsonFile(path.join(paths.src.base, name, 'config', 'config.json')) || {},
          isDebug()
            ? readJsonFile(path.join(paths.src.base, name, 'config', 'config.debug.json')) || {}
            : {},
          isLocal()
            ? readJsonFile(path.join(paths.src.base, name, 'config', 'config.local.json')) || {}
            : {}
        );
      })
  ));
};

var getAppExportsConfig = function(name) {
  var
    config = getAppConfig(name),
    _exports = {};

  var _performExports = function(_config, _manifest, _exports) {
    if (!_config || !_manifest) {
      return;
    }
    if (typeof _manifest == "string") {
      if (_config.hasOwnProperty(_manifest)) {
        _exports[_manifest] = _config[_manifest];
      }
      return;
    }
    if (Array.isArray(_manifest)) {
      _manifest.forEach(function(key) {
        _performExports(_config, key, _exports);
      });
      return;
    }
    Object.keys(_manifest)
      .filter(function(key) {
        return _config.hasOwnProperty(key);
      })
      .forEach(function(key) {
        if (typeof _manifest[key] != 'object') {
          _performExports(_config, key, _exports);
          return;
        }
        if (Array.isArray(_config[key]) || typeof _config[key] != 'object') {
          return;
        }
        if (!_exports.hasOwnProperty(key) || !_exports[key] || typeof _exports[key] != 'object' || Array.isArray(_exports[key])) {
          _exports[key] = {};
        }
        _performExports(_config[key], _manifest[key], _exports[key]);
      });
  };

  getAppExtendsList(name)
    .concat(name)
    .forEach(function(name) {
      _performExports(
        config,
        readJsonFile(path.join(paths.src.base, name, 'config', 'exports.json')) || [],
        _exports
      )
    });

  return _exports;
};

var getAppTemplateContext = function(name) {
  var _getTemplateContextMethods = function(name) {
    var
      dir = path.join(paths.src.base, name, 'template-context'),
      filename = path.join(dir, 'index.js');
    if (fs.existsSync(filename)) {
      try {
        return require('./' + dir);
      }
      catch(e) {}
    }
    return {};
  };

  var
    methods,
    context,
    config;

  methods = getAppExtendsList(name)
    .concat(name)
    .map(_getTemplateContextMethods);
  config = getAppConfig(name);
  context = mergeObjects([].concat(
    {
      $: config,
      cfg: config,
      config: config
    },
    methods
  ));

  Object.keys(context).forEach(function(key) {
    if (typeof context[key] == 'function') {
      context[key] = context[key].bind(context);
    }
  });

  var
    localeId = getAppLocaleId(name),
    locale = getAppLocales(name)[localeId],
    disabledLoggers = getTemplateContextDisabledLoggers();

  context.getLocale = function() {
    return locale || {};
  };
  context.log = function() {
    gutil.log(Array.prototype.slice.call(arguments).join(' '));
  };
  context.logger = function(ns) {
    if (disabledLoggers.indexOf(ns) != -1) {
      return function() {};
    }
    return function(/* ...args */) {
      context.log.apply(context, [ns + ':'].concat(Array.prototype.slice.call(arguments)));
    }
  };

  return context;
};

var getAppLocaleId = function(name) {
  return getLocaleId() || getAppDefaultLocaleId(name);
};

var getAppDefaultLocaleId = function(name) {
  return (getAppManifest(name).locale || {})['default'] || 'en';
};

var getAppLocales = function(name) {
  var _getPluralFn = function(name, id) {
    var
      dir = path.join(paths.src.base, name, 'locales', id),
      filename = path.join(dir, 'plural.js');
    if (fs.existsSync(filename)) {
      try {
        return require('./' + dir + '/plural');
      }
      catch(e) {}
    }
    return null;
  };

  return mergeObjects([].concat(
    {},
    getAppExtendsList(name)
      .concat(name)
      .map(function(name) {
        var
          dir = path.join(paths.src.base, name, 'locales'),
          locales = {};

        globby.sync(['*', '!*.json'], { cwd: dir })
          .forEach(function(id) {
            var
              pluralFn = _getPluralFn(name, id),
              locale = locales[id] = {};

            locale.id = id;
            if (pluralFn) {
              locale.plural = pluralFn;
            }
            locale.dictionary = readJsonFile(path.join(dir, id, 'dictionary.json')) || {};
          });

        return locales;
      })
  ));
};

var getAppLocalesExportsConfig = function(name) {
  return mergeObjects([].concat(
    {},
    getAppExtendsList(name)
      .concat(name)
      .map(function(name) {
        var
          dir = path.join(paths.src.base, name, 'locales'),
          _exports = {};
        (readJsonFile(path.join(dir, 'exports.json')) || []).forEach(function(key) {
          _exports[key] = true;
        });
        return _exports;
      })
  ));
};

var getAppExportsLocales = function(name) {
  var
    locales = getAppLocales(name),
    exportsConfig = getAppLocalesExportsConfig(name),
    _exports = {};

  Object.keys(locales)
    .forEach(function(id) {
      _exports[id] = {};
      Object.keys(exportsConfig)
        .forEach(function(term) {
          if (!_exports[id].hasOwnProperty(term) && locales[id].dictionary.hasOwnProperty(term)) {
            _exports[id][term] = locales[id].dictionary[term];
          }
          if (!locales[id].dictionary.hasOwnProperty(term)) {
            gutil.log('Undefined symbol "' + term + '" in ' + id + ' locale');
          }
        });
    });

  return _exports;
};

var getExcludedPatterns = function() {
  var
    apps = getApps(),
    patterns = [];
  globby.sync(paths.src.apps, { cwd: paths.src.base })
    .filter(function(dir) {
      var
        name = path.basename(dir);
      return apps.indexOf(name) == -1
    })
    .forEach(function(dir) {
      patterns.push(
        '!' + path.join(dir, '**'),
        '!' + dir
      )
    });
  return patterns;
};

var filterAllowedPatterns = function(/* pattern[, ...] */) {
  var patterns = Array.prototype.concat.apply([], Array.prototype.slice.call(arguments));
  return [].concat(patterns, getExcludedPatterns());
};

['fonts', 'images'].forEach(function(key) {
  gulp.task(key, function () {
    return gulp.src(filterAllowedPatterns(paths.src[key]), { cwd: paths.src.base })
      .pipe(plumber())
      .pipe(gulp.dest(paths.dest.base))
      .pipe(gulpif(isConnectLivereload(), connect.reload().on('error', gutil.log)))
      ;
  });
});

gulp.task('styles', function() {
  return gulp.src(filterAllowedPatterns(paths.src.styles), { cwd: paths.src.base })
    .pipe(plumber())
    .pipe(sass({errLogToConsole: true, indentedSyntax: true}).on('error', gutil.log))
    .pipe(autoprefixer().on('error', gutil.log))
    .pipe(gulpif(isMinify(), minifycss({processImport: false}).on('error', gutil.log)))
    .pipe(gulp.dest(paths.dest.base))
    .pipe(gulpif(isConnectLivereload(), connect.reload().on('error', gutil.log)))
    ;
});

gulp.task('copy', function() {
  var
    tasks = [],
    dirs;

  dirs = globby.sync(filterAllowedPatterns(paths.src.apps), { cwd: paths.src.base });
  dirs.forEach(function(dir) {
    var
      base = path.join(paths.src.base, dir),
      name = path.basename(dir),
      config,
      copy;

    config = getAppManifest(name);

    copy = config.copy || [];
    copy.forEach(function(options) {

      tasks.push(
        gulp.src(options.from, { cwd: base })
          .pipe(plumber())
          .pipe(gulp.dest(path.join(dir, options.to), { cwd: paths.dest.base }))
      );

    });
  });

  if (!tasks.length) {
    return;
  }

  return merge(tasks);
});

gulp.task('pages', function() {
  var
    tasks = [],
    dirs;

  dirs = globby.sync(filterAllowedPatterns(paths.src.pages), { cwd: paths.src.base });
  dirs.forEach(function(dir) {
    var
      base = path.join(paths.src.base, dir),
      name = path.basename(dir);

    tasks.push(
      streamqueue({ objectMode: true },
        gulp.src(['pages/**/*.{html,htm}'], { cwd: base })
          .pipe(plumber()),
        gulp.src(['pages/**/*.ejs'], { cwd: base })
          .pipe(plumber())
          .pipe(ejs(getAppTemplateContext(name)).on('error', gutil.log)),
        gulp.src(['pages/**/*.jade', '!pages/**/_*.jade'], { cwd: base })
          .pipe(plumber())
          .pipe(jade({locals: getAppTemplateContext(name)}).on('error', gutil.log))
      )
        .pipe(plumber())
        .pipe(gulp.dest(path.join(dir, getPagesRoot()), { cwd: paths.dest.base }))
    );
  });

  if (!tasks.length) {
    return;
  }

  return merge(tasks)
    .pipe(gulpif(isConnectLivereload(), connect.reload().on('error', gutil.log)))
    ;
});

gulp.task('scripts.modules', function() {
  var
    prefix = ';(function(angular) {',
    suffix = '})(angular);',
    tasks = [],
    dirs;

  dirs = globby.sync(filterAllowedPatterns(paths.src.scripts.modules), { cwd: paths.src.base });
  dirs.forEach(function(dir) {
    var
      base = path.join(paths.src.base, dir),
      name = path.basename(dir),
      appName = dir.split(/[\/\\]/)[0],
      appConfig,
      es6,
      ngAnnotateFix,
      exportsConfig,
      exportsConfigJs,
      exportsLocale,
      exportsLocaleJs,
      localeId,
      begin = prefix,
      end = suffix;

    appConfig = getAppManifest(appName);
    es6 = ((appConfig.es6 || {}).modules || []).indexOf(name) != -1;
    ngAnnotateFix = ((appConfig.ngAnnotate || {}).modules || []).indexOf(name) != -1;
    exportsConfig = (((appConfig.exports || {}).config || {}).modules || []).indexOf(name) != -1;
    exportsLocale = (((appConfig.exports || {}).locale || {}).modules || []).indexOf(name) != -1;

    if (exportsConfig) {
      exportsConfigJs = [
        'angular.module("'+name+'").config(["configProvider", function(configProvider) {',
        'configProvider.defaults(',
        JSON.stringify(getAppExportsConfig(appName)) || '',
        ');',
        '}]);'
      ];
      end += exportsConfigJs.join('');
    }

    if (exportsLocale) {
      localeId = getAppLocaleId(appName);
      exportsLocaleJs = [
        'angular.module("'+name+'").config(["localeProvider", function(localeProvider) {',
        'localeProvider.locale(',
        JSON.stringify(localeId),
        ');',
        'localeProvider.dictionary(',
        JSON.stringify(getAppExportsLocales(appName)[localeId]) || '',
        ');',
        '}]);'
      ];
      end += exportsLocaleJs.join('');
    }

    tasks.push(
      streamqueue({ objectMode: true },
        gulp.src(['module.js', '**/*.js', '!**/_*.js', '!**/*.{example,debug,local}.js'], { cwd: base })
          .pipe(plumber())
          .pipe(footer(';')),
        gulp.src(isDebug() ? ['**/*.debug.js', '!**/_*.js'] : [], { cwd: base })
          .pipe(plumber())
          .pipe(footer(';')),
        gulp.src(isLocal() ? ['**/*.local.js', '!**/_*.js'] : [], { cwd: base })
          .pipe(plumber())
          .pipe(footer(';')),
        gulp.src(['templates/**/*.{html,htm}'], { cwd: base })
          .pipe(plumber())
          .pipe(templateCache({ module: name }).on('error', gutil.log)),
        gulp.src(['templates/**/*.ejs'], { cwd: base })
          .pipe(plumber())
          .pipe(ejs(getAppTemplateContext(appName)).on('error', gutil.log))
          .pipe(templateCache({ module: name }).on('error', gutil.log)),
        gulp.src(['templates/**/*.jade', '!templates/**/_*.jade'], { cwd: base })
          .pipe(plumber())
          .pipe(jade({locals: getAppTemplateContext(appName)}).on('error', gutil.log))
          .pipe(templateCache({ module: name }).on('error', gutil.log))
      )
        .pipe(plumber())
        .pipe(concat(name + '.js'))
        .pipe(gulpif(es6, traceur(traceurOptions).on('error', gutil.log)))
        .pipe(header(begin))
        .pipe(footer(end))
        .pipe(gulpif(ngAnnotateFix, ngAnnotate().on('error', gutil.log)))
        .pipe(gulpif(isMinifyModules(), uglify().on('error', gutil.log)))
        .pipe(gulp.dest(path.dirname(dir), { cwd: paths.dest.base }))
    );
  });

  if (!tasks.length) {
    return;
  }

  return merge(tasks)
    .pipe(gulpif(isConnectLivereload(), connect.reload().on('error', gutil.log)))
    ;
});

gulp.task('scripts.apps.locales', function() {
  var
    prefix = ';(function() {',
    suffix = '})();',
    tasks = [],
    dirs;

  dirs = globby.sync(filterAllowedPatterns(paths.src.scripts.apps), { cwd: paths.src.base });
  dirs.forEach(function(dir) {
    var
      base = path.join(paths.src.base, dir),
      name = path.basename(dir),
      config,
      localeId,
      locales,
      keys;

    config = getAppManifest(name);
    localeId = getAppLocaleId(name);

    var sourcesToPaths = function(sources) {
      return sources.map(function(name){
        if ( /(^|.[/\\]):(modules)[/\\]/i.test(name) ) {
          return path.relative(base, path.join(paths.dest.base, dir, name.replace(/:(modules)/gi, '$1')));
        }
        if (name == ':es6.js') {
          return path.relative(base, path.normalize(traceurRuntimeJs));
        }
        return name;
      })
    };

    locales = (config.locales || {});
    keys = Object.keys(locales);
    keys.forEach(function(key) {
      var
        es6 = ((config.es6 || {}).locales || []).indexOf(key) != -1,
        ngAnnotateFix = ((config.ngAnnotate || {}).locales || []).indexOf(key) != -1
        ;
      tasks.push(
        gulp.src(sourcesToPaths(locales[key][localeId] || []), { cwd: base })
          .pipe(plumber())
          .pipe(footer(';'))
          .pipe(concat(key + '.js'))
          .pipe(gulpif(es6, traceur(traceurOptions).on('error', gutil.log)))
          .pipe(gulpif(es6, header(prefix)))
          .pipe(gulpif(es6, footer(suffix)))
          .pipe(gulpif(ngAnnotateFix, ngAnnotate().on('error', gutil.log)))
          .pipe(gulpif(isMinifyLocales(), uglify().on('error', gutil.log)))
          .pipe(gulp.dest( path.join(dir, 'locales'), { cwd: paths.dest.base }))
      );
    });
  });

  if (!tasks.length) {
    return;
  }

  return merge(tasks)
    .pipe(gulpif(isConnectLivereload(), connect.reload().on('error', gutil.log)))
    ;
});


gulp.task('scripts.apps.packages', function() {
  var
    prefix = ';(function() {',
    suffix = '})();',
    tasks = [],
    dirs;

  dirs = globby.sync(filterAllowedPatterns(paths.src.scripts.apps), { cwd: paths.src.base });
  dirs.forEach(function(dir) {
    var
      base = path.join(paths.src.base, dir),
      name = path.basename(dir),
      config,
      packages,
      keys;

    config = getAppManifest(name);

    var sourcesToPaths = function(sources) {
      return sources.map(function(name){
        if ( /(^|.[/\\]):(modules|locales)[/\\]/i.test(name) ) {
          return path.relative(base, path.join(paths.dest.base, dir, name.replace(/:(modules|locales)/gi, '$1')));
        }
        if (name == ':es6.js') {
          return path.relative(base, path.normalize(traceurRuntimeJs));
        }
        return name;
      })
    };

    packages = config.packages || {};
    keys = Object.keys(packages);
    keys.forEach(function(key) {
      var
        es6 = ((config.es6 || {}).packages || []).indexOf(key) != -1,
        ngAnnotateFix = ((config.ngAnnotate || {}).packages || []).indexOf(key) != -1
        ;
      tasks.push(
        gulp.src(sourcesToPaths(packages[key]), { cwd: base })
          .pipe(plumber())
          .pipe(footer(';'))
          .pipe(concat(key + '.js'))
          .pipe(gulpif(es6, traceur(traceurOptions).on('error', gutil.log)))
          .pipe(gulpif(es6, header(prefix)))
          .pipe(gulpif(es6, footer(suffix)))
          .pipe(gulpif(ngAnnotateFix, ngAnnotate().on('error', gutil.log)))
          .pipe(gulpif(isMinifyPackages(), uglify().on('error', gutil.log)))
          .pipe(gulp.dest( path.join(dir, 'packages'), { cwd: paths.dest.base }))
      );
    });
  });

  if (!tasks.length) {
    return;
  }

  return merge(tasks)
    .pipe(gulpif(isConnectLivereload(), connect.reload().on('error', gutil.log)))
    ;
});

gulp.task('scripts.apps.projects', function() {
  var
    prefix = ';(function() {',
    suffix = '})();',
    tasks = [],
    dirs;

  dirs = globby.sync(filterAllowedPatterns(paths.src.scripts.apps), { cwd: paths.src.base });
  dirs.forEach(function(dir) {
    var
      base = path.join(paths.src.base, dir),
      name = path.basename(dir),
      config,
      projects,
      keys;

    config = getAppManifest(name);

    var sourcesToPaths = function(sources) {
      return sources.map(function(name){
        if ( /(^|.[/\\]):(modules|locales|packages)[/\\]/i.test(name) ) {
          return path.relative(base, path.join(paths.dest.base, dir, name.replace(/:(modules|locales|packages)/gi, '$1')));
        }
        if (name == ':es6.js') {
          return path.relative(base, path.normalize(traceurRuntimeJs));
        }
        return name;
      })
    };

    projects = config.projects || {};
    keys = Object.keys(projects);
    keys.forEach(function(key) {
      var
        es6 = ((config.es6 || {}).projects || []).indexOf(key) != -1,
        ngAnnotateFix = ((config.ngAnnotate || {}).projects || []).indexOf(key) != -1
        ;
      tasks.push(
        gulp.src(sourcesToPaths(projects[key]), { cwd: base })
          .pipe(plumber())
          .pipe(footer(';'))
          .pipe(concat(key + '.js'))
          .pipe(gulpif(es6, traceur(traceurOptions).on('error', gutil.log)))
          .pipe(gulpif(es6, header(prefix)))
          .pipe(gulpif(es6, footer(suffix)))
          .pipe(gulpif(ngAnnotateFix, ngAnnotate().on('error', gutil.log)))
          .pipe(gulpif(isMinifyProjects(), uglify().on('error', gutil.log)))
          .pipe(gulp.dest( path.join(dir, 'projects'), { cwd: paths.dest.base }))
      );
    });
  });

  if (!tasks.length) {
    return;
  }

  return merge(tasks)
    .pipe(gulpif(isConnectLivereload(), connect.reload().on('error', gutil.log)))
    ;
});

gulp.task('scripts.apps', ['scripts.modules'], function(callback) {
  runSequence('scripts.apps.locales', 'scripts.apps.packages', 'scripts.apps.projects', callback);
});

gulp.task('connect', function() {
  var
    root = [];
  getConnectApps().forEach(function(name) {
    var
      app = path.join(paths.dest.base, name);
    root.push(path.join(app, getConnectRoot()));
    root.push(app);
  });
  root.push(paths.dest.base);

  var options = {
    root: root,
    livereload: isConnectLivereload(),
    port: getConnectPort()
  };

  options.middleware = function(connect, options) {
    var list = [];
    list.push(connect.responseTime());
    list.push(connect.query());

    if (isConnectPlugins()) {
      getApps()
        .forEach(function(name) {
          var
            middlewares = null,
            plugin = '.' + path.sep + path.join(paths.src.base, name, 'connect-plugins');
          try {
            if (fs.existsSync(path.join(__dirname, plugin, 'index.js'))) {
              middlewares = require(plugin)(connect, options);
            }
            if (Array.isArray(middlewares)) {
              Array.prototype.push.apply(list, middlewares);
            }
            else if (middlewares) {
              list.push(middlewares);
            }
          }
          catch(e) {
            gutil.log(e);
          }
        });
    }
    return list;
  };

  connect.server(options);
});

gulp.task('clean', function(cb) {
  var
    dirs,
    patterns;

  dirs = globby.sync(paths.src.apps, { cwd: paths.dest.base });
  patterns = dirs.map(function(dir){
    return path.join(dir, '**');
  });

  del(patterns, { cwd: path.join(process.cwd(), paths.dest.base) }, cb);
});

gulp.task('index', function() {
  var
    index;

  index = getIndex();
  if (!index) {
    return;
  }

  return gulp.src(index, { cwd: paths.dest.base })
    .pipe(rename('index.html'))
    .pipe(gulp.dest('.', {cwd: paths.dest.base}))
});

gulp.task('build', function(callback) {
  var
    tasks = [],
    demons = [];

  tasks.push('copy', ['fonts', 'images', 'styles', 'scripts.apps'], 'pages', 'index');

  if (isClean()){
    tasks.unshift('clean');
  }

  if (isWatch()) {
    demons.push('watch');
  }
  if (isConnect()) {
    demons.push('connect');
  }
  if (demons.length > 0) {
    tasks.push(demons);
  }

  runSequence.apply(null, tasks.concat(callback));
});

gulp.task('watch', function() {
  watch(paths.src.fonts, ['fonts']);
  watch(paths.src.images, ['images']);
  watch(paths.src.stylesWatch, ['styles']);
  watch(paths.src.pagesWatch, ['pages']);
  watch(paths.src.scriptsWatch, ['scripts.apps']);

  function watch(patterns, tasks) {
    var
      filteredPatterns = filterAllowedPatterns(patterns);
    gutil.log('watch: ' + filteredPatterns + ' ' + globby.sync(filteredPatterns, {cwd: paths.src.base}).length + ' files');
    return gulp.watch(filteredPatterns, {cwd: paths.src.base}, tasks || []).on('error', gutil.log);
  }
});

gulp.task('default', function(callback) {
  runSequence('build', callback);
});

gulp.task('bower', function() {
  return bower()
});

gulp.task('install', function(callback) {
  runSequence('bower', callback);
});