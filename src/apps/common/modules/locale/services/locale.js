
ng.provider('locale', function() {
  var
    _id = 'en',
    _dictionary = {};

  this.locale = function(id) {
    _id = id;
  };

  this.dictionary = function(dic) {
    _dictionary = dic || {};
  };

  this.$get = [
    '$locale',
    function($locale) {

      return {
        id: _id,
        dictionary: _dictionary,
        plural: $locale.pluralCat
      }

    }
  ];

});



