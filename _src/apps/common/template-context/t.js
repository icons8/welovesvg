
module.exports = {

  T: function(/* [n,] str [, ...args] */) {
    var
      args = Array.prototype.slice.call(arguments);

    if (typeof args[0] == 'number') {
      return this.tn.apply(this, [args[1], args[0]].concat(args.slice(2)));
    }
    else {
      return this.t.apply(this, args);
    }
  },

  t: function(str /*, ...args */) {
    var
      locale = this.getLocale(),
      dictionary = locale.dictionary || {},
      args,
      nextIndex,
      next;

    args = Array.prototype.slice.call(arguments, 1);

    if (dictionary.hasOwnProperty(str)) {
      str = dictionary[str];
    }
    else {
      this.logger('t')('Translate for string "' + str + '" for locale "' + locale.id + '" is not defined');
    }

    nextIndex = 0;
    next = function() {
      if (nextIndex >= args.length) {
        nextIndex = 0;
      }
      return args[nextIndex ++];
    };

    return (str || '')
      .replace(/(%s)/gi, function(match, placeholder) {
        return (next() || '') + '';
      });
  },

  tn: function(str, n /*, ...args */) {
    var
      locale = this.getLocale(),
      dictionary = locale.dictionary || {},
      pluralFn = locale.plural,
      pluralCase,
      pluralCat,
      nextIndex,
      next,
      args;

    n = n || 0;

    if (!pluralFn) {
      this.logger('t')('Plural function for locale "' + locale.id + '" is not defined');
      pluralFn = function(num) {
        return num === 1
          ? 'one'
          : 'other';
      };
    }

    args = Array.prototype.slice.call(arguments, 2);

    pluralCase = dictionary[str];
    if (!pluralCase || typeof pluralCase != 'object') {
      this.logger('t')('Plural for string "' + str + '" for locale "' + locale.id + '" is not defined');
    }
    else {
      pluralCat = pluralFn(n);
      if (!pluralCase.hasOwnProperty(pluralCat)) {
        this.logger('t')('Plural for category "' + pluralCat + '" for string "' + str + '" for locale "' + locale.id + '" is not defined');
        pluralCat = 'other';
      }
      if (pluralCase.hasOwnProperty(pluralCat)) {
        str = pluralCase[pluralCat];
      }
    }

    nextIndex = 0;
    next = function() {
      if (nextIndex >= args.length) {
        nextIndex = 0;
      }
      return args[nextIndex ++];
    };

    return (str || '')
      .replace(/(%n|\{n})/gi, function(match, placeholder) {
        return n + '';
      })
      .replace(/(%s)/gi, function(match, placeholder) {
        return (next() || '') + '';
      });

  }

};
