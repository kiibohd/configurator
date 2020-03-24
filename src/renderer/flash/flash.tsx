import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import os from 'os';
import ChildProcess from 'child_process';
import electron from 'electron';
import _ from 'lodash';
import { useConnectedKeyboards } from '../hooks';
import { makeStyles, deepOrange, Button, Grid, IconButton, InputAdornment, TextField, Typography, Theme } from '../mui';
import { FolderOpen, HelpOutlineIcon } from '../icons';
import { updateToolbarButtons, previousPanel, popupSimpleToast } from '../state/core';
import { useSettingsState, updateDfu } from '../state/settings';
import { BackButton, SettingsButton, HomeButton, HelpButton } from '../buttons';
import { pathToImg } from '../common';

//TODO: Split this up.

const useStyles = makeStyles(
  (theme: Theme) =>
    ({
      text: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: 16
      },
      resizeFont: {
        fontSize: 13
      },
      icon: {
        marginRight: -12
      },
      buttonGrid: {
        marginTop: 12,
        height: 49
      },
      button: {
        height: 49,
        width: 100
      },
      hintText: {
        '&&': {
          color: deepOrange[300]
        }
      },
      warn: {
        fontStyle: 'oblique',
        color: 'red'
      },
      success: {
        fontStyle: 'oblique',
        color: 'green'
      },
      image: {}
    } as const)
);

