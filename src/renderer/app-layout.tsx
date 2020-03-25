import React from 'react';
import { CssBaseline, CircularProgress, Snackbar, makeStyles, Theme } from './mui';
import AppToolbar from './app-toolbar';
import { KeyboardSelect, VariantSelect } from './keyboard-select';
import { Configure } from './configure';
import Flash from './flash';
import Settings from './settings';
import { useCoreState, Panels } from './state/core';

const useStyles = makeStyles(
  (theme: Theme) =>
    ({
      root: {
        display: 'flex',
        fontFamily: theme.typography.fontFamily,
      },
      content: {
        flexGrow: 1,
        padding: theme.spacing(2),
        height: 'calc(100vh - 48px)',
      },
      topPad: {
        minHeight: 48,
      },
      loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
      },
    } as const)
);

export default function AppLayout() {
  const classes = useStyles({});
  const [activePanel] = useCoreState('panel');
  const [loading] = useCoreState('loading');
  const [toast] = useCoreState('toast');

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppToolbar />
      <main className={classes.content}>
        <div className={classes.topPad} />
        {(() => {
          if (loading) {
            return (
              <div className={classes.loading}>
                <CircularProgress disableShrink color="secondary" />
              </div>
            );
          }
          switch (activePanel) {
            case Panels.KeyboardSelect:
              return <KeyboardSelect />;
            case Panels.Settings:
              return <Settings />;
            case Panels.Flash:
              return <Flash />;
            case Panels.VariantSelect:
              return <VariantSelect />;
            case Panels.ConfigureKeys:
            case Panels.ConfigureVisuals:
              return <Configure />;
          }
        })()}
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} open={!!toast}>
          {toast}
        </Snackbar>
      </main>
    </div>
  );
}
