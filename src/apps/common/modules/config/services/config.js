
ng.provider('config', function() {
  var
    defaults = {},
    config = {},
    configProvider
    ;

  config.__proto__ = defaults;

  configProvider = function(cfg) {
    configProvider.append(cfg);
  };

  configProvider.add = function(cfg) {
    return config = cfg || {};
  };

  configProvider.append = function(cfg) {
    return config = merge(config || {}, cfg || {});
  };

  configProvider.defaults = function(cfg) {
    return defaults = merge(defaults || {}, cfg || {});
  };

  configProvider.get = function() {
    return merge(
      defaults,
      config
    )
  };

  configProvider.$get = [function() {
    return configProvider.get();
  }];

  return configProvider;

  function merge(to, ...from) {
    return from.reduce((to, from) => _merge(to, from), to);

    function _merge(to, from) {
      if (!to || !from || typeof to != 'object' || typeof from != 'object' || Array.isArray(to) || Array.isArray(from)) {
        return from;
      }
      Object.keys(from).forEach((key) => {
        if (to.hasOwnProperty(key)) {
          to[key] = _merge(to[key], from[key]);
        }
        else {
          to[key] = from[key];
        }
      });
      return to;
    }
  }

});