
ng.config([
  'configProvider',
  function(config) {

    config({
      debug: {
        enabled: true,
        ns: {
          config: {
            enabled: true
          },
          locale: {
            enabled: true
          }
        }
      }
    });

  }
]);