
ng.directive('collectionIcons', [
  function() {
    return {
      restrict: 'E',
      scope: {
        collection: '='
      },
      templateUrl: 'components/collectionIcons.html'
    }
  }
]);