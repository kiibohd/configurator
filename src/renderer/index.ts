import React from 'react';
import ReactDOM from 'react-dom';
import './state/settings';

// Now we can render our application into it
function render() {
  const root = document.getElementById('app');
  if (!root) throw new Error('No root present, cannot mount');

  const App = require('./app').default;

  // ReactDOM.render(<App />, root);
  ReactDOM.render(React.createElement(App), root);
}

render();
