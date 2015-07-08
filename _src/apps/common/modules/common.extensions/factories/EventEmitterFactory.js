
ng.factory('EventEmitterFactory', [function() {
  return function(object) {

    object = object || (
      this !== window
        ? this
        : {}
    );

    object.listeners = {};

    object.emit = function(name, data) {
      var
        args = Array.prototype.slice.call(arguments, 1),
        listeners,
        index;

      if (!this.listeners[name]) {
        return;
      }
      listeners = this.listeners[name].slice();
      for (index = 0; index < listeners.length; index++) {
        listeners[index].apply(object, args);
      }
    };

    object.on = function(name, fn) {
      var
        emitter = this,
        names,
        offs;

      names = name
        .split(/\s+/)
        .filter(function(value) {
          return value;
        });

      if (names.length > 1) {
        offs = names.map(function(name) {
          return emitter.on(name, fn);
        });
        return function() {
          offs.forEach(function(off) {
            off();
          });
        }
      }

      name = names[0];
      if (!this.listeners[name]) {
        this.listeners[name] = [];
      }
      this.listeners[name].push(fn);

      return function() {
        emitter.off(name, fn);
      };
    };

    object.off = function(name, fn) {
      var
        emitter = this,
        names,
        index;

      names = name
        .split(/\s+/)
        .filter(function(value) {
          return value;
        });

      if (names.length > 1) {
        names.forEach(function(name) {
          emitter.off(name, fn);
        });
        return;
      }

      name = names[0];
      if (!this.listeners[name]) {
        return;
      }
      for (index = 0; index < this.listeners[name].length; ) {
        if (this.listeners[name][index] === fn) {
          this.listeners[name].splice(index, 1);
        }
        else {
          index ++;
        }
      }
    };

    object.once = function(name, fn) {
      var
        off = this.on(name, function() {
          fn.apply(this, arguments);
          off();
        });
      return off;
    };

    return object;
  }
}]);