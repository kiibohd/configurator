import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import ChildProcess from 'child_process';
import electron from 'electron';
import _ from 'lodash';
import { withStyles, deepOrange, Button, Grid, IconButton, InputAdornment, TextField, Typography } from '../mui';
import { MoreVertIcon } from '../icons';
import { updateToolbarButtons } from '../state/core';
import { useSettingsState, updateDfu } from '../state/settings';
import { BackButton, SettingsButton, HomeButton } from '../buttons';

const styles = theme => ({
  text: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
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
  }
});

function Flash(props) {
  const { classes } = props;
  const [lastDl] = useSettingsState('lastDl');
  const bin = lastDl ? (_.isString(lastDl.bin) ? lastDl.bin : lastDl.bin.left) : '';
  const [dfuPath] = useSettingsState('dfu');
  const [binPath, setBinPath] = useState(bin);
  const [progress, setProgress] = useState('');
  const progressTextBox = useRef(null);

  useEffect(() => {
    updateToolbarButtons(
      <>
        <BackButton />
        <SettingsButton />
        <HomeButton />
      </>
    );
  }, []);

  useLayoutEffect(updateScroll, [progress]);

  return (
    <div>
      <Typography variant="subtitle1">Flash Firmware</Typography>
      <Grid container spacing={8} direction="column">
        <Grid container item xs={12} direction="row" justify="space-between" alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              label="dfu-util command"
              value={dfuPath}
              onChange={e => updateDfu(e.target.value)}
              margin="dense"
              variant="outlined"
              className={classes.text}
              required
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
                      <MoreVertIcon />
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
              // error={!!binPath.length && !binPath.endsWith('.bin')}
              helperText={binPath.length && !binPath.endsWith('.bin') ? 'does not appear to be .bin file' : null}
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
                      <MoreVertIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              InputLabelProps={{ classes: { root: classes.resizeFont } }}
            />
          </Grid>
          <Grid item xs={3} />
        </Grid>
        <Grid item xs={12}>
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

  function updateScroll() {
    if (progressTextBox) {
      progressTextBox.current.scrollTop = progressTextBox.current.scrollHeight;
    }
  }

  function openDialog(title, filters, cb) {
    electron.remote.dialog.showOpenDialog({ title, filters, properties: ['openFile'] }, cb);
  }

  function flash() {
    setProgress('');
    const cmd = ChildProcess.spawn(dfuPath, ['-D', binPath]);
    cmd.stdout.on('data', d => setProgress(curr => curr + d + '\n'));
    cmd.stderr.on('data', d => setProgress(curr => curr + 'ERROR: ' + d + '\n'));
    cmd.on('close', code => setProgress(curr => curr + '\nExited with code ' + code));
  }
}

Flash.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Flash);
