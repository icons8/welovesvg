
ng.factory('T', [
  'locale',
  '$log',
  function(locale, $log) {
    var
      T;

    T = function(...args) {
      return typeof args[0] == 'number'
        ? tn(args[1], args[0], ...args.slice(2))
        : t(...args)
        ;
    };
    T.translate = T.t = t;
    T.pluralize = T.tn = tn;

    return T;

    function t(str, ...args) {
      var
        dictionary = locale.dictionary || {},
        nextIndex,
        next;

      if (dictionary.hasOwnProperty(str)) {
        str = dictionary[str];
      }
      else {
        $log.debug('Translate for string "' + str + '" for locale "' + locale.id + '" is not defined');
      }

      nextIndex = 0;
      next = () => {
        if (nextIndex >= args.length) {
          nextIndex = 0;
        }
        return args[nextIndex ++] || '';
      };

      return (str || '')
        .replace(/(%s)/gi, () => next() + '')
        ;
    }

    function tn(str, n, ...args) {
      var
        dictionary = locale.dictionary || {},
        pluralFn = locale.plural,
        pluralCase,
        pluralCat,
        nextIndex,
        next;

      n = n || 0;

      if (!pluralFn) {
        $log.debug('Plural function for locale "' + locale.id + '" is not defined');
        pluralFn = function(num) {
          return num === 1
            ? 'one'
            : 'other';
        };
      }

      pluralCase = dictionary[str];
      if (!pluralCase || typeof pluralCase != 'object') {
        $log.debug('Plural for string "' + str + '" for locale "' + locale.id + '" is not defined');
      }
      else {
        pluralCat = pluralFn(n);
        if (!pluralCase.hasOwnProperty(pluralCat)) {
          $log.debug('Plural for category "' + pluralCat + '" for string "' + str + '" for locale "' + locale.id + '" is not defined');
          pluralCat = 'other';
        }
        if (pluralCase.hasOwnProperty(pluralCat)) {
          str = pluralCase[pluralCat];
        }
      }

      nextIndex = 0;
      next = () => {
        if (nextIndex >= args.length) {
          nextIndex = 0;
        }
        return (args[nextIndex ++] || '') + '';
      };

      return (str || '')
        .replace(/(%n|\{n})/gi, () => n + '')
        .replace(/(%s)/gi, () => next() + '')
        ;
    }



  }
]);