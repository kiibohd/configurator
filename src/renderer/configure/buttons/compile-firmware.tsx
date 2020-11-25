import React, { useState } from 'react';
import urljoin from 'url-join';
import { makeStyles, Button, Snackbar, CircularProgress, Fab, Theme } from '../../mui';
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
  popupSimpleToast,
} from '../../state/core';
import { ErrorToast } from '../../toast';
import { SimpleDataModal } from '../../modal';
import { parseFilename, storeFirmware, extractLog, FirmwareResult } from '../../local-storage/firmware';
import log from 'loglevel';
import { Variant } from '../../../common/keyboards';

type SuccessfulResult = {
  success: true;
  firmware: FirmwareResult;
};

type FailedResult = {
  success: false;
  log?: string;
  error: Error | string;
};

type CompileResult = SuccessfulResult | FailedResult;

async function download(baseUri: string, file: string): Promise<ArrayBuffer> {
  const uri = urljoin(baseUri, file.startsWith('./') ? file.substring(2) : file);
  const response = await fetch(uri);
  const data = await response.arrayBuffer();

  return data;
}

async function compile(baseUri: string, variant: Variant): Promise<CompileResult> {
  try {
    const config = currentConfig();
    const payload = { config, env: 'latest' };
    log.trace(config);
    const uri = urljoin(baseUri, 'download.php');
    const response = await fetch(uri, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    log.trace(response);

    if (response.status !== 200) {
      log.error('Failed to compile.');
      const details = (await response.json()) || {};
      return { success: false, error: 'Compilation Failed', log: details.error };
    }

    const data = await response.json();
    const fileDesc = parseFilename(data.filename);
    const success = data.success && !fileDesc.isError;

    const contents = await download(baseUri, data.filename);

    if (success) {
      const firmware = await storeFirmware(fileDesc, variant.display, contents);
      return { success, firmware };
    }

    const logfile = await extractLog(contents);

    return { success: false, log: logfile, error: 'Compilation Failed' };
  } catch (e) {
    return { success: false, error: e };
  }
}

const useStyles = makeStyles(
  (theme: Theme) =>
    ({
      icon: {
        marginRight: theme.spacing(1),
      },
    } as const)
);

export default function CompileFirmwareButton(): JSX.Element {
  const classes = useStyles({});
  const [baseUri] = useSettingsState('uri');
  const [variant] = useCoreState('variant');
  const [toast, setToast] = useState<JSX.Element | null>(null);
  const [compileLog, setCompileLog] = useState<Optional<string>>(undefined);
  const [executing] = useCoreState('executing');

  const compiling = executing.includes(Actions.Compile);

  if (!variant) {
    log.error('Variant not set while CompileFirmwareButton is visible');
    throw Error('Invalid UI state - variant not set');
  }

  const click = async () => {
    if (compiling) return;
    startExecuting(Actions.Compile);
    setToast(null);
    try {
      const result = await compile(baseUri, variant);
      if (result.success) {
        await addDownload(result.firmware);
        popupSimpleToast('success', 'Compilation Successful');
        stopExecuting(Actions.Compile);
        updatePanel(Panels.Flash);
      } else {
        const actions = [];
        if (result.log) {
          actions.push(
            <Button key="showlog" onClick={() => setCompileLog(result.log)} color="inherit">
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
        Flash Keyboard
      </Fab>
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} open={!!toast}>
        {toast || undefined}
      </Snackbar>
      <SimpleDataModal
        open={!!compileLog}
        onClose={() => setCompileLog(undefined)}
        data={compileLog}
        title="Firmware Build Log"
      />
    </div>
  );
}
