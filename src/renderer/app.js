import React, { useEffect } from 'react';
import { MuiThemeProvider } from './mui';
import theme from './theme';
import AppLayout from './app-layout';
import { loadFromDb } from './state/settings';

async function initApp() {
  await loadFromDb();
}

function App() {
  useEffect(() => {
    initApp();
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <AppLayout />
    </MuiThemeProvider>
  );
}

export default App;
