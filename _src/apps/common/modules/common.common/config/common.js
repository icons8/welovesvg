
ng.config([
  'configProvider',
  function(config) {

    config({
      debug: {
        enabled: false,
        ns: {}
      },

      router: {
        html5Mode: false
      },

      sce: {
        enabled: true
      }
    });

  }
]);