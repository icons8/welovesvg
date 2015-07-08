
ng.config([
  'configProvider',
  function(config) {

    config({
      webicon: {
        preload: {
          names: [
            'flat-color-icons',
            'font-awesome'
          ]
        }
      }
    });

  }
]);