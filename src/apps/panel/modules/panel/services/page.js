ng.config(['$provide', function($provide) {

	$provide.decorator('page', [
		'$delegate',
		function($delegate) {
      var
        self = $delegate;

      return self;
    }
  ]);

}]);
