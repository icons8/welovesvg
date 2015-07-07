
ng.config([
  'configProvider',
  function(config) {

    config({
      api: {
      },
      debug: {
        enabled: false,
        ns: {}
      }
    });

  }
]);