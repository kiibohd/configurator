const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@static': path.resolve(__dirname, 'static')
    }
  }
};
