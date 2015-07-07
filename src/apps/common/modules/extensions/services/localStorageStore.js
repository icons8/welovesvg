
ng.factory('localStorageStore', ['localStorage', function(localStorage) {
  return {
    get: function(key) {
      var value = localStorage[key];
      return value ? angular.fromJson(value) : value;
    },
    put: function(key, value) {
      localStorage[key] = angular.toJson(value);
    },
    remove: function(key) {
      delete localStorage[key];
    }
  };
}]);