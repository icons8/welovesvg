
ng.factory('iconCollectionsManager', [
  function() {

    class IconCollectionsManager {

      constructor() {
        this.collections = [];
      }

      add(collection) {
        this.collections.push(collection);
      }

    }

    return new IconCollectionsManager();
  }
]);