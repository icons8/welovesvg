
ng.directive('shift', ['$animate', function($animate) {
  return {
    restrict: 'AE',
    priority: 400,
    terminal: true,
    transclude: 'element',
    link: function($scope, $element, $attrs, ctrl, $transclude) {
      var
        child = open();

      $scope.$watch($attrs.shift || $attrs.value, function(curr, prev) {
        if (curr === prev) {
          return;
        }
        shift();
      });

      function shift() {
        close(child);
        child = open();
      }

      function open() {
        var child = {};
        child.scope = $scope.$new();
        $transclude(child.scope, function(clone) {
          child.element = clone;
          child.element.addClass('ng-shift ng-shift-enter');
          $animate.enter(clone, $element.parent(), $element);
        });
        return child;
      }

      function close(child) {
        if (child.element) {
          child.element.removeClass('ng-shift-enter');
          child.element.addClass('ng-shift-leave');
          $animate.leave(child.element);
          delete child.element;
        }
        if (child.scope) {
          child.scope.$destroy();
          delete child.scope;
        }
      }
    }
  }
}]);