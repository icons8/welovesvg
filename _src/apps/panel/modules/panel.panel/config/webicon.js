
ng.config([
  '$webiconProvider',
  'configProvider',
  function($webiconProvider, configProvider) {
    var
      config;
    config = configProvider.get();

    $webiconProvider.preload(
      config.webicon.preload.force || config.webicon.preload.names,
      [
        '$promise',
        'iconCollectionsManager',
        'IconCollectionDeferred',
        'Icon',
        function($promise, iconCollectionsManager, IconCollectionDeferred, Icon) {
          var
            promises;

          promises = $promise.iconSets;
          Object.keys(promises).forEach(key => {
            var
              promise;

            promise = promises[key]
              .then(value => {
                return value && value.hasOwnProperty('collection')
                  ? value.collection
                  : value
              })
              .then(list => {
                return Array.from(list
                  .filter(scope => scope &&
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
                  ))
                  .map(id => new Icon(id));

              });

            iconCollectionsManager.add(
              new IconCollectionDeferred(key, promise)
            );

          });
        }
      ]
    );

  }
]);