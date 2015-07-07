
ng.service('path', [
  function() {

    this.join = function(...pieces) {

      if (!pieces.length) {
        return '';
      }

      return pieces
        .map(piece => String(piece || '').trim())
        .reduce((left, right) => {
          var
            counter,
            index;

          for (index = left.length-1, counter = 0; index >= 0 && left[index] == '/'; index --) {
            counter ++;
          }

          for (; counter > 0 && right.length > 0 && right[0] == '/'; counter --) {
            right = right.slice(1);
          }

          if (left && right && left[left.length - 1] != '/' && right[0] != '/') {
            left += '/';
          }

          return left + right;
        })
        ;

    };

  }
]);