
ng.config([
  'configProvider',
  function(config) {

    config({
      debug: {
        enabled: false,
        ns: {}
      }
    });

  }
]);