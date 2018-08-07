import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Typography } from '../mui';

const styles = () => ({
  text: {
    fontStyle: 'oblique'
  }
});

function Preferences(props) {
  const { classes } = props;

  return <Typography className={classes.text}>Nothing to see here...</Typography>;
}

Preferences.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Preferences);
