
function merge(/* ...args */) {
  var
    result = {},
    args = Array.prototype.slice.call(arguments);

  args.forEach(function(partial) {
    Object.keys(partial).forEach(function(key) {
      result[key] = partial[key];
    });
  });

  return result;
}


module.exports = merge(
  require('./url'),
  require('./t')
);
