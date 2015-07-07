
var ng = angular.module('common', [
  'ngSanitize',
  'ngTouch',
  'ngAnimate',
  'ui.router',
  'extensions',
  'config',
  'locale',
  'digestLogger'
]);

ng.config([
  '$locationProvider',
  '$sceProvider',
  function($locationProvider, $sceProvider) {
    $locationProvider.html5Mode(false);
    $sceProvider.enabled(true);
  }
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
