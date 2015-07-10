

ng.factory('ViewIconCollection', [
  'ViewIcon',
  'IconCollection',
  'IconCollectionRemote',
  function(ViewIcon, IconCollection, IconCollectionRemote) {

    class ViewIconCollection {

      constructor(collection) {
        this.init();
        this.setCollection(collection);
      }

      setCollection(collection) {
        if (!(collection instanceof IconCollection)) {
          collection = new IconCollectionRemote(collection);
        }

        this.collection = collection;
        this.clearViews();
        this.addIcons(collection.icons);

        this.collection.on('update', () => {
          this.clearViews();
          this.addIcons(this.collection.icons);
        });
      }

      clearViews() {
        this.views.length = 0;
      }

      addIcons(icons) {
        this.addViews(
          icons.map(icon => new ViewIcon(icon))
        );
      }

      addViews(views) {
        this.views.push(
          ...views
        );
      }

      init() {
        this.collection = null;
        this.views = [];
        this.visible = true;
      }

      search(text) {
        var
          icons,
          iconsSet;

        icons = this.collection.search(text);
        iconsSet = new Set(
          icons.map(icon => icon.id)
        );

        this.views.forEach(view => {
          view.visible = iconsSet.has(view.icon.id);
        });

        return this;
      }

    }

    return ViewIconCollection;

  }
]);