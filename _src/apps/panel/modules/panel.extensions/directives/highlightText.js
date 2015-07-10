
ng.directive('highlightText', [function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			attrs.$observe('highlightText', refresh);
			attrs.$observe('highlightTextNeedle', refresh);

			function refresh() {
				var
					body,
					needle,
					pattern,
					fromWordStart;

				body = String(attrs.highlightText || '');
				needle = String(attrs.highlightTextNeedle || '');

				fromWordStart = String(attrs.highlightTextFromWordStart || '').toLowerCase();
				fromWordStart = fromWordStart && ['false', 'null', 'f', '0'].indexOf(fromWordStart) == -1;

				if (needle) {
					pattern = needle.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}=!<>\|:])/g, "\\$1");
					if (fromWordStart) {
						pattern = '\\b' + pattern;
					}
					body = body.replace(new RegExp(pattern, 'gi'), match => '<span class="ng-highlight">' + match + '</span>')
				}
				element.html(body);
			}

		}
	}
}]);