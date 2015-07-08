
ng.config([
  'configProvider',
  function(config) {

    config({
      webicon: {
        preload: {
          names: true
        }
      }
    });

  }
]);