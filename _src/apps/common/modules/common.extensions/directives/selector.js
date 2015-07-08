
ng.directive('selector', ['EventEmitterFactory', '$parse', function(EventEmitterFactory, $parse) {

  return {
    restrict: 'A',
    require: 'selector',
    controller: ['$scope', '$attrs', function($scope, $attrs) {
      switch($attrs.selectorType) {
        case 'list':
          SelectorListFactory.apply(this);
          break;
        case 'map':
          SelectorMapFactory.apply(this);
          break;
        default:
          SelectorSingleFactory.apply(this);
      }
    }],
    compile: function() {
      return {
        pre: function(scope, element, attrs, selector) {
          var unwatch;
          switch(attrs.selectorType) {
            case 'list':
              unwatch = scope.$watchCollection(attrs.selector, setSelected);
              break;
            case 'map':
              unwatch = scope.$watch(attrs.selector, setSelected, true);
              break;
            default:
              unwatch = scope.$watch(attrs.selector, setSelected);
          }
          var assign = $parse(attrs.selector).assign;
          var unbind = selector.on('change', function(selected) {
            assign(scope, selected);
          });
          scope.$on('$destroy', function() {
            unwatch();
            unbind();
          });

          function setSelected(selected) {
            selector.reset(selected);
            selector.emit('change', selector.selected);
          }
        }
      }
    }
  };

  function SelectorFactory() {
    EventEmitterFactory.apply(this);
    this.toggle = function(value) {
      if (!this.isSelected(value)) {
        this.select(value);
      } else {
        this.unselect(value);
      }
    };
  }

  function SelectorSingleFactory() {
    SelectorFactory.apply(this);
    this.type = 'single';
    this.selected = undefined;
    this.reset = function(selected) {
      this.selected = selected;
    };
    this.isSelected = function(value) {
      return this.selected === value;
    };
    this.select = function(value) {
      if (this.isSelected(value)) return;
      this.selected = value;
      this.emit('change', this.selected);
    };
    this.unselect = function(value) {
      if (!this.isSelected(value)) return;
      this.selected = undefined;
      this.emit('change', this.selected);
    };
  }

  function SelectorListFactory() {
    SelectorFactory.apply(this);
    this.type = 'list';
    this.selected = [];
    this.reset = function(selected) {
      if (isArray(selected)) {
        this.selected = selected;
      } else {
        this.selected = selected ? [selected] : [];
      }
    };
    this.isSelected = function(value) {
      return this.selected.indexOf(value) !== -1;
    };
    this.select = function(value) {
      if (this.isSelected(value)) return;
      this.selected.push(value);
      this.emit('change', this.selected);
    };
    this.unselect = function(value) {
      if (!this.isSelected(value)) return;
      this.selected.splice(this.selected.indexOf(value), 1);
      this.emit('change', this.selected);
    };
  }

  function SelectorMapFactory() {
    SelectorFactory.apply(this);
    this.type = 'map';
    this.selected = {};
    this.reset = function(selected) {
      if (isObject(selected)) {
        this.selected = selected;
      } else {
        this.selected = selected ? Object(selected) : {};
      }
    };
    this.isSelected = function(value) {
      return this.selected.hasOwnProperty(value) && this.selected[value];
    };
    this.select = function(value, representation) {
      if (this.isSelected(value)) return;
      this.selected[value] = typeof representation == 'undefined' ? true : representation;
      this.emit('change', this.selected);
    };
    this.unselect = function(value) {
      if (!this.isSelected(value)) return;
      delete this.selected[value];
      this.emit('change', this.selected);
    };
    this.toggle = function(value, representation) {
      if (!this.isSelected(value)) {
        this.select(value, representation);
      } else {
        this.unselect(value);
      }
    };
  }

  function isArray(value) {
    return Array.isArray(value);
  }
  function isObject(value) {
    return value != null && typeof value == 'object';
  }

}]);

ng.directive('selectorOption', ['$animate', function($animate) {
  return {
    restrict: 'A',
    require: ['selectorOption', '^selector'],
    controller: ['$scope', '$element', '$attrs', 'EventEmitterFactory', function($scope, $element, $attrs, EventEmitterFactory) {
      var selector = $element.controller('selector');

      EventEmitterFactory.apply(this);

      ['select', 'unselect', 'toggle'].forEach(function(name) {
        this[name] = function() {
          selector[name].apply(selector, this.getValue());
        }
      }.bind(this));

      this.selected = false;
      this.getValue = function() {
        var match = $attrs.selectorOption.match(/^(.+)\sas\s(.+)$/i);
        if (match) {
          return [$scope.$eval(match[1]), $scope.$eval(match[2])];
        }
        return [$scope.$eval($attrs.selectorOption)];
      };
      this.refresh = function() {
        var selected = selector.isSelected(this.getValue()[0]);
        if (selected == this.selected) return;
        this.emit('change', this.selected = selected);
      };

      var unbind = selector.on('change', this.refresh.bind(this));
      $scope.$on('$destroy', unbind);
    }],
    link: function(scope, element, attrs, ctrls) {
      var selectorOption = ctrls[0];
      var selector = ctrls[1];

      if (!attrs.selectorOptionBind) {
        element.on('click', function() {
          if (isDisabled()) return;
          scope.$apply(function() {
            var toggle = selector.type != 'single';
            if (attrs.selectorOptionToggle) {
              toggle = scope.$eval(attrs.selectorOptionToggle);
            }
            selectorOption[toggle ? 'toggle' : 'select']();
          });
        });
      }
      var unbind = selectorOption.on('change', function(selected) {
        $animate[selected ? 'addClass' : 'removeClass'](element, 'ng-selected');
      });
      scope.$on('$destroy', unbind);

      if (selector.isSelected(selectorOption.getValue()[0])) {
        selectorOption.refresh();
      }

      function isDisabled () {
        return attrs.selectorOptionDisabled && scope.$eval(attrs.selectorOptionDisabled);
      }

    }
  }
}]);

ng.directive('selectorOptionBind', ['$parse', function($parse) {
  return {
    restrict: 'A',
    require: 'selectorOption',
    link: function(scope, element, attrs, selectorOption) {
      scope.$watch(attrs.selectorOptionBind, function(value) {
        selectorOption[value ? 'select' : 'unselect']();
      });

      var valueGetter = $parse(attrs.selectorOptionBind);
      var valueSetter = valueGetter.assign;
      var unbind = selectorOption.on('change', function(selected) {
        var value = valueGetter(scope);
        if ( (value && !selected) || (!value && selected) ) {
          valueSetter(scope, selected);
        }
      });
      scope.$on('$destroy', unbind);
    }
  }
}]);