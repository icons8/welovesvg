
ng.factory('sessionStorageStore', ['sessionStorage', function(sessionStorage) {
  return {
    get: function(key) {
      var value = sessionStorage[key];
      try {
        return value ? JSON.parse(value) : value;
      }
      catch(e) {
        return undefined;
      }
    },
    put: function(key, value) {
      sessionStorage[key] = JSON.stringify(value);
    },
    remove: function(key) {
      delete sessionStorage[key];
    }
  };
}]);