

ng.factory('Icon', [
  'humanize',
  function(humanize) {

    class Icon {

      constructor(id) {
        this.id = id;
        this.init();
      }

      init() {
        this.label = humanize(this.id);
      }

    }

    return Icon;

  }
]);