
ng.directive('popover', ['$timeout', '$animate', '$parse', '$browser', function($timeout, $animate, $parse, $browser) {
  return {
    transclude: 'element',
    restrict: 'A',
    priority: 500,
    terminal: true,
    require: '?^popoverManager',
    compile: function (element, attrs, transclude) {
      return function (scope, element, attrs, manager) {

        var closed = true;
        var closeDeferred = null;

        var getCloseDelay = function() {
          return attrs.popoverCloseDelay || 0;
        };

        var model = attrs.popover || attrs.popoverManager;
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

          if (value && closed) {
            if (closeDeferred) {
              $browser.defer.cancel(closeDeferred);
              closeDeferred = null;
            }
            closed = false;
            createPopover();
          }
          if (!value && !closed) {
            if (!closeDeferred) {
              var delay = getCloseDelay();
              if (!delay) {
                closed = true;
                scope.$$postDigest(function() {
                  destroyPopover();
                });
              } else {
                closeDeferred = $browser.defer(function() {
                  if (!isOpened()) {
                    closed = true;
                    scope.$$postDigest(function() {
                      destroyPopover();
                    });
                    scope.$digest();
                  }
                  closeDeferred = null;
                }, delay);
              }
            }
          }
        };

        var bodyClickListener = function(event) {
          if (!isOpened()) return;
          var element = angular.element(event.target);
          var inside = false;
          while (element.length && !inside) {
            inside = element[0] == childElement[0];
            element = element.parent();
          }
          if (!inside) {
            scope.$apply(function() {
              change(false);
            });
          }
        };

        var body = angular.element(document.getElementsByTagName('body'));
        body.on('click', bodyClickListener);

        scope.$on('$destroy', function() {
          body.off('click', bodyClickListener);
        });

        if (manager) {
          var unbind = manager.on('change', function(value) {
            change(value);
          });
          scope.$on('$destroy', unbind);
        }
        if (model) {
          scope.$watch(model, function(value) {
            change(value);
          });
        }


        var childElement, childScope;
        var controller = {
          close: function() {
            $timeout(function() {
              change(false);
            }, 0);
          },
          isVisible: function() {
            return !closed;
          }
        };

        function createPopover() {
          childScope = scope.$new();
          transclude(childScope, function (clone) {
            childElement = clone;
            $animate.enter(clone, element.parent(), element);
            childElement.data('$popoverController', controller);
            childScope.$popover = controller;
          });
        }

        function destroyPopover() {
          if (childElement) {
            $animate.leave(childElement);
            childElement = undefined;
          }
          if (childScope) {
            childScope.$destroy();
            childScope = undefined;
          }
        }

      }
    }
  }
}]);