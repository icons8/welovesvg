
var ng = angular.module('common.common', [
  'ngSanitize',
  'ngTouch',
  'common.extensions',
  'common.config',
  'common.locale',
  'digestLogger'
]);


ng.run([
  'config',
  'locale',
  'debug',
  '$injector',
  function(config, locale, debug, $injector) {

    debug.enabled = debug.enabled && config.debug.enabled;

    debug.ns('config')(config);
    debug.ns('locale')(locale);

    $injector.get('page');
  }
]);
