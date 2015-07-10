

/**
 * @name ng.directive:popoverManager
 * @restrict A
 *
 * @description
 * Optionally parent for popover and popoverHover or popoverToggle
 *
 *
 * @example
 *	<div popover-manager="model">
 *		<a popover-toggle="">popover toggle</a>
 *		<div popover="">popover pane</div>
 *	</div>
 *
 */

ng.directive('popoverManager', [function() {
  return {
    restrict: 'A',
    controller: ['$scope', '$element', '$attrs', '$parse', 'EventEmitterFactory', function($scope, $element, $attrs, $parse, EventEmitterFactory) {
      EventEmitterFactory.apply(this);

      var model = $attrs.popoverManager;
      if (model) {
        var getter = $parse(model);
        var setter = getter.assign;
      }

      this.opened = false;
      this.change = function(value) {
        if (Boolean(this.opened) == Boolean(value)) return;
        this.opened = value;
        if (model) setter($scope, this.opened);
        this.emit('change', this.opened);
      };

      if (model) {
        $scope.$watch(model, function(value) {
          this.change(value);
        }.bind(this));
      }

    }]
  }
}]);