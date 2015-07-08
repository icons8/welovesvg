

ng.factory('DeferredIconCollection', [
  'IconCollection',
  function(IconCollection) {

    class DeferredIconCollection extends IconCollection {

      constructor(id, promise) {
        super(id);
        this.addIconsPromise(promise);
      }

      addIconsPromise(promise) {
        this.pending = true;
        promise
          .then(icons => {
            this.addIcons(icons);
          })
          .finally(() => {
            this.pending = false;
          });
      }

    }

    return DeferredIconCollection;

  }
]);