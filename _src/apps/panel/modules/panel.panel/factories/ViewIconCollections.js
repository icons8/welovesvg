

ng.factory('ViewIconCollections', [
  'ViewIconCollection',
  'IconCollectionRemote',
  function(ViewIconCollection, IconCollectionRemote) {

    class ViewIconCollections {

      constructor(collections) {
        this.init();
        this.setCollections(collections);
      }

      init() {
        this.views = [];
        this.current = null;
        this.searchText = null;
      }

      clear() {
        this.views.length = 0;
        this.current = null;
      }

      setCollections(collections) {
        this.clear();
        (collections || []).forEach(collection => this.addCollection(collection));
      }

      addCollection(collection) {
        var
          view;
        view = new ViewIconCollection(collection);
        this.views.push(view);
        if (!this.current) {
          this.setCurrent(view);
        }
      }

      isCurrent(view) {
        return this.current === view;
      }

      setCurrent(view) {
        this.current = view;
        if (view.collection instanceof IconCollectionRemote && !view.collection.initialized) {
          view.collection.loadCollection().then(() => {
            if (this.searchText) {
              view.search(this.searchText);
            }
          });
        }
        else if (this.searchText) {
          this.current.search(this.searchText);
        }
      }

      search(text) {
        this.searchText = text;
        if (this.current) {
          this.current.search(text);
        }
      }

    }

    return ViewIconCollections;

  }
]);