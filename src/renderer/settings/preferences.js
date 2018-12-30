import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Card, CardHeader, CardContent, Typography } from '../mui';
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
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [uri] = useSettingsState('uri');

  useEffect(() => {
    const devtools = /./;
    devtools.toString = () => {
      setInspectorOpen(true);
      return 'devtools-check';
    };

    console.log('%c', devtools);
    return () => (devtools.toString = null);
  }, []);

  return (
    <Card className={classes.card}>
      <CardHeader title="Advanced" subheader="WARNING: Changing these could cause instability" />
      <CardContent>
        {!inspectorOpen && <Typography className={classes.text}>Unavailable</Typography>}
        {inspectorOpen && <ModedTextField defaultValue={uri} onSave={updateUri} label="Base URI" />}
      </CardContent>
    </Card>
  );
}

Preferences.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Preferences);
