
ng.directive('searchIconsPanel', [
  'ViewIconCollections',
  'config',
  function(ViewIconCollections, config) {
    return {
      restrict: 'E',
      templateUrl: 'components/searchIconsPanel.html',
      link: function(scope) {
        scope.search = '';
        scope.collections = new ViewIconCollections(
          config.collections.names
        );

        scope.$watch('search', () => {
          scope.collections.search(
            scope.search
          )
        });
      }
    }
  }
]);