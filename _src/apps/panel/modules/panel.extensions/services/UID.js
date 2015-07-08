
ng.service('UID', [function() {
  var
    incIdCurrentValue = 0;

  this.b36 = () => 'A' + (Date.now().toString(36) + Math.random().toString(36).slice(2)).toUpperCase();
  this.inc = () => ++incIdCurrentValue;

}]);