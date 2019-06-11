import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Card, CardHeader, CardContent, Typography } from '../mui';
import { useSettingsState, updateUri } from '../state/settings';
import { ModedTextField } from '../common';
import { useDevtoolsState } from '../hooks';

/** @type {import('../theme').CssProperties} */
const styles = {
  text: {
    fontStyle: 'oblique'
  }
};

function Preferences(props) {
  const { classes } = props;
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

Preferences.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Preferences);
