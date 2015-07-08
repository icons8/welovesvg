ng.directive('translate', [
  'T',
  function(T) {
    return {
      restrict: 'AE',
      scope: {
        translate: '@',
        count: '=?',
        params: '=?'
      },
      template: '<span ng-bind="getTranslatedText()"></span>',
      link: function(scope, element, attrs) {
        scope.getTranslatedText = function() {
          var
            params = scope.params;
          if (!params && params !== 0) {
            params = [];
          }
          if (!Array.isArray(params)) {
            params = [params];
          }

          return scope.count || scope.count === 0
            ? T.pluralize(scope.translate, scope.count, ...params)
            : T.translate(scope.translate, ...params);

        };
      }
    }
  }
]);