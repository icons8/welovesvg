
ng.service('debug', ['config', function(config) {
  var
    Debug,
    debug,
    pool = {};

  Debug = function(ns) {
    var
      _debug;

    _debug = function(...args) {
      return _debug.log(...args);
    };

    Object.defineProperty(_debug, 'enabled', {
      get: function() {
        return this._enabled && debug._enabled;
      },
      set: function(enabled) {
        this._enabled = enabled;
      },
      enumerable: true,
      configurable: true
    });

    _debug.enabled = false;

    _debug.log = function(...args) {
      if (this.enabled) {
        if (ns) {
          args.unshift(ns);
        }
        console.log.apply(console, args);
      }
    };

    return _debug;
  };


  debug = new Debug;
  debug.ns = function(ns) {
    if (!ns) {
      return this;
    }
    if (pool.hasOwnProperty(ns)) {
      return pool[ns];
    }
    return pool[ns] = new Debug(ns);
  };

  let _config = config.debug || {};
  let _nsConfig = _config.ns || {};

  debug.enabled = _config.enabled || false;

  Object.keys(_nsConfig).forEach(ns => {
    let _config = _nsConfig[ns] || {};
    debug.ns(ns).enabled = _config.enabled || false;
  });

  return debug;
}]);