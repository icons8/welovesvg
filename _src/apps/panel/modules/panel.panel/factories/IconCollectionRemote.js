

ng.factory('IconCollectionRemote', [
  'IconCollection',
  'Icon',
  '$webicon',
  '$q',
  function(IconCollection, Icon, $webicon, $q) {

    class IconCollectionRemote extends IconCollection {

      constructor(id) {
        super(id);
      }

      init() {
        super.init();
        this.promise = $q.when();
        this.initialized = false;
        this.pending = false;
      }

      loadCollection() {
        var
          promise;

        this.promise.cancel && this.promise.cancel();
        this.pending = true;
        promise = this.promise = $q.when($webicon.preload([this.id]).iconSets[this.id])
          .then(value => {
            var
              collection,
              icons;

            if (promise && promise.cancelled) {
              return this;
            }
            this.pending = false;

            collection = value && value.hasOwnProperty('collection')
              ? value.collection
              : value || [];

            icons = Array.from(
              collection.filter(scope => scope &&
                  scope._resource &&
                  scope._resource.icons
              )
                .map(scope => Object.keys(scope._resource.icons))
                .reduce(
                  (idSet, idList) => {
                    (idList || []).forEach(id => idSet.add(id));
                    return idSet;
                  },
                  new Set()
                )
            )
              .map(id => new Icon(id));

            this.clear();
            this.addIcons(icons);
            this.initialized = true;
            return this;
          });

        promise.cancel = () => promise.cancelled = true;

        return promise;
      }

    }

    return IconCollectionRemote;

  }
]);