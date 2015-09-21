
ng.directive('page', ['config',
  function(config) {
    return {
      restrict: 'E',
      link: function(scope) {
        scope.config = config;
      },
      templateUrl: 'components/page.html'
    }
  }
]);