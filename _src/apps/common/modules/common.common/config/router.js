
ng.config([
  '$locationProvider',
  '$sceProvider',
  'configProvider',
  function($locationProvider, $sceProvider, configProvider) {
    var
      config;
    config = configProvider.get();

    $locationProvider.html5Mode(config.router.html5Mode);
    $sceProvider.enabled(config.sce.enabled);
  }
]);
