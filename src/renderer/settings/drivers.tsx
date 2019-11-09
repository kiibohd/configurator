import React, { useState, useRef, useLayoutEffect } from 'react';
import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import log from 'loglevel';
import { makeStyles, Typography, Button, TextField, Theme } from '../mui';
import { useSettingsState } from '../state/settings';
import { SearchIcon, UpdateIcon } from '../icons';
import Bluebird from 'bluebird';
import { HookResult } from '../shared-state';

const readFile = Bluebird.promisify(fs.readFile);

function runKiidrv(exepath: string, subcmd: string, resultFn: (content: string | Buffer) => void) {
  const dirpath = path.parse(exepath).dir;
  const cmd = childProcess.execFile(
    // `"${exepath}"`,
    '"' + exepath + '"',
    ['--out', 'output.log', '--no-confirm', `--${subcmd}`],
    {
      shell: true,
      cwd: dirpath,
      windowsHide: true
    },
    (err, stdout, stderr) => {
      if (err) {
        resultFn(`\n\nkiidrv returned failure code \n\t ${err}`);
      } else {
        resultFn(stdout);
        stderr && resultFn(stderr);
      }
    }
  );

  cmd.on('exit', async (code, signal) => {
    log.info(`kiidrv exited with code: '${code}', signal: '${signal}'`);
    const content = await readFile(path.join(dirpath, 'output.log'));
    resultFn(content);
  });
}

const useStyles = makeStyles(
  (theme: Theme) =>
    ({
      headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      button: {
        minWidth: '6rem',
        marginLeft: 15
      },
      leftIcon: {
        marginRight: theme.spacing(1),
        fontSize: 20
      },
      text: {
        marginTop: 16
      },
      container: {}
    } as const)
);

export default function Drivers() {
  const classes = useStyles({});
  const [kiidrv] = useSettingsState('kiidrv') as HookResult<string>;
  const [results, setResults] = useState('');
  const resultsTextBox = useRef<HTMLInputElement>(null);

  function updateScroll() {
    if (resultsTextBox && resultsTextBox.current) {
      resultsTextBox.current.scrollTop = resultsTextBox.current.scrollHeight;
    }
  }

  useLayoutEffect(updateScroll, [results]);

  const append = (s: string | Buffer) => setResults(curr => curr + s);

  const verify = () => {
    setResults('');
    runKiidrv(kiidrv, 'verify', append);
  };

  const fix = () => {
    setResults('');
    runKiidrv(kiidrv, 'fix', append);
  };

  if (!kiidrv) {
    return (
      <div className={classes.container}>
        <Typography variant="subtitle1">Driver Diagnostics</Typography>
        <br />
        <Typography color="error">kiidrv utility not installed.</Typography>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.headerRow}>
        <Typography variant="subtitle1">Driver Diagnostics</Typography>
        <div>
          <Button className={classes.button} variant="outlined" color="primary" onClick={verify}>
            <SearchIcon className={classes.leftIcon} />
            Verify
          </Button>
          <Button className={classes.button} variant="outlined" color="secondary" onClick={fix}>
            <UpdateIcon className={classes.leftIcon} />
            Fix
          </Button>
        </div>
      </div>
      <TextField
        fullWidth
        multiline
        rows="15"
        label="command results"
        margin="dense"
        variant="outlined"
        className={classes.text}
        InputProps={{ inputRef: resultsTextBox, readOnly: true }}
        value={results}
      />
    </div>
  );
}
