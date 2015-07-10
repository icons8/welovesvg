

ng.factory('ViewIcon', [
  function() {

    class ViewIcon {

      constructor(icon) {
        this.icon = icon;
        this.init();
      }

      init() {
        this.visible = true;
      }

    }

    return ViewIcon;

  }
]);