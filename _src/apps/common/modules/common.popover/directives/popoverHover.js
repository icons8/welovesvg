
ng.directive('popoverHover', ['$parse', function($parse) {
  return {
    restrict: 'A',
    require: '?^popoverManager',
    link: function(scope, element, attrs, manager) {

      var model = attrs.popover || attrs.popoverManager || attrs.popoverHover;
      if (model) {
        var getter = $parse(model);
        var setter = getter.assign;
      }

      var change = function(value) {
        if (model) setter(scope, value);
        if (manager) manager.change(value);
      };

      var enterListener = function() {
        scope.$apply(function() {
          change(true);
        });
      };
      var leaveListener = function() {
        scope.$apply(function() {
          change(false);
        });
      };

      element.on('mouseenter', enterListener);
      element.on('mouseleave', leaveListener);

      var unbind = function() {
        element.off('mouseenter', enterListener);
        element.off('mouseleave', leaveListener);
      };

      scope.$on('$destroy', unbind);
    }

  }
}]);