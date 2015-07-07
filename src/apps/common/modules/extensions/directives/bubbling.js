ng.directive('bubbling', ['$parse', function($parse) {
  return {
    restrict: 'A',
    compile: function() {
      return {
        post: function(scope, element, attrs) {
          var parentScope = scope.$parent;
          if (!parentScope) {
            var parentElement = element.parent();
            parentScope = parentElement.data('$scope');
            while (!parentScope || parentScope === scope) {
              parentElement = parentElement.parent();
              if (!parentElement || !parentElement.length) {
                return;
              }
              parentScope = parentElement.data('$scope');
            }
          }
          var trimmed = String(attrs.bubbling).trim();
          _object(trimmed) ||
          _collection(trimmed) ||
          _setOf(trimmed) ||
          _withAs(trimmed) ||
          _normal(trimmed);


          function _object(trimmed) {
            if (trimmed[0] == '{') {
              var setters = {};
              scope.$watch(trimmed, function(table) {
                Object.keys(table).forEach(function(name) {
                  if (!setters[name]) {
                    setters[name] = $parse(name).assign;
                  }
                  setters[name](parentScope, table[name]);
                });
              }, true);
              return true;
            }
            return false;
          }

          function _collection(trimmed) {
            if (trimmed[0] == '[') {
              var setters = [];
              trimmed.substring(1, trimmed.length-1).split(',').forEach(function(expr) {
                setters.push($parse(expr).assign);
              });
              scope.$watchCollection(trimmed, function(collection) {
                for (var i = 0; i < collection.length; i++) {
                  setters[i](parentScope, collection[i]);
                }
              });
            }
          }

          function _setOf(string) {
            if (string.indexOf(',') != -1) {
              string.split(',').forEach(function(expr) {
                _withAs(expr) || _normal(expr);
              });
              return true;
            }
            return false;
          }

          function _withAs(string) {
            var match = string.match(/^(.+)\sas\s(.+)$/i);
            if (match) {
              var setter = $parse(match[2]).assign;
              scope.$watch(match[1], function(value) {
                setter(parentScope, value);
              });
              return true;
            }
            return false;
          }

          function _normal(string) {
            var setter = $parse(string).assign;
            scope.$watch(string, function(value) {
              setter(parentScope, value);
            });
          }
        }
      }
    }
  }
}]);