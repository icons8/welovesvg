
ng.directive('collectionSelect', [
  function() {
    return {
      restrict: 'E',
      templateUrl: 'components/collectionSelect.html',
      scope: {
        collections: '='
      }
    }
  }
]);