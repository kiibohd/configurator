import React, { useEffect, useState } from 'react';
import { CircularProgress, Grid, MuiThemeProvider } from './mui';
import theme from './theme';
import { checkVersion, checkFirmwareVersions, updateKeyboardConfigs } from './state';
import AppLayout from './app-layout';
import { loadFromDb, updateDfu, updateKiidrv, updateFirmwareVersions, updateLastConfigCheck } from './state/settings';
import { loadAvailableKeyboards, popupSimpleToast, popupToast } from './state/core';
import NewVersionToast from './toast/new-version';
import { checkDfuVersion, checkKiidrvVersion } from './local-storage/utilities';
import { GenericToast } from './toast';
import log from 'loglevel';

async function initApp() {
  await loadFromDb();
  const newVersion = await checkVersion();
  if (newVersion) {
    popupToast(<NewVersionToast version={newVersion.version} url={newVersion.url} onClose={() => popupToast()} />);
  }

  try {
    const firmwareVersions = await checkFirmwareVersions();
    if (firmwareVersions) {
      updateFirmwareVersions(firmwareVersions);
    }
  } catch (error: unknown) {
    popupSimpleToast('error', `Error retrieving firmware versions, information may be out of date.`);
    log.error('Error retrieving firmware versions: ', error);
  }

  const dfuUpdatedPath = await checkDfuVersion();
  if (dfuUpdatedPath) {
    updateDfu(dfuUpdatedPath);
    popupToast(
      <GenericToast
        variant="success"
        message={<span>Updated dfu-util downloaded.</span>}
        onClose={() => popupToast()}
      />
    );
  }

  const kiidrvUpdatedPath = await checkKiidrvVersion();
  if (kiidrvUpdatedPath) {
    updateKiidrv(kiidrvUpdatedPath);
    popupToast(
      <GenericToast variant="success" message={<span>Updated kiidrv downloaded.</span>} onClose={() => popupToast()} />
    );
  }

  await updateKeyboardConfigs();
  updateLastConfigCheck();

  await loadAvailableKeyboards();
}

function App(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const init = async () => {
      await initApp();
      setIsLoading(false);
    };

    init();
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      {isLoading ? (
        <Grid style={{ height: '90vh' }} container direction="row" justify="center" alignItems="center">
          <CircularProgress size={72} thickness={4} />
        </Grid>
      ) : (
        <AppLayout />
      )}
    </MuiThemeProvider>
  );
}

export default App;
