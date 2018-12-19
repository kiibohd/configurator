import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Card, CardHeader, CardContent } from '../mui';
import { useSettingsState, updateUri } from '../state/settings';
import { ModedTextField } from '../common';

/** @type {import('../theme').CssProperties} */
const styles = {
  text: {
    fontStyle: 'oblique'
  }
};

function Preferences(props) {
  const { classes } = props;
  const [uri] = useSettingsState('uri');

  return (
    <Card className={classes.card}>
      <CardHeader title="Advanced" subheader="WARNING: Changing these could cause instability" />
      <CardContent>
        <ModedTextField defaultValue={uri} onSave={updateUri} label="Base URI" />
      </CardContent>
    </Card>
  );
}

Preferences.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Preferences);
