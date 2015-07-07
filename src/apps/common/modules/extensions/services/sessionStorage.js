
ng.factory('sessionStorage', ['$window', function($window) {
  try {
    return $window.sessionStorage || {};
  }
  catch (e) {
    return {};
  }
}]);