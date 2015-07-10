

ng.factory('IconCollection', [
  'EventEmitterFactory',
  'humanize',
  'lunr',
  function(EventEmitterFactory, humanize, lunr) {

    class IconCollection extends EventEmitterFactory {

      constructor(id) {
        super();
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

      clear() {
        this.icons.length = 0;
      }

      addIcons(icons = []) {
        this.icons.push(
          ...icons
        );
        icons.forEach(icon => {
          this.searchIndex.add(icon);
          this.idIndex.set(icon.id, icon);
        });

        this.emit('update');
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