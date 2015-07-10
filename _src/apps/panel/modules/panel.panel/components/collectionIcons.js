
ng.directive('collectionIcons', [
  'jQuery',
  function(jQuery) {
    return {
      restrict: 'E',
      scope: {
        collection: '=',
        search: '='
      },
      templateUrl: 'components/collectionIcons.html',
      link: function(scope, element) {
        var
          popover;

        scope.popover = popover = {
          opened: false,
          handler: null,
          icon: null,
          color: '#32c24d'
        };

        Object.defineProperty(popover, 'element', {
          get: function() {
            return jQuery(element).find('[popover]:eq(0)');
          }
        });

        scope.showIconPopover = function(icon, event) {
          var
            target;

          target = jQuery(event.target);

          popover.handler = target.hasClass('icon')
            ? target
            : target.parent('.icon');
          popover.icon = icon;
        };

        scope.$watch('popover.opened', opened => {
          var
            element,
            offsetHandler,
            offsetContainer;

          if (opened) {
            element = popover.element;

            offsetHandler = popover.handler.offset();
            offsetContainer = jQuery(element).offset();

            element.css({
              left: offsetHandler.left - offsetContainer.left,
              top: offsetHandler.top - offsetContainer.top
            });
          }
        });

        scope.$watch('collection', () => {
          popover.opened = false;
        });
      }
    }
  }
]);