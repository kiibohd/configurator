import React, { useEffect } from 'react';
import { MuiThemeProvider } from './mui';
import theme from './theme';
import { checkVersion, checkFirmwareVersions } from './state';
import AppLayout from './app-layout';
import { loadFromDb, updateDfu, updateKiidrv, updateFirmwareVersions } from './state/settings';
import { popupToast } from './state/core';
import NewVersionToast from './toast/new-version';
import { checkDfuVersion, checkKiidrvVersion } from './local-storage/utilities';
import { GenericToast } from './toast';

async function initApp() {
  await loadFromDb();
  const newVersion = await checkVersion();
  if (newVersion) {
    popupToast(<NewVersionToast version={newVersion.version} url={newVersion.url} onClose={() => popupToast(null)} />);
  }

  const firmwareVersions = await checkFirmwareVersions();
  if (firmwareVersions) {
    updateFirmwareVersions(firmwareVersions);
  }

  const dfuUpdatedPath = await checkDfuVersion();
  if (dfuUpdatedPath) {
    updateDfu(dfuUpdatedPath);
    popupToast(
      <GenericToast
        variant="success"
        message={<span>Updated dfu-util downloaded.</span>}
        onClose={() => popupToast(null)}
      />
    );
  }

  const kiidrvUpdatedPath = await checkKiidrvVersion();
  if (kiidrvUpdatedPath) {
    updateKiidrv(kiidrvUpdatedPath);
    popupToast(
      <GenericToast
        variant="success"
        message={<span>Updated kiidrv downloaded.</span>}
        onClose={() => popupToast(null)}
      />
    );
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
