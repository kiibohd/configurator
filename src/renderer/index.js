import React from 'react';
import ReactDOM from 'react-dom';

// Now we can render our application into it
function render() {
  let root = document.getElementById('app');
  if (!root) throw new Error('No root present, cannot mount');

  const App = require('./app').default;

  ReactDOM.render(<App />, root);
}

render();
