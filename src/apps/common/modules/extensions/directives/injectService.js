
ng.directive('injectService', ['$injector', '$parse', function($injector, $parse) {
  return {
    restrict: 'A',
    scope: true,
    compile: function() {
      return {
        pre: function(scope, element, attrs) {
          var str = attrs.injectService;
          if (!str) return;
          var parts = str.split(',');
          parts.forEach(function(part) {
            var match = part.match(/^\s*(([_a-z0-9$]+).*?)(?:\sas\s(.+))?$/i);
            if (!match) throw new Error('Unsupported inject-service syntax "'+part+'"');
            var name = match[2];
            var instance = $injector.get(name);
            var expr = match[1];
            var locals = {};
            locals[name] = instance;
            var value = $parse(expr)(scope, locals);
            var serviceAs = match[3];
            $parse(serviceAs ? serviceAs : name).assign(scope, value);
          });
        }
      }
    }
  }
}]);