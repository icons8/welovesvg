
ng.factory('ensureDigest', [
  '$rootScope',
  function($rootScope) {
    var
      self;

    self = function(param) {
      var
        fn,
        async = false;
      if (param && typeof param == 'function') {
        fn = param;
      }
      else if (param) {
        async = true;
      }
      if (fn) {
        if (!$rootScope.$$phase) {
          $rootScope.$apply(fn);
        }
        else {
          fn();
        }
      }
      else {
        if (!$rootScope.$$phase) {
          if (async) {
            $rootScope.$evalAsync();  
          }
          else {
            $rootScope.$digest();
          }
        }
      }
    };

    return self;
  }
]);