
ng.directive('collectionSelect', ['config',
  function(config) {
    return {
      restrict: 'E',
      templateUrl: 'components/collectionSelect.html',
      scope: {
        collections: '='
      },
      link: function(scope) {
        scope.config = config;
      }
    }
  }
]);