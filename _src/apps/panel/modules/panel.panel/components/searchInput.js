
ng.directive('searchInput', [
  function() {
    return {
      restrict: 'E',
      scope: {
        search: '='
      },
      templateUrl: 'components/searchInput.html'
    }
  }
]);