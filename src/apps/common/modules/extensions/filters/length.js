ng.filter('length', function() {
  return function(input) {
    if (input instanceof Array) {
      return input.length;
    }
    if (!input) {
      return 0;
    }
    if (input instanceof String) {
      return input.length;
    }
    return Object.keys(input).length;
  }
});