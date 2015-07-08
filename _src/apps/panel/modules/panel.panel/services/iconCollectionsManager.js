
ng.factory('iconCollectionsManager', [
  'ViewIconCollection',
  function(ViewIconCollection) {

    class IconCollectionsManager {

      constructor() {
        this.collections = [];
        this.views = [];
      }

      add(collection) {
        this.collections.push(collection);
        this.views.push(new ViewIconCollection(collection));
      }

    }

    return new IconCollectionsManager();
  }
]);