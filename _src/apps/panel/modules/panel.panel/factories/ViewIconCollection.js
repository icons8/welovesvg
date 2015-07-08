

ng.factory('ViewIconCollection', [
  function() {

    class ViewIconCollection {

      constructor(collection) {
        this.collection = collection;
        this.init();
      }

      init() {
        this.visible = true;
      }

    }

    return ViewIconCollection;

  }
]);