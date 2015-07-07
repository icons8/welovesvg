
var path = require('path');

var createUrl = function(base, url) {
  url = (url || '').trim();
  if (!base) {
    return url;
  }

  if (url.charAt(0) == '/') {
    url = url.substr(1);
  }
  if (base.charAt(base.length-1) == '/') {
    base = base.slice(0, -1);
  }
  return base + '/' + url;
};

module.exports = {

  url: function(url) {
    return createUrl(this.config.page.baseUrl, url);
  }

};
