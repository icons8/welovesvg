

ng.factory('IconCollection', [
  'humanize',
  'lunr',
  function(humanize, lunr) {

    class IconCollection {

      constructor(id) {
        this.id = id;
        this.icons = [];
        this.idIndex = new Map();
        this.init();
      }

      init() {
        this.label = humanize(this.id);
        this.initSearchIndex();
      }

      initSearchIndex() {
        this.searchIndex = lunr(function() {
          this.field('label');
          this.field('id');
          this.ref('id');
        });
      }

      addIcons(icons = []) {
        this.icons.push(
          ...icons
        );
        icons.forEach(icon => {
          this.searchIndex.add(icon);
          this.idIndex.set(icon.id, icon);
        });
      }

      search(text) {
        if (!text && text !== 0) {
          return this.icons.slice();
        }
        return this.searchIndex
          .search(text)
          .map(item => this.idIndex.get(item.ref));
      }

    }

    return IconCollection;

  }
]);