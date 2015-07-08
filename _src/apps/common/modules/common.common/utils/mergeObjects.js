
ng.factory('mergeObjects', [
  function() {

    return merge;

    function merge(to, ...from) {
      return from.reduce((to, from) => _merge(to, from), to);

      function _merge(to, from) {
        if (!to
          || !from
          || typeof to != 'object'
          || typeof from != 'object'
          || Array.isArray(to)
          || Array.isArray(from)
          || to instanceof Date
          || from instanceof Date) {
          return from;
        }
        Object.keys(from).forEach((key) => {
          if (to.hasOwnProperty(key)) {
            to[key] = _merge(to[key], from[key]);
          }
          else {
            to[key] = from[key];
          }
        });
        return to;
      }
    }

  }
]);