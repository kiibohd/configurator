import React, { useEffect } from 'react';
import { MuiThemeProvider } from './mui';
import theme from './theme';
import AppLayout from './app-layout';
import { checkVersion } from './state';
import { loadFromDb } from './state/settings';
import { popupToast } from './state/core';
import NewVersionToast from './toast/new-version';

async function initApp() {
  await loadFromDb();
  const newVersion = await checkVersion();
  if (newVersion) {
    popupToast(<NewVersionToast version={newVersion.version} url={newVersion.url} onClose={() => popupToast(null)} />);
  }
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
