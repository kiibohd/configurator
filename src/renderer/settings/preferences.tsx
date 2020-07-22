import React from 'react';
import { makeStyles, Card, CardHeader, CardContent, Typography } from '../mui';
import { useSettingsState, updateUri } from '../state/settings';
import { ModedTextField } from '../common';
import { useDevtoolsState } from '../hooks';

const useStyles = makeStyles({
  text: {
    fontStyle: 'oblique',
  },
  card: {},
} as const);

export default function Preferences() {
  const classes = useStyles({});
  const isDevToolsOpened = useDevtoolsState();
  const [uri] = useSettingsState('uri');

  return (
    <Card className={classes.card}>
      <CardHeader title="Advanced" subheader="WARNING: Changing these could cause instability" />
      <CardContent>
        {!isDevToolsOpened && <Typography className={classes.text}>Unavailable</Typography>}
        {isDevToolsOpened && <ModedTextField defaultValue={uri} onSave={updateUri} label="Base URI" />}
      </CardContent>
    </Card>
  );
}
