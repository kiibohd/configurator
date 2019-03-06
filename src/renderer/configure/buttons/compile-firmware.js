import React, { useState } from 'react';
import PropTypes from 'prop-types';
import urljoin from 'url-join';
import { withStyles, Button, Snackbar, CircularProgress, Fab } from '../../mui';
import { FlashOnIcon } from '../../icons';
import { useSettingsState, addDownload } from '../../state/settings';
import { currentConfig } from '../../state/configure';
import {
  useCoreState,
  updatePanel,
  startExecuting,
  stopExecuting,
  Actions,
  Panels,
  popupToast
} from '../../state/core';
import { ErrorToast, SuccessToast } from '../../toast';
import { SimpleDataModal } from '../../modal';
import { parseFilename, storeFirmware, extractLog } from '../../local-storage/firmware';
import log from 'loglevel';

/**
 * @param {string} baseUri
 * @returns {Promise<{
 *  success: boolean
 *  firmware?: import('../../local-storage/firmware').FirmwareResult
 *  log?: string
 *  error?: any
 * }>}
 */
async function compile(baseUri, variant) {
  try {
    const config = currentConfig();
    const payload = { config, env: 'latest' };
    log.trace(config);
    const uri = urljoin(baseUri, 'download.php');
    const response = await fetch(uri, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
    log.trace(response);

    if (response.status !== 200) {
      log.error('Failed to compile.');
      let details = (await response.json()) || {};
      return { success: false, error: 'Compilation Failed', log: details.error };
    }

    const data = await response.json();
    const fileDesc = parseFilename(data.filename);
    const success = data.success && !fileDesc.isError;

    const contents = await download(baseUri, data.filename);

    if (success) {
      const firmware = await storeFirmware(fileDesc, variant, contents);
      return { success, firmware };
    }

    const logfile = await extractLog(contents);

    return { success, log: logfile };
  } catch (e) {
    return { success: false, error: e };
  }
}

async function download(baseUri, file) {
  const uri = urljoin(baseUri, file.startsWith('./') ? file.substring(2) : file);
  const response = await fetch(uri);
  const data = await response.arrayBuffer();

  return data;
}

/** @type {import('../../theme').ThemedCssProperties} */
const styles = theme => ({
  icon: {
    marginRight: theme.spacing.unit
  }
});

function CompileFirmwareButton(props) {
  const { classes } = props;
  const [baseUri] = useSettingsState('uri');
  const [variant] = useCoreState('variant');
  const [toast, setToast] = useState(null);
  const [log, setLog] = useState(null);
  const [executing] = useCoreState('executing');

  const compiling = executing.includes(Actions.Compile);

  const click = async () => {
    if (compiling) return;
    startExecuting(Actions.Compile);
    setToast(null);
    try {
      const result = await compile(baseUri, variant);
      if (result.success) {
        await addDownload(result.firmware);
        popupToast(<SuccessToast message={<span>Compilation Successful</span>} onClose={() => popupToast(null)} />);
        stopExecuting(Actions.Compile);
        updatePanel(Panels.Flash);
      } else {
        let actions = [];
        if (result.log) {
          actions.push(
            <Button key="showlog" onClick={() => setLog(result.log)} color="inherit">
              Show Log
            </Button>
          );
        }
        stopExecuting(Actions.Compile);
        setToast(
          <ErrorToast
            message={<span>{result.error.toString()}</span>}
            actions={actions}
            onClose={() => setToast(null)}
          />
        );
      }
    } catch {
      stopExecuting(Actions.Compile);
    }
  };

  return (
    <div>
      <Fab
        variant="extended"
        color="secondary"
        onClick={click}
        disabled={compiling}
        style={{ position: 'absolute', right: 0, top: -20 }}
      >
        {!compiling ? (
          <FlashOnIcon className={classes.icon} />
        ) : (
          <CircularProgress color="primary" className={classes.icon} size={24} thickness={3} />
        )}
        Download Firmware
      </Fab>
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} open={!!toast}>
        {toast}
      </Snackbar>
      <SimpleDataModal open={!!log} onClose={() => setLog(null)} data={log} title="Firmware Build Log" />
    </div>
  );
}

CompileFirmwareButton.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CompileFirmwareButton);
