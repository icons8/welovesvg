
ng.factory('humanize', [function() {

  return name => String(name || '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b[a-z]/gi, match => match.toUpperCase());

}]);