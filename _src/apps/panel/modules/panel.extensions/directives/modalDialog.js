
ng.directive('modalDialog', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true,
    transclude: true,
    link: function(scope, element, attrs) {
      scope.$watch('show', function(newVal, oldVal){
        if (scope.show) {
          angular.element(document).find('body').addClass('modal-opened');
        } else {
          angular.element(document).find('body').removeClass('modal-opened');
        }
      });

      scope.hideModal = function() {
        angular.element(document).find('body').removeClass('modal-opened');
        scope.show = false;
      };
    },
    templateUrl: 'components/modalTemplate.html'
  };
});