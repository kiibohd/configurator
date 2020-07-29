import React from 'react';

import { makeStyles, blueGrey, AppBar, Toolbar, Typography, Theme } from './mui';

import { useCoreState } from './state';

const useStyles = makeStyles(
  (theme: Theme) =>
    ({
      appBar: {
        zIndex: theme.zIndex.drawer + 1,
        background: 'white',
        color: blueGrey[900],
      },
      grow: {
        flexGrow: 1,
      },
    } as const)
);

export default function AppToolbar(): JSX.Element {
  const classes = useStyles({});
  const [selectedKeyboard] = useCoreState('keyboard');
  const [toolbarButtons] = useCoreState('toolbarButtons');

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar variant="dense">
        <Typography variant="h6" color="inherit" noWrap className={classes.grow}>
          {selectedKeyboard ? selectedKeyboard.keyboard.display : 'Kiibohd Configurator'}
        </Typography>
        {toolbarButtons}
      </Toolbar>
    </AppBar>
  );
}
