
ng.directive('popoverToggle', ['$parse', '$browser', function($parse, $browser) {
  return {
    restrict: 'A',
    require: '?^popoverManager',
    link: function(scope, element, attrs, manager) {

      var model = attrs.popover || attrs.popoverManager || attrs.popoverToggle;
      if (model) {
        var getter = $parse(model);
        var setter = getter.assign;
      }

      var isOpened = function() {
        if (model) return getter(scope);
        if (manager) return manager.opened;
        return false;
      };
      var change = function(value) {
        if (model) setter(scope, value);
        if (manager) manager.change(value);
      };

      element.on('click', function() {
        if (!isOpened()) {
          $browser.defer(function() {
            scope.$apply(function() {
              change(true);
            });
          }, 0);
        } else {
          scope.$apply(function() {
            change(false);
          });
        }
      });
    }

  }
}]);