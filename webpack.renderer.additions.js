const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@static': path.resolve(__dirname, 'static'),
      '@material-ui/styles': path.resolve(__dirname, 'node_modules', '@material-ui/styles')
    }
  }
};
