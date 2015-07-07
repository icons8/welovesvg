
ng.factory('localStorage', ['$window', function($window) {
  try {
    return $window.localStorage || {};
  }
  catch (e) {
    return {};
  }
}]);