export default function Flash() {
  const classes = useStyles({});
  const connected = useConnectedKeyboards();
  const [lastDl] = useSettingsState('lastDl');
  const bin = lastDl ? (_.isString(lastDl.bin) ? lastDl.bin : lastDl.bin.left) : '';
  const [dfuPath] = useSettingsState('dfu');

  const [dfuNotFound, setDfuNotFound] = useState(false);
  const [binPath, setBinPath] = useState(bin);
  const [progress, setProgress] = useState('');
  const [showResetHelp, setShowResetHelp] = useState(false);
  const progressTextBox = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    updateToolbarButtons(
      <>
        <BackButton />
        <SettingsButton />
        <HelpButton />
        <HomeButton />
      </>
    );
  }, []);

  function updateScroll() {
    if (progressTextBox.current) {
      progressTextBox.current.scrollTop = progressTextBox.current.scrollHeight;
    }
  }

  useLayoutEffect(updateScroll, [progress]);

  const flashableConnected = connected.some(x => x.known && x.known.isFlashable);

  const board = lastDl && lastDl.board;
  const found = board ? connected.find(x => x.known && x.known.names.includes(board)) : connected.find(x => !!x.known);
  const resetCombo = _.get(found, 'keyboard.info.resetCombo', '"Fn + Esc"');

  async function openDialog(title: string, filters: electron.FileFilter[], cb: (paths: string[]) => void) {
    const window = electron.remote.getCurrentWindow();
    const result = await electron.remote.dialog.showOpenDialog(window, { title, filters, properties: ['openFile'] });

    if (!result.canceled) {
      cb(result.filePaths);
    }
  }

  function flash() {
    if (!dfuPath || !binPath) return;
    setProgress('');
    const cmd = ChildProcess.spawn(dfuPath, ['-D', binPath]);
    cmd.stdout.on('data', d => setProgress(curr => curr + d + '\n'));
    cmd.stderr.on('data', d => setProgress(curr => curr + 'ERROR: ' + d + '\n'));
    cmd.on('close', code => {
      setProgress(curr => curr + '\nExited with code ' + code);
      if (code == 0) {
        popupSimpleToast('success', 'Flashing Successful');
        previousPanel();
      } else if (code === -os.constants.errno.ENOENT) {
        popupSimpleToast('error', 'dfu-util not found');
        setDfuNotFound(true);
        setProgress(curr => curr + ' (dfu-util not found)');
      } else if (code === 74) {
        popupSimpleToast('error', 'dfu-util could not find device in flash mode.');
        setProgress(curr => curr + ' (dfu-util could not find device in flash mode)');
      } else {
        popupSimpleToast('error', 'Error Flashing, check log');
      }
    });
    cmd.on('error', function() {
      // catch error so close still gets called
    });
  }

  return (
    <div>
      <Typography variant="subtitle1">Flash Firmware</Typography>
      <Grid container spacing={1} direction="column">
        {!flashableConnected && (
          <>
            <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
              <Grid item xs={9}>
                <Typography variant="subtitle2" className={classes.warn}>
                  No Keyboard Found in flash mode. Press the reset button on the bottom of your keyboard to enter flash
                  mode.
                  <IconButton onClick={() => setShowResetHelp(!showResetHelp)}>
                    <HelpOutlineIcon />
                  </IconButton>
                </Typography>
                {resetCombo && <Typography variant="subtitle2">Pressing {resetCombo} may also work.</Typography>}
              </Grid>
            </Grid>
            {showResetHelp && (
              <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
                <Grid item xs={5}>
                  <img className={classes.image} src={pathToImg('img/reset-button.png')} style={{ width: '100%' }} />
                </Grid>
              </Grid>
            )}
          </>
        )}
        {flashableConnected && !dfuPath && (
          <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
            <Grid item xs={5}>
              <Typography variant="subtitle2" className={classes.warn}>
                Please specify the location of dfu-util.
              </Typography>
            </Grid>
          </Grid>
        )}
        {flashableConnected && dfuPath && dfuNotFound && (
          <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
            <Grid item xs={5}>
              <Typography variant="subtitle2" className={classes.warn}>
                dfu-util not present at the specified location
              </Typography>
            </Grid>
          </Grid>
        )}
        {flashableConnected && !!dfuPath && !dfuNotFound && !binPath && (
          <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
            <Grid item xs={5}>
              <Typography variant="subtitle2" className={classes.warn}>
                Please specify a file to flash.
              </Typography>
            </Grid>
          </Grid>
        )}
      </Grid>
      <Grid container spacing={1} direction="column">
        <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              label="dfu-util command"
              value={dfuPath}
              onChange={e => {
                updateDfu(e.target.value);
                dfuNotFound && setDfuNotFound(false);
              }}
              margin="dense"
              variant="outlined"
              className={classes.text}
              required
              error={!dfuPath || dfuNotFound}
              InputProps={{
                classes: { input: classes.resizeFont },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      className={classes.icon}
                      onClick={() =>
                        openDialog(
                          'path to dfu-util',
                          [{ name: 'All Files', extensions: ['*'] }],
                          paths => paths.length && updateDfu(paths[0])
                        )
                      }
                    >
                      <FolderOpen />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              InputLabelProps={{ classes: { root: classes.resizeFont } }}
            />
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={2} className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={flash}
              disabled={!dfuPath || !binPath}
            >
              Flash
            </Button>
          </Grid>
        </Grid>
        <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              label=".bin to flash"
              value={binPath}
              onChange={e => setBinPath(e.target.value)}
              margin="dense"
              variant="outlined"
              required
              className={classes.text}
              helperText={binPath.length && !binPath.endsWith('.bin') ? 'does not appear to be .bin file' : null}
              error={!binPath}
              InputProps={{
                classes: { input: classes.resizeFont },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      className={classes.icon}
                      onClick={() =>
                        openDialog(
                          'firmware to flash',
                          [{ name: 'bin files', extensions: ['bin'] }],
                          paths => paths.length && setBinPath(paths[0])
                        )
                      }
                    >
                      <FolderOpen />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              InputLabelProps={{ classes: { root: classes.resizeFont } }}
            />
          </Grid>
          <Grid item xs={3} />
        </Grid>
        <Grid item xs={9}>
          <TextField
            fullWidth
            multiline
            rows="15"
            label="flashing progress"
            margin="dense"
            variant="outlined"
            className={classes.text}
            InputProps={{ inputRef: progressTextBox, readOnly: true }}
            value={progress}
          />
        </Grid>
      </Grid>
    </div>
  );
}
