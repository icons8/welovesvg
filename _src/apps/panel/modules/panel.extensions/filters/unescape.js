ng.filter('unescape', function() {
  return function(input) {
    return unescape(String(input || ''));
  }
});